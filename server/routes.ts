import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertInvoiceSchema, insertInvoiceItemSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if user exists
      let user = await storage.getUserByUsername(username);
      
      // If user doesn't exist, create default admin user
      if (!user && username === "admin" && password === "admin123") {
        user = await storage.createUser({ username: "admin", password: "admin123" });
      }
      
      // Simple password check (in production, use proper hashing)
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      res.json({ 
        success: true, 
        username: user.username,
        message: "Login successful" 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ success: true, message: "Logout successful" });
  });
  
  // Company routes
  app.post("/api/companies", async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid company data", error });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Error fetching company", error });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    try {
      const updateData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, updateData);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error });
    }
  });

  // Invoice routes
  app.post("/api/invoices", async (req, res) => {
    try {
      const { invoice: invoiceData, items, company: companyData } = req.body;
      
      let companyId = invoiceData.companyId;
      
      // Create company if provided
      if (companyData && companyData.name) {
        try {
          const company = await storage.createCompany(companyData);
          companyId = company.id;
        } catch (error) {
          // Company might already exist, try to find it
          console.log("Company creation note:", error);
        }
      }
      
      // Generate invoice number if not provided
      if (!invoiceData.invoiceNumber) {
        invoiceData.invoiceNumber = await storage.generateInvoiceNumber();
      }
      
      const finalInvoiceData = {
        ...invoiceData,
        companyId
      };
      
      const validatedInvoice = insertInvoiceSchema.parse(finalInvoiceData);
      const invoice = await storage.createInvoice(validatedInvoice);
      
      // Add items if provided
      if (items && Array.isArray(items)) {
        await Promise.all(
          items.map(async (item: any) => {
            const validatedItem = insertInvoiceItemSchema.parse({
              ...item,
              invoiceId: invoice.id
            });
            return await storage.createInvoiceItem(validatedItem);
          })
        );
      }
      
      // Return full invoice with items
      const fullInvoice = await storage.getInvoice(invoice.id);
      res.json(fullInvoice);
    } catch (error) {
      console.error("Invoice creation error:", error);
      res.status(400).json({ message: "Invalid invoice data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoices", error });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoice", error });
    }
  });

  app.get("/api/invoices/number/:invoiceNumber", async (req, res) => {
    try {
      const invoice = await storage.getInvoiceByNumber(req.params.invoiceNumber);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoice", error });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const updateData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(req.params.id, updateData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error });
    }
  });

  // Invoice items routes
  app.post("/api/invoice-items", async (req, res) => {
    try {
      const itemData = insertInvoiceItemSchema.parse(req.body);
      const item = await storage.createInvoiceItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid item data", error });
    }
  });

  app.delete("/api/invoice-items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInvoiceItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting item", error });
    }
  });

  // Utility routes
  app.get("/api/invoice-number/generate", async (req, res) => {
    try {
      const invoiceNumber = await storage.generateInvoiceNumber();
      res.json({ invoiceNumber });
    } catch (error) {
      res.status(500).json({ message: "Error generating invoice number", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
