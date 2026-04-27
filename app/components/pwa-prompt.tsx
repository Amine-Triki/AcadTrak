// app/components/pwa-prompt.tsx
// يعرض نافذة "تثبيت التطبيق" + نافذة "تحديث متاح"

import { useEffect, useState } from "react";
import { Button, notification, Space, Typography } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRegisterSW } from "virtual:pwa-register/react";

const { Text } = Typography;

export default function PWAPrompt() {
  if (import.meta.env.DEV) {
    return null;
  }

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // التحقق من التحديثات كل ساعة
      if (r) {
        setInterval(() => void r.update(), 60 * 60 * 1000);
      }
    },
  });

  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [api, contextHolder] = notification.useNotification();

  // ━━━━ استقبال حدث التثبيت من المتصفح ━━━━
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ━━━━ نافذة "تحديث متاح" ━━━━
  useEffect(() => {
    if (!needRefresh) return;
    api.info({
      key: "pwa-update",
      message: "تحديث متاح 🔄",
      description: "إصدار جديد من AcadTrak متاح. حدّث الآن للحصول على أحدث الميزات.",
      duration: 0,
      placement: "bottomRight",
      btn: (
        <Space>
          <Button
            size="small"
            onClick={() => {
              api.destroy("pwa-update");
              setNeedRefresh(false);
            }}
          >
            لاحقاً
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => void updateServiceWorker(true)}
          >
            تحديث الآن
          </Button>
        </Space>
      ),
    });
  }, [needRefresh]);

  // ━━━━ نافذة "تثبيت التطبيق" (بعد 5 ثواني) ━━━━
  useEffect(() => {
    if (!installPrompt) return;

    const timer = setTimeout(() => {
      api.info({
        key: "pwa-install",
        message: "ثبّت AcadTrak 📱",
        description: (
          <Space orientation="vertical" size={4}>
            <Text>أضف AcadTrak إلى شاشتك الرئيسية للوصول السريع حتى بدون إنترنت.</Text>
          </Space>
        ),
        duration: 12,
        placement: "bottomRight",
        btn: (
          <Space>
            <Button
              size="small"
              onClick={() => {
                api.destroy("pwa-install");
                setInstallPrompt(null);
              }}
            >
              لا شكراً
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={async () => {
                api.destroy("pwa-install");
                const prompt = installPrompt as BeforeInstallPromptEvent;
                await prompt.prompt();
                const result = await prompt.userChoice;
                if (result.outcome === "accepted") {
                  setInstallPrompt(null);
                }
              }}
            >
              تثبيت
            </Button>
          </Space>
        ),
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [installPrompt]);

  return <>{contextHolder}</>;
}

// TypeScript type للـ beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
