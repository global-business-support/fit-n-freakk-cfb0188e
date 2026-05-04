import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Camera, Video, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Post = {
  id: string;
  user_id: string;
  type: "photo" | "reel" | "progress";
  media_url: string | null;
  caption: string | null;
  progress_data: any;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export function CommunityFeed({ currentUserId }: { currentUserId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { name: string; photo_url: string | null }>>({});
  const [tab, setTab] = useState<"feed" | "mine">("feed");

  const load = async () => {
    const { data: postRows } = await supabase
      .from("member_posts")
      .select("*")
      .or(`status.eq.approved,user_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false })
      .limit(50);
    const list = (postRows ?? []) as Post[];
    setPosts(list);
    const userIds = Array.from(new Set(list.map((p) => p.user_id)));
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id,name,photo_url")
        .in("user_id", userIds);
      const map: Record<string, { name: string; photo_url: string | null }> = {};
      (profs ?? []).forEach((p: any) => {
        map[p.user_id] = { name: p.name, photo_url: p.photo_url };
      });
      setProfiles(map);
    }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("member_posts_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "member_posts" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const filtered = tab === "mine" ? posts.filter((p) => p.user_id === currentUserId) : posts.filter((p) => p.status === "approved");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl tracking-wider text-foreground">COMMUNITY</h2>
        <div className="flex gap-1 rounded-full bg-secondary/60 p-1">
          {(["feed", "mine"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-body font-bold",
                tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {k === "feed" ? "Feed" : "Mine"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-muted-foreground font-body">
          {tab === "mine" ? "You haven't posted yet." : "No community posts yet."}
        </div>
      )}

      {filtered.map((p) => {
        const prof = profiles[p.user_id];
        const TypeIcon = p.type === "reel" ? Video : p.type === "progress" ? TrendingUp : Camera;
        return (
          <article key={p.id} className="rounded-2xl border border-border bg-card/80 backdrop-blur-md overflow-hidden shadow-card">
            <div className="flex items-center gap-2 p-3">
              {prof?.photo_url ? (
                <img src={prof.photo_url} alt={prof.name} className="h-9 w-9 rounded-full object-cover ring-1 ring-primary/30" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {(prof?.name || "?")[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-bold truncate">{prof?.name || "Member"}</p>
                <p className="text-[10px] text-muted-foreground font-body">{new Date(p.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <TypeIcon className="h-4 w-4 text-primary" />
                {p.user_id === currentUserId && (
                  <span className={cn(
                    "ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider font-body font-bold",
                    p.status === "approved" && "bg-success/15 text-success",
                    p.status === "pending" && "bg-warning/15 text-warning",
                    p.status === "rejected" && "bg-destructive/15 text-destructive"
                  )}>
                    {p.status === "approved" ? <CheckCircle2 className="h-3 w-3" /> : p.status === "rejected" ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {p.status}
                  </span>
                )}
              </div>
            </div>

            {p.media_url && (
              p.type === "reel" ? (
                <video src={p.media_url} controls className="w-full max-h-[480px] bg-black" />
              ) : (
                <img src={p.media_url} alt={p.caption || "post"} className="w-full max-h-[480px] object-cover" />
              )
            )}

            {p.type === "progress" && p.progress_data && (
              <div className="grid grid-cols-4 gap-2 p-3 bg-secondary/30">
                {[
                  { l: "Weight", v: p.progress_data.weight, u: "kg" },
                  { l: "Waist", v: p.progress_data.waist, u: "in" },
                  { l: "Chest", v: p.progress_data.chest, u: "in" },
                  { l: "Arms", v: p.progress_data.arms, u: "in" },
                ].map((m) => (
                  <div key={m.l} className="text-center">
                    <p className="text-[9px] uppercase tracking-wider font-body text-muted-foreground">{m.l}</p>
                    <p className="font-heading text-sm text-primary">{m.v || "—"}{m.v ? <span className="text-[9px] text-muted-foreground"> {m.u}</span> : null}</p>
                  </div>
                ))}
              </div>
            )}

            {p.caption && (
              <div className="p-3 pt-2 text-sm font-body text-foreground/90 flex items-start gap-2">
                <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="flex-1">{p.caption}</p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
