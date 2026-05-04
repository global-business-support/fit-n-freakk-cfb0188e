import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Video, TrendingUp, Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PostType = "photo" | "reel" | "progress";

export function MemberPostUpload({ userId, onPosted }: { userId: string; onPosted?: () => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PostType>("photo");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState({ weight: "", waist: "", chest: "", arms: "" });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setOpen(false);
    setCaption("");
    setFile(null);
    setPreview(null);
    setProgress({ weight: "", waist: "", chest: "", arms: "" });
  };

  const onPick = (f: File | null) => {
    if (!f) return;
    if (type === "reel") {
      // ~60s/100MB cap heuristic
      if (f.size > 100 * 1024 * 1024) {
        toast.error("Video too large (max 100MB / ~60s)");
        return;
      }
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (type !== "progress" && !file) {
      toast.error("Please select a file");
      return;
    }
    if (type === "progress" && !progress.weight) {
      toast.error("Weight is required");
      return;
    }
    setBusy(true);
    try {
      let media_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("posts")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        media_url = supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("member_posts").insert({
        user_id: userId,
        type,
        media_url,
        caption: caption || null,
        progress_data: type === "progress" ? progress : null,
      });
      if (error) throw error;
      toast.success("Posted! Awaiting admin approval ⏳");
      reset();
      onPosted?.();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 to-card/60 backdrop-blur-md p-4 flex items-center gap-3 hover:scale-[1.01] transition-transform shadow-glow"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
          <Upload className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-heading text-lg tracking-wider">SHARE YOUR PROGRESS</p>
          <p className="text-xs text-muted-foreground font-body">Photo, reel or weekly report — admin approves before public feed</p>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/40 bg-card/80 backdrop-blur-xl p-4 space-y-3 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-heading text-lg tracking-wider text-primary">NEW POST</p>
        <button onClick={reset} className="h-8 w-8 rounded-lg bg-secondary/60 flex items-center justify-center">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {([
          { k: "photo", L: "Photo", I: Camera },
          { k: "reel", L: "Reel", I: Video },
          { k: "progress", L: "Report", I: TrendingUp },
        ] as const).map(({ k, L, I }) => (
          <button
            key={k}
            onClick={() => { setType(k); setFile(null); setPreview(null); }}
            className={cn(
              "rounded-xl p-3 flex flex-col items-center gap-1 border transition-all",
              type === k ? "border-primary bg-primary/15 text-primary" : "border-border bg-secondary/40 text-muted-foreground"
            )}
          >
            <I className="h-5 w-5" />
            <span className="text-[10px] uppercase tracking-wider font-body font-bold">{L}</span>
          </button>
        ))}
      </div>

      {type !== "progress" && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept={type === "reel" ? "video/*" : "image/*"}
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] || null)}
          />
          {preview ? (
            type === "reel" ? (
              <video src={preview} controls className="w-full rounded-xl max-h-64 bg-black" />
            ) : (
              <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-cover" />
            )
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary"
            >
              <Upload className="h-6 w-6" />
              <span className="text-xs font-body">Tap to choose {type === "reel" ? "video (max 60s)" : "photo"}</span>
            </button>
          )}
          {preview && (
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="w-full mt-2">
              Change file
            </Button>
          )}
        </div>
      )}

      {type === "progress" && (
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Weight (kg) *" type="number" value={progress.weight} onChange={(e) => setProgress({ ...progress, weight: e.target.value })} className="bg-secondary/60" />
          <Input placeholder="Waist (in)" type="number" value={progress.waist} onChange={(e) => setProgress({ ...progress, waist: e.target.value })} className="bg-secondary/60" />
          <Input placeholder="Chest (in)" type="number" value={progress.chest} onChange={(e) => setProgress({ ...progress, chest: e.target.value })} className="bg-secondary/60" />
          <Input placeholder="Arms (in)" type="number" value={progress.arms} onChange={(e) => setProgress({ ...progress, arms: e.target.value })} className="bg-secondary/60" />
        </div>
      )}

      <textarea
        placeholder="Caption / notes..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={500}
        className="w-full rounded-lg bg-secondary/60 border border-border p-3 text-sm font-body min-h-[60px] resize-none"
      />

      <Button onClick={submit} disabled={busy} className="w-full bg-gradient-primary text-primary-foreground font-heading tracking-widest h-11">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "POST FOR APPROVAL"}
      </Button>
    </div>
  );
}
