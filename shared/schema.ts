import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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

// Static dataset data
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
    ]
  }
];
