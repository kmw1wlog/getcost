import { Mail, FileText, Shield } from "lucide-react";
import { Link } from "wouter";
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
  const uniqueDatasets = (() => {
    const seen = new Set<string>();
    const result: Dataset[] = [];
    for (const d of datasets) {
      if (seen.has(d.id)) continue;
      seen.add(d.id);
      result.push(d);
    }
    return result;
  })();

  return (
    <Sidebar className="no-scrollbar">
      <SidebarHeader className="h-20 px-4 py-3 flex items-center bg-[#000000]">
        <Link href="/" className="inline-flex">
          <img
            src="/wiseitech-dark.png?v=1"
            alt="WISE iTECH"
            className="h-12 w-auto"
            loading="lazy"
          />
        </Link>
      </SidebarHeader>

      <Separator />

      <SidebarContent className="p-4 no-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Premium Datasets
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            {uniqueDatasets.map((dataset) => (
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
        <div className="space-y-2">
          <Link
            href="/docs"
            className="flex items-center gap-2 text-sm text-muted-foreground hover-elevate p-2 rounded-md"
            data-testid="link-docs-hub"
          >
            <Shield className="w-4 h-4 text-primary" />
            문서 센터
          </Link>
          <a
            href="https://wise.co.kr/customer/inquiry.do"
            className="flex items-center gap-2 text-sm text-muted-foreground hover-elevate p-2 rounded-md"
            data-testid="link-support"
            target="_blank"
            rel="noreferrer"
          >
            <Mail className="w-4 h-4" />
            고객 지원
          </a>
          <a
            href="https://wise.co.kr/media/list.do?board=1"
            className="flex items-center gap-2 text-sm text-muted-foreground hover-elevate p-2 rounded-md"
            data-testid="link-notice"
            target="_blank"
            rel="noreferrer"
          >
            <FileText className="w-4 h-4" />
            공지사항
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
