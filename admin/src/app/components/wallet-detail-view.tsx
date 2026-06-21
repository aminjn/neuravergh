import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DataGrid, type GridColumn } from "./data-grid";

const txCols: GridColumn[] = [
  { field: "id", headerName: "شناسه", filterType: "text", width: 120 },
  { field: "type", headerName: "نوع", filterType: "set" },
  { field: "amount", headerName: "مبلغ (تومان)", filterType: "number" },
  { field: "method", headerName: "روش", filterType: "set" },
  { field: "status", headerName: "وضعیت", filterType: "set" },
  { field: "date", headerName: "تاریخ", filterType: "date" },
  { field: "ref", headerName: "کد پیگیری", filterType: "text" },
];

const sampleTx = [
  { id: "TX-W001", type: "شارژ کیف پول", amount: 1500000, method: "آنلاین", status: "موفق", date: "2026-03-12", ref: "A8F12C" },
  { id: "TX-W002", type: "خرید ایجنت", amount: 1200000, method: "کیف پول", status: "موفق", date: "2026-03-20", ref: "B91DDA" },
  { id: "TX-W003", type: "شارژ توکن", amount: 350000, method: "کیف پول", status: "موفق", date: "2026-04-08", ref: "C30FE7" },
  { id: "TX-W004", type: "بازگشت وجه", amount: 80000, method: "آنلاین", status: "در انتظار", date: "2026-04-30", ref: "D77AA1" },
];

export function WalletDetailView({
  wallet,
  onBack,
}: {
  wallet: any;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1>کیف پول — {wallet.user}</h1>
            <p className="text-sm text-muted-foreground">
              موجودی فعلی: {Number(wallet.balance ?? 0).toLocaleString()} تومان
            </p>
          </div>
        </div>
        <Badge variant={wallet.status === "فعال" ? "default" : "secondary"}>
          {wallet.status}
        </Badge>
      </div>

      <Tabs defaultValue="user">
        <TabsList>
          <TabsTrigger value="user">اطلاعات یوزر</TabsTrigger>
          <TabsTrigger value="transactions">تراکنش‌های کیف پول</TabsTrigger>
        </TabsList>

        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات کاربر مرتبط با این کیف پول</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">نام کاربر</Label>
                <Input value={wallet.user ?? ""} disabled />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">ایمیل</Label>
                <Input value={wallet.email ?? ""} disabled />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">موجودی</Label>
                <Input value={String(wallet.balance ?? 0)} disabled />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">مجموع شارژ</Label>
                <Input value={String(wallet.totalCharged ?? 0)} disabled />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">مجموع مصرف</Label>
                <Input value={String(wallet.totalSpent ?? 0)} disabled />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">آخرین تراکنش</Label>
                <Input value={wallet.lastUpdate ?? ""} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>تراکنش‌های این کیف پول</CardTitle>
            </CardHeader>
            <CardContent>
              <DataGrid rowData={sampleTx} columnDefs={txCols} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
