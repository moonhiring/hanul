import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Building2,
  Users,
  Plus,
  Trash2,
  Check,
  X,
  Archive,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSite } from "@/context";

/* ---------- 타입 ---------- */

interface AdminBusiness {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  confidence: number | null;
  verified: boolean;
  source: string;
  status: string;
  last_checked_at: string | null;
  evidence: {
    reason?: string;
    llmVerdict?: string;
    escalatedToReview?: boolean;
    verdictSource?: string;
  } | null;
}

interface AdminUser {
  id: number;
  email: string | null;
  name: string | null;
  picture: string | null;
  role: "member" | "admin";
  created_at: string;
  last_login_at: string | null;
}

interface Stats {
  businessesTotal: number;
  byStatus: Record<string, number>;
  users: { total: number; admins: number; active7d: number };
  recentRuns: {
    worker_id: string;
    batch_size: number;
    result: Record<string, number>;
    started_at: string;
    finished_at: string | null;
  }[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: "대기",
  active: "정상",
  stale: "재검증 필요",
  likely_closed: "폐업 추정",
  needs_human: "검토 필요",
  not_korean: "비한인 확정",
  duplicate: "중복",
  archived: "보관됨",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-forest/10 text-forest",
  pending: "bg-ink/8 text-ink/70",
  stale: "bg-amber-500/10 text-amber-700",
  likely_closed: "bg-coral/10 text-coral-deep",
  needs_human: "bg-amber-500/15 text-amber-700",
  not_korean: "bg-ink/10 text-ink/60",
  duplicate: "bg-ink/10 text-ink/60",
  archived: "bg-ink/10 text-ink/50",
};

/* ---------- API 헬퍼 ---------- */

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    credentials: "include",
    headers: options?.body ? { "content-type": "application/json" } : undefined,
    ...options,
  });
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${r.status}`);
  }
  return r.json() as Promise<T>;
}

/* ---------- 페이지 ---------- */

type Tab = "dashboard" | "review" | "businesses" | "users";

export default function AdminPage() {
  const { user, authReady, setLoginOpen } = useSite();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (!authReady) {
    return <div className="mx-auto max-w-6xl px-6 py-20 text-center text-muted-foreground">확인 중…</div>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="serif-display text-2xl font-black text-ink">관리자 로그인이 필요합니다</p>
        <button
          onClick={() => setLoginOpen(true)}
          className="mt-6 rounded-full bg-coral px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          로그인
        </button>
      </div>
    );
  }
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="serif-display text-2xl font-black text-ink">관리자 권한이 없습니다</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {user.email} 계정은 일반 회원입니다. 관리자 등록이 필요하면 ADMIN_EMAILS에 이메일을 추가하세요.
        </p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
    { id: "review", label: "검토 큐", icon: Inbox },
    { id: "businesses", label: "업체 관리", icon: Building2 },
    { id: "users", label: "사용자", icon: Users },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="folio-label">Admin</p>
      <h1 className="serif-display mt-2 text-3xl font-black text-ink">관리자</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              tab === t.id
                ? "bg-forest text-cream"
                : "border border-border bg-card text-ink/70 hover:border-forest hover:text-forest"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "review" && <ReviewTab />}
        {tab === "businesses" && <BusinessesTab />}
        {tab === "users" && <UsersTab me={user} />}
      </div>
    </div>
  );
}

/* ---------- 대시보드 ---------- */

function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/admin/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-coral-deep">불러오기 실패: {error}</p>;
  if (!stats) return <p className="text-sm text-muted-foreground">불러오는 중…</p>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="전체 업체" value={stats.businessesTotal.toLocaleString()} />
        <StatCard label="검토 대기" value={(stats.byStatus.needs_human ?? 0).toLocaleString()} highlight />
        <StatCard label="가입 사용자" value={String(stats.users.total)} />
        <StatCard label="7일 내 접속" value={String(stats.users.active7d)} />
      </div>

      <section>
        <h2 className="text-sm font-bold text-ink">업체 상태 분포</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(stats.byStatus).map(([s, c]) => (
            <span
              key={s}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_BADGE[s] ?? "bg-ink/8 text-ink"}`}
            >
              {STATUS_LABEL[s] ?? s} {c.toLocaleString()}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-ink">최근 검증 실행</h2>
        {stats.recentRuns.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">아직 실행 기록이 없습니다.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2.5 font-semibold">워커</th>
                  <th className="px-4 py-2.5 font-semibold">건수</th>
                  <th className="px-4 py-2.5 font-semibold">결과</th>
                  <th className="px-4 py-2.5 font-semibold">시각</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentRuns.map((r, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2.5 font-mono">{r.worker_id}</td>
                    <td className="px-4 py-2.5">{r.batch_size}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {Object.entries(r.result)
                        .map(([k, v]) => `${STATUS_LABEL[k] ?? k} ${v}`)
                        .join(" · ")}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {new Date(r.started_at).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"}`}>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="serif-display mt-1 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}

/* ---------- 검토 큐 ---------- */

function ReviewTab() {
  const [items, setItems] = useState<AdminBusiness[] | null>(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    api<{ total: number; items: AdminBusiness[] }>("/api/admin/businesses?status=needs_human&limit=50")
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
      })
      .catch((e) => toast.error(`불러오기 실패: ${e.message}`));
  }, []);

  useEffect(load, [load]);

  const decide = async (id: number, status: "active" | "not_korean" | "archived") => {
    setBusy(id);
    try {
      await api(`/api/admin/businesses/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setItems((prev) => prev?.filter((b) => b.id !== id) ?? null);
      setTotal((t) => t - 1);
      toast.success(
        status === "active" ? "정상으로 승인했습니다" : status === "not_korean" ? "비한인으로 확정(비노출)했습니다" : "보관 처리했습니다",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "처리 실패");
    } finally {
      setBusy(null);
    }
  };

  if (!items) return <p className="text-sm text-muted-foreground">불러오는 중…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          검증 에이전트가 판단을 보류한 업체입니다. <b className="text-ink">{total}건</b> 남음
        </p>
        <button onClick={load} className="flex items-center gap-1 text-xs font-bold text-forest hover:underline">
          <RefreshCw className="h-3 w-3" /> 새로고침
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          검토 큐가 비었습니다 🎉
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((b) => (
            <li key={b.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-ink">
                    {b.name}
                    {b.evidence?.llmVerdict && (
                      <span className="ml-2 rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-bold text-coral-deep">
                        AI 의심: {STATUS_LABEL[b.evidence.llmVerdict] ?? b.evidence.llmVerdict}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b.city} · {b.category}
                    {b.address ? ` · ${b.address}` : ""}
                  </p>
                  {b.evidence?.reason && (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      <span className="font-semibold text-ink/70">AI 판정 근거:</span> {b.evidence.reason}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    disabled={busy === b.id}
                    onClick={() => decide(b.id, "active")}
                    className="flex items-center gap-1 rounded-full bg-forest px-3 py-1.5 text-[11px] font-bold text-cream hover:opacity-90 disabled:opacity-40"
                  >
                    <Check className="h-3 w-3" /> 승인
                  </button>
                  <button
                    disabled={busy === b.id}
                    onClick={() => decide(b.id, "not_korean")}
                    className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold text-ink/70 hover:border-coral hover:text-coral-deep disabled:opacity-40"
                  >
                    <X className="h-3 w-3" /> 비한인 확정
                  </button>
                  <button
                    disabled={busy === b.id}
                    onClick={() => decide(b.id, "archived")}
                    className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold text-ink/70 hover:border-ink disabled:opacity-40"
                  >
                    <Archive className="h-3 w-3" /> 보관
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- 업체 관리 ---------- */

function BusinessesTab() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [items, setItems] = useState<AdminBusiness[]>([]);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", category: "맛집", phone: "", address: "" });

  const load = useCallback(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    api<{ total: number; items: AdminBusiness[] }>(`/api/admin/businesses?${params}`)
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
      })
      .catch((e) => toast.error(`불러오기 실패: ${e.message}`));
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const setBizStatus = async (id: number, next: string) => {
    try {
      await api(`/api/admin/businesses/${id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      setItems((prev) => prev.map((b) => (b.id === id ? { ...b, status: next } : b)));
      toast.success("상태를 변경했습니다");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "변경 실패");
    }
  };

  const remove = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" 업체를 영구 삭제할까요? 되돌릴 수 없습니다. (보관은 상태를 '보관됨'으로)`)) return;
    try {
      await api(`/api/admin/businesses/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((b) => b.id !== id));
      setTotal((t) => t - 1);
      toast.success("삭제했습니다");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제 실패");
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/admin/businesses", { method: "POST", body: JSON.stringify(form) });
      toast.success(`"${form.name}" 추가 완료`);
      setForm({ name: "", city: "", category: "맛집", phone: "", address: "" });
      setShowAdd(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "추가 실패");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="업체명·주소 검색"
          className="w-56 bg-card"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{total.toLocaleString()}건</span>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="ml-auto flex items-center gap-1 rounded-full bg-coral px-4 py-2 text-xs font-bold text-white hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> 업체 추가
        </button>
      </div>

      {showAdd && (
        <form onSubmit={add} className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-5">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="업체명 *" className="bg-paper" required />
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="도시 * (예: 뉴욕)" className="bg-paper" required />
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="카테고리" className="bg-paper" />
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="전화번호" className="bg-paper" />
          <button type="submit" className="rounded-full bg-forest px-4 py-2 text-xs font-bold text-cream hover:opacity-90">
            추가
          </button>
        </form>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-2.5 font-semibold">업체</th>
              <th className="px-4 py-2.5 font-semibold">도시</th>
              <th className="px-4 py-2.5 font-semibold">카테고리</th>
              <th className="px-4 py-2.5 font-semibold">상태</th>
              <th className="px-4 py-2.5 font-semibold">삭제</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2.5">
                  <p className="font-bold text-ink">{b.name}</p>
                  {b.address && <p className="text-muted-foreground">{b.address}</p>}
                </td>
                <td className="px-4 py-2.5">{b.city}</td>
                <td className="px-4 py-2.5">{b.category}</td>
                <td className="px-4 py-2.5">
                  <Select value={b.status} onValueChange={(v) => setBizStatus(b.id, v)}>
                    <SelectTrigger className="h-8 w-32 bg-paper text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABEL).map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => remove(b.id, b.name)}
                    className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-coral/10 hover:text-coral-deep"
                    aria-label="삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다</p>
        )}
      </div>
    </div>
  );
}

/* ---------- 사용자 ---------- */

function UsersTab({ me }: { me: { id: number } }) {
  const [items, setItems] = useState<AdminUser[] | null>(null);

  const load = useCallback(() => {
    api<{ items: AdminUser[] }>("/api/admin/users")
      .then((d) => setItems(d.items))
      .catch((e) => toast.error(`불러오기 실패: ${e.message}`));
  }, []);

  useEffect(load, [load]);

  const setRole = async (id: number, role: "member" | "admin") => {
    try {
      await api(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });
      setItems((prev) => prev?.map((u) => (u.id === id ? { ...u, role } : u)) ?? null);
      toast.success("역할을 변경했습니다");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "변경 실패");
    }
  };

  if (!items) return <p className="text-sm text-muted-foreground">불러오는 중…</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="px-4 py-2.5 font-semibold">사용자</th>
            <th className="px-4 py-2.5 font-semibold">이메일</th>
            <th className="px-4 py-2.5 font-semibold">가입</th>
            <th className="px-4 py-2.5 font-semibold">최근 로그인</th>
            <th className="px-4 py-2.5 font-semibold">역할</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-2.5">
                <span className="flex items-center gap-2">
                  {u.picture ? (
                    <img src={u.picture} alt="" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-[10px] text-cream">
                      {(u.name ?? "?").slice(0, 1)}
                    </span>
                  )}
                  <span className="font-bold text-ink">{u.name ?? "(이름 없음)"}</span>
                  {u.id === me.id && <span className="text-[10px] text-muted-foreground">(나)</span>}
                </span>
              </td>
              <td className="px-4 py-2.5">{u.email}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{new Date(u.created_at).toLocaleDateString("ko-KR")}</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {u.last_login_at ? new Date(u.last_login_at).toLocaleString("ko-KR") : "-"}
              </td>
              <td className="px-4 py-2.5">
                <Select value={u.role} onValueChange={(v) => setRole(u.id, v as "member" | "admin")} disabled={u.id === me.id}>
                  <SelectTrigger className="h-8 w-28 bg-paper text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">일반</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
                  </SelectContent>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <p className="p-8 text-center text-sm text-muted-foreground">아직 가입한 사용자가 없습니다</p>
      )}
    </div>
  );
}
