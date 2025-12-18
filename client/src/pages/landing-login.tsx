import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FooterBanner } from "@/components/footer-banner";
import { useAuth } from "@/hooks/useAuth";

export default function LandingLogin() {
  const [, setLocation] = useLocation();
  const { setUser, storageKey } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    const accountsRaw = localStorage.getItem("accounts_v1");
    const accounts = accountsRaw ? (JSON.parse(accountsRaw) as Record<string, string>) : {};
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력하세요.");
      return;
    }
    if (!accounts[email]) {
      setError("가입된 이메일이 없습니다. 회원가입을 진행해 주세요.");
      return;
    }
    if (accounts[email] !== password) {
      setError("비밀번호가 올바르지 않습니다.");
      return;
    }
    const user = {
      id: email,
      email,
      firstName: email.split("@")[0],
      lastName: "",
      isAdmin: false,
    };
    localStorage.setItem(storageKey, JSON.stringify(user));
    window.dispatchEvent(new Event("auth-changed"));
    setLocation("/home");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 flex flex-col gap-12">
        <header className="flex items-center justify-between">
          <a
            href="https://wise.co.kr/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3"
          >
            <img src="/wiseitech.png" alt="WISEiTECH" className="h-10 w-auto" />
            <span className="text-sm text-white/70">Enterprise Data Platform</span>
          </a>
          <div className="flex items-center gap-2">
            <Link href="/signup">
              <Button variant="outline" size="sm">회원가입</Button>
            </Link>
          </div>
        </header>

        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.12em] text-primary font-semibold">
              Enterprise Data Platform
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              프리미엄 기업용 데이터셋
            </h1>
            <p className="text-lg text-white/80">
              금융 분석, 위치 기반 서비스, 소비자 행동 분석을 위한 고품질 데이터셋을 제공합니다.
              업계 최고 수준의 정확도와 신뢰성을 보장합니다.
            </p>
          </div>

          <div className="w-full max-w-md lg:ml-auto">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">로그인</h2>
              <p className="text-sm text-white/70">이메일과 비밀번호로 로그인하세요. 계정이 없다면 회원가입을 진행해 주세요.</p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-white/80">이메일</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-white/80">비밀번호</label>
                <Input
                  type="password"
                  placeholder="8자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button className="w-full" onClick={handleLogin}>
                로그인
              </Button>
              <div className="text-sm text-white/60 text-center">
                계정이 없나요? <Link href="/signup" className="text-primary underline">회원가입</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="mt-10">
        <FooterBanner />
      </div>
    </div>
  );
}

