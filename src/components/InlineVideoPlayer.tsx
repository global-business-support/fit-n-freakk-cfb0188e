import { useState } from "react";
import { Play, Pause } from "lucide-react";

function toYouTubeEmbed(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
      else if (u.pathname.startsWith("/v/")) id = u.pathname.split("/")[2];
    }
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  } catch {
    return null;
  }
}

function toDriveEmbed(url: string): string | null {
  if (!url || !url.includes("drive.google.com")) return null;
  const m = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  if (!m) return null;
  return `https://drive.google.com/file/d/${m[1]}/preview`;
}

function getThumbnail(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
    }
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  } catch {}
  return null;
}

interface InlineVideoPlayerProps {
  url: string;
  title?: string;
  thumbnailUrl?: string | null;
  className?: string;
}

/**
 * Inline video that plays right in place when clicked — no popups, no new tabs.
 * Shows thumbnail with play button, replaces with embedded iframe on click.
 */
export function InlineVideoPlayer({ url, title, thumbnailUrl, className = "" }: InlineVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  if (!url) return null;

  const youtube = toYouTubeEmbed(url);
  const drive = toDriveEmbed(url);
  const embed = youtube ?? drive;
  const isDirect = !embed && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  const thumb = thumbnailUrl || getThumbnail(url);

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className={`group relative aspect-video w-full overflow-hidden rounded-xl border border-sky/30 bg-black ${className}`}
        aria-label={`Play ${title || "video"}`}
      >
        {thumb ? (
          <img
            src={thumb}
            alt={title || "Video"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-sky/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-glow ring-4 ring-white/20 group-hover:scale-110 transition-transform">
            <Play className="h-7 w-7 text-white fill-white ml-1" />
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-heading text-base tracking-wider truncate drop-shadow-lg">
              {title.toUpperCase()}
            </p>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-xl border border-primary/40 bg-black shadow-glow ${className}`}>
      {embed ? (
        <iframe
          src={embed}
          title={title || "Video"}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : isDirect ? (
        <video src={url} controls autoPlay playsInline className="absolute inset-0 h-full w-full" />
      ) : (
        <div className="flex h-full items-center justify-center text-white/70 text-sm font-body p-6 text-center">
          Unsupported video URL.
        </div>
      )}
      <button
        type="button"
        onClick={() => setPlaying(false)}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
        aria-label="Stop video"
      >
        <Pause className="h-4 w-4" />
      </button>
    </div>
  );
}
