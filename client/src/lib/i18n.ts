import { useEffect, useState } from 'react';

export type Language = 'en' | 'ar' | 'ku';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
    ku: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    ar: 'الرئيسية',
    ku: 'سەرەتا'
  },
  'nav.brands': {
    en: 'Brands',
    ar: 'العلامات التجارية',
    ku: 'براندەکان'
  },
  'nav.categories': {
    en: 'Categories',
    ar: 'التصنيفات',
    ku: 'پۆلەکان'
  },
  'nav.sale': {
    en: 'Sale',
    ar: 'التخفيضات',
    ku: 'داشکاندن'
  },
  
  // Hero section
  'hero.title': {
    en: 'Step Into Style',
    ar: 'ادخل إلى عالم الأناقة',
    ku: 'هەنگاو بۆ شێواز'
  },
  'hero.subtitle': {
    en: 'Discover premium footwear from the world\'s leading brands',
    ar: 'اكتشف الأحذية الممتازة من العلامات التجارية الرائدة في العالم',
    ku: 'پێڵاوی باش لە براندە بەناوبانگەکانی جیهان بدۆزەرەوە'
  },
  'hero.shop_now': {
    en: 'BAWA SHOP Now',
    ar: 'تسوق الآن',
    ku: 'ئێستا کڕین بکە'
  },
  'hero.explore_brands': {
    en: 'Explore Brands',
    ar: 'استكشف العلامات التجارية',
    ku: 'براندەکان بگەڕێ'
  },
  
  // Categories
  'categories.title': {
    en: 'BAWA SHOP by Category',
    ar: 'تسوق حسب الفئة',
    ku: 'بەپێی پۆل کڕین بکە'
  },
  'categories.subtitle': {
    en: 'Find the perfect pair for every occasion',
    ar: 'اعثر على الزوج المثالي لكل مناسبة',
    ku: 'جووتە تەواوەکە بۆ هەموو بۆنەیەک بدۆزەرەوە'
  },
  
  // Products
  'products.featured': {
    en: 'Featured Products',
    ar: 'المنتجات المميزة',
    ku: 'بەرهەمە تایبەتەکان'
  },
  'products.featured_subtitle': {
    en: 'Handpicked favorites from top brands',
    ar: 'المفضلات المختارة بعناية من أفضل العلامات التجارية',
    ku: 'براندە باشەکان کە بە دەست هەڵبژێردراون'
  },
  'products.view_all': {
    en: 'View All',
    ar: 'عرض الكل',
    ku: 'هەموو ببینە'
  },
  'products.add_to_cart': {
    en: 'Add to Cart',
    ar: 'أضف إلى السلة',
    ku: 'زیاد بکە بۆ سەبەتە'
  },
  'products.size': {
    en: 'Size',
    ar: 'المقاس',
    ku: 'قەبارە'
  },
  'products.quantity': {
    en: 'Quantity',
    ar: 'الكمية',
    ku: 'ژمارە'
  },
  
  // Cart
  'cart.title': {
    en: 'BAWA SHOPping Cart',
    ar: 'سلة التسوق',
    ku: 'سەبەتەی کڕین'
  },
  'cart.total': {
    en: 'Total',
    ar: 'المجموع',
    ku: 'کۆی گشتی'
  },
  'cart.checkout': {
    en: 'Proceed to Checkout',
    ar: 'متابعة إلى الدفع',
    ku: 'بەرەو پارەدان'
  },
  'cart.continue_shopping': {
    en: 'Continue BAWA SHOPping',
    ar: 'متابعة التسوق',
    ku: 'کڕینەکە بەردەوام بکە'
  },
  'cart.empty': {
    en: 'Your cart is empty',
    ar: 'سلة التسوق فارغة',
    ku: 'سەبەتەکەت بەتاڵە'
  },
  
  // Checkout
  'checkout.title': {
    en: 'Checkout',
    ar: 'الدفع',
    ku: 'پارەدان'
  },
  'checkout.shipping_info': {
    en: 'Shipping Information',
    ar: 'معلومات الشحن',
    ku: 'زانیاری گەیاندن'
  },
  'checkout.payment_info': {
    en: 'Payment Information',
    ar: 'معلومات الدفع',
    ku: 'زانیاری پارەدان'
  },
  'checkout.order_summary': {
    en: 'Order Summary',
    ar: 'ملخص الطلب',
    ku: 'کورتەی داواکاری'
  },
  'checkout.place_order': {
    en: 'Place Order',
    ar: 'تأكيد الطلب',
    ku: 'داواکاری بکە'
  },
  
  // Forms
  'form.first_name': {
    en: 'First Name',
    ar: 'الاسم الأول',
    ku: 'ناوی یەکەم'
  },
  'form.last_name': {
    en: 'Last Name',
    ar: 'اسم العائلة',
    ku: 'ناوی دووەم'
  },
  'form.email': {
    en: 'Email Address',
    ar: 'عنوان البريد الإلكتروني',
    ku: 'ناونیشانی ئیمەیڵ'
  },
  'form.phone': {
    en: 'Phone Number',
    ar: 'رقم الهاتف',
    ku: 'ژمارەی تەلەفۆن'
  },
  'form.address': {
    en: 'Address',
    ar: 'العنوان',
    ku: 'ناونیشان'
  },
  'form.city': {
    en: 'City',
    ar: 'المدينة',
    ku: 'شار'
  },
  'form.state': {
    en: 'State',
    ar: 'الولاية',
    ku: 'پارێزگا'
  },
  'form.zip_code': {
    en: 'ZIP Code',
    ar: 'الرمز البريدي',
    ku: 'کۆدی پۆستە'
  },
  
  // Brands
  'brands.title': {
    en: 'BAWA SHOP by Brand',
    ar: 'تسوق حسب العلامة التجارية',
    ku: 'بەپێی براند کڕین بکە'
  },
  'brands.subtitle': {
    en: 'Explore collections from world-renowned brands',
    ar: 'استكشف المجموعات من العلامات التجارية المشهورة عالمياً',
    ku: 'کۆمەڵەکانی براندە بەناوبانگەکانی جیهان بگەڕێ'
  },
  
  // Admin
  'admin.title': {
    en: 'Admin Panel',
    ar: 'لوحة الإدارة',
    ku: 'پانێڵی بەڕێوەبەر'
  },
  'admin.products': {
    en: 'Products',
    ar: 'المنتجات',
    ku: 'بەرهەمەکان'
  },
  'admin.orders': {
    en: 'Orders',
    ar: 'الطلبات',
    ku: 'داواکارییەکان'
  },
  'admin.add_product': {
    en: 'Add Product',
    ar: 'إضافة منتج',
    ku: 'بەرهەم زیادبکە'
  },
  
  // Common
  'common.login': {
    en: 'Login',
    ar: 'تسجيل الدخول',
    ku: 'چوونەژوورەوە'
  },
  'common.logout': {
    en: 'Logout',
    ar: 'تسجيل الخروج',
    ku: 'دەرچوون'
  },
  'common.loading': {
    en: 'Loading...',
    ar: 'جاري التحميل...',
    ku: 'باربوون...'
  },
  'common.error': {
    en: 'An error occurred',
    ar: 'حدث خطأ',
    ku: 'هەڵەیەک ڕوویدا'
  },
  'common.save': {
    en: 'Save',
    ar: 'حفظ',
    ku: 'پاشکەوتکردن'
  },
  'common.cancel': {
    en: 'Cancel',
    ar: 'إلغاء',
    ku: 'پاشگەزبوونەوە'
  },
  'common.close': {
    en: 'Close',
    ar: 'إغلاق',
    ku: 'داخستن'
  },
};

const LANGUAGE_KEY = 'solestyle_language';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_KEY) as Language;
      return saved || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    
    // Update document direction and lang attribute
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  return {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar',
  };
}
