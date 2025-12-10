import { Database, MapPin, BarChart3, Check, FileJson, Clock, Target, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Dataset } from "@shared/schema";

interface DatasetDetailProps {
  dataset: Dataset;
  onPurchase: () => void;
}

const categoryIcons: Record<string, typeof Database> = {
  Finance: BarChart3,
  Geospatial: MapPin,
  Analytics: Database,
};

export function DatasetDetail({ dataset, onPurchase }: DatasetDetailProps) {
  const Icon = categoryIcons[dataset.category] || Database;
  const modelOutputConfig: Record<
    string,
    { gif: string; caption: string }
  > = {
    "cinematic-camera-motion-kit": {
      gif: "/3D01.gif",
      caption: "카메라 경로·이징·FOV 샘플 출력",
    },
    "procedural-geometry-recognition": {
      gif: "/3D02.gif",
      caption: "폐곡면/기하 생성·인식 예시",
    },
    "spatial-perception-weights": {
      gif: "/3D03.gif",
      caption: "공간 지각·구도 품질 샘플",
    },
  };
  const hasModelOutput = Boolean(modelOutputConfig[dataset.id]);
  const defaultTab = hasModelOutput ? "model-output" : "overview";
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">{dataset.category}</Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  {dataset.accuracy} accuracy
                </Badge>
              </div>
              <h1 className="text-2xl font-semibold text-foreground">
                {dataset.nameKo}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {dataset.descriptionKo}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Database className="w-4 h-4" />
              레코드 수
            </div>
            <div className="font-mono font-semibold text-lg">{dataset.records}</div>
          </div>
          <div className="p-4 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Target className="w-4 h-4" />
              정확도
            </div>
            <div className="font-mono font-semibold text-lg">{dataset.accuracy}</div>
          </div>
          <div className="p-4 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <FileJson className="w-4 h-4" />
              포맷
            </div>
            <div className="font-mono font-semibold text-sm">{dataset.format.split(",")[0]}</div>
          </div>
          <div className="p-4 rounded-md bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="w-4 h-4" />
              업데이트
            </div>
            <div className="font-mono font-semibold text-lg">{dataset.updateFrequency}</div>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full justify-start">
            {hasModelOutput && (
              <TabsTrigger value="model-output" data-testid="tab-model-output">
                모델 출력
              </TabsTrigger>
            )}
            <TabsTrigger value="overview" data-testid="tab-overview">개요</TabsTrigger>
            <TabsTrigger value="schema" data-testid="tab-schema">스키마</TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">샘플 데이터</TabsTrigger>
            <TabsTrigger value="features" data-testid="tab-features">기능</TabsTrigger>
          </TabsList>
          
          {hasModelOutput && (
            <TabsContent value="model-output" className="mt-6">
              <div className="space-y-2">
                <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-md border border-border bg-black">
                  <img
                    src={modelOutputConfig[dataset.id].gif}
                    alt="model output"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
                <p className="text-sm text-muted-foreground">
                  {modelOutputConfig[dataset.id].caption}
                </p>
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">데이터셋 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {dataset.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <FileJson className="w-3 h-3 mr-1" />
                    {dataset.format}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {dataset.updateFrequency} Updates
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schema" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">데이터 스키마</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono">필드명</TableHead>
                      <TableHead className="font-mono">타입</TableHead>
                      <TableHead>설명</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataset.sampleFields.map((field) => (
                      <TableRow key={field.name}>
                        <TableCell className="font-mono text-sm font-medium">
                          {field.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {field.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {field.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">주요 기능</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {dataset.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-full lg:w-80 flex-shrink-0">
        <Card className="sticky top-0">
          <CardHeader>
            <CardTitle className="text-lg">구매 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">가격</div>
              <div className="text-3xl font-mono font-bold text-foreground">
                {formatPrice(dataset.price)}
              </div>
              <div className="text-sm text-muted-foreground">부가세 별도</div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">안전한 결제 시스템</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileJson className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">즉시 다운로드 가능</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">1년간 업데이트 포함</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={onPurchase}
              data-testid="button-purchase"
            >
              데이터셋 구매하기
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              결제 후 현금영수증 발행이 가능합니다
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
