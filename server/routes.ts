import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isApproved, isAdmin } from "./auth";
import { insertProductSchema, insertCategorySchema, insertBrandSchema, insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User management routes (admin only)
  app.get('/api/users/pending', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.post('/api/users/:id/approve', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const user = await storage.approveUser(req.params.id);
      res.json(user);
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post('/api/users/:id/reject', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const user = await storage.rejectUser(req.params.id);
      res.json(user);
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Brand routes
  app.get('/api/brands', async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.post('/api/brands', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const brandData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(brandData);
      res.json(brand);
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category, brand, featured } = req.query;
      
      let products;
      if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else if (brand) {
        products = await storage.getProductsByBrand(brand as string);
      } else if (featured) {
        const limit = parseInt(featured as string) || 8;
        products = await storage.getFeaturedProducts(limit);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is admin
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes (require approval)
  app.get('/api/cart', isAuthenticated, isApproved, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, isApproved, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, isApproved, async (req: any, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, isApproved, async (req: any, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes (require approval)
  app.get('/api/orders', isAuthenticated, isApproved, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Admin can see all orders, regular users see only their orders
      const orders = user?.isAdmin 
        ? await storage.getOrders()
        : await storage.getOrders(userId);
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user owns the order or is admin
      if (order.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const createOrderSchema = z.object({
    shippingAddress: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
    }),
  });

  app.post('/api/orders', isAuthenticated, isApproved, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { shippingAddress } = createOrderSchema.parse(req.body);
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => 
        sum + parseFloat(item.product.price) * item.quantity, 0
      );
      const shipping = 9.99;
      const tax = subtotal * 0.07; // 7% tax
      const total = subtotal + shipping + tax;
      
      // Create order
      const order = await storage.createOrder(
        {
          userId,
          status: "pending",
          subtotal: subtotal.toString(),
          shipping: shipping.toString(),
          tax: tax.toString(),
          total: total.toString(),
          shippingAddress,
        },
        cartItems.map(item => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
          orderId: '', // This will be set in the storage function
        }))
      );
      
      // Clear cart after order creation
      await storage.clearCart(userId);
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  

// --- Admin: Users (approval) ---
app.get("/api/admin/users", async (req: any, res) => {
  try {
    if (!req.isAuthenticated() || !["manager","main_admin"].includes(req.user!.role)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const users = await storage.getAllUsers?.();
    if (!users) return res.json([]);
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.patch("/api/admin/users/:id/approve", async (req: any, res) => {
  try {
    if (!req.isAuthenticated() || !["manager","main_admin"].includes(req.user!.role)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { approved } = req.body ?? { approved: true };
    await storage.updateUserApproval(req.params.id, !!approved);
    const user = await storage.getUser(req.params.id);
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update approval" });
  }
});

// --- Admin: Orders ---
app.get("/api/admin/orders", async (req: any, res) => {
  try {
    if (!req.isAuthenticated() || !["manager","main_admin"].includes(req.user!.role)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const orders = await storage.getAllOrders?.();
    res.json(orders ?? []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.patch("/api/admin/orders/:id/status", async (req: any, res) => {
  try {
    if (!req.isAuthenticated() || !["manager","main_admin"].includes(req.user!.role)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { status } = req.body;
    const order = await storage.updateOrderStatus?.(req.params.id, status);
    res.json(order ?? { id: req.params.id, status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update order status" });
  }
});
const httpServer = createServer(app);
  return httpServer;
}
