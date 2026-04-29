import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

const STORAGE_KEY = "ff_lang";

type Dict = Record<string, { en: string; hi: string }>;

// UI translation dictionary
const dict: Dict = {
  // nav
  home: { en: "Home", hi: "होम" },
  workouts: { en: "Workouts", hi: "वर्कआउट" },
  machines: { en: "Machines", hi: "मशीनें" },
  progress: { en: "Progress", hi: "प्रगति" },
  profile: { en: "Profile", hi: "प्रोफाइल" },
  members: { en: "Members", hi: "सदस्य" },
  attendance: { en: "Attend", hi: "हाज़िरी" },
  admin: { en: "Admin", hi: "एडमिन" },
  stats: { en: "Stats", hi: "आँकड़े" },
  explore: { en: "Explore", hi: "खोजें" },
  ai_coach: { en: "AI Coach", hi: "एआई कोच" },
  signin: { en: "Sign In", hi: "लॉगिन" },
  signout: { en: "Sign Out", hi: "लॉगआउट" },

  // common
  loading: { en: "Loading…", hi: "लोड हो रहा है…" },
  save: { en: "Save", hi: "सेव करें" },
  cancel: { en: "Cancel", hi: "रद्द" },
  delete: { en: "Delete", hi: "हटाएं" },
  add: { en: "Add", hi: "जोड़ें" },
  edit: { en: "Edit", hi: "बदलें" },
  yes: { en: "Yes", hi: "हाँ" },
  no: { en: "No", hi: "नहीं" },
  back: { en: "Back", hi: "वापस" },
  language: { en: "Language", hi: "भाषा" },

  // exercise
  body_part: { en: "Body part", hi: "शरीर का हिस्सा" },
  sets: { en: "Sets", hi: "सेट्स" },
  reps: { en: "Reps", hi: "रेप्स" },
  how_to_perform: { en: "How to perform", hi: "कैसे करें" },
  preview_30s: { en: "30s preview", hi: "30 सेकंड प्रीव्यू" },
  with_video: { en: "with video", hi: "वीडियो के साथ" },
  show_all: { en: "Show all", hi: "सभी दिखाएं" },
  videos_only: { en: "Videos only", hi: "केवल वीडियो" },
  exercise_library: { en: "Exercise Library", hi: "एक्सरसाइज लाइब्रेरी" },
  featured_moves: { en: "Featured Moves", hi: "खास मूव्स" },

  // dashboard
  welcome: { en: "Welcome", hi: "स्वागत है" },
  total_members: { en: "Total Members", hi: "कुल सदस्य" },
  today_visitors: { en: "Today Visitors", hi: "आज के विज़िटर" },
  fees_pending: { en: "Fees Pending", hi: "बकाया फीस" },
  revenue: { en: "Revenue", hi: "आमदनी" },

  // admin
  fees: { en: "Fees", hi: "फीस" },
  exercises: { en: "Exercises", hi: "एक्सरसाइज" },
  schedule: { en: "Schedule", hi: "शेड्यूल" },
  roles: { en: "Roles", hi: "रोल्स" },
  brand: { en: "Brand", hi: "ब्रांड" },
  products: { en: "Products", hi: "प्रोडक्ट्स" },
  diet_plans: { en: "Diet Plans", hi: "डाइट प्लान" },
  salary: { en: "Salary", hi: "सैलरी" },
  export_data: { en: "Export Data", hi: "डेटा डाउनलोड" },
  download_excel: { en: "Download Excel", hi: "एक्सेल डाउनलोड" },
  add_product: { en: "Add Product", hi: "प्रोडक्ट जोड़ें" },
  activate: { en: "Activate", hi: "चालू करें" },
  cancel_plan: { en: "Cancel", hi: "रद्द करें" },
  promote_to_admin: { en: "Promote to Admin", hi: "एडमिन बनाएं" },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict | string) => string;
  /** Pick `_hi` field from a row when current lang is hi, falling back to base. */
  pick: <T extends Record<string, any>>(row: T | null | undefined, base: keyof T) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "en" || stored === "hi") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string) => {
    const entry = (dict as any)[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
  };

  const pick = <T extends Record<string, any>>(row: T | null | undefined, base: keyof T) => {
    if (!row) return "";
    const baseStr = (base as string);
    if (lang === "hi") {
      const hi = row[`${baseStr}_hi` as keyof T];
      if (hi && String(hi).trim()) return String(hi);
    }
    return String(row[base] ?? "");
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, pick }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
