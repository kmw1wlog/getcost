import { useState } from "react";
import { Database, BarChart3, MapPin, Shield, Zap, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatasetDetail } from "@/components/dataset-detail";
import { PaymentModal } from "@/components/payment-modal";
import { datasets, type Dataset } from "@shared/schema";

interface HomeProps {
  selectedDataset: Dataset | null;
  onSelectDataset: (dataset: Dataset) => void;
}

export default function Home({ selectedDataset, onSelectDataset }: HomeProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handlePurchase = () => {
    setIsPaymentOpen(true);
  };

  if (selectedDataset) {
    return (
      <>
        <DatasetDetail dataset={selectedDataset} onPurchase={handlePurchase} />
        <PaymentModal
          dataset={selectedDataset}
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          Enterprise Data Platform
        </Badge>
        <h1 className="text-4xl font-semibold text-foreground mb-4">
          프리미엄 기업용 데이터셋
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          금융 분석, 위치 기반 서비스, 소비자 행동 분석을 위한
          고품질 데이터셋을 제공합니다. 업계 최고 수준의 정확도와 신뢰성을 보장합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="text-center p-6">
          <CardContent className="p-0">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">보안 인증</h3>
            <p className="text-sm text-muted-foreground">
              ISO 27001 인증 데이터 처리 및 안전한 전송
            </p>
          </CardContent>
        </Card>
        <Card className="text-center p-6">
          <CardContent className="p-0">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">실시간 업데이트</h3>
            <p className="text-sm text-muted-foreground">
              일일/주간 단위 최신 데이터 자동 업데이트
            </p>
          </CardContent>
        </Card>
        <Card className="text-center p-6">
          <CardContent className="p-0">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">글로벌 커버리지</h3>
            <p className="text-sm text-muted-foreground">
              아시아 태평양 전역의 포괄적인 데이터
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">인기 데이터셋</h2>
        <div className="grid gap-4">
          {datasets.map((dataset) => {
            const icons: Record<string, typeof Database> = {
              Finance: BarChart3,
              Geospatial: MapPin,
              Analytics: Database,
            };
            const Icon = icons[dataset.category] || Database;

            return (
              <Card
                key={dataset.id}
                className="hover-elevate cursor-pointer"
                onClick={() => onSelectDataset(dataset)}
                data-testid={`card-home-dataset-${dataset.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{dataset.category}</Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {dataset.records} records
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {dataset.accuracy}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{dataset.nameKo}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {dataset.descriptionKo}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-mono font-bold mb-2">
                        {new Intl.NumberFormat("ko-KR", {
                          style: "currency",
                          currency: "KRW",
                          maximumFractionDigits: 0,
                        }).format(dataset.price)}
                      </div>
                      <Button size="sm">자세히 보기</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground">
          데이터 구매 관련 문의: support@wise itech.pro
        </p>
      </div>
    </div>
  );
}
