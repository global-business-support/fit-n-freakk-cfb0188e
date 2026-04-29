import { useLanguage } from "@/hooks/use-language";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      aria-label="Toggle language"
      className={cn(
        "flex items-center gap-1 rounded-full bg-secondary/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider font-body text-foreground ring-1 ring-border hover:ring-primary/50 transition",
        className
      )}
    >
      <Languages className="h-3 w-3" />
      <span>{lang === "en" ? "EN" : "हि"}</span>
    </button>
  );
}
