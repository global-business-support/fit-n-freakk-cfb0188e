import { useEffect, useState } from "react";
import { Play, X, Columns2 } from "lucide-react";

/** All previews across the app are capped at 30 seconds. */
const PREVIEW_SECONDS = 30;

/**
 * Convert any YouTube URL to an embed URL — plays in-app, no new tab.
 * Hard-cuts playback at PREVIEW_SECONDS using the YouTube &end= param.
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
    // controls=0 hides progress bar so users cannot skip past 30s; disablekb=1 blocks keyboard seek; fs=0 hides fullscreen.
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&start=0&end=${PREVIEW_SECONDS}`;
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

function getEmbedSrc(url: string): { embed: string | null; isDirect: boolean } {
  const youtube = toYouTubeEmbed(url);
  const drive = toDriveEmbed(url);
  const embed = youtube ?? drive;
  const isDirect = !embed && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  return { embed, isDirect };
}

function VideoFrame({ url, title, onEnded }: { url: string; title?: string; onEnded?: () => void }) {
  const { embed, isDirect } = getEmbedSrc(url);
  // Hard-cut timer for iframe embeds (YouTube/Drive) — YouTube's &end= isn't always respected for ad-less clips.
  useEffect(() => {
    if (!embed) return;
    const t = setTimeout(() => { onEnded?.(); }, PREVIEW_SECONDS * 1000 + 500);
    return () => clearTimeout(t);
  }, [embed, onEnded]);

  if (embed) {
    return (
      <iframe
        src={embed}
        title={title || "Video"}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }
  if (isDirect) {
    return (
      <video
        src={url}
        autoPlay
        playsInline
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 h-full w-full"
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime >= PREVIEW_SECONDS) {
            e.currentTarget.pause();
            onEnded?.();
          }
        }}
      />
    );
  }
  return (
    <div className="flex h-full items-center justify-center text-white/70 text-sm font-body p-6 text-center">
      Unsupported video URL.
    </div>
  );
}

interface VideoPlayerProps {
  url: string;
  title?: string;
  trigger?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Optional second video for split-screen comparison */
  compareOptions?: Array<{ url: string; title?: string }>;
}

export function VideoPlayer({ url, title, trigger, size = "md", compareOptions }: VideoPlayerProps) {
  const [open, setOpen] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [secondVideo, setSecondVideo] = useState<{ url: string; title?: string } | null>(null);

  if (!url) return null;

  const sizeClass =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  const close = () => {
    setOpen(false);
    setShowCompare(false);
    setSecondVideo(null);
  };

  const availableCompares = (compareOptions || []).filter((c) => c.url && c.url !== url);

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
          onClick={close}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 gap-2">
              <p className="text-white font-heading text-lg tracking-wider truncate flex-1">
                {secondVideo ? `${title || "VIDEO"}  ⇄  ${secondVideo.title || "COMPARE"}` : (title || "VIDEO")}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {availableCompares.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCompare((s) => !s)}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-sky/20 px-3 text-xs font-body uppercase tracking-wider text-sky hover:bg-sky/30"
                  >
                    <Columns2 className="h-4 w-4" />
                    {secondVideo ? "Single" : "Compare"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Compare picker */}
            {showCompare && availableCompares.length > 0 && (
              <div className="mb-3 rounded-xl bg-white/5 border border-sky/20 p-2 flex gap-2 overflow-x-auto">
                {availableCompares.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSecondVideo(opt); setShowCompare(false); }}
                    className="shrink-0 rounded-lg bg-sky/10 hover:bg-sky/20 px-3 py-2 text-xs font-body text-white border border-sky/20"
                  >
                    {opt.title || `Video ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Video grid: 1 or 2 panes */}
            <div className={`grid gap-3 ${secondVideo ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-primary/30 bg-black shadow-glow">
                <VideoFrame url={url} title={title} />
                {secondVideo && (
                  <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-body uppercase tracking-wider text-white">
                    {title || "Video 1"}
                  </div>
                )}
              </div>
              {secondVideo && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-sky/40 bg-black shadow-glow">
                  <VideoFrame url={secondVideo.url} title={secondVideo.title} />
                  <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-body uppercase tracking-wider text-sky">
                    {secondVideo.title || "Video 2"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecondVideo(null)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
