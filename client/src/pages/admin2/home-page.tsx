import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import logoPath from "@assets/1ravan_1754178167352.jpg";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Redirect based on user status and role
    if (!user.isPhoneVerified) {
      navigate("/phone-verification");
      return;
    }

    if (user.role === "user" && !user.isApproved) {
      navigate("/phone-verification");
      return;
    }

    if (user.role && ["manager", "main_admin"].includes(user.role)) {
      navigate("/admin");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center p-2">
            <img 
              src={logoPath} 
              alt="BAWA SHOP" 
              className="w-full h-full object-contain rounded-md"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BAWA BAWA SHOP</h1>
        <p className="text-sm text-gray-500 mb-4">Best Quality, Perfect Price</p>
        <p className="text-gray-600 mb-6">
          Hello {user.firstName} {user.lastName}! Your account has been approved.
        </p>
        <p className="text-sm text-gray-500">
          This is the main application area for approved users.
        </p>
      </div>
    </div>
  );
}
