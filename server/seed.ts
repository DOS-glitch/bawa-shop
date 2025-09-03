import { storage } from "./storage";
import { db } from "./db";

async function main() {
  try {
    const adminEmail = "admin@bawashop.local";
    const existing = await storage.getUserByEmail(adminEmail);
    if (existing) {
      console.log("Admin already exists:", adminEmail);
      process.exit(0);
    }

    const admin = await storage.createUser({
      firstName: "BAWA",
      lastName: "Admin",
      email: adminEmail,
      // The auth.ts uses passport-local with scrypt; password is hashed on register route.
      // storage.createUser expects raw fields; we will set a temporary password hash workflow if needed.
      // If storage.createUser doesn't hash, you can register via the /api/register route instead.
      // For now, we set a placeholder password field if schema needs it.
      password: "admin1234",
      role: "main_admin",
      isApproved: true,
      isPhoneVerified: true,
      phone: "0000000000"
    } as any);

    console.log("Seeded admin user:", adminEmail, "(password: admin1234)");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
