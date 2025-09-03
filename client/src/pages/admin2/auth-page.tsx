import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useTranslation, cities, formatPhoneForIraq } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema, loginSchema, type InsertUser, type LoginData } from "@shared/schema";
import { Eye, EyeOff, Shield, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/1ravan_1754178167352.jpg";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useTranslation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "user") {
        navigate("/phone-verification");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      city: "",
    },
  });

  const onLogin = async (data: LoginData) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const onRegister = async (data: InsertUser) => {
    try {
      await registerMutation.mutateAsync(data);
      navigate("/phone-verification");
      toast({
        title: "Registration successful",
        description: "Please verify your phone number to continue.",
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Google OAuth",
      description: "Google OAuth integration coming soon.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full space-y-8">
        {/* Language Selector */}
        <div className="flex justify-end">
          <LanguageSelector />
        </div>
        
        {/* Welcome Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white rounded-lg flex items-center justify-center mb-4 p-2">
            <img 
              src={logoPath} 
              alt="BAWA SHOP" 
              className="w-full h-full object-contain rounded-md"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? t('auth.welcome_back') : t('auth.join')}
          </h2>
          <p className="text-blue-100">
            {isLogin
              ? t('auth.login')
              : "باوا شۆپ - باشترین کوالیتی، نرخی تەواو"}
          </p>
        </div>

        {/* Auth Form Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? t('auth.login') : t('auth.register')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button variant="link" className="px-0 text-sm">
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a strong password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Button variant="link" className="px-0 h-auto text-sm">
                        Terms of Service
                      </Button>{" "}
                      and{" "}
                      <Button variant="link" className="px-0 h-auto text-sm">
                        Privacy Policy
                      </Button>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            {/* Switch between login/register */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-medium"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Create account" : "Sign in"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
