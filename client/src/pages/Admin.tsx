import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Package, BAWA SHOPpingCart, Users, Check, X } from "lucide-react";
import type { ProductWithRelations, Category, Brand, OrderWithItems, User } from "@shared/schema";

const productSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  nameKu: z.string().min(1, "Kurdish name is required"),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionKu: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  imageUrl: z.string().url("Valid image URL is required"),
  sizes: z.string().min(1, "Sizes are required"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  isNew: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  stock: z.string().default("0"),
});

type ProductForm = z.infer<typeof productSchema>;

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to access admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
    }
  }, [user, isAuthenticated, isLoading, toast]);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      nameKu: "",
      descriptionEn: "",
      descriptionAr: "",
      descriptionKu: "",
      price: "",
      originalPrice: "",
      imageUrl: "",
      sizes: "",
      categoryId: "",
      brandId: "",
      isNew: false,
      isOnSale: false,
      stock: "0",
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["/api/brands"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: pendingUsers = [], isLoading: pendingUsersLoading } = useQuery({
    queryKey: ["/api/users/pending"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const payload = {
        ...data,
        sizes: data.sizes.split(',').map(s => s.trim()),
        stock: parseInt(data.stock),
      };
      await apiRequest("POST", "/api/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setIsProductModalOpen(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductForm }) => {
      const payload = {
        ...data,
        sizes: data.sizes.split(',').map(s => s.trim()),
        stock: parseInt(data.stock),
      };
      await apiRequest("PUT", `/api/products/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsProductModalOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/users/${userId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/pending"] });
      toast({
        title: "Success",
        description: "User approved successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/users/${userId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/pending"] });
      toast({
        title: "Success",
        description: "User rejected successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditProduct = (product: ProductWithRelations) => {
    setEditingProduct(product);
    form.reset({
      nameEn: product.nameEn,
      nameAr: product.nameAr || "",
      nameKu: product.nameKu || "",
      descriptionEn: product.descriptionEn || "",
      descriptionAr: product.descriptionAr || "",
      descriptionKu: product.descriptionKu || "",
      price: product.price,
      originalPrice: product.originalPrice || "",
      imageUrl: product.imageUrl,
      sizes: product.sizes?.join(', ') || "",
      categoryId: product.categoryId || "",
      brandId: product.brandId || "",
      isNew: product.isNew || false,
      isOnSale: product.isOnSale || false,
      stock: product.stock?.toString() || "0",
    });
    setIsProductModalOpen(true);
  };

  const onSubmit = (data: ProductForm) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return `${numPrice.toLocaleString('en-US')} IQD`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You need admin privileges to access this page.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
          <p className="text-gray-600">Manage your shoe store</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BAWA SHOPpingCart className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Users</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(orders.reduce((sum, order) => sum + parseFloat(order.total), 0).toString())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">{t('admin.products')}</TabsTrigger>
            <TabsTrigger value="orders">{t('admin.orders')}</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{t('admin.products')}</CardTitle>
                  <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingProduct(null); form.reset(); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('admin.add_product')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? 'Edit Product' : t('admin.add_product')}
                        </DialogTitle>
                      </DialogHeader>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="nameEn"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name (English)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="nameAr"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name (Arabic)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="nameKu"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name (Kurdish)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="descriptionEn"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description (English)</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="descriptionAr"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description (Arabic)</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="descriptionKu"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description (Kurdish)</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="originalPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Original Price (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <Input type="url" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="sizes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sizes (comma separated)</FormLabel>
                                <FormControl>
                                  <Input placeholder="7, 8, 9, 10, 11" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories.map((category: Category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                          {category.nameEn}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="brandId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Brand</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {brands.map((brand: Brand) => (
                                        <SelectItem key={brand.id} value={brand.id}>
                                          {brand.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="stock"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stock</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsProductModalOpen(false)}
                            >
                              {t('common.cancel')}
                            </Button>
                            <Button
                              type="submit"
                              disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            >
                              {(createProductMutation.isPending || updateProductMutation.isPending) 
                                ? t('common.loading') 
                                : editingProduct ? 'Update' : t('common.save')
                              }
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          {t('common.loading')}
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product: ProductWithRelations) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img
                              src={product.imageUrl}
                              alt={product.nameEn}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.nameEn}</TableCell>
                          <TableCell>{product.brand?.name}</TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                                disabled={deleteProductMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.orders')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {t('common.loading')}
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order: OrderWithItems) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt!)}</TableCell>
                          <TableCell>{formatPrice(order.total)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(status) =>
                                updateOrderStatusMutation.mutate({ id: order.id, status })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <p className="text-gray-600">Approve or reject pending user registrations</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsersLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading pending users...
                        </TableCell>
                      </TableRow>
                    ) : pendingUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No pending users
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingUsers.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.firstName || user.email?.split('@')[0] || 'Unknown'
                            }
                          </TableCell>
                          <TableCell>{user.email || 'N/A'}</TableCell>
                          <TableCell>{formatDate(user.createdAt!)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => approveUserMutation.mutate(user.id)}
                                disabled={approveUserMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectUserMutation.mutate(user.id)}
                                disabled={rejectUserMutation.isPending}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
