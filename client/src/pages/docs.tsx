import { Link } from "wouter";

export default function Docs() {
  const docs: { title: string; href: string; desc: string }[] = [
    { title: "현금영수증 발행", href: "/docs/tax", desc: "발행 요청 방법, 필요 정보, 발행 기한 안내." },
    { title: "환불·취소 정책", href: "/docs/refund", desc: "환불 가능 조건, 기한, 수수료, 처리 소요 안내." },
    { title: "FAQ", href: "/docs/faq", desc: "다운로드, 포맷, 로그인, 청구 등 자주 묻는 질문." },
    { title: "이용약관", href: "/docs/terms", desc: "서비스 이용 범위, 책임 한계, 계약 조건." },
    { title: "개인정보처리방침", href: "/docs/privacy", desc: "개인정보 수집·이용 및 보호 조치." },
    { title: "SLA/지원 정책", href: "/docs/sla", desc: "지원 응답/복구 목표, 지원 채널·시간, 장애 시 대응." },
    { title: "데이터 스키마/필드 정의", href: "/docs/schema", desc: "필드 사전, 포맷, 샘플 데이터 안내." },
    { title: "릴리스 노트/변경 내역", href: "/docs/changelog", desc: "스키마 변경, 신규/폐기 필드, 업데이트 기록." },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">구매자 문서 모음</h1>
        <p className="text-muted-foreground">
          데이터 구매 및 사용과 관련된 주요 문서와 정책을 한 곳에서 확인하세요.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </header>

      <div className="space-y-3">
        {docs.map((doc) => (
          <Link
            key={doc.title}
            href={doc.href}
            className="block rounded-lg border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="font-semibold">{doc.title}</div>
            <div className="text-sm text-muted-foreground">{doc.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

