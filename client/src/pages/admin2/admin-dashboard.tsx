import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrandSchema, insertProductSchema, type User, type Brand, type ProductWithBrand, type InsertBrand, type InsertProduct } from "@shared/schema";
import { 
  Shield, Users, Clock, CheckCircle, Ban, Box, Plus, Edit, Trash2, 
  Search, Settings, LogOut, Eye, Check, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/1ravan_1754178167352.jpg";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductWithBrand | null>(null);

  // Redirect if not admin
  if (!user || !user.role || !["manager", "main_admin"].includes(user.role)) {
    navigate("/auth");
    return null;
  }

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["/api/admin/brands"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithBrand[]>({
    queryKey: ["/api/admin/products"],
  });

  // Mutations
  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User approved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to approve user", description: error.message, variant: "destructive" });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/reject`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User rejected successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reject user", description: error.message, variant: "destructive" });
    },
  });

  const createBrandMutation = useMutation({
    mutationFn: async (brandData: InsertBrand) => {
      const res = await apiRequest("POST", "/api/admin/brands", brandData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      setBrandDialogOpen(false);
      brandForm.reset();
      toast({ title: "Brand created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create brand", description: error.message, variant: "destructive" });
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBrand> }) => {
      const res = await apiRequest("PUT", `/api/admin/brands/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      setBrandDialogOpen(false);
      setEditingBrand(null);
      brandForm.reset();
      toast({ title: "Brand updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update brand", description: error.message, variant: "destructive" });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: async (brandId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/brands/${brandId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      toast({ title: "Brand deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete brand", description: error.message, variant: "destructive" });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      const res = await apiRequest("POST", "/api/admin/products", productData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setProductDialogOpen(false);
      productForm.reset();
      toast({ title: "Product created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProduct> }) => {
      const res = await apiRequest("PUT", `/api/admin/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
      toast({ title: "Product updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/products/${productId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });

  // Forms
  const brandForm = useForm<InsertBrand>({
    resolver: zodResolver(insertBrandSchema),
    defaultValues: {
      name: "",
      category: "",
      status: "active",
    },
  });

  const productForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      brandId: "",
      imageUrl: "",
      status: "active",
    },
  });

  // Stats
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.isPhoneVerified && !u.isApproved).length;
  const activeUsers = users.filter(u => u.isApproved).length;
  const suspendedUsers = users.filter(u => !u.isApproved && u.isPhoneVerified).length;

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "pending") return matchesSearch && user.isPhoneVerified && !user.isApproved;
    if (statusFilter === "active") return matchesSearch && user.isApproved;
    if (statusFilter === "suspended") return matchesSearch && !user.isApproved && user.isPhoneVerified;
    
    return matchesSearch;
  });

  const onBrandSubmit = (data: InsertBrand) => {
    if (editingBrand) {
      updateBrandMutation.mutate({ id: editingBrand.id, data });
    } else {
      createBrandMutation.mutate(data);
    }
  };

  const onProductSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const openBrandDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      brandForm.reset(brand);
    } else {
      setEditingBrand(null);
      brandForm.reset({
        name: "",
        category: "",
        status: "active",
      });
    }
    setBrandDialogOpen(true);
  };

  const openProductDialog = (product?: ProductWithBrand) => {
    if (product) {
      setEditingProduct(product);
      productForm.reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        brandId: product.brandId,
        imageUrl: product.imageUrl || "",
        status: product.status,
      });
    } else {
      setEditingProduct(null);
      productForm.reset({
        name: "",
        description: "",
        price: "0",
        brandId: "",
        imageUrl: "",
        status: "active",
      });
    }
    setProductDialogOpen(true);
  };

  const getUserStatusBadge = (user: User) => {
    if (!user.isPhoneVerified) {
      return <Badge variant="secondary">Phone Pending</Badge>;
    }
    if (!user.isApproved) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending Approval</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center mr-3 p-1">
                <img 
                  src={logoPath} 
                  alt="BAWA SHOP" 
                  className="w-full h-full object-contain rounded-sm"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold text-gray-900">BAWA SHOP</h1>
                <span className="text-sm text-gray-500">Admin Dashboard</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant={user.role === "main_admin" ? "default" : "secondary"}>
                {user.role === "main_admin" ? "Main Admin" : "Manager"}
              </Badge>
              <span className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Box className="h-4 w-4" />
              <span>Products & Brands</span>
            </TabsTrigger>
            {user.role === "main_admin" && (
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>System Settings</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                      <p className="text-2xl font-semibold text-gray-900">{pendingUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{activeUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Ban className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Suspended</p>
                      <p className="text-2xl font-semibold text-gray-900">{suspendedUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Accounts</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phoneNumber} • {user.city}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getUserStatusBadge(user)}
                          {user.isPhoneVerified && !user.isApproved && (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => approveUserMutation.mutate(user.id)}
                                disabled={approveUserMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectUserMutation.mutate(user.id)}
                                disabled={rejectUserMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Management Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Products & Brands</h2>
              <Button onClick={() => openProductDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsLoading ? (
                <div className="col-span-full text-center py-8">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No products found. Create your first product!
                </div>
              ) : (
                products.map((product) => (
                  <Card key={product.id}>
                    <div className="h-48 bg-gray-200 relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={product.status === "active" ? "default" : "secondary"}>
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <span className="text-sm text-gray-500">{product.brand?.name}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-blue-600">${product.price}</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openProductDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                            disabled={deleteProductMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Brand Management Section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Brand Management</h3>
                <Button variant="secondary" onClick={() => openBrandDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {brandsLoading ? (
                    <div className="text-center py-8">Loading brands...</div>
                  ) : brands.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No brands found. Create your first brand!
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {brands.map((brand) => (
                        <div key={brand.id} className="flex items-center justify-between p-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                              <span className="text-white font-bold text-sm">
                                {brand.name[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{brand.name}</div>
                              <div className="text-sm text-gray-500">{brand.category}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={brand.status === "active" ? "default" : "secondary"}>
                              {brand.status}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openBrandDialog(brand)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteBrandMutation.mutate(brand.id)}
                                disabled={deleteBrandMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Settings Tab */}
          {user.role === "main_admin" && (
            <TabsContent value="settings" className="space-y-6">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
                
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Manage administrator accounts and permissions. Only Main Admins can access this section.
                      </p>
                      <Button>Add Manager Admin</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Configure security settings for the application.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Auto-approve Users</h4>
                            <p className="text-sm text-gray-600">Automatically approve new user registrations</p>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-gray-600">Send email notifications for new registrations</p>
                          </div>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Brand Dialog */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "Edit Brand" : "Add Brand"}
            </DialogTitle>
          </DialogHeader>
          <Form {...brandForm}>
            <form onSubmit={brandForm.handleSubmit(onBrandSubmit)} className="space-y-4">
              <FormField
                control={brandForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={brandForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={brandForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBrandDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createBrandMutation.isPending || updateBrandMutation.isPending}
                >
                  {editingBrand ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
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
                          {brands.map((brand) => (
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
              </div>

              <FormField
                control={productForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProductDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  {editingProduct ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
