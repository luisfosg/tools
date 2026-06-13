import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://luisfosg.github.io",
  base: "/noteffy",
  integrations: [react(), tailwind()],
});
