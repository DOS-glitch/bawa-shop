import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Heart, Star } from "lucide-react";
import type { ProductWithRelations } from "@shared/schema";
import ProductModal from "./ProductModal";

interface ProductCardProps {
  product: ProductWithRelations;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add to cart with first available size
    if (product.sizes && product.sizes.length > 0) {
      addToCartMutation.mutate({
        productId: product.id,
        size: product.sizes[0],
        quantity: 1,
      });
    }
  };



  return (
    <>
      <div
        className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="aspect-square bg-neutral-50 relative overflow-hidden">
          <img
            src={product.imageUrl}
            alt={getProductName()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 bg-white rounded-full shadow-md hover:bg-red-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Heart className="h-4 w-4 text-neutral-400 hover:text-red-500" />
            </Button>
          </div>
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-primary-500 text-white">New</Badge>
            )}
            {product.isOnSale && (
              <Badge variant="destructive">Sale</Badge>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-neutral-500">
              {product.brand?.name}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-neutral-600">
                {parseFloat(product.rating || "0").toFixed(1)}
              </span>
            </div>
          </div>
          
          <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-1">
            {getProductName()}
          </h3>
          
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {getProductDescription()}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-neutral-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? t('common.loading') : t('products.add_to_cart')}
            </Button>
          </div>
        </div>
      </div>

      <ProductModal
        product={product}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
