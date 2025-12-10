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
  },
  {
    id: "quant-feature-lab",
    name: "Quantitative Feature Lab",
    nameKo: "퀀트 특화 주가 예측 피처 세트",
    description: "Engineered alpha factors derived from price-volume action, fundamentals, and macro indicators for quantitative equity models.",
    descriptionKo: "가격·거래량, 펀더멘털, 거시 지표로 생성한 알파 팩터 묶음으로 퀀트 주식 모델에 활용하기 적합합니다.",
    category: "Finance",
    price: 2800000,
    records: "6.1M",
    accuracy: "97.9%",
    format: "CSV, Parquet",
    updateFrequency: "Weekly",
    features: [
      "Normalized price/volume microstructure signals",
      "Factor neutralization against sector betas",
      "Event-driven abnormal return tags",
      "Liquidity and slippage-adjusted scores",
      "Ready-to-train tensors for DL models"
    ],
    sampleFields: [
      { name: "symbol", type: "string", description: "Ticker symbol" },
      { name: "session", type: "date", description: "Trading session date" },
      { name: "factor_momentum_21d", type: "float", description: "21-day momentum factor" },
      { name: "factor_quality", type: "float", description: "Composite quality score" },
      { name: "event_tag", type: "string", description: "Earnings/news tag" }
    ],
    sampleData: [
      { symbol: "005930", session: "2024-01-15", factor_momentum_21d: 0.38, factor_quality: 0.71, event_tag: "earnings_beat" },
      { symbol: "AAPL", session: "2024-01-15", factor_momentum_21d: 0.12, factor_quality: 0.64, event_tag: "product_launch" },
      { symbol: "NVDA", session: "2024-01-15", factor_momentum_21d: 0.56, factor_quality: 0.82, event_tag: "guidance_raise" }
    ]
  },
  {
    id: "realtime-spend-trends",
    name: "Real-time Card Spend Trends",
    nameKo: "실시간 카드 소비 트렌드 데이터",
    description: "Anonymized, high-frequency card transaction aggregates segmented by merchant category, region, and channel.",
    descriptionKo: "가맹점 업종, 지역, 채널별로 익명화된 고빈도 카드 결제 집계를 제공합니다.",
    category: "Analytics",
    price: 3500000,
    records: "12.4M",
    accuracy: "98.1%",
    format: "Parquet, BigQuery",
    updateFrequency: "Daily",
    features: [
      "15-minute aggregation latency",
      "MCC and channel level splits",
      "Seasonality-adjusted indexes",
      "Outlier detection flags",
      "Geo mobility correlation"
    ],
    sampleFields: [
      { name: "window_start", type: "datetime", description: "Aggregation window start" },
      { name: "mcc", type: "string", description: "Merchant category code" },
      { name: "region_code", type: "string", description: "Administrative region" },
      { name: "txn_volume", type: "integer", description: "Transaction count" },
      { name: "txn_amount", type: "float", description: "Total amount (KRW)" }
    ],
    sampleData: [
      { window_start: "2024-01-15T10:00:00Z", mcc: "5411", region_code: "KR-11", txn_volume: 1284, txn_amount: 485000000 },
      { window_start: "2024-01-15T10:00:00Z", mcc: "5814", region_code: "KR-26", txn_volume: 942, txn_amount: 192000000 },
      { window_start: "2024-01-15T10:00:00Z", mcc: "4111", region_code: "KR-41", txn_volume: 311, txn_amount: 87000000 }
    ]
  },
  {
    id: "smartcity-traffic",
    name: "Smart City Traffic Flow Dataset",
    nameKo: "스마트시티 교통 흐름 데이터셋",
    description: "Sensor-fused multimodal traffic counts, speeds, and congestion scores across urban corridors.",
    descriptionKo: "도심 주요 구간의 센서 융합 교통량, 속도, 혼잡도 지표를 제공합니다.",
    category: "Geospatial",
    price: 3000000,
    records: "22.8M",
    accuracy: "99.0%",
    format: "CSV, Parquet, GeoParquet",
    updateFrequency: "Daily",
    features: [
      "Loop detector and camera fusion",
      "Anomaly scoring for incidents",
      "Travel time reliability indexes",
      "Weather-adjusted congestion",
      "GeoJSON corridor geometry"
    ],
    sampleFields: [
      { name: "corridor_id", type: "string", description: "Road corridor identifier" },
      { name: "timestamp", type: "datetime", description: "Observation time" },
      { name: "avg_speed_kph", type: "float", description: "Average speed" },
      { name: "flow_vehicles", type: "integer", description: "Vehicle count" },
      { name: "congestion_score", type: "float", description: "0-1 congestion score" }
    ],
    sampleData: [
      { corridor_id: "KR-SEL-GN-001", timestamp: "2024-01-15T08:00:00Z", avg_speed_kph: 42.1, flow_vehicles: 1830, congestion_score: 0.32 },
      { corridor_id: "KR-SEL-GN-002", timestamp: "2024-01-15T08:00:00Z", avg_speed_kph: 18.4, flow_vehicles: 2110, congestion_score: 0.78 },
      { corridor_id: "KR-SEL-GN-003", timestamp: "2024-01-15T08:00:00Z", avg_speed_kph: 25.6, flow_vehicles: 1560, congestion_score: 0.61 }
    ]
  },
  {
    id: "wildfire-vision",
    name: "Satellite Wildfire Monitoring",
    nameKo: "위성 기반 산불 모니터링 데이터",
    description: "Pre-processed multispectral satellite tiles with burn scars, hotspots, and smoke plumes for rapid response.",
    descriptionKo: "산불 흔적, 핫스팟, 연기 기둥을 포함한 다중분광 위성 타일을 전처리하여 제공합니다.",
    category: "Geospatial",
    price: 2600000,
    records: "3.4M",
    accuracy: "96.4%",
    format: "GeoTIFF, Cloud-Optimized GeoTIFF",
    updateFrequency: "Daily",
    features: [
      "Atmospheric corrected reflectance",
      "Thermal hotspot confidence scores",
      "Smoke plume vector masks",
      "NDVI and NBR vegetation indexes",
      "Tiling compatible with STAC/COG"
    ],
    sampleFields: [
      { name: "tile_id", type: "string", description: "Tile identifier" },
      { name: "acquired_at", type: "datetime", description: "Acquisition time" },
      { name: "hotspot_confidence", type: "float", description: "0-1 confidence" },
      { name: "burn_area_hectare", type: "float", description: "Estimated burn area" },
      { name: "plume_vector", type: "string", description: "WKT geometry of plume" }
    ],
    sampleData: [
      { tile_id: "SAT-KR-20240115-001", acquired_at: "2024-01-15T03:00:00Z", hotspot_confidence: 0.91, burn_area_hectare: 18.4, plume_vector: "LINESTRING (126.9 37.5, 127.3 37.7)" },
      { tile_id: "SAT-KR-20240115-002", acquired_at: "2024-01-15T03:00:00Z", hotspot_confidence: 0.67, burn_area_hectare: 6.2, plume_vector: "LINESTRING (127.1 37.2, 127.4 37.4)" },
      { tile_id: "SAT-JP-20240115-010", acquired_at: "2024-01-15T02:00:00Z", hotspot_confidence: 0.82, burn_area_hectare: 11.9, plume_vector: "LINESTRING (139.3 35.6, 139.6 35.9)" }
    ]
  },
  {
    id: "iot-factory-anomaly",
    name: "Industrial IoT Anomaly Dataset",
    nameKo: "제조 설비 IoT 이상징후 데이터셋",
    description: "Time-series sensor signals with labeled downtime and anomaly root causes for predictive maintenance.",
    descriptionKo: "설비 센서 시계열과 다운타임/이상 원인 라벨을 포함해 예지보전 모델에 적합합니다.",
    category: "Analytics",
    price: 2700000,
    records: "9.3M",
    accuracy: "97.2%",
    format: "Parquet, CSV",
    updateFrequency: "Weekly",
    features: [
      "Multi-sensor vibration and temperature",
      "FFT domain features precomputed",
      "Labeled failure modes and MTBF",
      "Gap-filled and normalized signals",
      "Train/validation splits included"
    ],
    sampleFields: [
      { name: "machine_id", type: "string", description: "Equipment identifier" },
      { name: "timestamp", type: "datetime", description: "Sensor timestamp" },
      { name: "vibration_rms", type: "float", description: "RMS vibration" },
      { name: "temp_celsius", type: "float", description: "Surface temperature" },
      { name: "anomaly_label", type: "string", description: "Failure label" }
    ],
    sampleData: [
      { machine_id: "PRESS-01", timestamp: "2024-01-15T09:00:00Z", vibration_rms: 1.82, temp_celsius: 63.1, anomaly_label: "bearing_wear" },
      { machine_id: "PRESS-02", timestamp: "2024-01-15T09:00:00Z", vibration_rms: 0.94, temp_celsius: 48.6, anomaly_label: "normal" },
      { machine_id: "CNC-05", timestamp: "2024-01-15T09:00:00Z", vibration_rms: 2.41, temp_celsius: 71.3, anomaly_label: "spindle_misalignment" }
    ]
  },
  {
    id: "b2b-credit-risk",
    name: "B2B Credit Risk Scores",
    nameKo: "B2B 크레딧 리스크 스코어 데이터",
    description: "Probabilistic credit risk scores for enterprises combining filings, payment behavior, and network signals.",
    descriptionKo: "공시, 결제 성향, 네트워크 신호를 결합한 기업 신용 리스크 확률 스코어입니다.",
    category: "Finance",
    price: 3100000,
    records: "4.6M",
    accuracy: "98.9%",
    format: "CSV, JSON",
    updateFrequency: "Monthly",
    features: [
      "Payment delinquency history",
      "Supplier-customer network centrality",
      "Sector-adjusted probability of default",
      "Alert flags for filings and liens",
      "Model explainability attributes"
    ],
    sampleFields: [
      { name: "company_id", type: "string", description: "Enterprise identifier" },
      { name: "pd_12m", type: "float", description: "12-month probability of default" },
      { name: "industry_code", type: "string", description: "Industry classification" },
      { name: "paydex", type: "integer", description: "Payment index score" },
      { name: "risk_grade", type: "string", description: "Risk band grade" }
    ],
    sampleData: [
      { company_id: "KR-BIZ-00123", pd_12m: 0.012, industry_code: "C26", paydex: 82, risk_grade: "A" },
      { company_id: "KR-BIZ-00456", pd_12m: 0.074, industry_code: "G47", paydex: 61, risk_grade: "BBB" },
      { company_id: "JP-BIZ-00077", pd_12m: 0.156, industry_code: "H52", paydex: 49, risk_grade: "BB" }
    ]
  },
  {
    id: "power-demand-forecast",
    name: "Power Demand Forecasting Set",
    nameKo: "전력 수요 예측 데이터 세트",
    description: "Historical load curves, weather features, and calendar effects prepared for short-term load forecasting.",
    descriptionKo: "단기 전력 수요 예측용 과거 부하, 기상, 캘린더 특성을 포함합니다.",
    category: "Analytics",
    price: 2400000,
    records: "14.5M",
    accuracy: "98.3%",
    format: "Parquet, CSV",
    updateFrequency: "Daily",
    features: [
      "15-minute load curves",
      "Weather forecast alignment",
      "Holiday and event flags",
      "Regional grid topology IDs",
      "Baseline forecasts included"
    ],
    sampleFields: [
      { name: "region_id", type: "string", description: "Grid region identifier" },
      { name: "timestamp", type: "datetime", description: "Interval start" },
      { name: "load_mw", type: "float", description: "Load in megawatts" },
      { name: "temp_celsius", type: "float", description: "Ambient temperature" },
      { name: "is_holiday", type: "boolean", description: "Holiday flag" }
    ],
    sampleData: [
      { region_id: "KR-SE-01", timestamp: "2024-01-15T08:00:00Z", load_mw: 12840.5, temp_celsius: -2.1, is_holiday: false },
      { region_id: "KR-SE-01", timestamp: "2024-01-15T08:15:00Z", load_mw: 12922.3, temp_celsius: -2.0, is_holiday: false },
      { region_id: "KR-BU-02", timestamp: "2024-01-15T08:00:00Z", load_mw: 8421.7, temp_celsius: 0.4, is_holiday: false }
    ]
  },
  {
    id: "lastmile-optimization",
    name: "Last-Mile Logistics Optimization",
    nameKo: "라스트마일 물류 최적화 데이터",
    description: "Route telemetry, stop-level service times, and constraint metadata for VRP optimization.",
    descriptionKo: "경로 텔레메트리, 정차 서비스 시간, 제약 조건 메타데이터로 VRP 최적화에 활용됩니다.",
    category: "Geospatial",
    price: 2550000,
    records: "11.0M",
    accuracy: "97.8%",
    format: "Parquet, CSV, GeoJSON",
    updateFrequency: "Weekly",
    features: [
      "GPS breadcrumb traces",
      "Time-window and capacity constraints",
      "Depot and hub hierarchy",
      "Turn restriction and road class tags",
      "Historic on-time performance"
    ],
    sampleFields: [
      { name: "route_id", type: "string", description: "Route identifier" },
      { name: "stop_sequence", type: "integer", description: "Stop order" },
      { name: "arrived_at", type: "datetime", description: "Arrival time" },
      { name: "service_seconds", type: "integer", description: "Service duration" },
      { name: "geo_point", type: "string", description: "WKT point" }
    ],
    sampleData: [
      { route_id: "RT-SEO-001", stop_sequence: 1, arrived_at: "2024-01-15T09:10:00Z", service_seconds: 180, geo_point: "POINT (127.0276 37.4979)" },
      { route_id: "RT-SEO-001", stop_sequence: 2, arrived_at: "2024-01-15T09:25:00Z", service_seconds: 210, geo_point: "POINT (127.0412 37.5031)" },
      { route_id: "RT-BUS-014", stop_sequence: 1, arrived_at: "2024-01-15T08:50:00Z", service_seconds: 160, geo_point: "POINT (129.0756 35.1796)" }
    ]
  },
  {
    id: "retail-price-intel",
    name: "Retail Price Intelligence",
    nameKo: "소매 가격 인텔리전스 데이터",
    description: "Product-level price, promotion, and availability traces across omni-channel retail.",
    descriptionKo: "상품 단위 가격, 프로모션, 재고 변동을 옴니채널로 수집한 데이터입니다.",
    category: "Finance",
    price: 2300000,
    records: "7.9M",
    accuracy: "97.6%",
    format: "CSV, Parquet",
    updateFrequency: "Daily",
    features: [
      "Online/offline channel harmonization",
      "Promotion type and depth tagging",
      "MAP/MSRP compliance alerts",
      "Stock-out and restock signals",
      "Competitive set clustering"
    ],
    sampleFields: [
      { name: "sku", type: "string", description: "Product SKU" },
      { name: "channel", type: "string", description: "Online or offline" },
      { name: "price_krw", type: "float", description: "Price in KRW" },
      { name: "promotion_flag", type: "boolean", description: "Promotion indicator" },
      { name: "availability", type: "string", description: "In-stock status" }
    ],
    sampleData: [
      { sku: "SKU-EL-0001", channel: "online", price_krw: 1180000, promotion_flag: true, availability: "in_stock" },
      { sku: "SKU-FA-0201", channel: "offline", price_krw: 89000, promotion_flag: false, availability: "limited" },
      { sku: "SKU-HM-1102", channel: "online", price_krw: 45000, promotion_flag: true, availability: "out_of_stock" }
    ]
  }
];
