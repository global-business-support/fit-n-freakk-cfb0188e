import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { MemberCard } from "@/components/MemberCard";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members — Feet & Freakk" },
      { name: "description", content: "Manage gym members" },
    ],
  }),
  component: MembersPage,
});

interface MemberRow {
  user_id: string;
  name: string;
  member_id: string | null;
  age: number;
  height: string;
  weight: string;
  feesPaid: number;
  feesRemaining: number;
  lastVisit: string;
  status: "active" | "inactive";
  gender: "male" | "female";
  photoUrl?: string;
}

function MembersPage() {
  const [filter, setFilter] = useState<"all" | "male" | "female" | "unpaid">("all");
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [profilesRes, feesRes, attendanceRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("fees").select("*"),
      supabase.from("attendance").select("user_id, checked_in_at").gte("checked_in_at", todayStart.toISOString()),
    ]);

    const fees = feesRes.data || [];
    const today = attendanceRes.data || [];

    setMembers(
      (profilesRes.data || []).map((p: any) => {
        const mine = fees.filter((f: any) => f.user_id === p.user_id);
        const paid = mine.filter((f: any) => f.status === "approved").reduce((s: number, f: any) => s + Number(f.amount), 0);
        const due = mine.filter((f: any) => f.status === "pending").reduce((s: number, f: any) => s + Number(f.amount), 0);
        return {
          user_id: p.user_id,
          name: p.name,
          member_id: p.member_id,
          age: p.age || 0,
          height: p.height || (p.height_feet ? `${p.height_feet}'${p.height_inches ?? 0}"` : "—"),
          weight: p.weight ? `${p.weight}kg` : "—",
          feesPaid: paid,
          feesRemaining: due,
          lastVisit: today.some((a: any) => a.user_id === p.user_id) ? "Today" : "—",
          status: "active" as const,
          gender: (p.gender || "male") as "male" | "female",
          photoUrl: p.photo_url,
        };
      })
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("members-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const filtered = members.filter((m) => {
    if (filter === "male" && m.gender !== "male") return false;
    if (filter === "female" && m.gender !== "female") return false;
    if (filter === "unpaid" && m.feesRemaining === 0) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.name?.toLowerCase().includes(q) && !m.member_id?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <h1 className="text-2xl font-heading tracking-wider">MEMBERS</h1>
          <button
            onClick={load}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground"
            title="Refresh"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or Member ID..." className="pl-9 bg-secondary border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "male", "female", "unpaid"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider font-body transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground font-body">{filtered.length} of {members.length} members</p>

        <div className="space-y-3">
          {filtered.map((member) => (
            <MemberCard key={member.user_id} {...member} memberId={member.member_id ?? undefined} />
          ))}
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground font-body">
              <p>No members found</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
