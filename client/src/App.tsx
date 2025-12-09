import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import type { Dataset } from "@shared/schema";

function App() {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const style = {
    "--sidebar-width": "26rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar
              selectedDataset={selectedDataset}
              onSelectDataset={setSelectedDataset}
            />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                <Switch>
                  <Route path="/">
                    <Home
                      selectedDataset={selectedDataset}
                      onSelectDataset={setSelectedDataset}
                    />
                  </Route>
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
