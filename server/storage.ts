import { products, contactMessages, orders, type Product, type InsertProduct, type ContactMessage, type InsertContact, type Order, type InsertOrder } from "@shared/schema";
// import { db } from "./db"; // DB is disabled
// import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  createContactMessage(message: InsertContact): Promise<ContactMessage>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

export class JsonFileStorage implements IStorage {
  private async ensureDataDir() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      console.error("Error creating data directory:", error);
    }
  }

  private async readJson<T>(file: string, defaultValue: T): Promise<T> {
    try {
      await this.ensureDataDir();
      const content = await fs.readFile(file, "utf-8");
      return JSON.parse(content) as T;
    } catch (error) {
      // If file doesn't exist, return default
      if ((error as any).code === 'ENOENT') {
        return defaultValue;
      }
      throw error;
    }
  }

  private async writeJson<T>(file: string, data: T): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  }

  async getProducts(): Promise<Product[]> {
    return await this.readJson<Product[]>(PRODUCTS_FILE, []);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const products = await this.getProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = { ...insertProduct, id: newId };
    products.push(newProduct);
    await this.writeJson(PRODUCTS_FILE, products);
    return newProduct;
  }

  async createContactMessage(insertMessage: InsertContact): Promise<ContactMessage> {
    // For now, just log or ignore, as requested focus is on inventory. 
    // Implementing minimal return to satisfy interface.
    console.log("Contact message received:", insertMessage);
    return { ...insertMessage, id: 1, createdAt: new Date().toISOString() };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    // Similarly, minimal implementation for orders
    console.log("Order received:", insertOrder);
    return { ...insertOrder, id: 1, status: "pending" };
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    // Merge existing product with updates
    const updatedProduct = { ...products[index], ...productUpdate };
    products[index] = updatedProduct;

    await this.writeJson(PRODUCTS_FILE, products);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    let products = await this.getProducts();
    products = products.filter(p => p.id !== id);
    await this.writeJson(PRODUCTS_FILE, products);
  }
}

export const storage = new JsonFileStorage();
