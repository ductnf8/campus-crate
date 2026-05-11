import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Wallet, CheckCircle2, Clock, Sparkles } from "lucide-react";

const BANK = {
  bank: "MB Bank",
  bankCode: "MB", // mã VietQR
  accountNumber: "VQRQAITSH7008",
  accountName: "TRAN NGOC DUC",
};

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000, 500000, 1000000];

export default function Deposit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(50000);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);

  const userCode = user ? `NAPTIEN${user.id.replace(/-/g, "").slice(0, 8).toUpperCase()}` : "";

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadData();

    const ch = supabase
      .channel("deposit-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        () => {
          loadData();
          toast.success("🎉 Nạp tiền thành công!", { description: "Số dư của bạn đã được cập nhật." });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload: any) => setBalance(Number(payload.new.balance) || 0)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [{ data: profile }, { data: txs }] = await Promise.all([
      supabase.from("profiles").select("balance").eq("id", user.id).single(),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    if (profile) setBalance(Number(profile.balance) || 0);
    if (txs) setTransactions(txs);
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const qrUrl = `https://qr.sepay.vn/img?acc=${BANK.accountNumber}&bank=${BANK.bankCode}&amount=${amount}&des=${userCode}&template=compact`;

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg">
          <Wallet className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Nạp tiền vào tài khoản</h1>
          <p className="text-muted-foreground">Số dư hiện tại: <span className="font-bold text-primary">{balance.toLocaleString("vi-VN")} VNĐ</span></p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step 1: Chọn số tiền + QR */}
        <Card className="overflow-hidden border-2">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Quét mã QR để nạp tiền
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Số tiền (VNĐ)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                min={10000}
                step={10000}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((v) => (
                  <Button key={v} variant="outline" size="sm" onClick={() => setAmount(v)}>
                    {v.toLocaleString("vi-VN")}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center rounded-xl border bg-background p-4">
              <img src={qrUrl} alt="QR nạp tiền" className="h-64 w-64 rounded-lg" />
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Mở app ngân hàng → Quét QR → Số tiền & nội dung tự động điền
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Thông tin chuyển khoản thủ công */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Hoặc chuyển khoản thủ công</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Ngân hàng" value={BANK.bank} onCopy={() => copy(BANK.bank, "ngân hàng")} />
            <Row label="Số tài khoản" value={BANK.accountNumber} onCopy={() => copy(BANK.accountNumber, "số TK")} />
            <Row label="Chủ tài khoản" value={BANK.accountName} onCopy={() => copy(BANK.accountName, "tên chủ TK")} />
            <Row label="Số tiền" value={`${amount.toLocaleString("vi-VN")} VNĐ`} onCopy={() => copy(amount.toString(), "số tiền")} />
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">⚠️ Nội dung chuyển khoản (BẮT BUỘC)</p>
                  <p className="font-mono text-lg font-bold text-primary">{userCode}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => copy(userCode, "nội dung")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Phải ghi đúng nội dung này để hệ thống tự động cộng tiền.
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              💡 Sau khi chuyển khoản, số dư sẽ được cộng tự động trong vòng <strong>5–30 giây</strong>.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lịch sử giao dịch */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lịch sử giao dịch gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Chưa có giao dịch nào.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    {tx.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {tx.type === "deposit" ? "Nạp tiền" : tx.type === "listing_fee" ? "Phí đăng bài" : tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === "deposit" ? "text-green-600" : "text-destructive"}`}>
                      {tx.type === "deposit" ? "+" : "-"}
                      {Number(tx.amount).toLocaleString("vi-VN")} VNĐ
                    </p>
                    <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {tx.status === "completed" ? "Thành công" : "Đang chờ"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
      <Button size="icon" variant="ghost" onClick={onCopy}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
