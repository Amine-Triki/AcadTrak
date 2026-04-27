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

import { Button, Result, ConfigProvider, App as AntApp } from "antd";

import type { Route } from "./+types/root";
import "./app.css";
import "./i18n";
import { appDirection } from "./i18n";

import { AuthProvider } from "./context/auth";
import CrispChat from "./components/crisp-chat";
import PWAPrompt from "./components/pwa-prompt";

// 🎨 Theme الخاص بـ AcadTrak
const acadTrakTheme = {
  token: {
    colorPrimary: "#4f46e5", // بنفسجي - لون المنصة
    colorSuccess: "#10b981",
    borderRadius: 8,
    fontFamily: "Inter, sans-serif",
  },
  components: {
    Button: { borderRadius: 8 },
    Card: { borderRadius: 12 },
  },
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // ✅ PWA
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
  { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192x192.png" },
  { rel: "icon", type: "image/png", sizes: "512x512", href: "/icons/icon-512x512.png" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    if (import.meta.env.DEV && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });
    }
  }, []);

  // Keep SSR and first client render aligned to avoid html lang hydration mismatch.
  const lang = isHydrated
    ? (i18n.resolvedLanguage ?? i18n.language ?? "en")
    : "en";

  const direction = useMemo(() => appDirection(lang), [lang]);

  return (
    <html lang={lang} dir={direction} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
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
              <CrispChat />
              <PWAPrompt />
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
