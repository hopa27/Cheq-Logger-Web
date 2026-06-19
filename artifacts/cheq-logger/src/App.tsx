import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import { DateRangeProvider } from "@/lib/date-context";

import Layout from "@/components/layout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import ChequeList from "@/pages/cheques/list";
import ChequeForm from "@/pages/cheques/form";
import AccountsReport from "@/pages/reports/accounts";
import DepartmentsReport from "@/pages/reports/departments";
import OutstandingReport from "@/pages/reports/outstanding";
import Admin from "@/pages/admin/index";

const queryClient = new QueryClient();

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/cheques" component={ChequeList} />
        <Route path="/cheques/new" component={ChequeForm} />
        <Route path="/cheques/:id" component={ChequeForm} />
        <Route path="/reports/accounts" component={AccountsReport} />
        <Route path="/reports/departments" component={DepartmentsReport} />
        <Route path="/reports/outstanding" component={OutstandingReport} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DateRangeProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthGate />
          </WouterRouter>
        </DateRangeProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
