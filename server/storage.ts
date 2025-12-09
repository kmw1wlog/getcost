import {
  users,
  orders,
  type User,
  type UpsertUser,
  type Order,
  type InsertOrder,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderByMulNo(mulNo: string): Promise<Order | undefined>;
  updateOrderStatus(mulNo: string, status: string, completedAt?: Date): Promise<Order | undefined>;
  updateOrderDelivery(orderId: string, deliveryUrl: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderStats(): Promise<{ totalRevenue: number; totalOrders: number; completedOrders: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrderByMulNo(mulNo: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.mulNo, mulNo));
    return order;
  }

  async updateOrderStatus(mulNo: string, status: string, completedAt?: Date): Promise<Order | undefined> {
    const updateData: Partial<Order> = { paymentStatus: status };
    if (completedAt) {
      updateData.completedAt = completedAt;
    }
    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.mulNo, mulNo))
      .returning();
    return order;
  }

  async updateOrderDelivery(orderId: string, deliveryUrl: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ deliveryStatus: "delivered", deliveryUrl })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderStats(): Promise<{ totalRevenue: number; totalOrders: number; completedOrders: number }> {
    const allOrders = await db.select().from(orders);
    const completedOrders = allOrders.filter(o => o.paymentStatus === "completed");
    return {
      totalRevenue: completedOrders.reduce((sum, o) => sum + o.price, 0),
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
    };
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const id = user.id || randomUUID();
    const existing = this.users.get(id);
    const newUser: User = {
      ...existing,
      ...user,
      id,
      email: user.email || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      profileImageUrl: user.profileImageUrl || null,
      isAdmin: user.isAdmin || false,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    } as User;
    this.users.set(id, newUser);
    return newUser;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = {
      ...order,
      id,
      userId: order.userId || null,
      mulNo: order.mulNo || null,
      paymentStatus: order.paymentStatus || "pending",
      receiptType: order.receiptType || null,
      businessNumber: order.businessNumber || null,
      deliveryStatus: order.deliveryStatus || "pending",
      deliveryUrl: order.deliveryUrl || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderByMulNo(mulNo: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find((o) => o.mulNo === mulNo);
  }

  async updateOrderStatus(mulNo: string, status: string, completedAt?: Date): Promise<Order | undefined> {
    const order = await this.getOrderByMulNo(mulNo);
    if (!order) return undefined;
    const updated = { ...order, paymentStatus: status, completedAt: completedAt || null };
    this.orders.set(order.id, updated);
    return updated;
  }

  async updateOrderDelivery(orderId: string, deliveryUrl: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    const updated = { ...order, deliveryStatus: "delivered", deliveryUrl };
    this.orders.set(orderId, updated);
    return updated;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((o) => o.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getOrderStats(): Promise<{ totalRevenue: number; totalOrders: number; completedOrders: number }> {
    const allOrders = Array.from(this.orders.values());
    const completedOrders = allOrders.filter(o => o.paymentStatus === "completed");
    return {
      totalRevenue: completedOrders.reduce((sum, o) => sum + o.price, 0),
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
    };
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
