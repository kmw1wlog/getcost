import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldCheck, CreditCard, Receipt, Phone, Building2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Dataset } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  dataset: Dataset | null;
  isOpen: boolean;
  onClose: () => void;
}

const paymentFormSchema = z.object({
  buyerPhone: z
    .string()
    .min(1, "휴대폰 번호를 입력해주세요")
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 휴대폰 번호 형식이 아닙니다"),
  receiptType: z.enum(["none", "personal", "business"]),
  receiptNumber: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function PaymentModal({ dataset, isOpen, onClose }: PaymentModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const buildGoodname = (name: string) => {
    try {
      const safeName = name || "상품";
      const firstLabel = safeName.length > 16 ? safeName.slice(0, 16) : safeName;
      const combined = `${firstLabel}`;
      return combined.length > 20 ? combined.slice(0, 20) : combined;
    } catch (error) {
      console.error("Failed to build payment goodname", error);
      return "상품";
    }
  };

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      buyerPhone: "",
      receiptType: "none",
      receiptNumber: "",
    },
  });

  const receiptType = form.watch("receiptType");

  const paymentMutation = useMutation({
    mutationFn: async (values: PaymentFormValues): Promise<{ success: boolean; payUrl?: string; mulNo?: string; message?: string }> => {
      if (!dataset) throw new Error("No dataset selected");
      
      const response = await apiRequest("POST", "/api/payment/request", {
        datasetId: dataset.id,
        goodName: buildGoodname(dataset.nameKo),
        price: dataset.price,
        buyerPhone: values.buyerPhone.replace(/-/g, ""),
        receiptType: values.receiptType,
        businessNumber: values.receiptType === "business" ? values.receiptNumber : undefined,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.payUrl) {
        setPaymentUrl(data.payUrl);
        setStep("success");
      } else {
        toast({
          title: "결제 요청이 생성되었습니다",
          description: "입력하신 휴대폰으로 결제 링크가 발송되었습니다.",
        });
        setStep("success");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "결제 요청 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
      setStep("form");
    },
  });

  const onSubmit = (values: PaymentFormValues) => {
    setStep("processing");
    paymentMutation.mutate(values);
  };

  const handleClose = () => {
    setStep("form");
    setPaymentUrl(null);
    form.reset();
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!dataset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            결제하기
          </DialogTitle>
          <DialogDescription>
            {dataset.nameKo}
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="p-4 rounded-md bg-muted/50">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">결제 금액</span>
                  <span className="text-xl font-mono font-bold">
                    {formatPrice(dataset.price)}
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="buyerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      휴대폰 번호
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="010-1234-5678"
                        {...field}
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="receiptType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      현금영수증 발행
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-3"
                      >
                        <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate cursor-pointer">
                          <RadioGroupItem value="none" id="none" data-testid="radio-none" />
                          <Label htmlFor="none" className="flex-1 cursor-pointer">
                            발행 안함
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate cursor-pointer">
                          <RadioGroupItem value="personal" id="personal" data-testid="radio-personal" />
                          <Label htmlFor="personal" className="flex-1 cursor-pointer flex items-center gap-2">
                            <User className="w-4 h-4" />
                            소득공제용 (개인)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate cursor-pointer">
                          <RadioGroupItem value="business" id="business" data-testid="radio-business" />
                          <Label htmlFor="business" className="flex-1 cursor-pointer flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            지출증빙용 (사업자)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {receiptType === "business" && (
                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사업자등록번호</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123-45-67890"
                          {...field}
                          data-testid="input-business-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {receiptType === "personal" && (
                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>휴대폰 번호 (현금영수증용)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="010-1234-5678"
                          {...field}
                          data-testid="input-personal-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                PayApp 안전결제 시스템으로 보호됩니다
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={paymentMutation.isPending}
                data-testid="button-submit-payment"
              >
                결제 요청하기
              </Button>
            </form>
          </Form>
        )}

        {step === "processing" && (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">결제 요청을 처리하고 있습니다...</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-8 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">결제 요청이 생성되었습니다</h3>
              <p className="text-sm text-muted-foreground mb-4">
                아래 링크를 클릭하거나 휴대폰으로 발송된 링크에서 결제를 완료해주세요.
              </p>
              {paymentUrl && (
                <Button
                  asChild
                  className="w-full"
                  data-testid="link-payment"
                >
                  <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                    결제 페이지로 이동
                  </a>
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={handleClose} data-testid="button-close-modal">
              닫기
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
