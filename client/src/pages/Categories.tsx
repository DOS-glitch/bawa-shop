import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { ProductWithRelations, Category } from "@shared/schema";

export default function Categories() {
  const { language, t } = useLanguage();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const selectedCategoryId = searchParams.get('category');

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: selectedCategoryId ? ["/api/products", { category: selectedCategoryId }] : ["/api/products"],
  });

  const selectedCategory = categories.find((category: Category) => category.id === selectedCategoryId);

  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'ar':
        return category.nameAr || category.nameEn;
      case 'ku':
        return category.nameKu || category.nameEn;
      default:
        return category.nameEn;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            {selectedCategory ? getCategoryName(selectedCategory) : t('categories.title')}
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {selectedCategory 
              ? `Explore our ${getCategoryName(selectedCategory).toLowerCase()} collection` 
              : t('categories.subtitle')
            }
          </p>
        </div>

        {!selectedCategoryId && (
          <>
            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {categoriesLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="aspect-square rounded-2xl mb-4" />
                    <Skeleton className="h-6 w-20 mx-auto" />
                  </div>
                ))
              ) : (
                categories.map((category: Category) => (
                  <a
                    key={category.id}
                    href={`/categories?category=${category.id}`}
                    className="block"
                  >
                    <div className="group cursor-pointer text-center">
                      <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-white shadow-lg group-hover:shadow-xl transition-shadow">
                        <img
                          src={category.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                          alt={getCategoryName(category)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {getCategoryName(category)}
                      </h3>
                    </div>
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
                {selectedCategory 
                  ? `No products found in ${getCategoryName(selectedCategory)}` 
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
