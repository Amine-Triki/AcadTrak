import type { Route } from "./+types/_public.about";

import { Typography, Card } from "antd";
import {
  TeamOutlined,
  RocketOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("publicAbout.meta.title") },
    {
      name: "description",
      content: i18n.t("publicAbout.meta.description"),
    },
  ];
}

const { Title, Text, Paragraph } = Typography;

export default function AboutPage() {
  const { t } = useTranslation();

  const stats = t("publicAbout.stats.items", { returnObjects: true }) as Array<{
    value: string;
    label: string;
  }>;
  const values = t("publicAbout.values.items", { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  return (
    <div style={{ background: "#f8f9fc" }}>
      {/* ━━━━━━ Hero ━━━━━━ */}
      <section
        style={{
          background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
          padding: "80px 48px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#c4c0ff",
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 16px",
            borderRadius: 100,
            marginBottom: 20,
          }}
        >
          {t("publicAbout.hero.badge")}
        </span>
        <Title
          level={1}
          style={{
            color: "#fff",
            fontSize: "clamp(28px, 4vw, 48px)",
            marginBottom: 16,
          }}
        >
          {t("publicAbout.hero.title")}
        </Title>
        <Paragraph
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 16,
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.8,
          }}
        >
          {t("publicAbout.hero.description")}
        </Paragraph>
      </section>

      {/* ━━━━━━ Stats ━━━━━━ */}
      <section
        style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            textAlign: "center",
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#4f46e5",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
                {s.label}
              </Text>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━ Mission ━━━━━━ */}
      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* نص */}
          <div>
            <Text
              style={{
                color: "#4f46e5",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {t("publicAbout.mission.label")}
            </Text>
            <Title level={2} style={{ marginTop: 12, marginBottom: 20 }}>
              {t("publicAbout.mission.title")}
            </Title>
            <Paragraph
              type="secondary"
              style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}
            >
              {t("publicAbout.mission.paragraph1")}
            </Paragraph>
            <Paragraph
              type="secondary"
              style={{ fontSize: 15, lineHeight: 1.8 }}
            >
              {t("publicAbout.mission.paragraph2")}
            </Paragraph>
          </div>

          {/* صورة */}
          <div
            style={{
              background: "linear-gradient(135deg, #eef2ff, #f0f9ff)",
              borderRadius: 20,
              overflow: "hidden",
              height: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=70"
              alt="team"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* ━━━━━━ Values ━━━━━━ */}
      <section style={{ background: "#fff", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              {t("publicAbout.values.title")}
            </Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              {t("publicAbout.values.subtitle")}
            </Text>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {values.map((v, index) => {
              const icons = [
                <TrophyOutlined key="excellence" />,
                <GlobalOutlined key="accessibility" />,
                <TeamOutlined key="community" />,
                <RocketOutlined key="innovation" />,
                <SafetyCertificateOutlined key="trust" />,
              ];

              return (
              <Card
                key={v.title}
                style={{ borderRadius: 14, border: "1px solid #e5e7eb" }}
                styles={{ body: { padding: 28 } }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4f46e5",
                    fontSize: 20,
                    marginBottom: 16,
                  }}
                >
                  {icons[index]}
                </div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {v.title}
                </Title>
                <Text type="secondary" style={{ lineHeight: 1.7 }}>
                  {v.description}
                </Text>
              </Card>
              );
            })}
          </div>
        </div>
      </section>



      {/* ━━━━━━ CTA ━━━━━━ */}
      <section style={{ padding: "0 48px 80px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            background: "linear-gradient(135deg, #4338ca, #6d28d9)",
            borderRadius: 24,
            padding: "64px 48px",
            textAlign: "center",
          }}
        >
          <Title level={2} style={{ color: "#fff", marginBottom: 16 }}>
            {t("publicAbout.cta.title")}
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 16,
              marginBottom: 32,
            }}
          >
            {t("publicAbout.cta.description")}
          </Paragraph>
          <a href="/register">
            <button
              style={{
                background: "#fff",
                color: "#4338ca",
                fontWeight: 700,
                border: "none",
                borderRadius: 8,
                height: 48,
                padding: "0 32px",
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {t("publicAbout.cta.button")}
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
