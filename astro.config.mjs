import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://luisfosg.github.io",
  base: "/tools",
  integrations: [react(), sitemap()],
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["react-dom/client", "bcryptjs", "jose", "sileo"],
    },
  },
});
