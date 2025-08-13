import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InvoiceGenerator from "./pages/invoice-generator";
import InvoiceManagement from "./pages/invoice-management";
import Login from "./pages/login";
import NotFound from "./pages/not-found";
import AuthGuard from "./components/auth-guard";
import Navbar from "./components/navbar";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/">
            <AuthGuard>
              <Navbar />
              <InvoiceGenerator />
            </AuthGuard>
          </Route>
          <Route path="/invoices">
            <AuthGuard>
              <Navbar />
              <InvoiceManagement />
            </AuthGuard>
          </Route>
          <Route>
            <AuthGuard>
              <Navbar />
              <NotFound />
            </AuthGuard>
          </Route>
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}