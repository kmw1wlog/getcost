import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import { FooterBanner } from "@/components/footer-banner";
import PurchaseHistory from "@/pages/purchase-history";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import type { Dataset } from "@shared/schema";

function AppContent() {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const style = {
    "--sidebar-width": "26rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-[#0b0b0b]">
        <AppSidebar
          selectedDataset={selectedDataset}
          onSelectDataset={setSelectedDataset}
        />
        <div className="flex flex-col flex-1 overflow-hidden bg-[#0b0b0b]">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-[#0b0b0b]">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              {selectedDataset && (
                <nav className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => setSelectedDataset(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="breadcrumb-home"
                  >
                    홈
                  </button>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-foreground font-medium">
                    {selectedDataset.nameKo}
                  </span>
                </nav>
              )}
            </div>
            <div className="flex items-center gap-2">
              <UserMenu user={user} isLoading={isLoading} />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-[#0b0b0b]">
            <Switch>
              <Route path="/">
                <Home
                  selectedDataset={selectedDataset}
                  onSelectDataset={setSelectedDataset}
                />
              </Route>
              <Route path="/login" component={Login} />
              <Route path="/purchases" component={PurchaseHistory} />
              <Route path="/admin" component={AdminDashboard} />
              <Route component={NotFound} />
            </Switch>
            <FooterBanner />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
