import { createFileRoute } from "@tanstack/react-router";
import { Users, UserCheck, IndianRupee, TrendingUp, Search, Bell } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MemberCard } from "@/components/MemberCard";
import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GymForge" },
      { name: "description", content: "Gym management dashboard" },
    ],
  }),
  component: DashboardPage,
});

const mockMembers = [
  { name: "Rahul Sharma", age: 25, height: "5'10\"", weight: "75kg", feesPaid: 3000, feesRemaining: 0, lastVisit: "Today", status: "active" as const, gender: "male" as const },
  { name: "Priya Patel", age: 22, height: "5'5\"", weight: "58kg", feesPaid: 2000, feesRemaining: 1000, lastVisit: "Yesterday", status: "active" as const, gender: "female" as const },
  { name: "Amit Kumar", age: 30, height: "5'8\"", weight: "82kg", feesPaid: 1500, feesRemaining: 1500, lastVisit: "3 days ago", status: "active" as const, gender: "male" as const },
  { name: "Sneha Reddy", age: 28, height: "5'4\"", weight: "55kg", feesPaid: 3000, feesRemaining: 0, lastVisit: "Today", status: "active" as const, gender: "female" as const },
  { name: "Vikram Singh", age: 35, height: "6'0\"", weight: "90kg", feesPaid: 0, feesRemaining: 3000, lastVisit: "2 weeks ago", status: "inactive" as const, gender: "male" as const },
];

function DashboardPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading tracking-widest text-primary">GYMFORGE</h1>
              <p className="text-xs text-muted-foreground font-body">Welcome back, Admin</p>
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9 bg-secondary border-border"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Total Members" value={156} icon={Users} trend="+12 this month" variant="ember" />
          <StatCard title="Today Visitors" value={43} icon={UserCheck} variant="success" />
          <StatCard title="Fees Pending" value="₹45K" icon={IndianRupee} variant="warning" />
          <StatCard title="Revenue" value="₹1.2L" icon={TrendingUp} trend="+8% vs last month" />
        </div>

        {/* Members Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-heading tracking-wider">MEMBERS</h2>
            <span className="text-xs text-muted-foreground font-body">{mockMembers.length} total</span>
          </div>
          <div className="space-y-3">
            {mockMembers.map((member) => (
              <MemberCard key={member.name} {...member} />
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
