import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IssueProvider } from "@/context/IssueContext";
import { CitizenAuthProvider } from "@/context/CitizenAuthContext";
import { AuthorityAuthProvider } from "@/context/AuthorityAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import CitizenLogin from "./pages/citizen/Login";
import CitizenDashboard from "./pages/citizen/Dashboard";
import AuthorityLogin from "./pages/authority/Login";
import AuthorityDashboard from "./pages/authority/Dashboard";
import NotFound from "./pages/NotFound";
import JanSamadhanUI from "./pages/JanSamadhan";
import PublicMap from "./pages/PublicMap";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CitizenAuthProvider>
          <AuthorityAuthProvider>
            <IssueProvider>
              <Routes>
                {/* Citizen */}
                <Route path="/citizen/login" element={<CitizenLogin />} />
                <Route 
                  path="/citizen/dashboard" 
                  element={
                    <ProtectedRoute role="citizen">
                      <CitizenDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/citizen/report" element={<ReportIssue />} />
                {/* Authority */}
                <Route path="/authority/login" element={<AuthorityLogin />} />
                <Route 
                  path="/authority/dashboard" 
                  element={
                    <ProtectedRoute role="authority">
                      <AuthorityDashboard />
                    </ProtectedRoute>
                  } 
                />
                {/* Legacy/demo routes */}
                <Route path='/' element={<JanSamadhanUI />} />
                <Route path="/PublicMap" element={<PublicMap />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </IssueProvider>
          </AuthorityAuthProvider>
        </CitizenAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
