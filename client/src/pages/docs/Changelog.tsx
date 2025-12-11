export default function Changelog() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">릴리스 노트/변경 내역</h1>
        <p className="text-muted-foreground">스키마 변경, 신규/폐기 필드, 최근 업데이트 기록을 안내합니다.</p>
      </header>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">최근 변경</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>예: 2025-01-10 — 금융 뉴스 감성 데이터셋 필드 추가(sentiment_confidence)</li>
          <li>예: 2025-01-02 — 공간 지각 가중치 체크포인트 v2 배포</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">변경 이력 관리</h2>
        <p>중요 변경 시 고객지원 채널과 공지사항을 통해 사전 고지합니다.</p>
      </section>
    </div>
  );
}

