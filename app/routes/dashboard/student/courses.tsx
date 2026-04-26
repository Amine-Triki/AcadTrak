import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  App, Button, Card, Col, Empty, Progress,
  Row, Space, Spin, Tag, Typography,
} from "antd";
import {
  BookOutlined, PlayCircleOutlined, ReloadOutlined, TrophyOutlined,
} from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface EnrollmentCourse {
  _id?: string; id?: string;
  title?: string; description?: string; thumbnail?: string;
  type?: "free" | "paid"; price?: number;
  instructor?: { id?: string; _id?: string; firstName?: string; lastName?: string; userName?: string };
}

interface EnrollmentItem {
  _id: string; paidPrice: number;
  couponCode?: string; enrolledAt: string;
  course: EnrollmentCourse | string;
}

interface CourseProgress {
  progressPct: number; completedItems: number;
  totalItems: number; canAccessFinalExam: boolean;
}

const getCourseId = (c: EnrollmentCourse | string) =>
  typeof c === "string" ? c : (c.id || c._id || "");

const getCourseName = (c: EnrollmentCourse | string) =>
  typeof c === "string" ? "دورة" : (c.title ?? "دورة");

const getInstructorName = (c: EnrollmentCourse | string) => {
  if (typeof c === "string") return null;
  const ins = c.instructor;
  if (!ins) return null;
  return ins.firstName && ins.lastName
    ? `${ins.firstName} ${ins.lastName}` : ins.userName ?? null;
};

export default function StudentCoursesPage() {
  const { message }   = App.useApp();
  const [loading,     setLoading]     = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({});

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res  = await apiFetch("/api/enrollments/my");
      const data = (await res.json().catch(() => null)) as { enrollments?: EnrollmentItem[] } | null;
      if (!res.ok) throw new Error("فشل تحميل الدورات");
      const items = data?.enrollments ?? [];
      setEnrollments(items);

      const progEntries = await Promise.all(
        items.map(async (item) => {
          const id = getCourseId(item.course);
          if (!id) return null;
          try {
            const pRes  = await apiFetch(`/api/progress/course/${id}`);
            const pData = await pRes.json().catch(() => null);
            if (pRes.ok) return [id, pData] as [string, CourseProgress];
          } catch { /* ignore */ }
          return null;
        }),
      );

      const map: Record<string, CourseProgress> = {};
      progEntries.forEach((e) => { if (e) map[e[0]] = e[1]; });
      setProgressMap(map);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "فشل تحميل الدورات");
    } finally { setLoading(false); }
  };

  useEffect(() => { void fetchEnrollments(); }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 48 }}><Spin size="large" /></div>;

  return (
    <Space orientation="vertical" size={24} style={{ width: "100%" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ margin: 0 }}>دوراتي</Title>
          <Text type="secondary">{enrollments.length} دورة مسجل فيها</Text>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={() => void fetchEnrollments()}>تحديث</Button>
        </Col>
      </Row>

      {enrollments.length === 0 ? (
        <Empty
          image={<BookOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />}
          description={
            <Space orientation="vertical" size={4}>
              <Text>لا تملك أي دورة مسجل فيها بعد.</Text>
              <Link to="/courses"><Button type="primary">استعرض الدورات</Button></Link>
            </Space>
          }
        />
      ) : (
        <Row gutter={[16, 16]}>
          {enrollments.map((item) => {
            const courseId   = getCourseId(item.course);
            const courseName = getCourseName(item.course);
            const insName    = getInstructorName(item.course);
            const prog       = progressMap[courseId];
            const pct        = prog?.progressPct ?? 0;
            const thumbnail  = typeof item.course !== "string" ? item.course.thumbnail : undefined;
            const instructor = typeof item.course !== "string" ? item.course.instructor : null;

            return (
              <Col key={item._id} xs={24} sm={12} xl={8}>
                <Card
                  hoverable
                  style={{ height: "100%", borderRadius: 12, overflow: "hidden" }}
                  styles={{ body: { padding: 0 } }}
                >
                  {/* صورة + شريط تقدم */}
                  <div style={{ position: "relative" }}>
                    {thumbnail ? (
                      <img src={thumbnail} alt={courseName}
                        style={{ width: "100%", height: 140, objectFit: "cover" }} />
                    ) : (
                      <div style={{
                        height: 140,
                        background: `linear-gradient(135deg,${pct === 100 ? "#52c41a,#389e0d" : "#667eea,#764ba2"})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {pct === 100
                          ? <TrophyOutlined style={{ fontSize: 48, color: "#fff" }} />
                          : <BookOutlined   style={{ fontSize: 48, color: "#fff" }} />}
                      </div>
                    )}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                      <Progress
                        percent={pct} showInfo={false} size={4}
                        strokeColor={pct === 100 ? "#52c41a" : "#1677ff"}
                        railColor="rgba(255,255,255,0.4)"
                      />
                    </div>
                  </div>

                  {/* محتوى */}
                  <div style={{ padding: 16 }}>
                    <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                      <Text strong style={{ fontSize: 15 }}>{courseName}</Text>

                      {insName && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {instructor?.id || instructor?._id ? (
                            <Link to={`/instructor/${instructor.id || instructor._id}`}
                              style={{ color: "inherit" }}>{insName}</Link>
                          ) : insName}
                        </Text>
                      )}

                      {/* تقدم */}
                      <Space>
                        <Text style={{ fontSize: 13, fontWeight: 600,
                          color: pct === 100 ? "#52c41a" : "#1677ff" }}>
                          {pct}%
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {pct === 100 ? "✅ مكتمل"
                            : prog ? `(${prog.completedItems}/${prog.totalItems})`
                            : "لم يبدأ بعد"}
                        </Text>
                        {prog?.canAccessFinalExam && pct < 100 && (
                          <Tag color="gold" style={{ fontSize: 11 }}>جاهز للاختبار النهائي 🏆</Tag>
                        )}
                      </Space>

                      <Text type="secondary" style={{ fontSize: 11 }}>
                        تسجيل: {new Date(item.enrolledAt).toLocaleDateString("ar-TN")}
                        {item.paidPrice > 0 && ` · ${item.paidPrice} USD`}
                      </Text>

                      {/* أزرار */}
                      <Space wrap>
                        {courseId && (
                          <Link to={`/dashboard/student/courses/${courseId}`}>
                            <Button type="primary" icon={<PlayCircleOutlined />}
                              style={{ background: pct === 100 ? "#52c41a" : undefined, border: "none" }}>
                              {pct === 0 ? "ابدأ التعلم" : pct === 100 ? "مراجعة" : "متابعة"}
                            </Button>
                          </Link>
                        )}
                        {courseId && (
                          <Link to={`/dashboard/student/courses/${courseId}/discussions`}>
                            <Button size="small">النقاشات</Button>
                          </Link>
                        )}
                        {pct === 100 && (
                          <Link to="/dashboard/student/grades">
                            <Button size="small" icon={<TrophyOutlined />}>شهادتي</Button>
                          </Link>
                        )}
                      </Space>
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Space>
  );
}
