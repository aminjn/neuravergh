import { useState } from "react";
import { toast } from "sonner";
import { api } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ArrowRight, Pencil, Save, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DataGrid, type GridColumn } from "./data-grid";

type Props = {
  user: any;
  onBack: () => void;
};

const accountFields: { key: string; label: string }[] = [
  { key: "name", label: "نام و نام خانوادگی" },
  { key: "email", label: "ایمیل" },
  { key: "phone", label: "شماره تماس" },
  { key: "username", label: "نام کاربری" },
  { key: "role", label: "نقش" },
  { key: "status", label: "وضعیت" },
];

const identityFields: { key: string; label: string }[] = [
  { key: "nationalId", label: "کد ملی" },
  { key: "fatherName", label: "نام پدر" },
  { key: "birthDate", label: "تاریخ تولد" },
  { key: "gender", label: "جنسیت" },
  { key: "address", label: "آدرس" },
  { key: "postalCode", label: "کد پستی" },
];

const txCols: GridColumn[] = [
  { field: "id", headerName: "شناسه", filterType: "text", width: 110 },
  { field: "type", headerName: "نوع", filterType: "set" },
  { field: "amount", headerName: "مبلغ (تومان)", filterType: "number" },
  { field: "status", headerName: "وضعیت", filterType: "set" },
  { field: "date", headerName: "تاریخ", filterType: "date" },
  { field: "ref", headerName: "کد پیگیری", filterType: "text" },
];

const txRows: any[] = [];

const bizCols: GridColumn[] = [
  { field: "name", headerName: "نام بیزینس", filterType: "text" },
  { field: "industry", headerName: "صنعت", filterType: "set" },
  { field: "agent", headerName: "ایجنت متصل", filterType: "set" },
  { field: "members", headerName: "اعضا", filterType: "number" },
  { field: "createdAt", headerName: "تاریخ ایجاد", filterType: "date" },
];

const bizRows: any[] = [];

const agentCols: GridColumn[] = [
  { field: "name", headerName: "نام ایجنت", filterType: "set" },
  { field: "plan", headerName: "پلن", filterType: "set" },
  { field: "purchasedAt", headerName: "تاریخ خرید", filterType: "date" },
  { field: "expiresAt", headerName: "انقضا", filterType: "date" },
  { field: "price", headerName: "قیمت (تومان)", filterType: "number" },
  { field: "status", headerName: "وضعیت", filterType: "set" },
];

const agentRows: any[] = [];

const logCols: GridColumn[] = [
  { field: "time", headerName: "زمان", filterType: "date" },
  { field: "action", headerName: "عملیات", filterType: "set" },
  { field: "target", headerName: "هدف", filterType: "text" },
  { field: "ip", headerName: "IP", filterType: "text" },
  { field: "result", headerName: "نتیجه", filterType: "set" },
];

const logRows: any[] = [];

function FieldGrid({
  fields,
  values,
  readOnly,
  onChange,
}: {
  fields: { key: string; label: string }[];
  values: Record<string, any>;
  readOnly: boolean;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">{f.label}</Label>
          <Input
            value={values[f.key] ?? ""}
            disabled={readOnly}
            onChange={(e) => onChange(f.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export function UserDetailView({ user, onBack }: Props) {
  const m = (user as any).meta || {};
  const initial = {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? m.phone ?? "",
    username: user.username ?? user.email?.split("@")[0] ?? "",
    role: user.role ?? "",
    status: user.status ?? "",
    nationalId: user.nationalId ?? m.nationalId ?? "",
    fatherName: user.fatherName ?? m.fatherName ?? "",
    birthDate: user.birthDate ?? m.birthDate ?? "",
    gender: user.gender ?? m.gender ?? "",
    address: user.address ?? m.address ?? "",
    postalCode: user.postalCode ?? m.postalCode ?? "",
  };

  const [account, setAccount] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(false);

  const startEdit = () => {
    setDraft(account);
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const save = () => {
    setAccount(draft);
    setEditing(false);
    if (user.id) {
      api.updateUser(user.id, {
        name: draft.name, email: draft.email,
        meta: { phone: draft.phone, nationalId: draft.nationalId, fatherName: draft.fatherName, birthDate: draft.birthDate, gender: draft.gender, address: draft.address, postalCode: draft.postalCode },
      }).then(() => toast.success("اطلاعات کاربر ذخیره شد")).catch(() => toast.error("خطا در ذخیره"));
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1>مدیریت کاربر — {account.name}</h1>
            <p className="text-sm text-muted-foreground">
              مشاهده و ویرایش اطلاعات کاربر
            </p>
          </div>
        </div>
        <Badge variant="secondary">{account.email}</Badge>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">اطلاعات</TabsTrigger>
          <TabsTrigger value="identity">اطلاعات هویتی</TabsTrigger>
          <TabsTrigger value="finance">مالی</TabsTrigger>
          <TabsTrigger value="businesses">بیزینس‌ها</TabsTrigger>
          <TabsTrigger value="agents">ایجنت‌ها</TabsTrigger>
          <TabsTrigger value="logs">لاگ</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>اطلاعات حساب کاربری</CardTitle>
              {editing ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={cancel}>
                    <X className="h-4 w-4 ml-1" />
                    انصراف
                  </Button>
                  <Button size="sm" onClick={save}>
                    <Save className="h-4 w-4 ml-1" />
                    ذخیره
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={startEdit}>
                  <Pencil className="h-4 w-4 ml-1" />
                  ویرایش
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <FieldGrid
                fields={accountFields}
                values={editing ? draft : account}
                readOnly={!editing}
                onChange={(k, v) => setDraft({ ...draft, [k]: v })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات هویتی</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGrid
                fields={identityFields}
                values={account}
                readOnly
                onChange={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>تراکنش‌های کاربر</CardTitle>
            </CardHeader>
            <CardContent>
              <DataGrid rowData={txRows} columnDefs={txCols} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>بیزینس‌های کاربر</CardTitle>
            </CardHeader>
            <CardContent>
              <DataGrid rowData={bizRows} columnDefs={bizCols} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>ایجنت‌های خریداری‌شده</CardTitle>
            </CardHeader>
            <CardContent>
              <DataGrid rowData={agentRows} columnDefs={agentCols} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>لاگ عملیات کاربر</CardTitle>
            </CardHeader>
            <CardContent>
              <DataGrid rowData={logRows} columnDefs={logCols} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
