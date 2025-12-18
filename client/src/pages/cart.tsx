import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";

declare global {
  interface Window {
    PayApp?: {
      setDefault: (key: string, value: string) => void;
      setParam: (key: string, value: string) => void;
      call: () => void;
    };
  }
}

export default function CartPage() {
  const { items, removeItem, clear, totalPrice } = useCart();
  const [, setLocation] = useLocation();
  const [manualAmount, setManualAmount] = useState<string>("1000");

  const payappConfig = useMemo(
    () => ({
      userid: import.meta.env.VITE_PAYAPP_USERID || "wiseitech", // 실제 판매자 아이디 필수
      shopname: import.meta.env.VITE_PAYAPP_SHOPNAME || "테스트상점", // 판매자 설정의 상점명
      feedbackurl:
        import.meta.env.VITE_PAYAPP_FEEDBACK_URL || `${window.location.origin}/api/payapp/feedback`,
      recvphone: import.meta.env.VITE_PAYAPP_TEST_PHONE || "01012345678",
      returnurl: import.meta.env.VITE_PAYAPP_RETURN_URL || `${window.location.origin}/home`,
    }),
    [],
  );

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

  const setPayAppParams = (goodname: string) => {
    try {
      if (!window.PayApp) return false;
      const defaults = { userid: payappConfig.userid, shopname: payappConfig.shopname, feedbackurl: payappConfig.feedbackurl };
      const params = { goodname, price: manualAmount || "0", recvphone: payappConfig.recvphone, openpaytype: "card", reqaddr: "0", smsuse: "n", redirectpay: "1", skip_cstpage: "y", returnurl: payappConfig.returnurl };
      Object.entries(defaults).forEach(([key, value]) => window.PayApp?.setDefault(key, value));
      Object.entries(params).forEach(([key, value]) => window.PayApp?.setParam(key, value));
      window.PayApp?.call();
      return true;
    } catch (error) {
      console.error("Failed to set PayApp params", error);
      return false;
    }
  };

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="//lite.payapp.kr/public/api/v2/payapp-lite.js"]',
    );
    if (existing) return;
    const script = document.createElement("script");
    script.src = "//lite.payapp.kr/public/api/v2/payapp-lite.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleManualPay = () => {
    try {
      if (!window.PayApp) {
        alert("PayApp 스크립트 로딩을 기다려주세요.");
        return;
      }
      if (!payappConfig.userid || payappConfig.userid === "YOUR_PAYAPP_USERID") {
        alert("PayApp 판매자 아이디(VITE_PAYAPP_USERID)가 설정되지 않았습니다.");
        return;
      }
      if (!items.length) {
        alert("장바구니가 비어 있습니다.");
        return;
      }
      const prepared = setPayAppParams(cartGoodname);
      if (!prepared) alert("결제 준비에 실패했습니다. 다시 시도해주세요.");
    } catch (error) {
      console.error("Manual pay failed", error);
      alert("결제 준비 중 오류가 발생했습니다.");
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
