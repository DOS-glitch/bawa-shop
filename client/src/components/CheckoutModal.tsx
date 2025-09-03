import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { CartItemWithProduct } from "@shared/schema";
import { X } from "lucide-react";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: { shippingAddress: CheckoutForm }) => {
      await apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getProductName = (item: CartItemWithProduct) => {
    switch (language) {
      case 'ar':
        return item.product.nameAr || item.product.nameEn;
      case 'ku':
        return item.product.nameKu || item.product.nameEn;
      default:
        return item.product.nameEn;
    }
  };



  const subtotal = cartItems.reduce(
    (sum: number, item: CartItemWithProduct) =>
      sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const shipping = 9.99;
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + shipping + tax;

  const onSubmit = (data: CheckoutForm) => {
    createOrderMutation.mutate({
      shippingAddress: data,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Checkout Form */}
          <div className="p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">
                  {t('checkout.title')}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Shipping Information */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    {t('checkout.shipping_info')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.first_name')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.last_name')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>{t('form.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>{t('form.phone')}</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>{t('form.address')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.city')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.state')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kurdistan">Kurdistan</SelectItem>
                              <SelectItem value="baghdad">Baghdad</SelectItem>
                              <SelectItem value="basra">Basra</SelectItem>
                              <SelectItem value="mosul">Mosul</SelectItem>
                              <SelectItem value="erbil">Erbil</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.zip_code')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    {t('checkout.payment_info')}
                  </h3>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      This is a demo checkout. Payment processing will be implemented later.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? t('common.loading') : t('checkout.place_order')}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="bg-neutral-50 p-8 border-l border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">
              {t('checkout.order_summary')}
            </h3>

            <div className="space-y-4 mb-6">
              {cartItems.map((item: CartItemWithProduct) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={getProductName(item)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-neutral-900">
                      {getProductName(item)}
                    </h4>
                    <p className="text-xs text-neutral-600">
                      Size {item.size}, Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatPrice((parseFloat(item.product.price) * item.quantity).toString())}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-neutral-900">{formatPrice(subtotal.toString())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="text-neutral-900">{formatPrice(shipping.toString())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Tax</span>
                <span className="text-neutral-900">{formatPrice(tax.toString())}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-neutral-200">
                <span className="text-neutral-900">{t('cart.total')}</span>
                <span className="text-neutral-900">{formatPrice(total.toString())}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
