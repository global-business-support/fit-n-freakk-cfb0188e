import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

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
}: MemberCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-heading text-muted-foreground">
              {name.charAt(0)}
            </div>
          )}
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card",
              status === "active" ? "bg-success" : "bg-muted-foreground"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg tracking-wide truncate">{name}</h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider font-body",
                status === "active"
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {status}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-body">
            <span>{age}y</span>
            <span>•</span>
            <span>{height}</span>
            <span>•</span>
            <span>{weight}</span>
            <span>•</span>
            <span className="capitalize">{gender}</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Paid</p>
                <p className="text-sm font-semibold text-success font-body">₹{feesPaid}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Due</p>
                <p className={cn("text-sm font-semibold font-body", feesRemaining > 0 ? "text-destructive" : "text-success")}>
                  ₹{feesRemaining}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
              <Calendar className="h-3 w-3" />
              <span>{lastVisit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
