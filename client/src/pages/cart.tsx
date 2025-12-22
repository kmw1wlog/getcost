import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, clear, totalPrice } = useCart();
  const [, setLocation] = useLocation();
  const [manualAmount, setManualAmount] = useState<string>("1000");
  const [isLoading, setIsLoading] = useState(false);

  const buildGoodname = (cartItems: typeof items) => {
    try {
      if (!cartItems.length) return "장바구니 비어 있음";
      const [first, ...rest] = cartItems;
      const restCount = rest.reduce((sum, item) => sum + item.quantity, 0);
      const suffix = restCount > 0 ? ` 외 ${restCount}건` : "";
      const summary = `${first.name}${suffix}`;
      return summary.length > 40 ? `${summary.slice(0, 37)}...` : summary;
    } catch (error) {
      console.error("Failed to build cart goodname", error);
      return "장바구니 상품";
    }
  };

  const cartGoodname = useMemo(() => buildGoodname(items), [items]);

  const handleCreemPay = async () => {
    try {
      if (!items.length) {
        alert("장바구니가 비어 있습니다.");
        return;
      }

      const amount = parseInt(manualAmount, 10);
      if (isNaN(amount) || amount <= 0) {
        alert("올바른 금액을 입력해주세요.");
        return;
      }

      setIsLoading(true);

      const response = await fetch("/api/creem/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          goodName: cartGoodname,
          cartItems: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.message || "결제 요청에 실패했습니다.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Payment failed", error);
      alert("결제 처리 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">장바구니</h1>
          <p className="text-muted-foreground">선택한 데이터셋을 확인하고 결제를 진행하세요.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/home")}>데이터 둘러보기</Button>
          <Button variant="ghost" onClick={clear}>비우기</Button>
        </div>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            장바구니가 비어 있습니다.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(item.price)} x {item.quantity}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => removeItem(item.id)}>
                  제거
                </Button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">총액</div>
              <div className="text-xl font-mono font-bold">
                {new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(totalPrice)}
              </div>
            </div>
            <div className="space-y-3 rounded-md border border-primary/30 bg-primary/5 p-4">
              <div className="text-sm font-semibold text-primary">결제 금액 입력</div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-sm" htmlFor="payment_amount">
                  결제 금액 (원)
                </label>
                <Input
                  id="payment_amount"
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-[140px]"
                  min="100"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleCreemPay} 
                  className="sm:flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    "결제하기"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">입력한 금액으로 카드 결제를 진행합니다.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
