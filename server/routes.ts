import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { datasets } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

const CREEM_API_URL = "https://api.creem.io/v1";
const CREEM_API_KEY = process.env.CREEM_API_KEY || "";
const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET || "";

const CREEM_PRODUCT_MAP: Record<string, string> = {
  "cinematic-camera-motion-kit": "prod_5St2FaqZLUeTE2xaLSBbNa",
  "hires-3d-modeling-dataset": "prod_lRyUKogZi1QwmvxCpc0oC",
};

const creemCheckoutSchema = z.object({
  datasetId: z.string(),
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);

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

  app.post("/api/creem/checkout", async (req: any, res) => {
    try {
      if (!CREEM_API_KEY) {
        return res.status(500).json({ 
          success: false, 
          message: "CREEM_API_KEY가 설정되지 않았습니다." 
        });
      }

      const validatedData = creemCheckoutSchema.parse(req.body);
      const userId = req.user?.claims?.sub || null;
      
      const creemProductId = CREEM_PRODUCT_MAP[validatedData.datasetId];
      if (!creemProductId) {
        return res.status(400).json({
          success: false,
          message: "해당 상품은 결제가 지원되지 않습니다.",
        });
      }

      const dataset = datasets.find(d => d.id === validatedData.datasetId);
      if (!dataset) {
        return res.status(404).json({
          success: false,
          message: "데이터셋을 찾을 수 없습니다.",
        });
      }
      
      const baseUrl = process.env.REPLIT_DEPLOYMENT 
        ? "https://wisedata.ai.kr"
        : `${req.protocol}://${req.get("host")}`;
      
      const requestId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const checkoutResponse = await fetch(`${CREEM_API_URL}/checkouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CREEM_API_KEY,
        },
        body: JSON.stringify({
          request_id: requestId,
          product_id: creemProductId,
          success_url: `${baseUrl}/payment/success`,
          metadata: {
            userId: userId || "guest",
            datasetId: validatedData.datasetId,
            goodName: dataset.nameKo,
          },
        }),
      });

      if (!checkoutResponse.ok) {
        const errorText = await checkoutResponse.text();
        console.error("Creem checkout creation failed:", errorText);
        return res.status(400).json({
          success: false,
          message: "체크아웃 생성에 실패했습니다.",
        });
      }

      const checkoutData = await checkoutResponse.json();

      await storage.createOrder({
        userId,
        datasetId: validatedData.datasetId,
        goodName: dataset.nameKo,
        price: dataset.price,
        buyerPhone: "creem-payment",
        mulNo: requestId,
        paymentStatus: "pending",
        deliveryStatus: "pending",
      });

      res.json({
        success: true,
        checkoutUrl: checkoutData.checkout_url,
        requestId: requestId,
        message: "결제 페이지로 이동합니다.",
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "입력 데이터가 올바르지 않습니다.",
          errors: error.errors,
        });
      }
      console.error("Creem checkout error:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  });

  app.post("/api/creem/webhook", async (req: any, res) => {
    try {
      const signature = req.headers["x-creem-signature"] as string;
      
      if (CREEM_WEBHOOK_SECRET && signature) {
        const rawBody = req.rawBody;
        if (!rawBody) {
          console.error("No raw body available for signature verification");
          return res.status(400).send("No raw body");
        }
        
        const expectedSignature = crypto
          .createHmac("sha256", CREEM_WEBHOOK_SECRET)
          .update(rawBody)
          .digest("hex");
        
        if (signature !== expectedSignature) {
          console.error("Invalid webhook signature");
          return res.status(401).send("Invalid signature");
        }
      }

      const event = req.body;
      console.log("Creem webhook received:", event.type);

      switch (event.type) {
        case "checkout.completed": {
          const metadata = event.data?.metadata || {};
          const requestId = event.data?.request_id;
          
          if (requestId) {
            await storage.updateOrderStatus(requestId, "completed", new Date());
            console.log(`Payment completed for request_id: ${requestId}`);
          }
          break;
        }
        case "payment.failed": {
          const requestId = event.data?.request_id;
          if (requestId) {
            await storage.updateOrderStatus(requestId, "failed", new Date());
            console.log(`Payment failed for request_id: ${requestId}`);
          }
          break;
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Creem webhook error:", error);
      res.status(500).send("Error");
    }
  });

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
