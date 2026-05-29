import { useEffect, useState } from "react";
import { Cake, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Birthday {
  user_id: string;
  name: string;
  photo_url: string | null;
  dob: string;
}

export function BirthdayBanner({ currentUserId }: { currentUserId: string }) {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("user_id, name, photo_url, dob")
      .not("dob", "is", null)
      .then(({ data }) => {
        const today = new Date();
        const m = today.getMonth();
        const d = today.getDate();
        const todays = (data || []).filter((p: any) => {
          if (!p.dob) return false;
          const dob = new Date(p.dob);
          return dob.getMonth() === m && dob.getDate() === d;
        });
        setBirthdays(todays as Birthday[]);

        // Show a wishing notification once if it's the current user's birthday
        if (todays.some((p: any) => p.user_id === currentUserId)) {
          const key = `bday-wish-${today.toDateString()}`;
          if (!localStorage.getItem(key)) {
            toast.success("🎉 Happy Birthday from Feet & Freakk!", {
              description: "Wishing you a year full of gains, health & happiness 🎂",
              duration: 8000,
            });
            localStorage.setItem(key, "1");
          }
        }
      });
  }, [currentUserId]);

  if (birthdays.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/25 via-card/70 to-sky/20 backdrop-blur-md p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Cake className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-heading text-lg tracking-wider text-foreground flex items-center gap-2">
            BIRTHDAY TODAY <PartyPopper className="h-4 w-4 text-primary" />
          </p>
          <p className="text-xs text-muted-foreground font-body">
            Wish your gym {birthdays.length > 1 ? "buddies" : "buddy"}!
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {birthdays.map((b) => (
          <div
            key={b.user_id}
            className="flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-primary/30 pl-1 pr-3 py-1"
          >
            {b.photo_url ? (
              <img src={b.photo_url} alt={b.name} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
                {b.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <span className="text-sm font-body font-semibold text-foreground">
              {b.user_id === currentUserId ? `${b.name} (You) 🎂` : b.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
