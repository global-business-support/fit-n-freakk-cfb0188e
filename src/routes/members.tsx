import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { MemberCard } from "@/components/MemberCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members — GymForge" },
      { name: "description", content: "Manage gym members" },
    ],
  }),
  component: MembersPage,
});

const allMembers = [
  { name: "Rahul Sharma", age: 25, height: "5'10\"", weight: "75kg", feesPaid: 3000, feesRemaining: 0, lastVisit: "Today", status: "active" as const, gender: "male" as const },
  { name: "Priya Patel", age: 22, height: "5'5\"", weight: "58kg", feesPaid: 2000, feesRemaining: 1000, lastVisit: "Yesterday", status: "active" as const, gender: "female" as const },
  { name: "Amit Kumar", age: 30, height: "5'8\"", weight: "82kg", feesPaid: 1500, feesRemaining: 1500, lastVisit: "3 days ago", status: "active" as const, gender: "male" as const },
  { name: "Sneha Reddy", age: 28, height: "5'4\"", weight: "55kg", feesPaid: 3000, feesRemaining: 0, lastVisit: "Today", status: "active" as const, gender: "female" as const },
  { name: "Vikram Singh", age: 35, height: "6'0\"", weight: "90kg", feesPaid: 0, feesRemaining: 3000, lastVisit: "2 weeks ago", status: "inactive" as const, gender: "male" as const },
  { name: "Anita Desai", age: 26, height: "5'6\"", weight: "60kg", feesPaid: 3000, feesRemaining: 0, lastVisit: "Today", status: "active" as const, gender: "female" as const },
];

function MembersPage() {
  const [filter, setFilter] = useState<"all" | "male" | "female" | "unpaid">("all");
  const [search, setSearch] = useState("");

  const filtered = allMembers.filter((m) => {
    if (filter === "male" && m.gender !== "male") return false;
    if (filter === "female" && m.gender !== "female") return false;
    if (filter === "unpaid" && m.feesRemaining === 0) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <h1 className="text-2xl font-heading tracking-wider">MEMBERS</h1>
          <Button variant="ember" size="sm">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search members..." className="pl-9 bg-secondary border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
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

        <div className="space-y-3">
          {filtered.map((member) => (
            <MemberCard key={member.name} {...member} />
          ))}
          {filtered.length === 0 && (
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
