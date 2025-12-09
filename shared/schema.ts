import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, index, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Orders table for purchase history
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  datasetId: varchar("dataset_id").notNull(),
  goodName: text("good_name").notNull(),
  price: integer("price").notNull(),
  buyerPhone: varchar("buyer_phone").notNull(),
  mulNo: varchar("mul_no"),
  paymentStatus: varchar("payment_status").default("pending"), // pending, completed, failed
  receiptType: varchar("receipt_type"), // none, personal, business
  businessNumber: varchar("business_number"),
  deliveryStatus: varchar("delivery_status").default("pending"), // pending, delivered
  deliveryUrl: text("delivery_url"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

// Dataset definition
export interface Dataset {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  category: string;
  price: number;
  records: string;
  accuracy: string;
  format: string;
  updateFrequency: string;
  features: string[];
  sampleFields: { name: string; type: string; description: string }[];
  sampleData?: Record<string, any>[];
}

// Payment request schema
export const paymentRequestSchema = z.object({
  datasetId: z.string(),
  goodName: z.string(),
  price: z.number().positive(),
  buyerPhone: z.string().regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 휴대폰 번호를 입력해주세요"),
  receiptType: z.enum(["none", "personal", "business"]).optional(),
  businessNumber: z.string().optional(),
});

export type PaymentRequest = z.infer<typeof paymentRequestSchema>;

// Payment response
export interface PaymentResponse {
  success: boolean;
  payUrl?: string;
  mulNo?: string;
  message?: string;
}

// Cash receipt request schema
export const cashReceiptSchema = z.object({
  idInfo: z.string(),
  price: z.number().positive(),
  valType: z.enum(["1", "2"]), // 1: personal deduction, 2: business expense
  goodName: z.string(),
  buyerPhone: z.string(),
});

export type CashReceiptRequest = z.infer<typeof cashReceiptSchema>;

// Static dataset data with sample data for preview
export const datasets: Dataset[] = [
  {
    id: "financial-sentiment",
    name: "Financial News Sentiment Dataset",
    nameKo: "금융 뉴스 감성 분석 데이터셋",
    description: "Comprehensive sentiment-labeled financial news dataset covering global markets, earnings reports, and market-moving events. Perfect for training NLP models and algorithmic trading systems.",
    descriptionKo: "글로벌 시장, 실적 보고서, 시장 변동 이벤트를 다루는 감성 레이블링된 종합 금융 뉴스 데이터셋입니다. NLP 모델 및 알고리즘 트레이딩 시스템 학습에 최적화되어 있습니다.",
    category: "Finance",
    price: 2500000,
    records: "2.5M",
    accuracy: "98.7%",
    format: "JSON, CSV, Parquet",
    updateFrequency: "Daily",
    features: [
      "Multi-language sentiment labels (EN/KO/JP/CN)",
      "Entity recognition for companies and executives",
      "Market sector classification",
      "Temporal event tagging",
      "Source credibility scores"
    ],
    sampleFields: [
      { name: "article_id", type: "string", description: "Unique identifier" },
      { name: "title", type: "string", description: "Article headline" },
      { name: "sentiment_score", type: "float", description: "-1.0 to 1.0" },
      { name: "entities", type: "array", description: "Extracted entities" },
      { name: "published_at", type: "datetime", description: "Publication timestamp" }
    ],
    sampleData: [
      { article_id: "FN-2024-001234", title: "Samsung Electronics Q4 Earnings Beat Expectations", sentiment_score: 0.82, entities: ["Samsung Electronics", "Q4 2024"], published_at: "2024-01-15T09:30:00Z" },
      { article_id: "FN-2024-001235", title: "Federal Reserve Signals Potential Rate Cuts", sentiment_score: 0.45, entities: ["Federal Reserve", "Interest Rates"], published_at: "2024-01-15T10:15:00Z" },
      { article_id: "FN-2024-001236", title: "Tech Sector Faces Regulatory Headwinds", sentiment_score: -0.31, entities: ["Tech Sector", "Regulation"], published_at: "2024-01-15T11:00:00Z" },
      { article_id: "FN-2024-001237", title: "Hyundai Motor Reports Record EV Sales", sentiment_score: 0.76, entities: ["Hyundai Motor", "Electric Vehicles"], published_at: "2024-01-15T12:30:00Z" },
      { article_id: "FN-2024-001238", title: "Global Supply Chain Disruptions Continue", sentiment_score: -0.58, entities: ["Supply Chain", "Logistics"], published_at: "2024-01-15T14:00:00Z" }
    ]
  },
  {
    id: "geospatial-poi",
    name: "Enterprise Geospatial POI Database",
    nameKo: "기업용 지리공간 POI 데이터베이스",
    description: "High-precision point-of-interest dataset with rich metadata covering retail locations, corporate offices, and commercial properties across Asia-Pacific region.",
    descriptionKo: "아시아 태평양 지역의 소매 위치, 기업 사무실, 상업용 부동산을 포괄하는 풍부한 메타데이터가 포함된 고정밀 관심 지점 데이터셋입니다.",
    category: "Geospatial",
    price: 4800000,
    records: "15.2M",
    accuracy: "99.2%",
    format: "GeoJSON, Shapefile, PostgreSQL",
    updateFrequency: "Weekly",
    features: [
      "Sub-meter GPS accuracy",
      "Business category taxonomy (500+ categories)",
      "Operating hours and contact information",
      "Foot traffic estimation",
      "Competitive proximity analysis"
    ],
    sampleFields: [
      { name: "poi_id", type: "string", description: "Unique POI identifier" },
      { name: "coordinates", type: "geometry", description: "Lat/Lng point" },
      { name: "category_code", type: "string", description: "Business category" },
      { name: "foot_traffic", type: "integer", description: "Daily visitors estimate" },
      { name: "verified_at", type: "datetime", description: "Last verification date" }
    ],
    sampleData: [
      { poi_id: "POI-KR-SEL-00001", name: "Gangnam Station Shopping Complex", coordinates: { lat: 37.4979, lng: 127.0276 }, category_code: "RETAIL_SHOPPING", foot_traffic: 45000, verified_at: "2024-01-10" },
      { poi_id: "POI-KR-SEL-00002", name: "Coex Convention Center", coordinates: { lat: 37.5126, lng: 127.0590 }, category_code: "CONVENTION_CENTER", foot_traffic: 28000, verified_at: "2024-01-12" },
      { poi_id: "POI-KR-SEL-00003", name: "Lotte Tower Observatory", coordinates: { lat: 37.5126, lng: 127.1025 }, category_code: "TOURISM_ATTRACTION", foot_traffic: 15000, verified_at: "2024-01-11" },
      { poi_id: "POI-JP-TKY-00001", name: "Shibuya Crossing District", coordinates: { lat: 35.6595, lng: 139.7004 }, category_code: "RETAIL_ENTERTAINMENT", foot_traffic: 250000, verified_at: "2024-01-09" },
      { poi_id: "POI-JP-TKY-00002", name: "Tokyo Station Marunouchi", coordinates: { lat: 35.6812, lng: 139.7671 }, category_code: "TRANSPORT_HUB", foot_traffic: 450000, verified_at: "2024-01-08" }
    ]
  },
  {
    id: "consumer-behavior",
    name: "Consumer Behavior Analytics Dataset",
    nameKo: "소비자 행동 분석 데이터셋",
    description: "Anonymized consumer journey data capturing purchase patterns, brand preferences, and cross-channel behavior for retail and e-commerce analytics.",
    descriptionKo: "소매 및 전자상거래 분석을 위한 익명화된 소비자 여정 데이터로, 구매 패턴, 브랜드 선호도, 옴니채널 행동을 포착합니다.",
    category: "Analytics",
    price: 3200000,
    records: "8.7M",
    accuracy: "97.5%",
    format: "JSON, BigQuery, Snowflake",
    updateFrequency: "Monthly",
    features: [
      "Privacy-compliant anonymization",
      "Cross-device journey mapping",
      "Purchase intent signals",
      "Brand affinity scores",
      "Cohort segmentation labels"
    ],
    sampleFields: [
      { name: "session_id", type: "string", description: "Anonymized session" },
      { name: "journey_events", type: "array", description: "Interaction sequence" },
      { name: "purchase_intent", type: "float", description: "0.0 to 1.0 score" },
      { name: "segments", type: "array", description: "User cohort labels" },
      { name: "ltv_estimate", type: "float", description: "Lifetime value prediction" }
    ],
    sampleData: [
      { session_id: "SES-A7B2C9D4", journey_events: ["homepage", "category_electronics", "product_view", "add_to_cart"], purchase_intent: 0.89, segments: ["tech_enthusiast", "high_value"], ltv_estimate: 2450000 },
      { session_id: "SES-E5F1G8H3", journey_events: ["search", "product_view", "compare", "product_view"], purchase_intent: 0.67, segments: ["price_conscious", "researcher"], ltv_estimate: 890000 },
      { session_id: "SES-I2J6K0L4", journey_events: ["homepage", "promotions", "category_fashion"], purchase_intent: 0.34, segments: ["casual_browser", "deal_seeker"], ltv_estimate: 320000 },
      { session_id: "SES-M9N3O7P1", journey_events: ["direct_product", "add_to_cart", "checkout", "purchase"], purchase_intent: 0.98, segments: ["loyal_customer", "brand_advocate"], ltv_estimate: 4200000 },
      { session_id: "SES-Q5R8S2T6", journey_events: ["mobile_app", "wishlist", "price_alert"], purchase_intent: 0.52, segments: ["mobile_first", "waiting_for_sale"], ltv_estimate: 680000 }
    ]
  }
];
