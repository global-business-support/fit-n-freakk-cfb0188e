import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Feet & Freakk" },
      { name: "description", content: "Track gym attendance" },
    ],
  }),
  component: AttendancePage,
});

const members = [
  { id: 1, name: "Rahul Sharma", gender: "male" as const },
  { id: 2, name: "Priya Patel", gender: "female" as const },
  { id: 3, name: "Amit Kumar", gender: "male" as const },
  { id: 4, name: "Sneha Reddy", gender: "female" as const },
  { id: 5, name: "Vikram Singh", gender: "male" as const },
  { id: 6, name: "Anita Desai", gender: "female" as const },
];

function AttendancePage() {
  const [attendance, setAttendance] = useState<Record<number, "present" | "absent">>({});
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const markAll = (status: "present" | "absent") => {
    const all: Record<number, "present" | "absent"> = {};
    members.forEach((m) => (all[m.id] = status));
    setAttendance(all);
  };

  const toggle = (id: number) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const presentCount = Object.values(attendance).filter((v) => v === "present").length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-heading tracking-wider">ATTENDANCE</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-body">{today}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* Quick Actions */}
        <div className="flex items-center justify-between rounded-xl bg-card border border-border p-3">
          <div>
            <p className="text-sm font-body font-semibold">{presentCount}/{members.length} Present</p>
            <p className="text-xs text-muted-foreground font-body">Tap to toggle attendance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => markAll("present")}>
              All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => markAll("absent")}>
              All Absent
            </Button>
          </div>
        </div>

        {/* Member List */}
        <div className="space-y-2">
          {members.map((member) => {
            const status = attendance[member.id];
            return (
              <button
                key={member.id}
                onClick={() => toggle(member.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-3.5 transition-all",
                  status === "present"
                    ? "border-success/30 bg-success/5"
                    : status === "absent"
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-sm font-heading">
                    {member.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold font-body">{member.name}</p>
                    <p className="text-xs text-muted-foreground capitalize font-body">{member.gender}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                    status === "present"
                      ? "bg-success text-success-foreground"
                      : status === "absent"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {status === "present" ? <Check className="h-5 w-5" /> : status === "absent" ? <X className="h-5 w-5" /> : <Check className="h-5 w-5 opacity-30" />}
                </div>
              </button>
            );
          })}
        </div>

        <Button variant="ember" size="lg" className="w-full">
          Save Attendance
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
