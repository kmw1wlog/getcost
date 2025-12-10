interface FooterLink {
  text: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const navSections: FooterSection[] = [
  {
    title: "사업분야",
    links: [
      { text: "AI", href: "https://wise.co.kr/business/ai.do" },
      { text: "빅데이터", href: "https://wise.co.kr/business/bigData.do" },
      { text: "메타버스", href: "https://wise.co.kr/business/metaverse.do" },
    ],
  },
  {
    title: "제품소개",
    links: [
      { text: "와이즈프로핏™", href: "https://wise.co.kr/product/wiseprophet.do" },
      { text: "와이즈인텔리전스™", href: "https://wise.co.kr/product/wiseintelligence.do" },
      { text: "와이즈디큐™", href: "https://wise.co.kr/product/wisedq.do" },
      { text: "와이즈메타™", href: "https://wise.co.kr/product/wisemeta.do" },
      { text: "와이즈메타엔진™", href: "https://wise.co.kr/product/metaversePlatform.do" },
    ],
  },
  {
    title: "레퍼런스",
    links: [
      { text: "수주소식", href: "https://wise.co.kr/reference/newsList.do" },
      { text: "사업실적", href: "https://wise.co.kr/reference/performancelist.do" },
      { text: "구축사례", href: "https://wise.co.kr/reference/custSucCase.do" },
      { text: "고객사", href: "https://wise.co.kr/reference/client.do" },
    ],
  },
  {
    title: "홍보센터",
    links: [
      { text: "보도자료", href: "https://wise.co.kr/media/list.do?board=2" },
      { text: "홍보영상", href: "https://wise.co.kr/media/promotionList.do" },
      { text: "공지사항", href: "https://wise.co.kr/media/list.do?board=1" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { text: "온라인 문의", href: "https://wise.co.kr/customer/inquiry.do" },
      { text: "Contact us", href: "https://wise.co.kr/customer/contact.do" },
    ],
  },
  {
    title: "회사소개",
    links: [
      { text: "회사개요", href: "https://wise.co.kr/company/about.do" },
      { text: "CEO인사말", href: "https://wise.co.kr/company/greeting.do" },
      { text: "연혁", href: "https://wise.co.kr/company/history.do" },
      { text: "채용정보", href: "https://wise.co.kr/company/employment.do" },
    ],
  },
];

const breadNavLinks: FooterLink[] = [
  { text: "Home", href: "https://wise.co.kr/" },
  { text: "사업분야", href: "https://wise.co.kr/business/ai.do" },
  { text: "제품소개", href: "https://wise.co.kr/product/wiseprophet.do" },
  { text: "레퍼런스", href: "https://wise.co.kr/reference/newsList.do" },
  { text: "홍보센터", href: "https://wise.co.kr/media/list.do?board=2" },
  { text: "고객지원", href: "https://wise.co.kr/customer/inquiry.do" },
  { text: "회사소개", href: "https://wise.co.kr/company/about.do" },
  { text: "AI", href: "https://wise.co.kr/business/ai.do" },
  { text: "빅데이터", href: "https://wise.co.kr/business/bigData.do" },
  { text: "메타버스", href: "https://wise.co.kr/business/metaverse.do" },
];

export function FooterBanner() {
  return (
    <footer className="bg-[#000000] text-white">
      <div className="max-w-6xl mx-auto px-0 lg:px-0 py-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-8">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <div className="space-y-2 text-sm text-white/70">
                {section.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="sub-nav__link block hover:text-white transition-colors"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6">
          <div className="flex flex-wrap gap-3 text-xs text-white/60">
            {breadNavLinks.map((link) => (
              <a
                key={link.href + link.text}
                href={link.href}
                className="sub-bread-nav__link hover:text-white transition-colors"
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/wiseitech.png" alt="WISEiTECH" className="h-8 w-auto" />
              <span className="text-sm text-white/70">(주)위세아이텍</span>
            </div>
          </div>

          <div className="space-y-1 text-sm text-white/70">
            <div className="flex flex-wrap gap-2">
              <span>경기도 과천시 과천대로 12길 117 과천펜타원 G동 11~13층 (우: 13824)</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span>대표번호 02-6246-1400</span>
              <span className="hidden sm:inline">|</span>
              <span>팩스 02-6246-1415</span>
              <span className="hidden sm:inline">|</span>
              <span>이메일 contact@wise.co.kr</span>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <a href="#" className="underline hover:text-white">개인정보처리방침</a>
              <span className="hidden sm:inline">|</span>
              <span>Ⓒ COPYRIGHT© WISEiTECH CO.,LTD ALL RIGHTS RESERVED.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

