import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Brands from "@/pages/Brands";
import Categories from "@/pages/Categories";
import Admin from "@/pages/Admin";

import AdminDashboard2 from "@/pages/admin2/admin-dashboard";
import AuthPage from "@/pages/admin2/auth-page";
import PhoneVerification from "@/pages/admin2/phone-verification";
import AdminHome2 from "@/pages/admin2/home-page";


function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            <Layout>
              <Home />
            </Layout>
          </Route>
          <Route path="/brands">
            <Layout>
              <Brands />
            </Layout>
          </Route>
          <Route path="/categories">
            <Layout>
              <Categories />
            </Layout>
          </Route>
          <Route path="/admin">
            <Layout>
              <Admin />
            </Layout>
          </Route>
        </>
      )}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    
  <Route path="/admin2" component={AdminHome2} />
  <Route path="/admin2/dashboard" component={AdminDashboard2} />
  <Route path="/login" component={AuthPage} />
  <Route path="/verify-phone" component={PhoneVerification} />
</Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
