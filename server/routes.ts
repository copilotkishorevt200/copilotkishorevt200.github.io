import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertContactSchema, insertOrderSchema } from "@shared/schema";

import { setupAuth, isAuthenticated } from "./auth";

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    const productsToSeed = [
      {
        name: "Oversized Street Hoodie",
        description: "Premium heavyweight cotton hoodie with dropped shoulders and a boxy fit. Features a minimal logo on the chest and a large graphic print on the back. Perfect for layering.",
        price: "85.00",
        category: "Hoodies",
        sizes: ["S", "M", "L", "XL"],
        images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        inStock: true,
        featured: true,
      },
      {
        name: "Cargo Tech Pants",
        description: "Functional cargo pants made from durable ripstop fabric. Multiple pockets for utility and adjustable cuffs for a customizable fit. Water-resistant finish.",
        price: "95.00",
        category: "Pants",
        sizes: ["30", "32", "34", "36"],
        images: ["https://images.unsplash.com/photo-1517445312882-6362953a067a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        inStock: true,
        featured: true,
      },
      {
        name: "Graphic Tee - 'Rebel'",
        description: "Heavyweight cotton t-shirt with a vintage wash. Bold 'Rebel' graphic screen-printed on the front. Relaxed fit for all-day comfort.",
        price: "45.00",
        category: "T-Shirts",
        sizes: ["S", "M", "L", "XL", "XXL"],
        images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        inStock: true,
        featured: true,
      },
      {
        name: "Distressed Denim Jacket",
        description: "Classic trucker jacket silhouette reimagined with heavy distressing and raw hems. Medium wash denim that pairs with everything.",
        price: "120.00",
        category: "Jackets",
        sizes: ["M", "L", "XL"],
        images: ["https://images.unsplash.com/photo-1523205565295-f8e91625443b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        inStock: true,
        featured: false,
      },
      {
        name: "Urban Utility Vest",
        description: "Tactical utility vest with mesh panels and zippered pockets. Adds an edge to any outfit. Layer over a hoodie or tee.",
        price: "70.00",
        category: "Accessories",
        sizes: ["One Size"],
        images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        inStock: true,
        featured: false,
      },
      {
        name: "Wide Leg Chinos",
        description: "Relaxed fit chinos with a wide leg opening. Cropped length to show off your sneakers. Made from soft cotton twill.",
        price: "65.00",
        category: "Pants",
        sizes: ["30", "32", "34"],
        images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        inStock: true,
        featured: false,
      },
      {
        name: "Bucket Hat - Black",
        description: "Classic bucket hat in durable canvas. Features embroidered logo and adjustable chin strap.",
        price: "30.00",
        category: "Accessories",
        sizes: ["One Size"],
        images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        inStock: true,
        featured: false,
      },
      {
        name: "Essential Crew Socks",
        description: "Pack of 3 premium cotton blend socks. Ribbed cuffs and cushioned sole for comfort. Minimalist branding.",
        price: "25.00",
        category: "Accessories",
        sizes: ["One Size"],
        images: ["https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        inStock: true,
        featured: false,
      }
    ];

    for (const product of productsToSeed) {
      await storage.createProduct(product);
    }
    console.log("Database seeded with products");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Seed database on startup
  await seedDatabase();

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post(api.products.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const input = insertContactSchema.parse(req.body);
      const message = await storage.createContactMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, input);
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      // If product not found, storage throws error
      res.status(404).json({ message: "Product not found" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).end();
    } catch (err) {
      res.status(404).json({ message: "Product not found" });
    }
  });

  return httpServer;
}
