import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { paymentRequestSchema, cashReceiptSchema, datasets } from "@shared/schema";
import { z } from "zod";

const PAYAPP_API_URL = "https://api.payapp.kr/oapi/apiLoad.html";
const PAYAPP_USER_ID = process.env.PAYAPP_USER_ID || "payapp_test_id";

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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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

  app.post("/api/payment/request", async (req, res) => {
    try {
      const validatedData = paymentRequestSchema.parse(req.body);
      
      const dataset = datasets.find((d) => d.id === validatedData.datasetId);
      if (!dataset) {
        return res.status(404).json({ success: false, message: "Dataset not found" });
      }

      const feedbackUrl = `${req.protocol}://${req.get("host")}/api/payment/callback`;
      
      const formData = new URLSearchParams({
        cmd: "payrequest",
        userid: PAYAPP_USER_ID,
        goodname: validatedData.goodName,
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
        await storage.savePaymentRequest({
          ...validatedData,
          mulNo: result.mul_no,
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
        
        const paymentRecord = await storage.getPaymentByMulNo(mul_no);
        
        if (paymentRecord && var2 && var2 !== "none" && (var2 === "personal" || var2 === "business")) {
          const idInfo = var2 === "business" ? var3 : paymentRecord.buyerPhone;
          const valType = var2 === "business" ? "2" : "1";

          try {
            await issueCashReceipt({
              idInfo,
              price: paymentRecord.price,
              valType,
              goodName: paymentRecord.goodName,
              buyerPhone: paymentRecord.buyerPhone,
            });
            console.log("Cash receipt issued successfully");
          } catch (receiptError) {
            console.error("Failed to issue cash receipt:", receiptError);
          }
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Payment callback error:", error);
      res.status(500).send("Error");
    }
  });

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
