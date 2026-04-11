import { Typography, Card } from "antd";
import {
  TeamOutlined, RocketOutlined, GlobalOutlined,
  SafetyCertificateOutlined, TrophyOutlined,
} from "@ant-design/icons";


export function meta() {
  return [
    { title: "AcadTrak | About Us" },
    {
      name: "description",
      content:
        "Learn more about AcadTrak, our mission, and how we are revolutionizing the learning experience for students and educators alike.",
    },
  ];
}


const { Title, Text, Paragraph } = Typography;

const TEAM = [
  { name: "Sarah Chen",    role: "CEO & Founder",      img: "https://i.pravatar.cc/80?img=10" },
  { name: "Alex Rivera",   role: "Head of Design",     img: "https://i.pravatar.cc/80?img=11" },
  { name: "Mark Thompson", role: "Lead Engineer",      img: "https://i.pravatar.cc/80?img=12" },
  { name: "Lena Müller",   role: "Head of Content",    img: "https://i.pravatar.cc/80?img=13" },
  { name: "James Park",    role: "Product Manager",    img: "https://i.pravatar.cc/80?img=14" },
  { name: "Nina Patel",    role: "Marketing Director", img: "https://i.pravatar.cc/80?img=20" },
];

const STATS = [
  { value: "15,000+", label: "Active Students" },
  { value: "200+",    label: "Expert Courses" },
  { value: "50+",     label: "Instructors" },
  { value: "98.2%",   label: "Success Rate" },
];

const VALUES = [
  { icon: <TrophyOutlined />,              title: "Excellence",     desc: "We deliver only top-quality, rigorously vetted course content." },
  { icon: <GlobalOutlined />,              title: "Accessibility",  desc: "World-class education for every learner, anywhere on the planet." },
  { icon: <TeamOutlined />,               title: "Community",      desc: "A thriving network where students and instructors grow together." },
  { icon: <RocketOutlined />,             title: "Innovation",     desc: "Constantly evolving our platform to meet tomorrow's demands." },
  { icon: <SafetyCertificateOutlined />,  title: "Trust",          desc: "Transparent pricing, honest reviews, and real career outcomes." },
];

export default function AboutPage() {
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
          Our Story
        </span>
        <Title
          level={1}
          style={{ color: "#fff", fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}
        >
          Built for the Future of Learning
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
          We believe education should be accessible, engaging, and career-focused.
          AcadTrak was founded in 2021 to bridge the gap between traditional learning and
          modern industry demands.
        </Paragraph>
      </section>

      {/* ━━━━━━ Stats ━━━━━━ */}
      <section style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
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
          {STATS.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#4f46e5", lineHeight: 1 }}>
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
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}>
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
              Our Mission
            </Text>
            <Title level={2} style={{ marginTop: 12, marginBottom: 20 }}>
              Empowering Learners Worldwide
            </Title>
            <Paragraph
              type="secondary"
              style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}
            >
              AcadTrak was born from a simple belief: everyone deserves access to
              world-class education. We partner with industry experts to create courses
              that are not just informative — they're transformative.
            </Paragraph>
            <Paragraph
              type="secondary"
              style={{ fontSize: 15, lineHeight: 1.8 }}
            >
              From beginners finding their path to professionals leveling up their skills,
              our platform serves learners at every stage of their journey.
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
            <Title level={2} style={{ marginBottom: 8 }}>What We Stand For</Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              The principles that guide everything we do at AcadTrak.
            </Text>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {VALUES.map((v) => (
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
                  {v.icon}
                </div>
                <Title level={4} style={{ marginBottom: 8 }}>{v.title}</Title>
                <Text type="secondary" style={{ lineHeight: 1.7 }}>{v.desc}</Text>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━ Team ━━━━━━ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Title level={2} style={{ marginBottom: 8 }}>Meet the Team</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            The people behind AcadTrak's mission.
          </Text>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {TEAM.map((member) => (
            <Card
              key={member.name}
              style={{ borderRadius: 14, border: "1px solid #e5e7eb", textAlign: "center" }}
              styles={{ body: { padding: 28 } }}
            >
              <img
                src={member.img}
                alt={member.name}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 16,
                  border: "3px solid #eef2ff",
                }}
              />
              <Title level={5} style={{ marginBottom: 4 }}>{member.name}</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>{member.role}</Text>
            </Card>
          ))}
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
            Join Our Growing Community
          </Title>
          <Paragraph style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32 }}>
            Be part of 15,000+ learners transforming their careers with AcadTrak.
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
              Get Started Free
            </button>
          </a>
        </div>
      </section>

    </div>
  );
}
