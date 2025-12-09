import { type User, type InsertUser, type PaymentRequest, type CashReceiptRequest } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  savePaymentRequest(request: PaymentRequest & { mulNo?: string }): Promise<void>;
  getPaymentByMulNo(mulNo: string): Promise<(PaymentRequest & { mulNo?: string }) | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private payments: Map<string, PaymentRequest & { mulNo?: string }>;

  constructor() {
    this.users = new Map();
    this.payments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async savePaymentRequest(request: PaymentRequest & { mulNo?: string }): Promise<void> {
    if (request.mulNo) {
      this.payments.set(request.mulNo, request);
    }
  }

  async getPaymentByMulNo(mulNo: string): Promise<(PaymentRequest & { mulNo?: string }) | undefined> {
    return this.payments.get(mulNo);
  }
}

export const storage = new MemStorage();
