import { type User, type InsertUser, type Company, type InsertCompany, type Invoice, type InsertInvoice, type InvoiceItem, type InsertInvoiceItem, type InvoiceWithItems } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company methods
  createCompany(company: InsertCompany): Promise<Company>;
  getCompany(id: string): Promise<Company | undefined>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  
  // Invoice methods
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: string): Promise<InvoiceWithItems | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithItems | undefined>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<InvoiceWithItems[]>;
  
  // Invoice item methods
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  deleteInvoiceItem(id: string): Promise<boolean>;
  
  // Utility methods
  generateInvoiceNumber(): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private companies: Map<string, Company>;
  private invoices: Map<string, Invoice>;
  private invoiceItems: Map<string, InvoiceItem>;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
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

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const company: Company = { 
      ...insertCompany, 
      id, 
      createdAt: new Date() 
    };
    this.companies.set(id, company);
    return company;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async updateCompany(id: string, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...updateData };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      createdAt: new Date() 
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoice(id: string): Promise<InvoiceWithItems | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const items = await this.getInvoiceItems(id);
    const company = invoice.companyId ? await this.getCompany(invoice.companyId) : undefined;
    
    return { ...invoice, items, company };
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithItems | undefined> {
    const invoice = Array.from(this.invoices.values()).find(
      (inv) => inv.invoiceNumber === invoiceNumber
    );
    if (!invoice) return undefined;
    
    const items = await this.getInvoiceItems(invoice.id);
    const company = invoice.companyId ? await this.getCompany(invoice.companyId) : undefined;
    
    return { ...invoice, items, company };
  }

  async updateInvoice(id: string, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...updateData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async getAllInvoices(): Promise<InvoiceWithItems[]> {
    const invoices = Array.from(this.invoices.values());
    const invoicesWithItems = await Promise.all(
      invoices.map(async (invoice) => {
        const items = await this.getInvoiceItems(invoice.id);
        const company = invoice.companyId ? await this.getCompany(invoice.companyId) : undefined;
        return { ...invoice, items, company };
      })
    );
    return invoicesWithItems;
  }

  async createInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = randomUUID();
    const item: InvoiceItem = { ...insertItem, id };
    this.invoiceItems.set(id, item);
    return item;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(
      (item) => item.invoiceId === invoiceId
    );
  }

  async deleteInvoiceItem(id: string): Promise<boolean> {
    return this.invoiceItems.delete(id);
  }

  async generateInvoiceNumber(): Promise<string> {
    const existingInvoices = Array.from(this.invoices.values());
    const maxNumber = existingInvoices
      .map(inv => {
        const match = inv.invoiceNumber.match(/INV-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .reduce((max, current) => Math.max(max, current), 0);
    
    const nextNumber = (maxNumber + 1).toString().padStart(6, '0');
    return `INV-${nextNumber}`;
  }
}

export const storage = new MemStorage();
