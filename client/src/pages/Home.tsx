import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { ProductWithRelations, Category, Brand } from "@shared/schema";

export default function Home() {
  const { t } = useLanguage();

  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { featured: "8" }],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["/api/brands"],
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-neutral-900 to-neutral-700 text-white">
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-6xl font-bold mb-4">
              {t('hero.title')}
            </h2>
            <p className="text-xl mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
                {t('hero.shop_now')}
              </Button>
              <Link href="/brands">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-neutral-900">
                  {t('hero.explore_brands')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              {t('categories.title')}
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {t('categories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categoriesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="aspect-square rounded-2xl mb-4" />
                  <Skeleton className="h-6 w-20 mx-auto" />
                </div>
              ))
            ) : (
              categories.slice(0, 4).map((category: Category) => (
                <Link key={category.id} href={`/categories?category=${category.id}`}>
                  <div className="group cursor-pointer text-center">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-white shadow-lg group-hover:shadow-xl transition-shadow">
                      <img
                        src={category.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                        alt={category.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {category.nameEn}
                    </h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                {t('products.featured')}
              </h2>
              <p className="text-neutral-600">
                {t('products.featured_subtitle')}
              </p>
            </div>
            <Button variant="ghost" className="text-primary-500 hover:text-primary-600">
              {t('products.view_all')}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
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
            ) : (
              featuredProducts.map((product: ProductWithRelations) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              {t('brands.title')}
            </h2>
            <p className="text-neutral-600">
              {t('brands.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {brandsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))
            ) : (
              brands.slice(0, 6).map((brand: Brand) => (
                <Link key={brand.id} href={`/brands?brand=${brand.id}`}>
                  <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="aspect-square flex items-center justify-center">
                      <span className="text-2xl font-bold text-neutral-700 group-hover:text-primary-500 transition-colors">
                        {brand.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">SoleStyle</h3>
              <p className="text-neutral-400 mb-6">
                Premium footwear for every lifestyle. Step into comfort and style with our curated collection.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">BAWA SHOP</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/categories?category=running" className="hover:text-white transition-colors">Running Shoes</Link></li>
                <li><Link href="/categories?category=casual" className="hover:text-white transition-colors">Casual Sneakers</Link></li>
                <li><Link href="/categories?category=formal" className="hover:text-white transition-colors">Formal Shoes</Link></li>
                <li><Link href="/categories?category=sports" className="hover:text-white transition-colors">Sports Shoes</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">Size Guide</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Return Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Shipping Info</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-neutral-400 mb-4">
                Subscribe to get updates on new arrivals and exclusive offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button className="bg-primary-500 hover:bg-primary-600 px-6 py-2 rounded-r-lg rounded-l-none">
                  →
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 SoleStyle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
