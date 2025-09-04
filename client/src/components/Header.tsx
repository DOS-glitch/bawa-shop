import { useState } from "react";
import logoPath from "@assets/1ravan_1754178167352.jpg";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, type Language } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Search, User, ShoppingBag, Menu, Heart } from "lucide-react";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const navItems = [
    { href: "/", label: t('nav.home') },
    { href: "/brands", label: t('nav.brands') },
    { href: "/categories", label: t('nav.categories') },
  ];

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
  <div className="flex items-center gap-2"><img src={logoPath} alt="BAWA SHOP" className="h-8 w-8 rounded"/><span className="font-bold">BAWA SHOP</span></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-neutral-900 cursor-pointer">
                  SoleStyle
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <div className={`flex items-center space-x-8 ${isRTL ? 'space-x-reverse' : ''}`}>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`font-medium cursor-pointer transition-colors ${
                        location === item.href
                          ? "text-neutral-900"
                          : "text-neutral-600 hover:text-primary-600"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Right Side Icons */}
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              {/* Language Switcher */}
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-16 border-none bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="ar">عربي</SelectItem>
                  <SelectItem value="ku">کوردی</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>

              {/* User Account */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => window.location.href = '/api/logout'}>
                    {t('common.logout')}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => window.location.href = '/api/login'}>
                  {t('common.login')}
                </Button>
              )}

              {/* BAWA SHOPping Cart */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setIsCartOpen(true)}
                >
                  <BAWA SHOPpingBag className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "left" : "right"}>
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <span
                          className={`block font-medium cursor-pointer transition-colors ${
                            location === item.href
                              ? "text-neutral-900"
                              : "text-neutral-600 hover:text-primary-600"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      {isAuthenticated && (
        <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
      )}
    </>
  );
}
