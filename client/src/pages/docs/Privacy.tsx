export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">개인정보처리방침</h1>
        <p className="text-muted-foreground">개인정보 수집·이용 목적, 보관 기간, 보호 조치를 안내합니다.</p>
      </header>

      <section className="space-y-3 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">수집 항목과 목적</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>계정/결제용: 이메일, 이름, 결제 식별자</li>
          <li>고객지원: 문의 내용, 연락처</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">보관 기간</h2>
        <p>법령 또는 계약 이행을 위해 필요한 기간 동안만 보관하며, 목적 달성 시 지체 없이 파기합니다.</p>
      </section>

      <section className="space-y-3 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">안전성 확보 조치</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>전송/저장 암호화</li>
          <li>접근권한 최소화 및 로그 관리</li>
          <li>정기 보안 점검</li>
        </ul>
      </section>
    </div>
  );
}







