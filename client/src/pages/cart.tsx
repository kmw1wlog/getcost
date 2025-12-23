import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";
import { Loader2, CreditCard, ShoppingCart } from "lucide-react";

const CREEM_PRODUCT_MAP: Record<string, string> = {
  "cinematic-camera-motion-kit": "prod_5St2FaqZLUeTE2xaLSBbNa",
  "hires-3d-modeling-dataset": "prod_lRyUKogZi1QwmvxCpc0oC",
};

export default function CartPage() {
  const { items, removeItem, clear, totalPrice } = useCart();
  const [, setLocation] = useLocation();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const isPayableItem = (itemId: string) => {
    return itemId in CREEM_PRODUCT_MAP;
  };

  const handleCheckout = async (datasetId: string) => {
    try {
      const creemProductId = CREEM_PRODUCT_MAP[datasetId];
      if (!creemProductId) {
        alert("해당 상품은 결제가 지원되지 않습니다.");
        return;
      }

      setLoadingItemId(datasetId);

      const response = await fetch("/api/creem/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          datasetId: datasetId,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.message || "결제 요청에 실패했습니다.");
        setLoadingItemId(null);
      }
    } catch (error) {
      console.error("Payment failed", error);
      alert("결제 처리 중 오류가 발생했습니다.");
      setLoadingItemId(null);
    }
  };

  const formatPrice = (price: number, currency: "USD" | "KRW" = "USD") => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
    }
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16" data-testid="cart-page">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold" data-testid="cart-title">장바구니</h1>
          <p className="text-muted-foreground">선택한 데이터셋을 확인하고 결제를 진행하세요.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/home")}
            data-testid="button-browse-data"
          >
            데이터 둘러보기
          </Button>
          <Button 
            variant="ghost" 
            onClick={clear}
            data-testid="button-clear-cart"
          >
            비우기
          </Button>
        </div>
      </header>

      {items.length === 0 ? (
        <Card data-testid="cart-empty">
          <CardContent className="py-10 text-center text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            장바구니가 비어 있습니다.
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="cart-items-card">
          <CardContent className="p-4 space-y-4">
            {items.map((item) => {
              const canPay = isPayableItem(item.id);
              const isLoading = loadingItemId === item.id;
              
              return (
                <div 
                  key={item.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md border border-border"
                  data-testid={`cart-item-${item.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" data-testid={`cart-item-name-${item.id}`}>{item.name}</span>
                      {canPay && (
                        <Badge variant="secondary">결제 가능</Badge>
                      )}
                    </div>
                    <div className="text-lg font-mono font-bold mt-1" data-testid={`cart-item-price-${item.id}`}>
                      {formatPrice(item.price, "USD")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canPay && (
                      <Button
                        onClick={() => handleCheckout(item.id)}
                        disabled={isLoading || loadingItemId !== null}
                        data-testid={`button-pay-${item.id}`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            처리 중...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            결제하기
                          </>
                        )}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => removeItem(item.id)}
                      disabled={loadingItemId !== null}
                      data-testid={`button-remove-${item.id}`}
                    >
                      제거
                    </Button>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">장바구니 총액 (USD)</div>
              <div className="text-xl font-mono font-bold" data-testid="cart-total-price">
                {formatPrice(totalPrice, "USD")}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              결제는 상품별로 개별 진행됩니다. "결제 가능" 배지가 있는 상품만 결제할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
