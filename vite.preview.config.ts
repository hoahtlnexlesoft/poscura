// Static device-preview build (Fit4Stream-style viewer + the app as one self-contained file).
// `npm run build:preview` → dist-preview/index.html (viewer) + dist-preview/app.html (app)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [tsconfigPaths(), react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: "dist-preview",
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    rollupOptions: { input: "preview/app.html" },
  },
});
