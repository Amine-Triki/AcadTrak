import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "react-router";

import { Button, Result, ConfigProvider, App as AntApp, theme } from "antd";

import type { Route } from "./+types/root";
import "./app.css";

import { AuthProvider } from "./context/auth";
import CrispChat from "./components/crisp-chat";

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
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <ConfigProvider theme={acadTrakTheme} direction="ltr">
          <AntApp>
            <AuthProvider>
              <CrispChat />
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
        title="An unexpected error occurred"
        subTitle={
          import.meta.env.DEV && error instanceof Error
            ? error.message
            : "Please try again"
        }
        extra={
          <Button type="primary">
            <Link to="/">Back to Home</Link>
          </Button>
        }
      />
    </div>
  );
}
