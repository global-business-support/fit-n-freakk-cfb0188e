import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { InlineVideoPlayer } from "@/components/InlineVideoPlayer";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Cog, Dumbbell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getExercisesForMachine, getMachineCategory, MACHINE_CATEGORIES, type MachineCategory, type ExerciseLite } from "@/lib/machine-exercises";

export const Route = createFileRoute("/machines")({
  head: () => ({
    meta: [
      { title: "Machines — Feet & Freakk" },
      { name: "description", content: "Gym machines guide" },
    ],
  }),
  component: MachinesPage,
});

function MachinesPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [exercises, setExercises] = useState<ExerciseLite[]>([]);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.from("machines").select("*").order("name").then(({ data }) => {
      setMachines(data || []);
    });
    supabase.from("exercises").select("id,name,body_part,thumbnail_url,video_url").then(({ data }) => {
      setExercises((data as ExerciseLite[]) || []);
    });
  }, []);

  const exercisesByMachine = useMemo(() => {
    const map: Record<string, ExerciseLite[]> = {};
    for (const m of machines) {
      map[m.id] = getExercisesForMachine(m.name, exercises);
    }
    return map;
  }, [machines, exercises]);

  const playable = machines.filter((m: any) => !!m.video_url);
  const pool = showAll ? machines : playable;
  const filtered = pool.filter((m: any) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      <LiveBackground />
      <header className="sticky top-0 z-40 border-b border-sky/20 bg-card/70 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-heading tracking-wider bg-gradient-primary bg-clip-text text-transparent">MACHINES</h1>
          <p className="text-xs text-muted-foreground font-body">Learn how to use gym equipment</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky/70" />
          <Input
            placeholder="Search machines..."
            className="pl-9 bg-secondary/60 border-border h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[10px] uppercase tracking-wider font-body text-sky-200/80">
            {filtered.length} {showAll ? "total" : "with video"}
          </span>
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="rounded-full border border-sky/40 bg-card/60 px-3 py-1 text-[10px] uppercase tracking-wider font-body text-sky-100 hover:border-sky/70 transition"
          >
            {showAll ? "Videos only" : "Show all"}
          </button>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground font-body">
            <Cog className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No machines found</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((machine: any) => (
            <div key={machine.id} className="rounded-2xl border border-sky/20 bg-gradient-card overflow-hidden shadow-card">
              {machine.video_url ? (
                <InlineVideoPlayer
                  url={machine.video_url}
                  title={machine.name}
                  thumbnailUrl={machine.image_url}
                  className="rounded-none border-0"
                />
              ) : machine.image_url ? (
                <img src={machine.image_url} alt={machine.name} className="w-full h-44 object-cover" loading="lazy" />
              ) : null}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shrink-0">
                      <Cog className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg tracking-wider truncate">{machine.name.toUpperCase()}</h3>
                  </div>
                </div>
                {machine.description && (
                  <p className="text-sm text-muted-foreground font-body">{machine.description}</p>
                )}
                {machine.how_to_use && (
                  <div className="rounded-lg bg-secondary/50 p-3 ring-1 ring-sky/10">
                    <p className="text-[10px] uppercase tracking-wider text-sky font-body mb-1 font-bold">How to use</p>
                    <p className="text-sm font-body whitespace-pre-line">{machine.how_to_use}</p>
                  </div>
                )}

                {exercisesByMachine[machine.id]?.length > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpanded((s) => ({ ...s, [machine.id]: !s[machine.id] }))}
                      className="flex w-full items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-left hover:bg-primary/20 transition"
                    >
                      <span className="flex items-center gap-2 text-xs font-heading tracking-wider text-primary uppercase">
                        <Dumbbell className="h-4 w-4" />
                        {exercisesByMachine[machine.id].length} exercises on this machine
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-primary transition-transform ${expanded[machine.id] ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expanded[machine.id] && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {exercisesByMachine[machine.id].map((ex) => (
                          <Link
                            key={ex.id}
                            to="/exercise/$id"
                            params={{ id: ex.id }}
                            className="flex items-center gap-2 rounded-lg border border-sky/15 bg-secondary/40 p-2 hover:border-primary/40 hover:bg-secondary/70 transition group"
                          >
                            {ex.thumbnail_url ? (
                              <img
                                src={ex.thumbnail_url}
                                alt={ex.name}
                                className="h-10 w-10 rounded-md object-cover shrink-0"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gradient-primary/30 flex items-center justify-center shrink-0">
                                <Dumbbell className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-body font-semibold truncate group-hover:text-primary transition">
                                {ex.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                                {ex.body_part}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
