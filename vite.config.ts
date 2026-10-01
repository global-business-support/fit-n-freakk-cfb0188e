// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      mcpPlugin(),
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        manifest: false,
        filename: "sw.js",
        devOptions: { enabled: false },
        workbox: {
          globPatterns: ["**/*.{js,css,woff2,png,svg,ico,jpg,webp}"],
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
              handler: "NetworkFirst",
              options: { cacheName: "pages", networkTimeoutSeconds: 4, expiration: { maxEntries: 60 } },
            },
            {
              urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/assets/"),
              handler: "CacheFirst",
              options: { cacheName: "assets", expiration: { maxEntries: 300 } },
            },
            {
              urlPattern: ({ url, request }) =>
                request.method === "GET" && url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/rest/"),
              handler: "NetworkFirst",
              options: { cacheName: "data", networkTimeoutSeconds: 5, expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 14 } },
            },
            {
              urlPattern: ({ url }) =>
                url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/storage/"),
              handler: "CacheFirst",
              options: { cacheName: "media", expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } },
            },
            {
              urlPattern: ({ url }) => /fonts\.(googleapis|gstatic)\.com|i\.ytimg\.com|media\.giphy\.com/.test(url.hostname),
              handler: "CacheFirst",
              options: { cacheName: "external", expiration: { maxEntries: 300 }, cacheableResponse: { statuses: [0, 200] } },
            },
          ],
        },
      }),
    ],
  },
});
