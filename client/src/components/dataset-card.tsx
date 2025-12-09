import { Database, MapPin, BarChart3, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Dataset } from "@shared/schema";

interface DatasetCardProps {
  dataset: Dataset;
  isSelected: boolean;
  onSelect: (dataset: Dataset) => void;
}

const categoryIcons: Record<string, typeof Database> = {
  Finance: BarChart3,
  Geospatial: MapPin,
  Analytics: Database,
};

export function DatasetCard({ dataset, isSelected, onSelect }: DatasetCardProps) {
  const Icon = categoryIcons[dataset.category] || Database;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-150 hover-elevate ${
        isSelected
          ? "ring-2 ring-primary bg-primary/5"
          : ""
      }`}
      onClick={() => onSelect(dataset)}
      data-testid={`card-dataset-${dataset.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {dataset.category}
              </Badge>
              <Badge variant="outline" className="text-xs font-mono">
                {dataset.records} records
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground truncate mb-1">
              {dataset.nameKo}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {dataset.descriptionKo}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-lg font-semibold text-foreground">
                {formatPrice(dataset.price)}
              </span>
              <Button size="sm" variant={isSelected ? "default" : "outline"}>
                {isSelected ? "선택됨" : "상세보기"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
