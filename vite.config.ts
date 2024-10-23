// vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "AuthBuddy",
      formats: ["es", "cjs", "umd"],
      fileName: format => `auth-buddy-ts.${format}.js`
    },
    rollupOptions: {
      external: [],
    },
  },
});
