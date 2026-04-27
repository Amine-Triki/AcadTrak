import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Alert, App, Badge, Button, Card, Col,
  Collapse, Divider, Row, Skeleton, Space, Tag, Typography,
} from "antd";
import {
  BookOutlined, CheckCircleOutlined, ClockCircleOutlined,
  FileTextOutlined, LockOutlined, LoginOutlined,
  PlayCircleOutlined, StarFilled, TeamOutlined,
} from "@ant-design/icons";
import { useAuth } from "~/context/auth";
import { apiFetch } from "~/utils/api";

const { Title, Text, Paragraph } = Typography;

/* ── Types ─────────────────────────────────── */
interface CourseDetail {
  id: string; title: string; description: string;
  type: "free" | "paid"; status: "draft" | "published";
  price: number; effectivePrice?: number;
  thumbnail?: string; duration?: number;
  averageRating?: number; totalRatingsCount?: number;
  instructor?: {
    id?: string; _id?: string;
    firstName?: string; lastName?: string; userName?: string;
    avatar?: string;
  };
  category?: string | { name: string; slug: string };
}

interface LessonPreview {
  _id?: string; id?: string;
  title: string; order: number;
  isPreview: boolean;
  video?: { youtubeId: string; duration?: number };
  pdf?: { url: string };
}

interface QuizPreview {
  _id?: string; id?: string;
  title: string; type: "quiz" | "final_exam"; order: number;
}

const getLId = (l: LessonPreview) => l.id || l._id || "";
const getQId = (q: QuizPreview)   => q.id || q._id || "";

/* ── Component ──────────────────────────────── */
export default function PublicCourseDetailPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate         = useNavigate();
  const { message }      = App.useApp();
  const { t }            = useTranslation();
  const { user }         = useAuth();

  const [loading,    setLoading]    = useState(true);
  const [course,     setCourse]     = useState<CourseDetail | null>(null);
  const [lessons,    setLessons]    = useState<LessonPreview[]>([]);
  const [quizzes,    setQuizzes]    = useState<QuizPreview[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling,  setEnrolling]  = useState(false);

  const fetchData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [cRes, lRes, qRes] = await Promise.all([
        apiFetch(`/api/courses/${courseId}`),
        apiFetch(`/api/lessons/course/${courseId}`),
        apiFetch(`/api/quiz/course/${courseId}`),
      ]);

      const [cData, lData, qData] = await Promise.all([
        cRes.json().catch(() => null),
        lRes.json().catch(() => null),
        qRes.json().catch(() => null),
      ]);

      if (!cRes.ok) throw new Error(cData?.message || t("publicCourseDetail.errors.failedLoadCourse"));

      setCourse(cData?.course ?? null);
      setLessons(lData?.lessons ?? []);
      setQuizzes(qData?.quizzes ?? []);

      // تحقق من التسجيل إذا كان مسجل دخوله
      if (user) {
        const eRes  = await apiFetch("/api/enrollments/my");
        const eData = await eRes.json().catch(() => null);
        const enrolled = Boolean(
          eData?.enrollments?.some((e: { course?: string | { id?: string; _id?: string } }) => {
            const c = e.course;
            return typeof c === "string"
              ? c === courseId
              : c?.id === courseId || c?._id === courseId;
          }),
        );
        setIsEnrolled(enrolled);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("publicCourseDetail.errors.loadError"));
    } finally {
      setLoading(false);
    }
  }, [courseId, user, message, t]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  /* ── Actions ──────────────────────────────── */
  const handleEnroll = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/courses/${courseId}` } });
      return;
    }
    if (!course) return;

    if (course.type === "paid") {
      navigate(`/payment/${courseId}`);
      return;
    }

    // مجاني — سجّل مباشرة
    setEnrolling(true);
    try {
      const res  = await apiFetch(`/api/enrollments/course/${courseId}/enroll`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || t("publicCourseDetail.errors.failedEnroll"));
      message.success(t("publicCourseDetail.messages.enrolled"));
      navigate(`/dashboard/student/courses/${courseId}`);
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("publicCourseDetail.errors.failedEnroll"));
    } finally {
      setEnrolling(false);
    }
  };

  /* ── Render ─────────────────────────────────── */
  if (loading) return (
    <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px" }}>
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  );

  if (!course) return (
    <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px" }}>
      <Alert type="error" title={t("publicCourseDetail.errors.courseUnavailable")} showIcon />
    </div>
  );

  const instructorId   = course.instructor?.id || course.instructor?._id;
  const instructorName = course.instructor
    ? (course.instructor.firstName && course.instructor.lastName
        ? `${course.instructor.firstName} ${course.instructor.lastName}`
        : course.instructor.userName ?? t("publicCourseDetail.teacherFallback"))
      : t("publicCourseDetail.teacherFallback");

  const categoryName = typeof course.category === "object"
    ? course.category.name
    : (course.category ?? "");

  const totalLessons   = lessons.length;
  const previewLessons = lessons.filter((l) => l.isPreview).length;
  const finalExam      = quizzes.find((q) => q.type === "final_exam");
  const regularQuizzes = quizzes.filter((q) => q.type !== "final_exam");

  // دمج المحتوى مرتباً للعرض
  type ContentItem =
    | { kind: "lesson"; data: LessonPreview }
    | { kind: "quiz";   data: QuizPreview };

  const allContent: ContentItem[] = [
    ...lessons.map((l) => ({ kind: "lesson" as const, data: l })),
    ...regularQuizzes.map((q) => ({ kind: "quiz" as const, data: q })),
  ].sort((a, b) => a.data.order - b.data.order);

  if (finalExam) {
    allContent.push({ kind: "quiz", data: finalExam });
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      <Row gutter={[32, 24]}>

        {/* ── الجانب الأيسر: المعلومات ─────── */}
        <Col xs={24} lg={16}>
          {/* Breadcrumb */}
          <Space size={4} style={{ marginBottom: 12 }}>
            <Link to="/courses"><Text type="secondary">{t("common.courses")}</Text></Link>
            <Text type="secondary">/</Text>
            {categoryName && <Text type="secondary">{categoryName}</Text>}
          </Space>

          {/* العنوان */}
          <Title level={2} style={{ marginBottom: 8 }}>{course.title}</Title>

          {/* التقييم والإحصائيات */}
          <Space size={16} style={{ marginBottom: 12 }} wrap>
            {course.averageRating ? (
              <Space size={4}>
                <StarFilled style={{ color: "#f59e0b" }} />
                <Text strong>{course.averageRating.toFixed(1)}</Text>
                {course.totalRatingsCount && (
                  <Text type="secondary">({course.totalRatingsCount} {t("publicCourseDetail.meta.ratings")})</Text>
                )}
              </Space>
            ) : null}
            <Space size={4}>
              <TeamOutlined />
              <Text type="secondary">{t("publicCourseDetail.meta.lessons", { count: totalLessons })}</Text>
            </Space>
            {regularQuizzes.length > 0 && (
              <Space size={4}>
                <FileTextOutlined />
                <Text type="secondary">{t("publicCourseDetail.meta.quizzes", { count: regularQuizzes.length })}</Text>
              </Space>
            )}
            {finalExam && (
              <Tag color="red" icon={<FileTextOutlined />}>{t("publicCourseDetail.meta.finalExamCertificate")}</Tag>
            )}
          </Space>

          {/* الأستاذ */}
          <Space style={{ marginBottom: 20 }}>
            <BookOutlined />
            <Text>{t("publicCourseDetail.by")}: </Text>
            {instructorId ? (
              <Link to={`/instructor/${instructorId}`}>
                <Text strong style={{ color: "#1677ff" }}>{instructorName}</Text>
              </Link>
            ) : (
              <Text strong>{instructorName}</Text>
            )}
          </Space>

          {/* الوصف */}
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>{t("publicCourseDetail.about")}</Title>
            <Paragraph>{course.description}</Paragraph>
          </Card>

          {/* ── محتوى الدورة ──────────────────── */}
          <Card
            title={
              <Space>
                <PlayCircleOutlined />
                <span>{t("publicCourseDetail.content.title")}</span>
                <Badge count={allContent.length} color="#1677ff" />
                {previewLessons > 0 && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({t("publicCourseDetail.content.freePreviewCount", { count: previewLessons })})
                  </Text>
                )}
              </Space>
            }
          >
            {allContent.length === 0 ? (
              <Text type="secondary">{t("publicCourseDetail.content.empty")}</Text>
            ) : (
              <Collapse
                ghost
                items={allContent.map((item, idx) => {
                  const isLesson   = item.kind === "lesson";
                  const lesson     = isLesson ? (item.data as LessonPreview) : null;
                  const quiz       = !isLesson ? (item.data as QuizPreview) : null;
                  const isFinal    = quiz?.type === "final_exam";
                  const isPreview  = isLesson ? lesson!.isPreview : false;
                  const isLocked   = !isEnrolled && !isPreview;

                  const id = isLesson ? getLId(lesson!) : getQId(quiz!);

                  return {
                    key: `${item.kind}-${id}`,
                    label: (
                      <Space>
                        {isLocked
                          ? <LockOutlined style={{ color: "#bfbfbf" }} />
                          : isLesson
                          ? <PlayCircleOutlined style={{ color: "#1677ff" }} />
                          : isFinal
                          ? <FileTextOutlined style={{ color: "#f5222d" }} />
                          : <FileTextOutlined style={{ color: "#fa8c16" }} />
                        }
                        <Text>{idx + 1}. {item.data.title}</Text>
                        {isPreview && <Tag color="green" style={{ fontSize: 11 }}>{t("publicCourseDetail.content.freePreview")}</Tag>}
                        {isFinal   && <Tag color="red"   style={{ fontSize: 11 }}>{t("publicCourseDetail.content.finalExam")}</Tag>}
                        {!isLesson && !isFinal && <Tag color="orange" style={{ fontSize: 11 }}>{t("publicCourseDetail.content.quiz")}</Tag>}
                      </Space>
                    ),
                    children: isLocked ? (
                      <Alert
                        type="info"
                        showIcon
                        icon={<LockOutlined />}
                        message={t("publicCourseDetail.content.enrollToUnlock")}
                        action={
                          <Button
                            type="primary"
                            size="small"
                            icon={user ? undefined : <LoginOutlined />}
                            onClick={() => void handleEnroll()}
                          >
                            {user
                              ? (course.type === "paid" ? t("publicCourseDetail.actions.buyCourse") : t("publicCourseDetail.actions.freeEnroll"))
                              : t("publicCourseDetail.actions.login")}
                          </Button>
                        }
                      />
                    ) : isLesson && lesson ? (
                      <Space wrap>
                        {lesson.video?.youtubeId ? (
                          <Button
                            type="primary" ghost size="small"
                            icon={<PlayCircleOutlined />}
                            href={isEnrolled
                              ? `/dashboard/student/courses/${courseId}`
                              : `https://www.youtube.com/watch?v=${lesson.video.youtubeId}`}
                            target={isEnrolled ? undefined : "_blank"}
                          >
                            {isEnrolled ? t("publicCourseDetail.actions.watchInDashboard") : t("publicCourseDetail.actions.watchPreview")}
                          </Button>
                        ) : (
                          <Text type="secondary">{t("publicCourseDetail.content.lessonAvailableAfterEnroll")}</Text>
                        )}
                      </Space>
                    ) : (
                      isEnrolled ? (
                        <Link to={`/dashboard/student/courses/${courseId}`}>
                          <Button type="primary" size="small">{t("publicCourseDetail.actions.startQuizFromDashboard")}</Button>
                        </Link>
                      ) : (
                        <Text type="secondary">{t("publicCourseDetail.content.quizAvailableAfterEnroll")}</Text>
                      )
                    ),
                  };
                })}
              />
            )}
          </Card>
        </Col>

        {/* ── الجانب الأيمن: بطاقة الشراء ─── */}
        <Col xs={24} lg={8}>
          <div style={{ position: "sticky", top: 24 }}>
            <Card
              cover={
                course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ height: 180, objectFit: "cover" }}
                  />
                ) : (
                  <div style={{
                    height: 180, background: "linear-gradient(135deg,#667eea,#764ba2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <BookOutlined style={{ fontSize: 48, color: "#fff" }} />
                  </div>
                )
              }
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
            >
              {/* السعر */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                {course.type === "free" ? (
                  <Tag color="green" style={{ fontSize: 20, padding: "4px 16px" }}>{t("publicCourseDetail.pricing.free")}</Tag>
                ) : (
                  <Space orientation="vertical" size={2}>
                    {course.effectivePrice !== undefined &&
                     course.effectivePrice < course.price ? (
                      <>
                        <Text delete type="secondary" style={{ fontSize: 14 }}>
                          ${course.price}
                        </Text>
                        <Text strong style={{ fontSize: 28, color: "#52c41a" }}>
                          ${course.effectivePrice}
                        </Text>
                      </>
                    ) : (
                      <Text strong style={{ fontSize: 28, color: "#1677ff" }}>
                        ${course.price}
                      </Text>
                    )}
                  </Space>
                )}
              </div>

              {/* زر الاشتراك */}
              {isEnrolled ? (
                <Space orientation="vertical" style={{ width: "100%" }} size={8}>
                  <Alert
                    type="success" showIcon
                    icon={<CheckCircleOutlined />}
                    title={t("publicCourseDetail.messages.alreadyEnrolled")}
                    style={{ marginBottom: 0 }}
                  />
                  <Link to={`/dashboard/student/courses/${courseId}`} style={{ display: "block" }}>
                    <Button type="primary" block size="large" icon={<PlayCircleOutlined />}>
                      {t("publicCourseDetail.actions.continueLearning")}
                    </Button>
                  </Link>
                </Space>
              ) : (
                <Button
                  type="primary" block size="large"
                  loading={enrolling}
                  icon={user ? undefined : <LoginOutlined />}
                  onClick={() => void handleEnroll()}
                  style={{
                    background: course.type === "paid" ? "#0f766e" : "#4f46e5",
                    border: "none",
                  }}
                >
                  {!user
                    ? t("publicCourseDetail.actions.loginToEnroll")
                    : course.type === "paid"
                    ? t("publicCourseDetail.actions.buyWithPrice", { price: course.price })
                    : t("publicCourseDetail.actions.freeEnroll")}
                </Button>
              )}

              <Divider style={{ margin: "16px 0" }} />

              {/* ما ستحصل عليه */}
              <Title level={5} style={{ marginBottom: 12 }}>{t("publicCourseDetail.includes.title")}</Title>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                {totalLessons > 0 && (
                  <Space>
                    <PlayCircleOutlined style={{ color: "#1677ff" }} />
                    <Text>{t("publicCourseDetail.meta.lessons", { count: totalLessons })}</Text>
                  </Space>
                )}
                {regularQuizzes.length > 0 && (
                  <Space>
                    <FileTextOutlined style={{ color: "#fa8c16" }} />
                    <Text>{t("publicCourseDetail.meta.quizzes", { count: regularQuizzes.length })}</Text>
                  </Space>
                )}
                {finalExam && (
                  <Space>
                    <FileTextOutlined style={{ color: "#f5222d" }} />
                    <Text>{t("publicCourseDetail.meta.finalExamCertificate")}</Text>
                  </Space>
                )}
                {course.duration && (
                  <Space>
                    <ClockCircleOutlined />
                    <Text>{t("publicCourseDetail.includes.hoursContent", { count: course.duration })}</Text>
                  </Space>
                )}
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>{t("publicCourseDetail.includes.lifetimeAccess")}</Text>
                </Space>
              </Space>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
