import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardContent className="py-12 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">결제가 완료되었습니다</h1>
            <p className="text-muted-foreground">
              결제해 주셔서 감사합니다. 주문 내역은 구매내역 페이지에서 확인하실 수 있습니다.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setLocation("/purchases")}>
              구매내역 보기
            </Button>
            <Button onClick={() => setLocation("/home")}>
              계속 둘러보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
