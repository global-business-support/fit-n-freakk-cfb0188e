import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { LiveBackground } from "@/components/LiveBackground";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Cog, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("machines").select("*").order("name").then(({ data }) => {
      setMachines(data || []);
    });
  }, []);

  const filtered = machines.filter((m: any) =>
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

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground font-body">
            <Cog className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No machines found</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((machine: any) => (
            <div key={machine.id} className="rounded-2xl border border-sky/20 bg-gradient-card overflow-hidden shadow-card">
              {machine.image_url && (
                <img src={machine.image_url} alt={machine.name} className="w-full h-44 object-cover" />
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shrink-0">
                      <Cog className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg tracking-wider truncate">{machine.name.toUpperCase()}</h3>
                  </div>
                  {machine.video_url && (
                    <VideoPlayer url={machine.video_url} title={machine.name} size="md" />
                  )}
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
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
