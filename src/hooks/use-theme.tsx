import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * Applies a body class based on the user's gender so the female theme
 * (Cherry Blossom Pink) overrides the default Charcoal & Ember tokens.
 *
 * Female users -> `theme-female` -> pink palette via src/styles.css
 * Anyone else -> default dark blue/ember theme
 */
export function useGenderTheme() {
  const { profile } = useAuth();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const isFemale = profile?.gender?.toLowerCase() === "female";
    document.documentElement.classList.toggle("theme-female", isFemale);
    return () => {
      document.documentElement.classList.remove("theme-female");
    };
  }, [profile?.gender]);
}
