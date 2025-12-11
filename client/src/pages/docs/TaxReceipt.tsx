export default function TaxReceipt() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">현금영수증 발행 안내</h1>
        <p className="text-muted-foreground">
          발행 요청 방법, 필요 정보, 발행 기한을 안내합니다.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">발행 요청 방법</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>주문 완료 후 고객 지원 채널(문의 폼/이메일)로 요청해 주세요.</li>
          <li>요청 시 주문번호, 사업자등록번호 또는 휴대폰번호, 수취 이메일을 함께 남겨주세요.</li>
          <li>영업일 기준 2~3일 내 발행 및 이메일 송부를 진행합니다.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">필요 정보</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>주문번호</li>
          <li>사업자등록번호(개인이라면 휴대폰번호)</li>
          <li>수취 이메일 주소</li>
          <li>수취인 상호/성명</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">유의사항</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>주문 정보와 불일치 시 추가 확인이 필요할 수 있습니다.</li>
          <li>법인카드 결제는 카드 매출전표로 대체될 수 있습니다.</li>
          <li>발행 완료 후 재발행/수정은 불가하니 정보를 정확히 기입해 주세요.</li>
        </ul>
      </section>
    </div>
  );
}

