import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "shop.fitnfreakk.app",
  appName: "Fit & Freakk",
  webDir: "public",
  server: {
    url: "https://fitnfreakk.shop",
    cleartext: false,
  },
  android: { backgroundColor: "#0a0a0a" },
};

export default config;
