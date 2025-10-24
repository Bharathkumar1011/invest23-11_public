// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite"; // <-- add this
// import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export default defineConfig(async () => {
//   const plugins = [react(), tailwindcss()]; // <-- include here

//   // (Optional) Replit overlay/cartographer
//   // If you truly need it, re-add, otherwise keep things simple:
//   // import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
//   // plugins.push(runtimeErrorOverlay());

//   return {
//     plugins,
//     resolve: {
//       alias: {
//         "@": path.resolve(__dirname, "src"),
//         "@shared": path.resolve(__dirname, "../shared"),
//         "@assets": path.resolve(__dirname, "../attached_assets"),
//       },
//     },
//     build: {
//       outDir: path.resolve(__dirname, "dist"),
//       emptyOutDir: true,
//     },
//     server: {
//       port: 5173,
//       proxy: {
//         '/api': {
//           target: 'http://localhost:5000',
//           changeOrigin: true,
//           secure: false,
//         },
//       },
//       fs: {
//         strict: true,
//         deny: ["**/.*"],
//       },
//     },
//     define: {
//       'import.meta.env.VITE_API_URL': JSON.stringify(
//         process.env.VITE_API_URL ?? 'http://localhost:5000'
//       ),
//     },
//   };
// });

// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL ?? 'http://localhost:3000',
    ),
  },
})
