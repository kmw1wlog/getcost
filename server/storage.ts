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

export const storage = new DatabaseStorage();
