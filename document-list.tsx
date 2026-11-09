import Link from "next/link";
import { Badge } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export type DocRow = {
  id: string;
  createdAt: Date;
  status: "PENDING" | "COMPLETED" | "FAILED";
  pointsCharged: number;
  service: { nameAr: string };
};

const STATUS = {
  COMPLETED: { label: "مكتمل", tone: "success" as const },
  PENDING: { label: "قيد المعالجة", tone: "warning" as const },
  FAILED: { label: "فشل (أُعيدت النقاط)", tone: "danger" as const },
};

export function DocumentList({ docs, locale }: { docs: DocRow[]; locale: string }) {
  if (docs.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">لا توجد وثائق بعد.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="px-3 py-2 text-start font-medium">الخدمة</th>
            <th className="px-3 py-2 text-start font-medium">التاريخ</th>
            <th className="px-3 py-2 text-start font-medium">النقاط</th>
            <th className="px-3 py-2 text-start font-medium">الحالة</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id} className="border-b last:border-0 hover:bg-muted/40">
              <td className="px-3 py-3 font-semibold">{d.service.nameAr}</td>
              <td className="px-3 py-3 text-muted-foreground">{formatDate(d.createdAt, locale)}</td>
              <td className="px-3 py-3">{d.pointsCharged}</td>
              <td className="px-3 py-3">
                <Badge tone={STATUS[d.status].tone}>{STATUS[d.status].label}</Badge>
              </td>
              <td className="px-3 py-3 text-end">
                {d.status === "COMPLETED" && (
                  <Link href={`/${locale}/dashboard/documents/${d.id}`} className="font-semibold text-primary hover:underline">
                    عرض
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
