import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItemWithProduct } from "@shared/schema";
import CheckoutModal from "./CheckoutModal";
import { useState } from "react";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { language, t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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



  const total = cartItems.reduce(
    (sum: number, item: CartItemWithProduct) =>
      sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  const handleQuantityChange = (item: CartItemWithProduct, change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      updateQuantityMutation.mutate({ id: item.id, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItemMutation.mutate(id);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={isRTL ? "left" : "right"} className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>{t('cart.title')}</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-6">
              {isLoading ? (
                <div className="text-center py-8">{t('common.loading')}</div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-600">
                  {t('cart.empty')}
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item: CartItemWithProduct) => (
                    <div key={item.id} className="flex gap-4 pb-6 border-b border-neutral-100">
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.imageUrl}
                          alt={getProductName(item)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900 text-sm">
                          {getProductName(item)}
                        </h3>
                        <p className="text-xs text-neutral-600">
                          Size {item.size}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-6 h-6"
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-6 h-6"
                              onClick={() => handleQuantityChange(item, 1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-semibold text-neutral-900 text-sm">
                            {formatPrice((parseFloat(item.product.price) * item.quantity).toString())}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-neutral-400 hover:text-red-500"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-neutral-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-neutral-900">
                    {t('cart.total')}
                  </span>
                  <span className="text-xl font-bold text-neutral-900">
                    {formatPrice(total.toString())}
                  </span>
                </div>
                
                <Button
                  className="w-full mb-3"
                  onClick={handleCheckout}
                >
                  {t('cart.checkout')}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                >
                  {t('cart.continue_shopping')}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutModal open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </>
  );
}
