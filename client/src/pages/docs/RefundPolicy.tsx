export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">환불·취소 정책</h1>
        <p className="text-muted-foreground">
          환불 가능 조건, 기한, 수수료, 처리 소요를 안내합니다.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">환불 가능 조건</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>다운로드/열람 이전: 전액 환불 가능</li>
          <li>다운로드/열람 이후: 데이터 특성상 환불이 제한될 수 있음</li>
          <li>잘못된 결제나 중복 결제는 확인 후 전액 환불</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">절차 및 기한</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>환불 요청은 구매 후 7일 이내 문의 채널로 접수</li>
          <li>처리 소요: 영업일 기준 3~5일 (결제사/카드사 사정에 따라 상이)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">수수료</h2>
        <p className="text-muted-foreground">결제 수단에 따른 결제대행 수수료가 환불액에서 차감될 수 있습니다.</p>
      </section>
    </div>
  );
}







