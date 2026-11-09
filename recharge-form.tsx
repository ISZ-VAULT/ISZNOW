"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const ERRORS: Record<string, string> = {
  INVALID_CODE_FORMAT: "الكود يجب أن يتكون من 12 رقماً",
  CARD_NOT_FOUND: "هذا الكود غير موجود",
  CARD_ALREADY_USED: "هذا الكود مستعمل من قبل",
  UNAUTHORIZED: "يجب تسجيل الدخول أولاً",
  SERVER_ERROR: "حدث خطأ في الخادم، حاول مرة أخرى",
};

export function RechargeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ added: number; balance: number } | null>(null);

  const digits = code.replace(/\D/g, "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    const res = await fetch("/api/recharge/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: digits }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(ERRORS[data.error] ?? "حدث خطأ غير متوقع");
      return;
    }
    setSuccess({ added: data.pointsAdded, balance: data.pointsBalance });
    setCode("");
    router.refresh(); // updates the balance in the topbar
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="code">كود بطاقة الشحن (12 رقماً)</Label>
        <Input
          id="code"
          dir="ltr"
          inputMode="numeric"
          maxLength={14}
          placeholder="1234 5678 9012"
          className="h-14 text-center text-xl font-bold tracking-widest"
          value={code}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, 12);
            setCode(d.replace(/(\d{4})(?=\d)/g, "$1 "));
          }}
        />
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-destructive">{error}</p>}
      {success && (
        <div className="flex items-center gap-3 rounded-md bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">تمت إضافة {success.added.toLocaleString("fr-DZ")} نقطة بنجاح</p>
            <p>رصيدك الحالي: {success.balance.toLocaleString("fr-DZ")} نقطة</p>
          </div>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading || digits.length !== 12}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        شحن الرصيد
      </Button>
    </form>
  );
}
