export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">이용약관</h1>
        <p className="text-muted-foreground">서비스 이용 범위와 책임 한계, 계약 조건을 안내합니다.</p>
      </header>

      <section className="space-y-3 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">주요 내용</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>허용/제한되는 사용 범위(재판매/재배포 금지 등)</li>
          <li>사용자 계정/보안 책임</li>
          <li>서비스 변경·중단 및 고지</li>
          <li>책임 제한(직·간접 손해 배제, 일부 예외 포함)</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">준거법 및 분쟁 해결</h2>
        <p>관할 법원 및 준거법을 명시하고, 분쟁 발생 시 협의 절차를 거칩니다.</p>
      </section>
    </div>
  );
}

