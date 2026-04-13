import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Input,
  Select,
  Card,
  Tag,
  Rate,
  Button,
  Typography,
  Spin,
  Empty,
  Pagination,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  StarFilled,
  FilterOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import type { Route } from "./+types/_public.courses";

const { Title, Text, Paragraph } = Typography;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  rating: number;
  students: number;
  price: number;
  img: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// بيانات وهمية — تُحذف عند ربط API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: "Advanced Fullstack React Architect",
    description:
      "Build scalable enterprise applications using React and Tailwind.",
    category: "Development",
    instructor: "Sarah Chen",
    rating: 4.8,
    students: 2100,
    price: 129,
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=60",
    level: "Advanced",
  },
  {
    id: 2,
    title: "Digital Product Design Mastery",
    description:
      "Master Figma and learn psychological principles of world-class UI.",
    category: "Design",
    instructor: "Alex Rivera",
    rating: 4.9,
    students: 1240,
    price: 89,
    img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=60",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "Growth Marketing for Startups",
    description:
      "Customer acquisition and viral growth strategies for startups.",
    category: "Marketing",
    instructor: "Mark Thompson",
    rating: 5.0,
    students: 980,
    price: 54,
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=60",
    level: "Beginner",
  },
  {
    id: 4,
    title: "Financial Analysis Fundamentals",
    description: "Decode financial statements like a professional analyst.",
    category: "Business",
    instructor: "Lena Müller",
    rating: 4.7,
    students: 750,
    price: 99,
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=60",
    level: "Beginner",
  },
  {
    id: 5,
    title: "Visual Storytelling Masterclass",
    description:
      "Master lighting and composition for cinematic content creation.",
    category: "Creative",
    instructor: "James Park",
    rating: 4.5,
    students: 620,
    price: 75,
    img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=60",
    level: "Intermediate",
  },
  {
    id: 6,
    title: "Python for Data Science & ML",
    description:
      "From pandas to neural networks — a complete data science journey.",
    category: "Data",
    instructor: "Nina Patel",
    rating: 4.9,
    students: 3400,
    price: 149,
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=60",
    level: "Intermediate",
  },
  {
    id: 7,
    title: "Node.js Backend Engineering",
    description:
      "Build production-ready REST APIs and microservices with Node.js.",
    category: "Development",
    instructor: "Sarah Chen",
    rating: 4.6,
    students: 1800,
    price: 119,
    img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=60",
    level: "Advanced",
  },
  {
    id: 8,
    title: "Product Management Essentials",
    description: "From ideation to launch — the complete PM toolkit.",
    category: "Business",
    instructor: "Mark Thompson",
    rating: 4.8,
    students: 1100,
    price: 109,
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=60",
    level: "Intermediate",
  },
  {
    id: 9,
    title: "UI/UX Research & Prototyping",
    description:
      "User research methods, wireframing, and interactive prototyping.",
    category: "Design",
    instructor: "Alex Rivera",
    rating: 4.7,
    students: 890,
    price: 79,
    img: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=60",
    level: "Beginner",
  },
  {
    id: 10,
    title: "SEO & Content Marketing",
    description:
      "Rank higher on Google and build a content engine that converts.",
    category: "Marketing",
    instructor: "Lena Müller",
    rating: 4.6,
    students: 1300,
    price: 69,
    img: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=60",
    level: "Beginner",
  },
  {
    id: 11,
    title: "AWS Cloud Architecture",
    description: "Design scalable and fault-tolerant systems on AWS.",
    category: "Development",
    instructor: "James Park",
    rating: 4.9,
    students: 2800,
    price: 159,
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=60",
    level: "Advanced",
  },
  {
    id: 12,
    title: "Brand Identity Design",
    description:
      "Create memorable brands from logo to full visual identity system.",
    category: "Creative",
    instructor: "Nina Patel",
    rating: 4.5,
    students: 540,
    price: 85,
    img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=60",
    level: "Intermediate",
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Config
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CATEGORIES = [
  "All",
  "Development",
  "Design",
  "Marketing",
  "Business",
  "Creative",
  "Data",
];

const CATEGORY_COLOR: Record<string, string> = {
  Development: "blue",
  Design: "purple",
  Marketing: "green",
  Business: "orange",
  Creative: "pink",
  Data: "cyan",
};

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "success",
  Intermediate: "warning",
  Advanced: "error",
};

const PAGE_SIZE = 8;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// meta
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function meta({}: Route.MetaArgs) {
  return [
    { title: "AcadTrak | All Courses" },
    {
      name: "description",
      content:
        "Browse 200+ expert-led courses in development, design, marketing, and more.",
    },
  ];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// clientLoader — يُستبدل بـ API لاحقاً
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function clientLoader() {
  // ستُستبدل بـ:
  // const res = await fetch("/api/courses");
  // return await res.json();

  await new Promise((r) => setTimeout(r, 400)); // محاكاة تأخير
  return { courses: MOCK_COURSES };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function CoursesPage({ loaderData }: Route.ComponentProps) {
  const allCourses: Course[] = loaderData?.courses ?? [];

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);

  // ── فلترة + بحث + ترتيب ──────────
  const filtered = useMemo(() => {
    let result = [...allCourses];

    // بحث بالعنوان أو المدرب
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q),
      );
    }

    // فلتر الفئة
    if (category !== "All") {
      result = result.filter((c) => c.category === category);
    }

    // ترتيب
    if (sortBy === "popular") result.sort((a, b) => b.students - a.students);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result.sort((a, b) => b.id - a.id);

    return result;
  }, [allCourses, search, category, sortBy]);

  // ── Pagination ────────────────────
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // إعادة للصفحة 1 عند تغيير الفلتر
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleCategory = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div style={{ background: "#f8f9fc", minHeight: "100vh" }}>
      {/* ━━━━━━ Hero ━━━━━━ */}
      <section
        style={{
          background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
          padding: "64px 48px",
          textAlign: "center",
        }}
      >
        <Title
          level={1}
          style={{
            color: "#fff",
            fontSize: "clamp(24px, 3.5vw, 42px)",
            marginBottom: 12,
          }}
        >
          Explore All Courses
        </Title>
        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 16,
            display: "block",
            marginBottom: 32,
          }}
        >
          Discover 200+ expert-led courses across design, development,
          marketing, and more.
        </Text>

        {/* Search */}
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <Input
            size="large"
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Search courses, instructors, topics..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
          />
        </div>
      </section>

      {/* ━━━━━━ Filters Bar ━━━━━━ */}
      <section
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          position: "sticky",
          top: 64, // تحت الـ Header
          zIndex: 90,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 48px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {/* Category Tabs */}
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              style={{
                flexShrink: 0,
                padding: "14px 18px",
                border: "none",
                borderBottom:
                  category === cat
                    ? "2px solid #4f46e5"
                    : "2px solid transparent",
                background: "transparent",
                color: category === cat ? "#4f46e5" : "#6b7280",
                fontWeight: category === cat ? 600 : 400,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          ))}

          {/* Sort */}
          <div
            style={{
              marginLeft: "auto",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FilterOutlined style={{ color: "#9ca3af", fontSize: 14 }} />
            <Select
              value={sortBy}
              onChange={setSortBy}
              size="small"
              style={{ width: 140 }}
              options={[
                { label: "Most Popular", value: "popular" },
                { label: "Top Rated", value: "rating" },
                { label: "Price: Low", value: "price_asc" },
                { label: "Price: High", value: "price_desc" },
                { label: "Newest", value: "newest" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ━━━━━━ Results ━━━━━━ */}
      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 48px 80px" }}
      >
        {/* عدد النتائج */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text type="secondary">
            {search
              ? `Showing ${filtered.length} results for "${search}"`
              : `${filtered.length} courses available`}
            {category !== "All" && ` in ${category}`}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Page {page} of {Math.ceil(filtered.length / PAGE_SIZE) || 1}
          </Text>
        </div>

        {/* ── No Results ── */}
        {filtered.length === 0 && (
          <Empty
            description={
              <span>
                No courses found for <strong>"{search}"</strong>.{" "}
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  style={{
                    color: "#4f46e5",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Clear filters
                </button>
              </span>
            }
            style={{ padding: "80px 0" }}
          />
        )}

        {/* ── Grid ── */}
        {filtered.length > 0 && (
          <>
            <Row gutter={[20, 20]}>
              {paginated.map((course) => (
                <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 14,
                      border: "1px solid #e5e7eb",
                      height: "100%",
                      overflow: "hidden",
                    }}
                    styles={{ body: { padding: 16 } }}
                    cover={
                      <div style={{ position: "relative" }}>
                        <img
                          src={course.img}
                          alt={course.title}
                          style={{
                            width: "100%",
                            height: 140,
                            objectFit: "cover",
                          }}
                        />
                        {/* Level badge */}
                        <Tag
                          color={LEVEL_COLOR[course.level]}
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            fontSize: 11,
                            margin: 0,
                          }}
                        >
                          {course.level}
                        </Tag>
                      </div>
                    }
                  >
                    {/* Category */}
                    <Tag
                      color={CATEGORY_COLOR[course.category]}
                      style={{ fontSize: 10, marginBottom: 8 }}
                    >
                      {course.category.toUpperCase()}
                    </Tag>

                    {/* Title */}
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#111827",
                        lineHeight: 1.5,
                        minHeight: 42,
                        marginBottom: 8,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {course.title}
                    </div>

                    {/* Instructor */}
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      {course.instructor}
                    </Text>

                    {/* Rating */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 12,
                      }}
                    >
                      <StarFilled style={{ color: "#f59e0b", fontSize: 13 }} />
                      <Text style={{ fontSize: 13, fontWeight: 600 }}>
                        {course.rating}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ({course.students.toLocaleString()} students)
                      </Text>
                    </div>

                    {/* Footer: Price + Button */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid #f3f4f6",
                        paddingTop: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#4f46e5",
                        }}
                      >
                        ${course.price}
                      </span>
                      <Link to={`/courses/${course.id}`}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<ArrowRightOutlined />}
                          iconPosition="end"
                          style={{
                            background: "#4f46e5",
                            border: "none",
                            borderRadius: 6,
                          }}
                        >
                          Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 48,
                }}
              >
                <Pagination
                  current={page}
                  total={filtered.length}
                  pageSize={PAGE_SIZE}
                  onChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  showTotal={(total) => `Total ${total} courses`}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
