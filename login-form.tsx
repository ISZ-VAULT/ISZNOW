"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });
    if (!res || res.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة، أو الحساب محظور");
      setLoading(false);
      return;
    }

    const session = await getSession();
    router.push(`/${locale}/${session?.user.role === "ADMIN" ? "admin" : "dashboard"}`);
    router.refresh();
  }

  function fill(e: string, p: string) {
    setEmail(e);
    setPassword(p);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@isznow.com"
        />
      </div>
      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          type="password"
          dir="ltr"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        تسجيل الدخول
      </Button>

      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        <p className="mb-2 font-semibold">حسابات تجريبية (اضغط للتعبئة):</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fill("agent@isznow.com", "agent123")}>
            وكيل
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fill("admin@isznow.com", "admin123")}>
            مدير
          </Button>
        </div>
      </div>
    </form>
  );
}
