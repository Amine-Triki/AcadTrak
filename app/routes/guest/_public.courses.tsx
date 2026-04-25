import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  App,
  Alert,
  Input,
  Select,
  Card,
  Tag,
  Button,
  Typography,
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
  LoginOutlined,
} from "@ant-design/icons";
import type { Route } from "./+types/_public.courses";
import { apiFetch } from "~/utils/api";
import { useAuth } from "~/context/auth";

const { Title, Text } = Typography;

type CourseType = "free" | "paid";
type CourseStatus = "draft" | "published";

interface ApiCourse {
  id: string;
  title: string;
  description: string;
  category:
    | string
    | {
        id?: string;
        _id?: string;
        name?: string;
        slug?: string;
      };
  categoryDetails?: {
    id: string;
    name: string;
    slug?: string;
  };
  instructor:
    | string
    | {
        id?: string;
        _id?: string;
        firstName?: string;
        lastName?: string;
        userName?: string;
      };
  instructorDetails?: {
    id: string;
    name: string;
    userName?: string;
  };
  type: CourseType;
  status: CourseStatus;
  price: number;
  effectivePrice?: number;
  thumbnail?: string;
  averageRating?: number;
  totalRatingsCount?: number;
}

interface CourseCardItem {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorId?: string; // معرف الأستاذ
  rating: number;
  students: number;
  price: number;
  img: string;
  type: CourseType;
}

interface CoursesLoaderData {
  courses: ApiCourse[];
  errorMessage?: string;
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

const PAGE_SIZE = 8;

const getCategoryLabel = (
  category: ApiCourse["category"],
  categoryDetails?: ApiCourse["categoryDetails"],
) => {
  if (categoryDetails?.name?.trim()) {
    return categoryDetails.name.trim();
  }

  if (typeof category === "string") {
    if (/^[a-fA-F0-9]{24}$/.test(category)) {
      return "General";
    }

    return category.trim() || "General";
  }

  return category.name?.trim() || "General";
};

const getInstructorLabel = (
  instructor: ApiCourse["instructor"],
  instructorDetails?: ApiCourse["instructorDetails"],
) => {
  if (instructorDetails?.name?.trim()) {
    return instructorDetails.name.trim();
  }

  if (typeof instructor === "string") {
    if (/^[a-fA-F0-9]{24}$/.test(instructor)) {
      return "AcadTrak Instructor";
    }

    return instructor.trim() || "AcadTrak Instructor";
  }

  const fullName = `${instructor.firstName ?? ""} ${instructor.lastName ?? ""}`.trim();
  if (fullName) {
    return fullName;
  }

  return instructor.userName?.trim() || "AcadTrak Instructor";
};

const getInstructorId = (instructor: ApiCourse["instructor"]) => {
  if (typeof instructor === "string") {
    return instructor;
  }
  return instructor.id || instructor._id || "";
};

const getCategoryColor = (category: string) => {
  const hash = category
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
};

const mapApiCourse = (course: ApiCourse): CourseCardItem => ({
  id: course.id,
  title: course.title,
  description: course.description,
  category: getCategoryLabel(course.category, course.categoryDetails),
  instructor: getInstructorLabel(course.instructor, course.instructorDetails),
  instructorId: getInstructorId(course.instructor),
  rating: Number((course.averageRating ?? 0).toFixed(1)),
  students: course.totalRatingsCount ?? 0,
  price: course.type === "free" ? 0 : course.effectivePrice ?? course.price,
  img: course.thumbnail || FALLBACK_IMAGE,
  type: course.type,
});

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AcadTrak | All Courses" },
    {
      name: "description",
      content:
        "Browse expert-led courses in development, design, marketing, and more.",
    },
  ];
}

export async function clientLoader(): Promise<CoursesLoaderData> {
  try {
    const response = await apiFetch("/api/courses");
    const payload = (await response.json().catch(() => null)) as
      | { courses?: ApiCourse[]; message?: string }
      | null;

    if (!response.ok) {
      return {
        courses: [],
        errorMessage: payload?.message || "Failed to load courses.",
      };
    }

    return { courses: payload?.courses ?? [] };
  } catch {
    return {
      courses: [],
      errorMessage: "Unable to connect to the server.",
    };
  }
}

export default function CoursesPage({ loaderData }: Route.ComponentProps) {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuth();
  const allCourses = useMemo(
    () => (loaderData?.courses ?? []).map(mapApiCourse),
    [loaderData?.courses],
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(allCourses.map((course) => course.category));
    return ["All", ...Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b))];
  }, [allCourses]);

  const filtered = useMemo(() => {
    let result = [...allCourses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(q) ||
          course.instructor.toLowerCase().includes(q) ||
          course.category.toLowerCase().includes(q),
      );
    }

    if (category !== "All") {
      result = result.filter((course) => course.category === category);
    }

    if (sortBy === "popular") result.sort((a, b) => b.students - a.students);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result.sort((a, b) => b.id.localeCompare(a.id));

    return result;
  }, [allCourses, search, category, sortBy]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setPage(1);
  };

  const handleCourseAction = async (course: CourseCardItem) => {
    if (!user) {
      navigate("/login", { state: { from: `/payment/${course.id}` } });
      return;
    }

    if (course.type === "paid") {
      navigate(`/payment/${course.id}`);
      return;
    }

    if (user.role !== "student" && user.role !== "admin") {
      message.info("Only students can enroll in courses.");
      return;
    }

    setEnrollingCourseId(course.id);
    try {
      const response = await apiFetch(`/api/enrollments/course/${course.id}/enroll`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (response.status === 409) {
        message.success(payload?.message || "You are already enrolled.");
        navigate(`/dashboard/student/courses/${course.id}`);
        return;
      }

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to enroll in course.");
      }

      message.success(payload?.message || "You are now enrolled.");
      navigate(`/dashboard/student/courses/${course.id}`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to enroll in course.");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const getPrimaryActionLabel = (course: CourseCardItem) => {
    if (course.type === "paid") {
      return user ? "الانتقال إلى الدفع" : "سجّل الدخول للدفع";
    }

    if (!user) {
      return "سجّل الدخول للانضمام";
    }

    return "الانضمام الآن";
  };

  return (
    <div style={{ background: "#f8f9fc", minHeight: "100vh" }}>
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
            color: "rgba(255,255,255,0.78)",
            fontSize: 16,
            display: "block",
            marginBottom: 32,
          }}
        >
          Discover expert-led courses and start learning with real content.
        </Text>

        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <Input
            size="large"
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Search courses, instructors, topics..."
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            allowClear
            style={{ borderRadius: 10, height: 48, fontSize: 15 }}
          />
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          position: "sticky",
          top: 64,
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
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => handleCategory(item)}
              style={{
                flexShrink: 0,
                padding: "14px 18px",
                border: "none",
                borderBottom:
                  category === item
                    ? "2px solid #4f46e5"
                    : "2px solid transparent",
                background: "transparent",
                color: category === item ? "#4f46e5" : "#6b7280",
                fontWeight: category === item ? 600 : 400,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </button>
          ))}

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
              style={{ width: 150 }}
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

      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 48px 80px" }}
      >
        {loaderData?.errorMessage ? (
          <Alert
            type="warning"
            showIcon
            title={loaderData.errorMessage}
            style={{ marginBottom: 20 }}
          />
        ) : null}

        <div
          style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
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

        {filtered.length === 0 && (
          <Empty
            description={
              <span>
                No courses found.
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
                    marginLeft: 6,
                  }}
                >
                  Clear filters
                </button>
              </span>
            }
            style={{ padding: "80px 0" }}
          />
        )}

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
                        <Tag
                          color={course.type === "paid" ? "gold" : "green"}
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            fontSize: 11,
                            margin: 0,
                          }}
                        >
                          {course.type === "paid" ? "Paid" : "Free"}
                        </Tag>
                      </div>
                    }
                  >
                    <Tag
                      color={getCategoryColor(course.category)}
                      style={{ fontSize: 10, marginBottom: 8 }}
                    >
                      {course.category.toUpperCase()}
                    </Tag>

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

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      {course.instructorId ? (
                        <Link to={`/instructor/${course.instructorId}`} style={{ color: "inherit" }}>
                          {course.instructor}
                        </Link>
                      ) : (
                        course.instructor
                      )}
                    </Text>

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
                        ({course.students.toLocaleString()} ratings)
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        flexWrap: "wrap",
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
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </span>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Button
                          type="primary"
                          size="small"
                          loading={enrollingCourseId === course.id}
                          icon={user ? undefined : <LoginOutlined />}
                          onClick={() => void handleCourseAction(course)}
                          style={{
                            background: course.type === "paid" ? "#0f766e" : "#4f46e5",
                            border: "none",
                            borderRadius: 6,
                          }}
                        >
                          {getPrimaryActionLabel(course)}
                        </Button>
                        <Link to={`/payment/${course.id}`}>
                          <Button
                            type="default"
                            size="small"
                            icon={<ArrowRightOutlined />}
                            iconPlacement="end"
                            style={{
                              borderRadius: 6,
                            }}
                          >
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

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
                  onChange={(nextPage) => {
                    setPage(nextPage);
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
