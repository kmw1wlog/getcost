export default function Faq() {
  const faqs = [
    { q: "다운로드가 안 돼요", a: "네트워크 상태를 확인하고, 다른 브라우저 시도 후 지속되면 문의 주세요." },
    { q: "지원 포맷이 궁금해요", a: "각 상품 안내에 기재된 포맷(JSON/CSV/Parquet 등)을 확인하세요." },
    { q: "로그인이 필요하나요?", a: "구매내역/재다운로드 등 개인화 기능을 위해 로그인 기반입니다." },
    { q: "청구/영수증은 어디서?", a: "현금영수증 발행 안내를 참고해 요청해 주세요." },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">FAQ</h1>
        <p className="text-muted-foreground">자주 묻는 질문과 답변을 확인하세요.</p>
      </header>

      <div className="space-y-4">
        {faqs.map((item) => (
          <details key={item.q} className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <summary className="font-semibold cursor-pointer">{item.q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}







