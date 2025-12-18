export default function Sla() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">SLA/지원 정책</h1>
        <p className="text-muted-foreground">지원 채널, 응답/복구 목표, 장애 시 대응을 안내합니다.</p>
      </header>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">지원 채널 및 시간</h2>
        <p>이메일/문의 폼 기준 영업일 09:00~18:00 응대</p>
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">응답/복구 목표</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>응답: 접수 후 영업일 1일 이내</li>
          <li>복구: 영향도에 따라 우선순위 부여, 목표 복구 시간 공지</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">장애 시 대응</h2>
        <p>장애 공지, 우회 다운로드 제공 등 가능하면 서비스 지속 방안을 마련합니다.</p>
      </section>
    </div>
  );
}









