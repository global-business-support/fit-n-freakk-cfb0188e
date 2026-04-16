import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Cog, Play, Search } from "lucide-react";
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [machines, setMachines] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    supabase.from("machines").select("*").order("name").then(({ data }) => {
      setMachines(data || []);
    });
  }, []);

  const filtered = machines.filter((m: any) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-heading tracking-wider">MACHINES</h1>
          <p className="text-xs text-muted-foreground font-body">Learn how to use gym equipment</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search machines..."
            className="pl-9 bg-secondary border-border h-11"
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
            <div key={machine.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {machine.image_url && (
                <img src={machine.image_url} alt={machine.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Cog className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg tracking-wider">{machine.name.toUpperCase()}</h3>
                  </div>
                  {machine.video_url && (
                    <a href={machine.video_url} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-ember/10 text-ember shrink-0">
                      <Play className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {machine.description && (
                  <p className="text-sm text-muted-foreground font-body">{machine.description}</p>
                )}
                {machine.how_to_use && (
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body mb-1">How to use</p>
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
