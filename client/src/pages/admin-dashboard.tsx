import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, ShoppingCart, CheckCircle, TrendingUp } from "lucide-react";
import type { Order } from "@shared/schema";

interface OrderStats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "로그인 필요",
        description: "관리자 페이지에 접근하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !user.isAdmin) {
      toast({
        title: "권한 없음",
        description: "관리자 권한이 필요합니다.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [user, isAuthenticated, authLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<OrderStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  if (authLoading || !isAuthenticated || !user?.isAdmin) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const conversionRate = stats && stats.totalOrders > 0 
    ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold" data-testid="text-admin-title">관리자 대시보드</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-revenue">
                {formatPrice(stats?.totalRevenue || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">총 주문</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-orders">
                {stats?.totalOrders || 0}건
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">완료율</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-conversion-rate">
                {conversionRate}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !orders || orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">아직 주문이 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문일시</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                  <TableHead>결제상태</TableHead>
                  <TableHead>배송상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="font-medium">{order.goodName}</TableCell>
                    <TableCell>{order.buyerPhone}</TableCell>
                    <TableCell className="text-right">{formatPrice(order.price)}</TableCell>
                    <TableCell>
                      <Badge variant={order.paymentStatus === "completed" ? "default" : "secondary"}>
                        {order.paymentStatus === "completed" ? "완료" : "대기"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.deliveryStatus === "delivered" ? "default" : "outline"}>
                        {order.deliveryStatus === "delivered" ? "발송완료" : "대기"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
