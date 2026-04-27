import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const appDir = path.resolve(new URL(".", import.meta.url).pathname, "app");

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    VitePWA({
      // ✅ SPA / CSR — ssr: false
      strategies: "injectManifest",
      srcDir: "app",
      filename: "sw.ts",
      registerType: "prompt", // يسأل المستخدم قبل التحديث
      injectManifest: {
        injectionPoint: "self.__WB_MANIFEST",
      },
      manifest: {
        name: "AcadTrak",
        short_name: "AcadTrak",
        description: "منصة التعلم الإلكتروني — دوراتك في جيبك",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4f46e5",
        orientation: "portrait-primary",
        lang: "ar",
        dir: "rtl",
        categories: ["education", "productivity"],
        icons: [
          { src: "/icons/icon-72x72.png",      sizes: "72x72",   type: "image/png" },
          { src: "/icons/icon-96x96.png",      sizes: "96x96",   type: "image/png" },
          { src: "/icons/icon-128x128.png",    sizes: "128x128", type: "image/png" },
          { src: "/icons/icon-144x144.png",    sizes: "144x144", type: "image/png" },
          { src: "/icons/icon-152x152.png",    sizes: "152x152", type: "image/png" },
          { src: "/icons/icon-192x192.png",    sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-384x384.png",    sizes: "384x384", type: "image/png" },
          { src: "/icons/icon-512x512.png",    sizes: "512x512", type: "image/png" },
          {
            src: "/icons/maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "دوراتي",
            short_name: "دوراتي",
            url: "/dashboard/student/courses",
            icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
          },
          {
            name: "استعرض الدورات",
            short_name: "الدورات",
            url: "/courses",
            icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
          },
        ],
      },
      devOptions: {
        enabled: false, // تعطيل SW في dev لتجنب كاش stale مع Vite
        type: "module",
      },
    }),
  ],
  resolve: {
    alias: {
      "~": appDir,
    },
  },
});

