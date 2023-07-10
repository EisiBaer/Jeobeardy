import { fileURLToPath, URL } from "node:url";
import path from "path";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

const __dirname = path.resolve(path.dirname(""));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/webapp", import.meta.url)),
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
    },
  },
});
