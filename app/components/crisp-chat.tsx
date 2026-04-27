import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useAuth } from "~/context/auth";

const CRISP_WEBSITE_ID = import.meta.env.VITE_CRISP_WEBSITE_ID as string | undefined;

interface CrispClient {
  configure: (websiteId: string, options?: { autoload?: boolean }) => void;
  chat: {
    show: () => void;
    hide: () => void;
  };
}

export default function CrispChat() {
  const location = useLocation();
  const { user } = useAuth();
  const configuredRef = useRef(false);
  const crispRef = useRef<CrispClient | null>(null);

  useEffect(() => {
    if (!CRISP_WEBSITE_ID) {
      if (import.meta.env.DEV) {
        console.warn("Crisp is disabled: VITE_CRISP_WEBSITE_ID is not set.");
      }
      return;
    }

    if (configuredRef.current) {
      return;
    }

    let mounted = true;

    const setupCrisp = async () => {
      const module = (await import("crisp-sdk-web")) as {
        Crisp?: CrispClient;
        default?: CrispClient;
      };

      const crisp = module.Crisp ?? module.default;
      if (!mounted || !crisp) {
        return;
      }

      crisp.configure(CRISP_WEBSITE_ID);
      crispRef.current = crisp;
      configuredRef.current = true;
    };

    void setupCrisp();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!CRISP_WEBSITE_ID || !configuredRef.current || !crispRef.current) {
      return;
    }

    const isAdminRoute = location.pathname.startsWith("/dashboard/admin");
    const isAdminUser = user?.role === "admin";

    if (isAdminRoute || isAdminUser) {
      crispRef.current.chat.hide();
      return;
    }

    crispRef.current.chat.show();
  }, [location.pathname, user?.role]);

  return null;
}
