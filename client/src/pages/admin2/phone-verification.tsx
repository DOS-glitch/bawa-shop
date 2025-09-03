import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/1ravan_1754178167352.jpg";

export default function PhoneVerificationPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (user.isPhoneVerified && user.isApproved) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/send-verification");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification code sent",
        description: `A code has been sent to ${user?.phoneNumber}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyPhoneMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      const res = await apiRequest("POST", "/api/verify-phone", {
        code: verificationCode,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Phone verified successfully",
        description: "Your account is now pending admin approval.",
      });
      // Update user data to reflect verification
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
      setCode(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    },
  });

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    verifyPhoneMutation.mutate(verificationCode);
  };

  const handleResendCode = () => {
    sendVerificationMutation.mutate();
    setCode(["", "", "", "", "", ""]);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) return null;

  if (user.isPhoneVerified && user.isApproved) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-700 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white rounded-lg flex items-center justify-center mb-4 p-2">
            <img 
              src={logoPath} 
              alt="BAWA SHOP" 
              className="w-full h-full object-contain rounded-md"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Verify Your Phone</h2>
          <p className="text-orange-100">
            We've sent a verification code to{" "}
            <span className="font-medium">{user.phoneNumber}</span>
          </p>
        </div>

        {/* Verification Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Enter 6-digit code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={verifyPhoneMutation.isPending || code.some(d => !d)}
            >
              {verifyPhoneMutation.isPending
                ? "Verifying..."
                : "Verify Phone Number"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <Button
                type="button"
                variant="link"
                onClick={handleResendCode}
                disabled={sendVerificationMutation.isPending}
                className="text-orange-600 hover:text-orange-700"
              >
                {sendVerificationMutation.isPending ? "Sending..." : "Resend Code"}
              </Button>
            </div>

            {user.isPhoneVerified && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                  <div className="text-sm">
                    <h3 className="font-medium text-blue-800">Account Under Review</h3>
                    <p className="text-blue-700 mt-1">
                      Your phone has been verified! Your account is now being reviewed by our admin team. 
                      You'll receive an email notification once approved.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
