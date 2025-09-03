import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { X, Star, Minus, Plus, Check, Heart } from "lucide-react";
import type { ProductWithRelations } from "@shared/schema";

interface ProductModalProps {
  product: ProductWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: string; size: string; quantity: number }) => {
      await apiRequest("POST", "/api/cart", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: t('products.add_to_cart'),
        description: `${getProductName()} added to cart`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getProductName = () => {
    switch (language) {
      case 'ar':
        return product.nameAr || product.nameEn;
      case 'ku':
        return product.nameKu || product.nameEn;
      default:
        return product.nameEn;
    }
  };

  const getProductDescription = () => {
    switch (language) {
      case 'ar':
        return product.descriptionAr || product.descriptionEn;
      case 'ku':
        return product.descriptionKu || product.descriptionEn;
      default:
        return product.descriptionEn;
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: t('common.error'),
        description: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate({
      productId: product.id,
      size: selectedSize,
      quantity,
    });
  };



  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const discountPercentage = product.originalPrice 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Product Images */}
          <div className="p-6">
            <div className="aspect-square bg-neutral-50 rounded-xl mb-4 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={getProductName()}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.imageUrls && product.imageUrls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                <div className="w-20 h-20 bg-neutral-100 rounded-lg flex-shrink-0 cursor-pointer border-2 border-primary-500">
                  <img
                    src={product.imageUrl}
                    alt="Main"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                {product.imageUrls.map((url, index) => (
                  <div key={index} className="w-20 h-20 bg-neutral-100 rounded-lg flex-shrink-0 cursor-pointer">
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 border-l border-neutral-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm font-medium text-neutral-500">
                  {product.brand?.name}
                </span>
                <h2 className="text-2xl font-bold text-neutral-900 mt-1">
                  {getProductName()}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.floor(parseFloat(product.rating || "0"))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-600">
                ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-neutral-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-neutral-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  {discountPercentage > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {discountPercentage}% off
                    </Badge>
                  )}
                </>
              )}
            </div>

            <p className="text-neutral-600 mb-6">
              {getProductDescription()}
            </p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  {t('products.size')}
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className="py-2"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                {t('products.quantity')}
              </h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                className="flex-1"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || !selectedSize}
              >
                {addToCartMutation.isPending ? t('common.loading') : t('products.add_to_cart')}
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Product Features */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Premium materials
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Comfortable fit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Durable construction
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Stylish design
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
