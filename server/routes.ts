import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { paymentRequestSchema, cashReceiptSchema, datasets } from "@shared/schema";
import { z } from "zod";

const PAYAPP_API_URL = "https://api.payapp.kr/oapi/apiLoad.html";
const PAYAPP_USER_ID = process.env.PAYAPP_USER_ID || "payapp_test_id";
const PAYAPP_LINKVAL = process.env.PAYAPP_LINKVAL;
const PAYAPP_LINKKEY = process.env.PAYAPP_LINKKEY;

const truncate = (value: string, limit: number) => Array.from(value || "").slice(0, limit).join("");
const buildGoodnameLabel = (raw: string) => truncate(raw || "장바구니 수동 결제", 19);

async function parsePayAppResponse(text: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const item of text.split("&")) {
    if (item.includes("=")) {
      const [key, value] = item.split("=", 2);
      result[key] = decodeURIComponent(value || "");
    }
  }
  return result;
}

const buildGoodname = (name: string) => {
  try {
    const safeName = name || "상품";
    const firstLabel = safeName.length > 16 ? safeName.slice(0, 16) : safeName;
    const combined = `${firstLabel}`;
    return combined.length > 20 ? combined.slice(0, 20) : combined;
  } catch (error) {
    console.error("Failed to build server goodname", error);
    return "상품";
  }
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Setup auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dataset routes
  app.get("/api/datasets", (_req, res) => {
    res.json(datasets);
  });

  app.get("/api/datasets/:id", (req, res) => {
    const dataset = datasets.find((d) => d.id === req.params.id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }
    res.json(dataset);
  });

  // Dataset preview/sample data
  app.get("/api/datasets/:id/preview", (req, res) => {
    const dataset = datasets.find((d) => d.id === req.params.id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }
    res.json({
      sampleFields: dataset.sampleFields,
      sampleData: dataset.sampleData || [],
    });
  });

  // Payment routes
  app.post("/api/payment/request", async (req: any, res) => {
    try {
      const validatedData = paymentRequestSchema.parse(req.body);
      
      const dataset = datasets.find((d) => d.id === validatedData.datasetId);
      if (!dataset) {
        return res.status(404).json({ success: false, message: "Dataset not found" });
      }

      // Get user ID if authenticated
      const userId = req.user?.claims?.sub || null;

      const feedbackUrl = `${req.protocol}://${req.get("host")}/api/payment/callback`;
      
      const goodName = buildGoodname(validatedData.goodName);

      const formData = new URLSearchParams({
        cmd: "payrequest",
        userid: PAYAPP_USER_ID,
        goodname: goodName,
        price: validatedData.price.toString(),
        recvphone: validatedData.buyerPhone.replace(/-/g, ""),
        smsuse: "n",
        feedbackurl: feedbackUrl,
        var1: validatedData.datasetId,
        var2: validatedData.receiptType || "none",
        var3: validatedData.businessNumber || "",
      });

      const response = await fetch(PAYAPP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const responseText = await response.text();
      const result = await parsePayAppResponse(responseText);

      if (result.state === "1") {
        // Save order to database
        await storage.createOrder({
          userId,
          datasetId: validatedData.datasetId,
          goodName: goodName,
          price: validatedData.price,
          buyerPhone: validatedData.buyerPhone,
          mulNo: result.mul_no,
          receiptType: validatedData.receiptType || "none",
          businessNumber: validatedData.businessNumber,
          paymentStatus: "pending",
          deliveryStatus: "pending",
        });

        res.json({
          success: true,
          payUrl: result.payurl,
          mulNo: result.mul_no,
          message: "결제 요청이 생성되었습니다.",
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.msg || "결제 요청에 실패했습니다.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "입력 데이터가 올바르지 않습니다.",
          errors: error.errors,
        });
      }
      console.error("Payment request error:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  });

  app.post("/api/payment/callback", async (req, res) => {
    try {
      const { mul_no, pay_state, var1, var2, var3 } = req.body;

      if (pay_state === "4") {
        console.log(`Payment completed for mul_no: ${mul_no}`);
        
        // Update order status
        const order = await storage.updateOrderStatus(mul_no, "completed", new Date());
        
        if (order && var2 && var2 !== "none" && (var2 === "personal" || var2 === "business")) {
          const idInfo = var2 === "business" ? var3 : order.buyerPhone;
          const valType = var2 === "business" ? "2" : "1";

          try {
            await issueCashReceipt({
              idInfo,
              price: order.price,
              valType,
              goodName: order.goodName,
              buyerPhone: order.buyerPhone,
            });
            console.log("Cash receipt issued successfully");
          } catch (receiptError) {
            console.error("Failed to issue cash receipt:", receiptError);
          }
        }

        // Generate download URL for completed payment
        if (order) {
          const dataset = datasets.find(d => d.id === order.datasetId);
          if (dataset) {
            // Simulate delivery URL generation
            const deliveryUrl = `/api/datasets/${order.datasetId}/download?order=${order.id}`;
            await storage.updateOrderDelivery(order.id, deliveryUrl);
            console.log(`Delivery URL generated: ${deliveryUrl}`);
          }
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Payment callback error:", error);
      res.status(500).send("Error");
    }
  });

  // PayApp Lite feedback (테스트 모드: 금액 검증 스킵)
  app.all("/api/payapp/feedback", async (req, res) => {
    // PayApp는 본문 'SUCCESS'(대문자) 응답을 보고 재시도 여부를 판단합니다.
    // 어떤 메서드/바디가 와도 우선 200/SUCCESS를 반환해 70080을 방지합니다.
    res.status(200).type("text/plain").send("SUCCESS");

    try {
      const { pay_state, price, mul_no, goodname, recvphone, var1, linkval } = req.body;

      if (PAYAPP_LINKVAL && (!linkval || linkval !== PAYAPP_LINKVAL)) {
        console.warn("PayApp feedback rejected by linkval", { mul_no, linkval });
        return;
      }

      if (pay_state === "4") {
        const existing = mul_no ? await storage.getOrderByMulNo(mul_no) : undefined;
        if (existing) {
          await storage.updateOrderStatus(mul_no, "completed", new Date());
        } else if (mul_no) {
          const fallbackName = buildGoodnameLabel(goodname || "장바구니 수동 결제 테스트");
          await storage.createOrder({
            userId: null,
            datasetId: var1 || "manual-test",
            goodName: fallbackName,
            price: Number(price) || 0,
            buyerPhone: recvphone || "unknown",
            mulNo: mul_no,
            paymentStatus: "completed",
            deliveryStatus: "pending",
          });
        }
        console.log(`결제 성공: ${price}원 / 주문번호(mul_no): ${mul_no}`);
        return;
      }

      console.warn("PayApp feedback ignored (pay_state != 4)", { pay_state, mul_no });
    } catch (error) {
      console.error("PayApp feedback error:", error);
    }
  });

  // User orders (purchase history)
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin routes
  app.get("/api/admin/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Cash receipt issuance
  app.post("/api/receipt/issue", async (req, res) => {
    try {
      const validatedData = cashReceiptSchema.parse(req.body);
      
      const result = await issueCashReceipt(validatedData);
      
      if (result.success) {
        res.json({
          success: true,
          message: "현금영수증이 발행되었습니다.",
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || "현금영수증 발행에 실패했습니다.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "입력 데이터가 올바르지 않습니다.",
          errors: error.errors,
        });
      }
      console.error("Receipt issuance error:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  });

  // Dataset search
  app.get("/api/datasets/search", (req, res) => {
    const { q, category } = req.query;
    let results = [...datasets];

    if (q && typeof q === "string") {
      const query = q.toLowerCase();
      results = results.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.nameKo.includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.descriptionKo.includes(query) ||
        d.category.toLowerCase().includes(query)
      );
    }

    if (category && typeof category === "string") {
      results = results.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }

    res.json(results);
  });

  return httpServer;
}

async function issueCashReceipt(data: {
  idInfo: string;
  price: number;
  valType: string;
  goodName: string;
  buyerPhone: string;
}): Promise<{ success: boolean; message?: string }> {
  const formData = new URLSearchParams({
    cmd: "cashreceipt_regist",
    userid: PAYAPP_USER_ID,
    good_name: data.goodName,
    buy_tel: data.buyerPhone.replace(/-/g, ""),
    id_info: data.idInfo.replace(/-/g, ""),
    price: data.price.toString(),
    val_type: data.valType,
  });

  const response = await fetch(PAYAPP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const responseText = await response.text();
  const result = await parsePayAppResponse(responseText);

  return {
    success: result.state === "1",
    message: result.msg,
  };
}
