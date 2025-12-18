import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { storageKey } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = () => {
    setError("");
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력하세요.");
      return;
    }
    if (!agreeTerms) {
      setError("약관에 동의해야 가입할 수 있습니다.");
      return;
    }
    const accountsRaw = localStorage.getItem("accounts_v1");
    const accounts = accountsRaw ? (JSON.parse(accountsRaw) as Record<string, string>) : {};
    if (accounts[email]) {
      setError("이미 가입된 이메일입니다. 로그인으로 이동하세요.");
      return;
    }
    accounts[email] = password;
    localStorage.setItem("accounts_v1", JSON.stringify(accounts));

    // 자동 로그인 처리
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
    <div className="min-h-screen flex flex-col bg-[#0b0b0b] text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#0b0b0b]">
        <div className="flex items-center gap-3">
          <img src="/wiseitech.png" alt="WISEiTECH" className="h-8 w-auto" />
          <span className="text-sm text-white/70">Enterprise Data Platform</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" size="sm">로그인</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">회원가입</h1>
            <p className="text-sm text-white/70">이메일과 비밀번호를 입력하고 약관에 동의해 주세요.</p>
          </div>

          <div className="space-y-3">
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
            <div className="flex items-center space-x-2">
              <Checkbox id="agree" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(!!v)} />
              <label htmlFor="agree" className="text-sm text-white/80">이용약관 및 개인정보 처리방침에 동의합니다.</label>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button className="w-full" onClick={handleSignup}>가입하기</Button>
            <div className="text-sm text-white/60 text-center">
              이미 계정이 있나요? <Link href="/login" className="text-primary underline">로그인</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}









