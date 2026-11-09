"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/utils";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  pointsBalance: number;
  isBanned: boolean;
  createdAt: string;
  docs: number;
};

export function UsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  async function patch(id: string, body: object) {
    setBusy(id);
    setError("");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (!res.ok) {
      setError("فشلت العملية، حاول مرة أخرى");
      return false;
    }
    router.refresh();
    return true;
  }

  async function savePoints(id: string) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) {
      setError("أدخل عدداً صحيحاً موجباً");
      return;
    }
    if (await patch(id, { action: "setPoints", points: n })) setEditing(null);
  }

  return (
    <div>
      {error && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-destructive">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="px-3 py-2 text-start font-medium">الوكيل</th>
              <th className="px-3 py-2 text-start font-medium">النقاط</th>
              <th className="px-3 py-2 text-start font-medium">الوثائق</th>
              <th className="px-3 py-2 text-start font-medium">الحالة</th>
              <th className="px-3 py-2 text-end font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-3 py-3">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{u.email}</p>
                </td>
                <td className="px-3 py-3">
                  {editing === u.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        className="h-8 w-28"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        autoFocus
                      />
                      <Button size="icon" className="h-8 w-8" onClick={() => savePoints(u.id)} disabled={busy === u.id} aria-label="حفظ">
                        {busy === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)} aria-label="إلغاء">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="flex items-center gap-2 font-bold hover:text-primary"
                      onClick={() => {
                        setEditing(u.id);
                        setValue(String(u.pointsBalance));
                        setError("");
                      }}
                    >
                      {formatNumber(u.pointsBalance)}
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </td>
                <td className="px-3 py-3">{u.docs}</td>
                <td className="px-3 py-3">
                  <Badge tone={u.isBanned ? "danger" : "success"}>{u.isBanned ? "محظور" : "نشط"}</Badge>
                </td>
                <td className="px-3 py-3 text-end">
                  <Button
                    size="sm"
                    variant={u.isBanned ? "outline" : "destructive"}
                    disabled={busy === u.id}
                    onClick={() => patch(u.id, { action: "toggleBan" })}
                  >
                    {u.isBanned ? "إلغاء الحظر" : "حظر"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
