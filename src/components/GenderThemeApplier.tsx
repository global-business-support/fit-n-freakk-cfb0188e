import { useGenderTheme } from "@/hooks/use-theme";

/** Mounted once near the app root to apply gender-based theme class. */
export function GenderThemeApplier() {
  useGenderTheme();
  return null;
}
