import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";

export default function CartPage() {
  const { items, removeItem, clear, totalPrice } = useCart();
  const [, setLocation] = useLocation();
  const [manualAmount, setManualAmount] = useState<string>("1000");

  const truncate = (value: string, limit: number) => Array.from(value).slice(0, limit).join("");

  const buildGoodname = (cartItems: typeof items) => {
    if (!cartItems.length) return "장바구니 결제";
    const first = truncate(cartItems[0].name || "장바구니 상품", 14);
    const others = cartItems.length - 1;
    const suffix = others > 0 ? ` 그외${others}개` : "";
    const combined = `${first}${suffix}`;
    return truncate(combined, 19);
  };

  const cartGoodname = useMemo(() => buildGoodname(items), [items]);

  const createCreemSession = async (amount: number) => {
    const res = await fetch("/api/creem/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        name: cartGoodname,
        metadata: { cartCount: items.length },
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(detail || "세션 생성 실패");
    }
    return res.json() as Promise<{ url: string; sessionId?: string }>;
  };

  const handleManualPay = async () => {
    try {
      if (!items.length) {
        alert("장바구니가 비어 있습니다.");
        return;
      }
      const amount = parseInt(manualAmount || "0", 10);
      if (isNaN(amount) || amount <= 0) {
        alert("결제 금액을 1원 이상으로 입력해주세요.");
        return;
      }
      const data = await createCreemSession(amount);
      if (data.url) {
        window.location.href = data.url; // Creem은 모달이 아니라 redirect
      } else {
        alert("결제 URL 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Manual pay failed", error);
      alert("결제 준비 중 오류가 발생했습니다. 다시 시도해주세요.");
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
            <div className="space-y-3 rounded-md border border-red-300 bg-red-50 p-4">
              <div className="text-sm font-semibold text-red-700">관리자 테스트 모드 (장바구니 총액 무시)</div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-sm text-red-700" htmlFor="manual_pay_amount">
                  테스트 금액
                </label>
                <Input
                  id="manual_pay_amount"
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  style={{ border: "2px solid red", width: "140px" }}
                />
                <Button onClick={handleManualPay} className="sm:flex-1">
                  테스트 결제 (카드)
                </Button>
              </div>
              <p className="text-xs text-red-700">입력한 금액으로 즉시 카드 결제창을 띄웁니다. 주소 요청 없음.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
