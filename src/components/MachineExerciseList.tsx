import { useState } from "react";
import { Play, ExternalLink, Dumbbell } from "lucide-react";
import { InlineVideoPlayer } from "./InlineVideoPlayer";

/** True if URL is a real YouTube video/short (not a search results page) or a direct video file. */
export function isEmbeddableVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host === "youtu.be") return !!u.pathname.slice(1);
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.pathname === "/watch") return !!u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return !!u.pathname.split("/")[2];
      if (u.pathname.startsWith("/shorts/")) return !!u.pathname.split("/")[2];
      if (u.pathname.startsWith("/v/")) return !!u.pathname.split("/")[2];
      return false; // /results?search_query=... is NOT embeddable
    }
    if (host.includes("drive.google.com")) return /\/file\/d\/|[?&]id=/.test(url);
    if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url)) return true;
    return false;
  } catch {
    return false;
  }
}

interface MachineExercise {
  id: string;
  name: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
}

interface Props {
  exercises: MachineExercise[];
  emptyText?: string;
}

/**
 * Clean list of exercise names. Click a name → plays inline right below it.
 * Non-embeddable URLs (YouTube search pages, etc.) open in a new tab.
 */
export function MachineExerciseList({ exercises, emptyText }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!exercises || exercises.length === 0) {
    return emptyText ? (
      <p className="text-xs text-muted-foreground font-body italic px-1">{emptyText}</p>
    ) : null;
  }

  const sorted = [...exercises].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="divide-y divide-primary/10 rounded-lg bg-background/40 ring-1 ring-primary/20 overflow-hidden">
      {sorted.map((ex) => {
        const embeddable = isEmbeddableVideoUrl(ex.video_url);
        const isOpen = openId === ex.id;

        if (!ex.video_url) {
          return (
            <div key={ex.id} className="flex items-center gap-2 px-3 py-2.5">
              <Dumbbell className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm font-body flex-1 truncate">{ex.name}</span>
            </div>
          );
        }

        if (!embeddable) {
          return (
            <a
              key={ex.id}
              href={ex.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 hover:bg-primary/10 transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-body flex-1 truncate">{ex.name}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-body shrink-0">
                YouTube
              </span>
            </a>
          );
        }

        return (
          <div key={ex.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : ex.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition ${
                isOpen ? "bg-primary/15" : "hover:bg-primary/10"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <Play className="h-3.5 w-3.5 fill-current" />
              </div>
              <span className="text-sm font-body flex-1 truncate">{ex.name}</span>
            </button>
            {isOpen && ex.video_url && (
              <div className="p-2 bg-background/60">
                <InlineVideoPlayer
                  url={ex.video_url}
                  title={ex.name}
                  thumbnailUrl={ex.thumbnail_url}
                  className="rounded-md border-0"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
