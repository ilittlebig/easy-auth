// vite.config.ts
import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ outputDir: "dist" })],
  build: {
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "EasyAuth",
      formats: ["es", "cjs"],
      fileName: format => `easy-auth.${format}.js`
    },
    rollupOptions: {
      external: ["@aws-sdk/client-cognito-identity-provider", "aws-cognito-srp-client", "sjcl-aws"]
    }
  },
});
