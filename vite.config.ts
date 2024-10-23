// vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "EasyAuth",
      formats: ["es", "cjs", "umd"],
      fileName: format => `easy-auth.${format}.js`
    },
    rollupOptions: {
      external: [],
    },
  },
});
