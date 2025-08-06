import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import HomePage from "@/app/page";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import NGODashboard from "@/pages/ngo-dashboard";
import VolunteerDashboard from "@/pages/volunteer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import PrivacyPolicy from "@/pages/privacy";
import TermsOfService from "@/pages/terms";
import VolunteerGuide from "@/pages/volunteer-guide";
import NGOGuide from "@/pages/ngo-guide";
import GeneralSupport from "@/pages/general-support";
import NotFound from "@/pages/not-found";
import CertificateVerification from "@/components/certificate-verification";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/home" component={HomePage} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/volunteer-guide" component={VolunteerGuide} />
      <Route path="/ngo-guide" component={NGOGuide} />
      <Route path="/general-support" component={GeneralSupport} />
      <Route path="/verify-certificate" component={() => (
        <div className="min-h-screen bg-slate-50 py-12">
          <CertificateVerification />
        </div>
      )} />
      <Route path="/verify-certificate/:number" component={({ params }) => (
        <div className="min-h-screen bg-slate-50 py-12">
          <CertificateVerification />
        </div>
      )} />
      
      {/* Protected Routes */}
      {user ? (
        <>
          <Route path="/ngo-dashboard" component={NGODashboard} />
          <Route path="/volunteer-dashboard" component={VolunteerDashboard} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/dashboard" component={() => {
            // Redirect to appropriate dashboard based on role
            switch (user.role) {
              case "ngo":
                return <NGODashboard />;
              case "volunteer":
                return <VolunteerDashboard />;
              case "admin":
                return <AdminDashboard />;
              default:
                return <Dashboard />;
            }
          }} />
        </>
      ) : null}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
