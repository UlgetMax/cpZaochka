import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm"; 
import path from "path"; 
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    react(), 
    wasm(), 
    svgr({
      include: "**/*.svg",
      svgrOptions: {
        icon: true,
        svgo: true,
        svgoConfig: {
          plugins: [
            { 
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false,
                  removeDimensions: true
                }
              }
            }
          ]
        }
      }
    })
  ],
  publicDir: "public",
  base: "./",
  server: {
    port: 6969,
  },
});
