import { pool, db } from "../server/db";
import { categories, brands, products, users } from "../shared/schema";

async function seedData() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create categories
    const categoryData = [
      {
        nameEn: "Athletic Shoes",
        nameAr: "أحذية رياضية",
        nameKu: "پێڵاوی وەرزشی",
        slug: "athletic-shoes",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"
      },
      {
        nameEn: "Casual Shoes",
        nameAr: "أحذية كاجوال",
        nameKu: "پێڵاوی ئاسایی",
        slug: "casual-shoes",
        imageUrl: "https://images.unsplash.com/photo-1560472355-a3c4c1b37b12?w=400"
      },
      {
        nameEn: "Formal Shoes",
        nameAr: "أحذية رسمية",
        nameKu: "پێڵاوی فەرمی",
        slug: "formal-shoes",
        imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38d0d4?w=400"
      },
      {
        nameEn: "Boots",
        nameAr: "أحذية طويلة",
        nameKu: "جزمە",
        slug: "boots",
        imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400"
      }
    ];

    console.log("📦 Creating categories...");
    const createdCategories = await db.insert(categories).values(categoryData).returning();

    // Create brands
    const brandData = [
      {
        name: "Nike",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg"
      },
      {
        name: "Adidas",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg"
      },
      {
        name: "Puma",
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/da/Puma_complete_logo.svg"
      },
      {
        name: "New Balance",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg"
      }
    ];

    console.log("🏷️ Creating brands...");
    const createdBrands = await db.insert(brands).values(brandData).returning();

    // Create products
    const productData = [
      {
        nameEn: "Air Max 270",
        nameAr: "إير ماكس 270",
        nameKu: "ئێر ماکس ٢٧٠",
        descriptionEn: "Experience the pinnacle of comfort with the Nike Air Max 270. Features Nike's largest heel Air unit for all-day comfort.",
        descriptionAr: "اختبر قمة الراحة مع نايكي إير ماكس 270. يتميز بأكبر وحدة هوائية في الكعب من نايكي للراحة طوال اليوم.",
        descriptionKu: "لەگەڵ نایکی ئێر ماکس ٢٧٠ دا، بەرزترین ئاستی ئاسوودەیی تاقی بکەرەوە. تایبەتمەندی یەکەی هەوای گەورەترینی پاژنە بۆ ئاسوودەیی بە درێژایی ڕۆژ.",
        price: "208000",
        originalPrice: "234000",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        imageUrls: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600"
        ],
        sizes: ["7", "8", "9", "10", "11", "12"],
        categoryId: createdCategories[0].id, // Athletic Shoes
        brandId: createdBrands[0].id, // Nike
        isNew: true,
        isOnSale: true,
        rating: "4.5",
        reviewCount: 324,
        stock: 45
      },
      {
        nameEn: "Ultraboost 22",
        nameAr: "أولترابوست 22",
        nameKu: "ئاڵترابووست ٢٢",
        descriptionEn: "The Adidas Ultraboost 22 delivers incredible energy return with every step. Perfect for running and everyday wear.",
        descriptionAr: "يوفر أديداس أولترابوست 22 عودة طاقة لا تصدق مع كل خطوة. مثالية للجري والارتداء اليومي.",
        descriptionKu: "ئەدیداس ئاڵترابووست ٢٢ گەڕانەوەی وزەیەکی نائەگەری لەگەڵ هەر هەنگاوێکدا دابین دەکات. تەواو بۆ ڕاکردن و پۆشینی ڕۆژانە.",
        price: "247000",
        imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
        imageUrls: [
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600"
        ],
        sizes: ["7", "8", "9", "10", "11", "12"],
        categoryId: createdCategories[0].id, // Athletic Shoes
        brandId: createdBrands[1].id, // Adidas
        isNew: true,
        rating: "4.7",
        reviewCount: 156,
        stock: 32
      },
      // Add more products...
      {
        nameEn: "Classic Oxford",
        nameAr: "أوكسفورد كلاسيكي",
        nameKu: "ئۆکسفۆردی کلاسیکی",
        descriptionEn: "Elegant leather Oxford shoes perfect for formal occasions and business wear.",
        descriptionAr: "أحذية أوكسفورد الجلدية الأنيقة مثالية للمناسبات الرسمية وملابس العمل.",
        descriptionKu: "پێڵاوی چەرمی ئۆکسفۆردی شیک کە تەواو بۆ بۆنە فەرمییەکان و پۆشاکی کار.",
        price: "169000",
        imageUrl: "https://images.unsplash.com/photo-1614252235318-e24b66c5b44d?w=600",
        sizes: ["7", "8", "9", "10", "11", "12"],
        categoryId: createdCategories[2].id, // Formal Shoes
        brandId: createdBrands[3].id, // New Balance
        rating: "4.3",
        reviewCount: 89,
        stock: 28
      }
    ];

    console.log("👟 Creating products...");
    await db.insert(products).values(productData);

    console.log("✅ Database seeding completed successfully!");
    console.log(`
📊 Summary:
- Categories: ${createdCategories.length}
- Brands: ${createdBrands.length}
- Products: ${productData.length}

🔐 Admin users will be automatically approved when they first log in:
- dostanbakr88@gmail.com (your current account)
- raviar@replit.com

Regular users will need admin approval before they can shop.
`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

// Run the seed function
seedData();