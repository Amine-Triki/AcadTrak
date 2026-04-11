import type { Route } from "./+types/_public.home";


import { Link } from "react-router";
import {
  Button, Rate, Tag, Avatar, Input,
  Typography, Card, Row, Col, Statistic,
} from "antd";
import {
  ArrowRightOutlined, SearchOutlined,
  UserOutlined, SafetyCertificateOutlined,
  ClockCircleOutlined, TrophyOutlined,
  StarFilled, RocketOutlined,
} from "@ant-design/icons";

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

// ── بيانات وهمية ──────────────────────────

const COURSES = [
  { id: 1, title: "Advanced Fullstack React Architect", category: "DEVELOPMENT", categoryColor: "blue",   rating: 4.8, price: 129.0, img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=60" },
  { id: 2, title: "Growth Marketing for Startups",      category: "MARKETING",   categoryColor: "green",  rating: 5.0, price: 54.5,  img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=60" },
  { id: 3, title: "Visual Storytelling Masterclass",    category: "CREATIVE",    categoryColor: "purple", rating: 4.5, price: 75.0,  img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=60" },
  { id: 4, title: "Financial Analysis Fundamentals",    category: "BUSINESS",    categoryColor: "orange", rating: 4.7, price: 99.0,  img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=60" },
];

const FEATURES = [
  { icon: <UserOutlined />,              title: "Expert Instructors",  desc: "Learn from industry veterans." },
  { icon: <ClockCircleOutlined />,       title: "Lifetime Access",     desc: "Enroll once, keep forever." },
  { icon: <SafetyCertificateOutlined />, title: "Flexible Learning",   desc: "Study at your own pace anywhere." },
  { icon: <TrophyOutlined />,            title: "98.2% Success",       desc: "High completion and success rate." },
];

export default function HomePage() {
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
          backgroundPosition: "center top",
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
            <RocketOutlined /> LMS EVOLUTION 2.0
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
            Learn from the{" "}
            <span style={{ color: "#818cf8" }}>World's Best</span>
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
            Master new skills with expert-led courses designed for deep focus
            and professional growth. Access world-class education from anywhere.
          </Paragraph>

          {/* Search + CTA */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <Input
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              placeholder="Search courses..."
              size="large"
              style={{ width: 300, borderRadius: 8 }}
            />
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              style={{
                background: "#4f46e5",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                height: 40,
              }}
            >
              Explore Courses
            </Button>
          </div>

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
              <strong style={{ color: "#fff" }}>15k+</strong> students already joined
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
            <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
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
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━
          Featured Courses
      ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px" }}>

        {/* عنوان القسم */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Featured Courses</Title>
            <Text type="secondary">The most sought-after industry skills, taught by professionals.</Text>
          </div>
          <Button type="link" style={{ color: "#4f46e5", padding: 0 }}>
            View All <ArrowRightOutlined />
          </Button>
        </div>

        {/* الكورس المميز الكبير */}
        <Card
          style={{ borderRadius: 16, border: "1px solid #e5e7eb", marginBottom: 24, overflow: "hidden" }}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {/* صورة */}
            <div
              style={{
                background: "linear-gradient(135deg, #e0e7ff, #f0f9ff)",
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=420&q=70"
                alt="featured"
                style={{ maxHeight: 220, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxWidth: "100%" }}
              />
            </div>

            {/* تفاصيل */}
            <div style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Tag color="blue" style={{ width: "fit-content", marginBottom: 16 }}>UI/UX DESIGN</Tag>
              <Title level={3} style={{ marginBottom: 12 }}>Digital Product Design Mastery</Title>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Rate disabled defaultValue={4.9} allowHalf style={{ fontSize: 14 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>(4.9) · 1,240 students</Text>
              </div>
              <Paragraph type="secondary" style={{ marginBottom: 24, lineHeight: 1.7 }}>
                Master Figma and learn the psychological principles behind world-class interfaces.
                This comprehensive course covers everything from wireframing to high-fidelity prototyping.
              </Paragraph>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar src="https://i.pravatar.cc/40?img=10" size={40} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Alex Rivera</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>Senior Product Designer</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: "#4f46e5" }}>$89.99</span>
                  <Button type="primary" size="large" style={{ background: "#4f46e5", border: "none", borderRadius: 8 }}>
                    Enroll Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 4 كورسات */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {COURSES.map((c) => (
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
                <Button
                  type="primary"
                  size="small"
                  shape="circle"
                  icon={<ArrowRightOutlined />}
                  style={{ background: "#4f46e5", border: "none" }}
                />
              </div>
            </Card>
          ))}
        </div>
      </section>

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
            Built for Serious Learners
          </Title>
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 48 }}>
            Our platform is an integrated ecosystem designed to ensure you reach your career goals.
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
              { value: "15,000+", label: "Active Students" },
              { value: "200+",    label: "Expert Courses" },
              { value: "98.2%",   label: "Success Rate" },
              { value: "50+",     label: "Expert Instructors" },
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
            Ready to start your journey?
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
            Join over 15,000 students and start building the career you've always dreamed of with AcadTrak.
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
            <Link to="/register">Get Started for Free</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}


