import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — GymForge" },
      { name: "description", content: "Gym analytics and insights" },
    ],
  }),
  component: AnalyticsPage,
});

const attendanceData = [
  { day: "Mon", count: 42 },
  { day: "Tue", count: 38 },
  { day: "Wed", count: 45 },
  { day: "Thu", count: 40 },
  { day: "Fri", count: 48 },
  { day: "Sat", count: 52 },
  { day: "Sun", count: 30 },
];

const memberGrowth = [
  { month: "Jan", members: 120 },
  { month: "Feb", members: 128 },
  { month: "Mar", members: 135 },
  { month: "Apr", members: 142 },
  { month: "May", members: 150 },
  { month: "Jun", members: 156 },
];

const feesData = [
  { month: "Jan", collected: 85000, pending: 15000 },
  { month: "Feb", collected: 92000, pending: 12000 },
  { month: "Mar", collected: 88000, pending: 18000 },
  { month: "Apr", collected: 95000, pending: 10000 },
  { month: "May", collected: 102000, pending: 8000 },
  { month: "Jun", collected: 98000, pending: 14000 },
];

const attendanceConfig: ChartConfig = {
  count: { label: "Visitors", color: "var(--color-chart-1)" },
};

const growthConfig: ChartConfig = {
  members: { label: "Members", color: "var(--color-chart-2)" },
};

const feesConfig: ChartConfig = {
  collected: { label: "Collected", color: "var(--color-chart-2)" },
  pending: { label: "Pending", color: "var(--color-chart-1)" },
};

function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-heading tracking-wider">ANALYTICS</h1>
          <p className="text-xs text-muted-foreground font-body">Performance overview</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* Attendance Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading text-lg tracking-wider mb-3">WEEKLY ATTENDANCE</h3>
          <ChartContainer config={attendanceConfig} className="h-[200px] w-full">
            <BarChart data={attendanceData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Member Growth */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading text-lg tracking-wider mb-3">MEMBER GROWTH</h3>
          <ChartContainer config={growthConfig} className="h-[200px] w-full">
            <LineChart data={memberGrowth}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="members" stroke="var(--color-members)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Fees Collection */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading text-lg tracking-wider mb-3">FEES COLLECTION</h3>
          <ChartContainer config={feesConfig} className="h-[200px] w-full">
            <BarChart data={feesData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
