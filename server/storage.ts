import {
  users,
  categories,
  brands,
  products,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Brand,
  type InsertBrand,
  type Product,
  type InsertProduct,
  type ProductWithRelations,
  type CartItem,
  type InsertCartItem,
  type CartItemWithProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Brand operations
  getBrands(): Promise<Brand[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  
  // Product operations
  getProducts(): Promise<ProductWithRelations[]>;
  getProductById(id: string): Promise<ProductWithRelations | undefined>;
  getProductsByCategory(categoryId: string): Promise<ProductWithRelations[]>;
  getProductsByBrand(brandId: string): Promise<ProductWithRelations[]>;
  getFeaturedProducts(limit?: number): Promise<ProductWithRelations[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Cart operations
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  getOrders(userId?: string): Promise<OrderWithItems[]>;
  getOrderById(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if admin users should be auto-approved
    const isAdminUser = userData.email === 'dostanbakr88@gmail.com' || userData.email === 'raviar@replit.com';
    const userDataWithApproval = {
      ...userData,
      isAdmin: isAdminUser,
      isApproved: isAdminUser, // Auto-approve admin users
    };

    const [user] = await db
      .insert(users)
      .values(userDataWithApproval)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userDataWithApproval,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User approval operations
  async approveUser(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async rejectUser(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isApproved: false, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isApproved, false));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.nameEn));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Brand operations
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands).orderBy(asc(brands.name));
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  // Product operations
  async getProducts(): Promise<ProductWithRelations[]> {
    const results = await db.query.products.findMany({
      with: {
        category: true,
        brand: true,
      },
      orderBy: [desc(products.createdAt)],
    });
    return results.map(product => ({
      ...product,
      category: product.category || undefined,
      brand: product.brand || undefined,
    }));
  }

  async getProductById(id: string): Promise<ProductWithRelations | undefined> {
    const result = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        brand: true,
      },
    });
    if (!result) return undefined;
    return {
      ...result,
      category: result.category || undefined,
      brand: result.brand || undefined,
    };
  }

  async getProductsByCategory(categoryId: string): Promise<ProductWithRelations[]> {
    const results = await db.query.products.findMany({
      where: eq(products.categoryId, categoryId),
      with: {
        category: true,
        brand: true,
      },
      orderBy: [desc(products.createdAt)],
    });
    return results.map(product => ({
      ...product,
      category: product.category || undefined,
      brand: product.brand || undefined,
    }));
  }

  async getProductsByBrand(brandId: string): Promise<ProductWithRelations[]> {
    const results = await db.query.products.findMany({
      where: eq(products.brandId, brandId),
      with: {
        category: true,
        brand: true,
      },
      orderBy: [desc(products.createdAt)],
    });
    return results.map(product => ({
      ...product,
      category: product.category || undefined,
      brand: product.brand || undefined,
    }));
  }

  async getFeaturedProducts(limit = 8): Promise<ProductWithRelations[]> {
    const results = await db.query.products.findMany({
      with: {
        category: true,
        brand: true,
      },
      orderBy: [desc(products.rating), desc(products.createdAt)],
      limit,
    });
    return results.map(product => ({
      ...product,
      category: product.category || undefined,
      brand: product.brand || undefined,
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    return await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: {
        product: true,
      },
      orderBy: [desc(cartItems.createdAt)],
    });
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item with same product and size already exists
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.userId, cartItem.userId),
        eq(cartItems.productId, cartItem.productId),
        eq(cartItems.size, cartItem.size)
      ),
    });

    if (existingItem) {
      // Update quantity of existing item
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: (existingItem.quantity || 0) + (cartItem.quantity || 0) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new cart item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getOrders(userId?: string): Promise<OrderWithItems[]> {
    const whereClause = userId ? eq(orders.userId, userId) : undefined;
    
    return await db.query.orders.findMany({
      where: whereClause,
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
    });
  }

  async getOrderById(id: string): Promise<OrderWithItems | undefined> {
    return await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });
  }

  async createOrder(order: InsertOrder, orderItemsData: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Insert order items
    const orderItemsWithOrderId = orderItemsData.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
}

export const storage = new DatabaseStorage();
