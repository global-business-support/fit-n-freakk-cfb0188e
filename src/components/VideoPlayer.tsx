import { useState } from "react";
import { Play, X } from "lucide-react";

/**
 * Convert any YouTube URL (watch, youtu.be, shorts, embed) to an embed URL.
 * Returns null if it's not a YouTube URL.
 */
function toYouTubeEmbed(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    let id: string | null = null;

    if (host === "youtu.be") {
      id = u.pathname.slice(1);
    } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
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

/** Convert Google Drive share URL to preview/embed URL. */
function toDriveEmbed(url: string): string | null {
  if (!url || !url.includes("drive.google.com")) return null;
  const m = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  if (!m) return null;
  return `https://drive.google.com/file/d/${m[1]}/preview`;
}

interface VideoPlayerProps {
  url: string;
  title?: string;
  trigger?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function VideoPlayer({ url, title, trigger, size = "md" }: VideoPlayerProps) {
  const [open, setOpen] = useState(false);
  const youtube = toYouTubeEmbed(url);
  const drive = toDriveEmbed(url);
  const embed = youtube ?? drive;
  const isDirect = !embed && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

  if (!url) return null;

  const sizeClass =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <>
      {trigger ? (
        <button onClick={() => setOpen(true)} type="button">{trigger}</button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex ${sizeClass} items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow shrink-0 hover:scale-105 transition-transform`}
          aria-label="Play video"
        >
          <Play className={iconSize} fill="currentColor" />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-heading text-lg tracking-wider truncate">
                {title || "VIDEO"}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-primary/30 bg-black shadow-glow">
              {embed ? (
                <iframe
                  src={embed}
                  title={title || "Video"}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : isDirect ? (
                <video
                  src={url}
                  controls
                  autoPlay
                  playsInline
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/70 text-sm font-body p-6 text-center">
                  Unsupported video URL. Use a YouTube, Google Drive, or direct
                  video link.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
