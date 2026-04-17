import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AttendanceToggleProps {
  userId: string;
}

/**
 * Daily Present/Absent toggle for member home.
 * - One mark per day. Shows current state with reason for absent.
 * - Saves status + optional reason to attendance table.
 */
export function AttendanceToggle({ userId }: AttendanceToggleProps) {
  const [today, setToday] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!userId) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .gte("checked_in_at", start.toISOString())
      .maybeSingle()
      .then(({ data }) => {
        setToday(data);
        setLoading(false);
      });
  }, [userId]);

  const mark = async (status: "present" | "absent", reasonText?: string) => {
    setSubmitting(true);
    const { data, error } = await supabase
      .from("attendance")
      .insert({ user_id: userId, status, reason: reasonText || null })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setToday(data);
    setShowReason(false);
    setReason("");
    toast.success(status === "present" ? "Marked Present 💪" : "Marked Absent");
  };

  if (loading) {
    return <div className="h-20 rounded-2xl bg-card/40 animate-pulse" />;
  }

  // Already marked today
  if (today) {
    const isPresent = today.status === "present";
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md ${
          isPresent
            ? "border-success/40 bg-success/10"
            : "border-warning/40 bg-warning/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isPresent ? "bg-success/30 text-success" : "bg-warning/30 text-warning"
            }`}
          >
            {isPresent ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <p className="font-heading text-lg tracking-wider text-foreground">
              {isPresent ? "MARKED PRESENT TODAY" : "MARKED ABSENT TODAY"}
            </p>
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">
              <Clock className="inline h-3 w-3 mr-1" />
              {new Date(today.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {today.reason && ` • ${today.reason}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky/30 bg-card/60 backdrop-blur-md p-4">
      <p className="font-heading text-lg tracking-wider text-foreground mb-3">
        TODAY'S ATTENDANCE
      </p>

      {!showReason ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={submitting}
            onClick={() => mark("present")}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-success to-success/70 text-success-foreground py-4 font-heading text-lg tracking-widest hover:scale-[1.02] active:scale-95 transition-transform shadow-lg disabled:opacity-50"
          >
            <CheckCircle2 className="inline h-5 w-5 mr-1 -mt-0.5" />
            PRESENT
            <span className="animate-shimmer-sweep" />
          </button>
          <button
            disabled={submitting}
            onClick={() => setShowReason(true)}
            className="rounded-xl bg-card border-2 border-warning/50 text-warning py-4 font-heading text-lg tracking-widest hover:bg-warning/10 active:scale-95 transition-all disabled:opacity-50"
          >
            <XCircle className="inline h-5 w-5 mr-1 -mt-0.5" />
            ABSENT
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl bg-secondary/60 text-foreground px-3 py-3 font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-warning"
          >
            <option value="">Select reason...</option>
            <option value="Sick">Sick / Unwell</option>
            <option value="Travel">Travelling</option>
            <option value="Busy">Busy with work</option>
            <option value="Injury">Injury / Recovery</option>
            <option value="Other">Other</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowReason(false)}
              className="rounded-xl bg-secondary/60 text-foreground py-2.5 font-body text-sm font-bold"
            >
              Cancel
            </button>
            <button
              disabled={!reason || submitting}
              onClick={() => mark("absent", reason)}
              className="rounded-xl bg-warning text-warning-foreground py-2.5 font-body text-sm font-bold disabled:opacity-50"
            >
              Confirm Absent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
