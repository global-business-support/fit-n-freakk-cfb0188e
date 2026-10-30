import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { InlineVideoPlayer } from "@/components/InlineVideoPlayer";

/** True for directly-playable files (mp4/webm/mov/m4v) — everything else needs an embed player. */
export function isDirectVideo(url?: string | null) {
  return !!url && /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
}

/**
 * Muted looping video that plays only while visible in the viewport
 * (keeps long pages smooth). Falls back to a node when the file can't play.
 */
export function ViewportAutoVideo({
  src,
  className,
  onError,
}: {
  src: string;
  className?: string;
  onError?: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      className={className}
      muted
      loop
      playsInline
      controls={false}
      preload="metadata"
      onError={onError}
    />
  );
}

interface ExerciseMediaProps {
  gifUrl?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  title?: string;
  /** "viewport" = silent autoplay when on screen (explore cards); "controls" = visible player controls. */
  mode?: "viewport" | "controls";
  imgClassName?: string;
  videoClassName?: string;
  /** Shown when nothing can be rendered at all. */
  placeholder?: React.ReactNode;
}

/**
 * Renders an exercise's animation (GIF / direct video) with graceful fallbacks:
 * GIF fails -> tries the exercise video; video fails -> embed player or placeholder.
 * GIFs render at natural height (w-full h-auto) so they are never cropped or letterboxed.
 */
export function ExerciseMedia({
  gifUrl,
  videoUrl,
  thumbnailUrl,
  title,
  mode = "controls",
  imgClassName = "w-full h-auto object-contain rounded-lg border border-border",
  videoClassName = "w-full aspect-video rounded-lg border border-border object-contain bg-black",
  placeholder,
}: ExerciseMediaProps) {
  const [gifFailed, setGifFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const gifUsable = !!gifUrl && !gifFailed;

  const renderFallback = () => {
    if (!videoUrl || videoFailed) return placeholder ?? null;
    if (isDirectVideo(videoUrl)) {
      return (
        <MediaVideo
          src={videoUrl}
          mode={mode}
          className={videoClassName}
          onError={() => setVideoFailed(true)}
        />
      );
    }
    return <InlineVideoPlayer url={videoUrl} title={title} thumbnailUrl={thumbnailUrl} />;
  };

  if (gifUsable && isDirectVideo(gifUrl)) {
    if (videoFailed) return renderFallback();
    return (
      <MediaVideo
        src={gifUrl!}
        mode={mode}
        className={videoClassName}
        onError={() => setVideoFailed(true)}
      />
    );
  }

  if (gifUsable) {
    return (
      <img
        src={gifUrl!}
        alt={`${title || "Exercise"} animation`}
        className={imgClassName}
        loading="lazy"
        onError={() => setGifFailed(true)}
      />
    );
  }

  if (videoUrl && !videoFailed) return renderFallback();
  return placeholder ?? null;
}

function MediaVideo({
  src,
  mode,
  className,
  onError,
}: {
  src: string;
  mode: "viewport" | "controls";
  className: string;
  onError: () => void;
}) {
  if (mode === "viewport") {
    return (
      <ViewportAutoVideo
        src={src}
        className={className}
        onError={onError}
      />
    );
  }
  return (
    <video
      src={src}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      controls
      preload="metadata"
      onError={onError}
    />
  );
}

/** Simple no-media placeholder used across pages. */
export function MediaPlaceholder({ className }: { className?: string }) {
  return (
    <div className={className ?? "aspect-video rounded-lg bg-secondary flex items-center justify-center text-muted-foreground/40"}>
      <Play className="h-6 w-6" />
    </div>
  );
}
