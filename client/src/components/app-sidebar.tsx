import { Database, Mail, FileText, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DatasetCard } from "./dataset-card";
import { datasets, type Dataset } from "@shared/schema";

interface AppSidebarProps {
  selectedDataset: Dataset | null;
  onSelectDataset: (dataset: Dataset) => void;
}

export function AppSidebar({ selectedDataset, onSelectDataset }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <Database className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-sidebar-foreground">wise itech Pro</h1>
            <p className="text-xs text-muted-foreground">Enterprise Data Marketplace</p>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Premium Datasets
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isSelected={selectedDataset?.id === dataset.id}
                onSelect={onSelectDataset}
              />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <Separator className="mb-4" />
        <div className="space-y-3">
          <a
            href="mailto:support@wise itech.pro"
            className="flex items-center gap-2 text-sm text-muted-foreground hover-elevate p-2 rounded-md"
            data-testid="link-support"
          >
            <Mail className="w-4 h-4" />
            고객 지원
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-sm text-muted-foreground hover-elevate p-2 rounded-md"
            data-testid="link-docs"
          >
            <FileText className="w-4 h-4" />
            API 문서
          </a>
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
            <Shield className="w-4 h-4 text-primary" />
            SSL 암호화 보안 연결
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
