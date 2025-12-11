export default function SchemaGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">데이터 스키마/필드 정의</h1>
        <p className="text-muted-foreground">필드 사전, 포맷, 샘플 데이터 안내입니다.</p>
      </header>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">포맷</h2>
        <p>상품별 안내된 포맷(JSON/CSV/Parquet 등)을 확인해 주세요.</p>
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">필드 정의</h2>
        <p>주요 필드명, 타입, 설명을 스키마 문서로 제공합니다. 상품 상세의 “스키마” 탭도 참고하세요.</p>
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">샘플 데이터</h2>
        <p>미리보기/샘플 파일을 통해 구조와 품질을 확인할 수 있습니다.</p>
      </section>
    </div>
  );
}

