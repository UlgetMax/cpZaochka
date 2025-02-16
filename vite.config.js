import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm"; 
import path from "path"; 

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [react(), wasm()],
  publicDir: "public",
  base: "./",
  server: {
    port: 6969,
  },
});
