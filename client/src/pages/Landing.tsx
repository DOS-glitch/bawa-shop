import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Star, Truck, CreditCard } from "lucide-react";

export default function Landing() {
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();

  // Show approval pending message for authenticated but unapproved users
  if (!isLoading && user && !user.isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Welcome {user.firstName || user.email}! Your account has been created successfully.
            </p>
            <p className="text-gray-600">
              An administrator will review your account shortly. You'll be able to start shopping once approved.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This usually takes 24-48 hours. You'll receive an email confirmation once approved.
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/api/logout'}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                SoleStyle
              </h1>
              <p className="text-neutral-600">
                Premium footwear for every lifestyle
              </p>
            </div>

            <div className="mb-6">
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                alt="Premium Shoes"
                className="w-full rounded-lg object-cover h-48"
              />
            </div>

            <p className="text-neutral-600 mb-6">
              Discover our curated collection of premium footwear from the world's leading brands.
              Step into style and comfort with SoleStyle.
            </p>

            <Button
              className="w-full"
              onClick={() => window.location.href = '/api/login'}
            >
              Sign In with Google
            </Button>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>New users require admin approval</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
