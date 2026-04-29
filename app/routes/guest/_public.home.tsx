import type { Route } from "./+types/_public.home";

import { Link } from "react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Await } from "react-router";
import {
  Alert,
  Button, Rate, Tag, Avatar, Input,
  Typography, Card, Row, Col, Statistic,
} from "antd";
import {
  ArrowRightOutlined, SearchOutlined,
  UserOutlined, SafetyCertificateOutlined,
  ClockCircleOutlined, TrophyOutlined,
  StarFilled, RocketOutlined,
} from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text, Paragraph } = Typography;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AcadTrak | Home" },
    {
      name: "description",
      content:
        "Welcome to AcadTrak , your ultimate learning companion! , LMS paltform , create your own learning path , with Amine Triki",
    },
  ];
}

type CourseType = "free" | "paid";

interface ApiCourse {
  id: string;
  title: string;
  category?: string;
  categoryDetails?: {
    id: string;
    name: string;
    slug?: string;
  };
  price: number;
  effectivePrice?: number;
  thumbnail?: string;
  averageRating?: number;
  type: CourseType;
}

interface FeaturedCourse {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  rating: number;
  price: number;
  img: string;
}

interface HomeLoaderData {
  coursesData?: Promise<{
    featuredCourses: FeaturedCourse[];
    coursesError?: string;
  }>;
}

const CATEGORY_COLORS = [
  "blue",
  "geekblue",
  "green",
  "gold",
  "purple",
  "cyan",
  "orange",
  "lime",
  "volcano",
] as const;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=60";

const getCategoryColor = (category: string) => {
  const hash = category
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
};

const mapFeaturedCourse = (course: ApiCourse): FeaturedCourse => {
  const category = course.categoryDetails?.name?.trim() || course.category || "General";

  return {
    id: course.id,
    title: course.title,
    category: category.toUpperCase(),
    categoryColor: getCategoryColor(category),
    rating: Number((course.averageRating ?? 0).toFixed(1)),
    price: course.type === "free" ? 0 : (course.effectivePrice ?? course.price),
    img: course.thumbnail || FALLBACK_IMAGE,
  };
};

export async function clientLoader(): Promise<HomeLoaderData> {
  // ✅ Return immediately with Promise - render page ASAP
  const coursesData = (async () => {
    try {
      const response = await apiFetch("/api/courses");
      const payload = (await response.json().catch(() => null)) as
        | { courses?: ApiCourse[]; message?: string }
        | null;

      if (!response.ok) {
        return {
          featuredCourses: [],
          coursesError: payload?.message || "Failed to load featured courses.",
        };
      }

      return {
        featuredCourses: (payload?.courses ?? [])
          .slice(0, 4)
          .map(mapFeaturedCourse),
      };
    } catch {
      return {
        featuredCourses: [],
        coursesError: "Unable to connect to the server.",
      };
    }
  })();

  return {
    coursesData,
  };
}

const FEATURES = [
  { icon: <UserOutlined />, key: "expertInstructors" },
  { icon: <ClockCircleOutlined />, key: "lifetimeAccess" },
  { icon: <SafetyCertificateOutlined />, key: "flexibleLearning" },
  { icon: <TrophyOutlined />, key: "highSuccess" },
] as const;

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <div style={{ background: "#f8f9fc" }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━
          HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        style={{
          position: "relative",
          minHeight: 540,
          backgroundImage: "url('/1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,24,0.65)" }} />

        {/* المحتوى — عرض محدود + محاذاة يسار */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 48px",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 14px",
              borderRadius: 100,
              background: "rgba(99,91,255,0.25)",
              border: "1px solid rgba(99,91,255,0.45)",
              color: "#c4c0ff",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            <RocketOutlined /> {t("publicHome.hero.badge")}
          </div>

          {/* عنوان رئيسي */}
          <Title
            style={{
              color: "#fff",
              fontSize: "clamp(32px, 4.5vw, 56px)",
              lineHeight: 1.1,
              marginBottom: 16,
              maxWidth: 620,
            }}
          >
            {t("publicHome.hero.titlePrefix")} {" "}
            <span style={{ color: "#818cf8" }}>{t("publicHome.hero.titleHighlight")}</span>
          </Title>

          {/* وصف */}
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 16,
              maxWidth: 500,
              marginBottom: 36,
              lineHeight: 1.7,
            }}
          >
            {t("publicHome.hero.description")}
          </Paragraph>



          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/32?img=${i}`}
                  alt=""
                  style={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    border: "2px solid white",
                    marginLeft: i > 1 ? -10 : 0,
                  }}
                />
              ))}
            </div>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
              <strong style={{ color: "#fff" }}>15k+</strong> {t("publicHome.hero.socialProof")}
            </Text>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━
          Features Bar
      ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "28px 48px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.key} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  flexShrink: 0,
                  width: 42, height: 42,
                  borderRadius: 10,
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4f46e5",
                  fontSize: 18,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                  {t(`publicHome.features.${f.key}.title`)}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  {t(`publicHome.features.${f.key}.description`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━
          Featured Courses (Deferred)
      ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Suspense
        fallback={
          <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  style={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
                  styles={{ body: { padding: 14 } }}
                >
                  <div style={{ height: 200, background: "#f0f0f0", borderRadius: 8 }} />
                </Card>
              ))}
            </div>
          </section>
        }
      >
        <Await resolve={loaderData?.coursesData}>
          {(coursesData: any) => (
            <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px" }}>

              {/* عنوان القسم */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                  <Title level={2} style={{ margin: 0 }}>{t("publicHome.featured.title")}</Title>
                  <Text type="secondary">{t("publicHome.featured.subtitle")}</Text>
                </div>
                <Link to="/courses">
                  <Button type="link" style={{ color: "#4f46e5", padding: 0 }}>
                    {t("publicHome.featured.viewAll")} <ArrowRightOutlined />
                  </Button>
                </Link>
              </div>

              {coursesData?.coursesError ? (
                <Alert
                  type="warning"
                  showIcon
                  title={coursesData.coursesError}
                  style={{ marginBottom: 16 }}
                />
              ) : null}

              {/* 4 كورسات */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                }}
              >
                {coursesData?.featuredCourses?.map((c: FeaturedCourse) => (
                  <Card
                    key={c.id}
                    hoverable
                    style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}
                    styles={{ body: { padding: 14 } }}
                    cover={
                      <div style={{ position: "relative" }}>
                        <img
                          src={c.img}
                          alt={c.title}
                          style={{ width: "100%", height: 130, objectFit: "cover" }}
                        />
                        <Tag
                          color={c.categoryColor}
                          style={{ position: "absolute", top: 8, left: 8, fontSize: 10 }}
                        >
                          {c.category}
                        </Tag>
                      </div>
                    }
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 8, lineHeight: 1.4, minHeight: 36 }}>
                      {c.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                      <StarFilled style={{ color: "#f59e0b", fontSize: 12 }} />
                      <Text style={{ fontSize: 12, color: "#374151" }}>{c.rating}</Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, color: "#4f46e5" }}>${c.price}</span>
                      <Link to="/courses">
                        <Button
                          type="primary"
                          size="small"
                          shape="circle"
                          icon={<ArrowRightOutlined />}
                          style={{ background: "#4f46e5", border: "none" }}
                        />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              {coursesData?.featuredCourses?.length === 0 ? (
                <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
                  {t("publicHome.featured.empty")}
                </Text>
              ) : null}
            </section>
          )}
        </Await>
      </Suspense>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━
          Stats
      ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: "#fff", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "64px 48px",
          }}
        >
          <Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>
            {t("publicHome.stats.title")}
          </Title>
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 48 }}>
            {t("publicHome.stats.subtitle")}
          </Text>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 32,
              textAlign: "center",
            }}
          >
            {[
              { value: "15,000+", label: t("publicHome.stats.items.activeStudents") },
              { value: "200+", label: t("publicHome.stats.items.expertCourses") },
              { value: "98.2%", label: t("publicHome.stats.items.successRate") },
              { value: "50+", label: t("publicHome.stats.items.expertInstructors") },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 40, fontWeight: 700, color: "#4f46e5", lineHeight: 1 }}>
                  {s.value}
                </div>
                <Text type="secondary" style={{ marginTop: 8, display: "block" }}>{s.label}</Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━
          CTA
      ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ padding: "64px 48px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
            borderRadius: 24,
            padding: "64px 48px",
            textAlign: "center",
          }}
        >
          <Title level={2} style={{ color: "#fff", marginBottom: 16 }}>
            {t("publicHome.cta.title")}
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 16,
              marginBottom: 32,
              maxWidth: 480,
              margin: "0 auto 32px",
            }}
          >
            {t("publicHome.cta.description")}
          </Paragraph>
          <Button
            size="large"
            style={{
              background: "#fff",
              color: "#4338ca",
              fontWeight: 700,
              border: "none",
              borderRadius: 8,
              height: 48,
              padding: "0 32px",
              fontSize: 15,
            }}
          >
            <Link to="/register">{t("publicHome.cta.button")}</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}


