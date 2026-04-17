import { cn } from "@/lib/utils";
import { Calendar, IndianRupee, TrendingUp, Pencil, BadgeCheck } from "lucide-react";

interface MemberCardProps {
  name: string;
  age: number;
  height: string;
  weight: string;
  feesPaid: number;
  feesRemaining: number;
  lastVisit: string;
  status: "active" | "inactive";
  photoUrl?: string;
  gender: "male" | "female";
  memberId?: string | null;
  onEdit?: () => void;
}

export function MemberCard({
  name,
  age,
  height,
  weight,
  feesPaid,
  feesRemaining,
  lastVisit,
  status,
  photoUrl,
  gender,
  memberId,
  onEdit,
}: MemberCardProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="group relative rounded-2xl shine-border p-[2px] transition-all duration-300 hover:-translate-y-0.5 shadow-card hover:shadow-glow">
      <div className="shine-border-inner rounded-2xl" />
      <div className="relative z-[2] rounded-2xl bg-gradient-card p-4 overflow-hidden">
        {/* Soft halo glows around the card */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-sky/20 blur-2xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-primary/15 blur-2xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="relative flex items-start gap-3">
        {/* Avatar */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-sky/30 bg-gradient-primary">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-heading text-primary-foreground">
              {initial}
            </div>
          )}
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card",
              status === "active"
                ? "bg-success animate-pulse-glow"
                : "bg-muted-foreground"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading text-xl tracking-wider truncate text-foreground">
              {name.toUpperCase()}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest font-body",
                  status === "active"
                    ? "bg-success/15 text-success ring-1 ring-success/30"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {status}
              </span>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky/15 text-sky hover:bg-sky/25 ring-1 ring-sky/30 transition-colors"
                  aria-label="Edit member"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          {memberId && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-sky/90 font-body uppercase tracking-[0.2em]">
              <BadgeCheck className="h-3 w-3" /> {memberId}
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground font-body">
            <span className="font-semibold text-sky">{age}y</span>
            <span className="text-border">•</span>
            <span>{height}</span>
            <span className="text-border">•</span>
            <span>{weight}</span>
            <span className="text-border">•</span>
            <span className="capitalize">{gender}</span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-success/10 px-2 py-1.5 ring-1 ring-success/20">
              <p className="flex items-center gap-1 text-[9px] text-success/80 uppercase tracking-wider font-body font-bold">
                <IndianRupee className="h-2.5 w-2.5" /> Paid
              </p>
              <p className="text-sm font-bold text-success font-body">
                ₹{feesPaid}
              </p>
            </div>
            <div
              className={cn(
                "rounded-lg px-2 py-1.5 ring-1",
                feesRemaining > 0
                  ? "bg-destructive/10 ring-destructive/20"
                  : "bg-success/10 ring-success/20"
              )}
            >
              <p
                className={cn(
                  "flex items-center gap-1 text-[9px] uppercase tracking-wider font-body font-bold",
                  feesRemaining > 0 ? "text-destructive/80" : "text-success/80"
                )}
              >
                <TrendingUp className="h-2.5 w-2.5" /> Due
              </p>
              <p
                className={cn(
                  "text-sm font-bold font-body",
                  feesRemaining > 0 ? "text-destructive" : "text-success"
                )}
              >
                ₹{feesRemaining}
              </p>
            </div>
            <div className="rounded-lg bg-sky/10 px-2 py-1.5 ring-1 ring-sky/20">
              <p className="flex items-center gap-1 text-[9px] text-sky/90 uppercase tracking-wider font-body font-bold">
                <Calendar className="h-2.5 w-2.5" /> Visit
              </p>
              <p className="text-sm font-bold text-sky font-body truncate">
                {lastVisit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
