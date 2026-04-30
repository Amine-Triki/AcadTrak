import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { lazy, Suspense } from "react";

import { Button, Result, ConfigProvider, App as AntApp, Spin } from "antd";

import type { Route } from "./+types/root";
import "./app.css";
import "./i18n";
import { appDirection } from "./i18n";

import { AuthProvider } from "./context/auth";

// ✅ Lazy load heavy components
const CrispChat = lazy(() => import("./components/crisp-chat"));
const PWAPrompt = lazy(() => import("./components/pwa-prompt"));

// 🎨 Theme الخاص بـ AcadTrak
const acadTrakTheme = {
  token: {
    colorPrimary: "#4f46e5", // بنفسجي - لون المنصة
    colorSuccess: "#10b981",
    borderRadius: 8,
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Button: { borderRadius: 8 },
    Card: { borderRadius: 12 },
  },
};

export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    as: "image",
    href: "/1.webp",
    type: "image/webp",
  },
  // ✅ PWA
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
  { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192x192.png" },
  { rel: "icon", type: "image/png", sizes: "512x512", href: "/icons/icon-512x512.png" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  // ✅ Read from localStorage immediately (synchronous) to avoid hydration mismatch
  const [lang] = useState(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem("acadtrak_lang");
    return stored && ["ar", "en"].includes(stored) ? stored : "en";
  });

  const direction = useMemo(() => appDirection(lang), [lang]);

  useEffect(() => {
    if (import.meta.env.DEV && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });
    }
  }, []);

  return (
    <html lang={lang} dir={direction} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="6Uv5yhzQFcfkKSPsifCwqEgyqPTqD_ebAozgsZ7ELig" />
        <Meta />
        <Links />
        {/* ✅ Prevent flash of white screen */}
        <style>
          {`
            html, body { margin: 0; padding: 0; }
            body { background-color: #f8f9fc; }
          `}
        </style>
        {/* ✅ PWA meta tags */}
        <meta name="theme-color" content="#4f46e5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AcadTrak" />
        <meta name="application-name" content="AcadTrak" />
      </head>
      <body suppressHydrationWarning>
        <ConfigProvider theme={acadTrakTheme} direction={direction}>
          <AntApp>
            <AuthProvider>
              <Suspense fallback={null}>
                <CrispChat />
                <PWAPrompt />
              </Suspense>
              {children}
            </AuthProvider>
          </AntApp>
        </ConfigProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, #f8f9fc 0%, #eef2ff 100%)",
      }}
    >
      <Spin size="large" />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <Result
        status="500"
        title={t("error.title")}
        subTitle={
          import.meta.env.DEV && error instanceof Error
            ? error.message
            : t("error.retry")
        }
        extra={
          <Button type="primary">
            <Link to="/">{t("error.backHome")}</Link>
          </Button>
        }
      />
    </div>
  );
}
