// vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
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
