import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { ProductWithRelations, Brand } from "@shared/schema";

export default function Brands() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const selectedBrandId = searchParams.get('brand');

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["/api/brands"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: selectedBrandId ? ["/api/products", { brand: selectedBrandId }] : ["/api/products"],
  });

  const selectedBrand = brands.find((brand: Brand) => brand.id === selectedBrandId);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            {selectedBrand ? selectedBrand.name : t('brands.title')}
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {selectedBrand 
              ? `Explore the ${selectedBrand.name} collection` 
              : t('brands.subtitle')
            }
          </p>
        </div>

        {!selectedBrandId && (
          <>
            {/* Brand Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-16">
              {brandsLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))
              ) : (
                brands.map((brand: Brand) => (
                  <a
                    key={brand.id}
                    href={`/brands?brand=${brand.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="aspect-square flex items-center justify-center">
                          <span className="text-xl font-bold text-neutral-700 group-hover:text-primary-500 transition-colors">
                            {brand.name}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))
              )}
            </div>
          </>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {productsLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-neutral-600 text-lg">
                {selectedBrand 
                  ? `No products found for ${selectedBrand.name}` 
                  : "No products found"
                }
              </p>
            </div>
          ) : (
            products.map((product: ProductWithRelations) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
