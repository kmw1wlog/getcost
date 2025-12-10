import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { storageKey } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeEmail = email.trim();
    if (!safeEmail) return;

    const user = {
      id: safeEmail,
      email: safeEmail,
      firstName: firstName.trim() || "Guest",
      lastName: lastName.trim() || "",
      isAdmin: false,
    };
    localStorage.setItem(storageKey, JSON.stringify(user));
    window.dispatchEvent(new Event("auth-changed"));
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] text-white px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">로그인</h1>
          <p className="text-sm text-white/70">
            
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">이름</Label>
              <Input
                id="firstName"
                placeholder="이름"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">성</Label>
              <Input
                id="lastName"
                placeholder="성"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            로그인하기
          </Button>
        </form>

        <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
          홈으로 이동
        </Button>
      </div>
    </div>
  );
}

