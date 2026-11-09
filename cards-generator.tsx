"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { formatCode } from "@/lib/utils";

type Result = { packName: string; points: number; priceDzd: number; codes: string[] };

export function CardsGenerator() {
  const router = useRouter();
  const [packName, setPackName] = useState("Pack Pro");
  const [points, setPoints] = useState("12000");
  const [priceDzd, setPriceDzd] = useState("3000");
  const [quantity, setQuantity] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/cards/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packName,
        points: Number(points),
        priceDzd: Number(priceDzd),
        quantity: Number(quantity),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError("تعذّر إنشاء البطاقات، تحقق من القيم المدخلة (الكمية بين 1 و 500)");
      return;
    }
    setResult(data);
    router.refresh();
  }

  function downloadCsv() {
    if (!result) return;
    const rows = ["code,points,price_dzd,pack", ...result.codes.map((c) => `${c},${result.points},${result.priceDzd},${result.packName}`)];
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `isznow-cards-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>توليد بطاقات جديدة</CardTitle>
          <CardDescription>تُنشأ دفعة واحدة بأكواد عشوائية من 12 رقماً</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>اسم الباقة</Label>
              <Input required value={packName} onChange={(e) => setPackName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>النقاط</Label>
                <Input type="number" min={1} required value={points} onChange={(e) => setPoints(e.target.value)} />
              </div>
              <div>
                <Label>سعر البيع (دج)</Label>
                <Input type="number" min={0} required value={priceDzd} onChange={(e) => setPriceDzd(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>عدد البطاقات (حتى 500)</Label>
              <Input type="number" min={1} max={500} required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              توليد البطاقات
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>الدفعة الأخيرة</CardTitle>
            <CardDescription>
              {result ? `${result.codes.length} بطاقة — ${result.packName} (${result.points} نقطة)` : "لم يتم توليد أي دفعة بعد"}
            </CardDescription>
          </div>
          {result && (
            <Button variant="outline" size="sm" onClick={downloadCsv}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {result ? (
            <div dir="ltr" className="grid max-h-[420px] gap-2 overflow-y-auto sm:grid-cols-2">
              {result.codes.map((c) => (
                <div key={c} className="rounded-md border bg-muted/40 px-3 py-2 text-center font-mono text-sm font-bold tracking-wider">
                  {formatCode(c)}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">املأ النموذج واضغط «توليد البطاقات»</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
