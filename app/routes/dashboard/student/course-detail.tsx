import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  App, Alert, Button, Card, Col, Progress,
  Row, Space, Spin, Tag, Tooltip, Typography,
} from "antd";
import {
  CheckCircleOutlined, ClockCircleOutlined,
  FilePdfOutlined, FileTextOutlined,
  LockOutlined, MessageOutlined,
  ReloadOutlined, TrophyOutlined, YoutubeOutlined,
} from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface CourseItem {
  id: string; title: string; description: string;
  type: "free" | "paid"; status: "draft" | "published";
  price: number; effectivePrice?: number; isHidden: boolean; duration?: number;
  instructor?: { id?: string; _id?: string; firstName?: string; lastName?: string; userName?: string };
}

interface LessonItem {
  _id?: string; id?: string; title: string; description?: string; order: number;
  video?: { youtubeId: string; duration?: number };
  pdf?: { url: string; publicId: string };
  isPreview: boolean; isPublished: boolean;
}

interface QuizItem {
  _id?: string; id?: string; title: string;
  type: "quiz" | "final_exam"; order: number;
  passingScore?: number; isPublished: boolean;
  questions?: Array<{ text: string }>;
}

interface ProgressItem {
  id: string; type: "lesson" | "quiz"; order: number;
  title: string; isPreview?: boolean; completed: boolean; isUnlocked: boolean;
}

interface CourseProgressData {
  progressPct: number; completedItems: number; totalItems: number;
  canAccessFinalExam: boolean;
  completedLessonIds: string[]; passedQuizIds: string[];
  items: ProgressItem[];
}

const getLessonId = (l: LessonItem) => l.id || l._id || "";
const getQuizId   = (q: QuizItem)   => q.id  || q._id  || "";

export default function StudentCourseDetailPage() {
  const { message } = App.useApp();
  const { id: courseId } = useParams<{ id: string }>();

  const [loading,    setLoading]    = useState(true);
  const [markingId,  setMarkingId]  = useState<string | null>(null);
  const [course,     setCourse]     = useState<CourseItem | null>(null);
  const [lessons,    setLessons]    = useState<LessonItem[]>([]);
  const [quizzes,    setQuizzes]    = useState<QuizItem[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress,   setProgress]   = useState<CourseProgressData | null>(null);

  const fetchAll = useCallback(async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [cRes, lRes, qRes, eRes] = await Promise.all([
        apiFetch(`/api/courses/${courseId}`),
        apiFetch(`/api/lessons/course/${courseId}`),
        apiFetch(`/api/quiz/course/${courseId}`),
        apiFetch("/api/enrollments/my"),
      ]);
      const [cData, lData, qData, eData] = await Promise.all([
        cRes.json().catch(() => null), lRes.json().catch(() => null),
        qRes.json().catch(() => null), eRes.json().catch(() => null),
      ]);
      if (!cRes.ok) throw new Error(cData?.message || "فشل تحميل الكورس");

      const enrolled = Boolean(
        eData?.enrollments?.some((e: { course?: string | { id?: string; _id?: string } }) => {
          const c = e.course;
          return typeof c === "string" ? c === courseId : c?.id === courseId || c?._id === courseId;
        }),
      );

      setCourse(cData?.course ?? null);
      setLessons(lData?.lessons ?? []);
      setQuizzes(qData?.quizzes ?? []);
      setIsEnrolled(enrolled);

      if (enrolled) {
        const pRes  = await apiFetch(`/api/progress/course/${courseId}`);
        const pData = await pRes.json().catch(() => null);
        if (pRes.ok) setProgress(pData);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "فشل تحميل الدورة");
    } finally { setLoading(false); }
  }, [courseId, message]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const handleMarkComplete = async (lessonId: string) => {
    if (!courseId) return;
    setMarkingId(lessonId);
    try {
      const res  = await apiFetch(`/api/progress/course/${courseId}/lesson/${lessonId}/complete`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "فشل التأشير");
      message.success("✅ تم إكمال الدرس");
      const pRes  = await apiFetch(`/api/progress/course/${courseId}`);
      const pData = await pRes.json().catch(() => null);
      if (pRes.ok) setProgress(pData);
    } catch (err) { message.error(err instanceof Error ? err.message : "خطأ");
    } finally { setMarkingId(null); }
  };

  const isLessonCompleted = (id: string) => progress?.completedLessonIds.includes(id) ?? false;
  const isQuizPassed      = (id: string) => progress?.passedQuizIds.includes(id) ?? false;
  const getProgItem       = (id: string) => progress?.items.find((it) => it.id === id);

  if (loading) return <div style={{ textAlign: "center", padding: 48 }}><Spin size="large" /></div>;
  if (!course) return <Card><Text type="secondary">تعذر تحميل الكورس.</Text></Card>;

  type MixedItem = { kind: "lesson"; item: LessonItem } | { kind: "quiz"; item: QuizItem };

  const sorted: MixedItem[] = [
    ...lessons.map((l) => ({ kind: "lesson" as const, item: l })),
    ...quizzes.filter((q) => q.type !== "final_exam").map((q) => ({ kind: "quiz" as const, item: q })),
  ].sort((a, b) => a.item.order - b.item.order);

  const finalExam     = quizzes.find((q) => q.type === "final_exam");
  const instructorId  = course.instructor?.id || course.instructor?._id;
  const instructorName = course.instructor
    ? (course.instructor.firstName && course.instructor.lastName
        ? `${course.instructor.firstName} ${course.instructor.lastName}`
        : course.instructor.userName ?? "الأستاذ")
    : null;

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>

      {/* Header */}
      <Row justify="space-between" align="middle" gutter={[12, 12]}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>{course.title}</Title>
          {instructorName && instructorId && (
            <Link to={`/instructor/${instructorId}`}>
              <Text type="secondary">الأستاذ: {instructorName}</Text>
            </Link>
          )}
        </Col>
        <Col>
          <Space>
            {courseId && (
              <Link to={`/dashboard/student/courses/${courseId}/discussions`}>
                <Button icon={<MessageOutlined />}>النقاشات</Button>
              </Link>
            )}
            <Button icon={<ReloadOutlined />} onClick={() => void fetchAll()}>تحديث</Button>
          </Space>
        </Col>
      </Row>

      {/* شريط التقدم */}
      {isEnrolled && progress && (
        <Card style={{ background: "linear-gradient(135deg,#f0f9ff,#e6f4ff)", border: "1px solid #91caff" }}>
          <Space orientation="vertical" size={8} style={{ width: "100%" }}>
            <Space>
              <TrophyOutlined style={{ color: "#1677ff" }} />
              <Text strong>تقدمك في الدورة</Text>
              <Text type="secondary">({progress.completedItems} / {progress.totalItems} مكتمل)</Text>
            </Space>
            <Progress
              percent={progress.progressPct}
              strokeColor={progress.progressPct === 100 ? "#52c41a" : "#1677ff"}
            />
            {progress.canAccessFinalExam && finalExam && !isQuizPassed(getQuizId(finalExam)) && (
              <Alert type="success" showIcon
                title="🎉 أكملت كل المحتوى! يمكنك الآن تقديم الاختبار النهائي للحصول على شهادتك." />
            )}
          </Space>
        </Card>
      )}

      {/* معلومات الكورس */}
      <Card>
        <Space orientation="vertical" size={8} style={{ width: "100%" }}>
          <Space>
            <Tag color={course.type === "paid" ? "gold" : "green"}>
              {course.type === "paid" ? "مدفوع" : "مجاني"}
            </Tag>
            <Tag color={course.status === "published" ? "blue" : "default"}>
              {course.status === "published" ? "منشور" : "مسودة"}
            </Tag>
          </Space>
          <Text>{course.description}</Text>
          {course.duration && (
            <Space size={4}><ClockCircleOutlined /><Text>{course.duration} ساعة</Text></Space>
          )}
          {!isEnrolled && (
            <Alert type="info" showIcon title="الدروس الكاملة متاحة بعد التسجيل"
              action={<Button type="primary" size="small" href={`/payment/${courseId}`}>التسجيل الآن</Button>}
            />
          )}
        </Space>
      </Card>

      {/* محتوى الدورة */}
      <Title level={4} style={{ marginBottom: 0 }}>
        محتوى الدورة ({sorted.length + (finalExam ? 1 : 0)} عنصر)
      </Title>

      <Row gutter={[0, 8]}>
        {sorted.map((entry) => {
          if (entry.kind === "lesson") {
            const lesson     = entry.item;
            const lid        = getLessonId(lesson);
            const completed  = isLessonCompleted(lid);
            const isUnlocked = !isEnrolled ? lesson.isPreview : (getProgItem(lid)?.isUnlocked ?? false);

            return (
              <Col xs={24} key={`lesson-${lid}`}>
                <Card size="small"
                  style={{
                    borderLeft: `4px solid ${completed ? "#52c41a" : isUnlocked ? "#1677ff" : "#d9d9d9"}`,
                    opacity: isUnlocked ? 1 : 0.65,
                  }}
                  title={
                    <Space>
                      {completed ? <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        : isUnlocked ? <YoutubeOutlined style={{ color: "#1677ff" }} />
                        : <LockOutlined style={{ color: "#bfbfbf" }} />}
                      <Text strong>{lesson.title}</Text>
                      {lesson.isPreview && <Tag color="green">معاينة مجانية</Tag>}
                      {completed && <Tag color="success">مكتمل ✓</Tag>}
                    </Space>
                  }
                >
                  {!isUnlocked ? (
                    <Alert type="warning" showIcon icon={<LockOutlined />}
                      title="أكمل الدرس السابق أولاً لفتح هذا الدرس" />
                  ) : (
                    <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                      {lesson.description && <Text type="secondary">{lesson.description}</Text>}
                      <Space wrap>
                        {lesson.video?.youtubeId && (
                          <Button type="primary" ghost icon={<YoutubeOutlined />}
                            href={`https://www.youtube.com/watch?v=${lesson.video.youtubeId}`} target="_blank">
                            مشاهدة الفيديو
                          </Button>
                        )}
                        {lesson.pdf?.url && (
                          <Button icon={<FilePdfOutlined />} href={lesson.pdf.url} target="_blank">
                            فتح PDF
                          </Button>
                        )}
                        {isEnrolled && !completed && (
                          <Tooltip title="اضغط بعد الانتهاء من الدرس">
                            <Button type="primary" icon={<CheckCircleOutlined />}
                              loading={markingId === lid}
                              onClick={() => void handleMarkComplete(lid)}>
                              أكملت هذا الدرس
                            </Button>
                          </Tooltip>
                        )}
                      </Space>
                    </Space>
                  )}
                </Card>
              </Col>
            );
          }

          const quiz       = entry.item;
          const qid        = getQuizId(quiz);
          const passed     = isQuizPassed(qid);
          const isUnlocked = !isEnrolled ? false : (getProgItem(qid)?.isUnlocked ?? false);

          return (
            <Col xs={24} key={`quiz-${qid}`}>
              <Card size="small"
                style={{
                  borderLeft: `4px solid ${passed ? "#52c41a" : isUnlocked ? "#fa8c16" : "#d9d9d9"}`,
                  opacity: isUnlocked ? 1 : 0.65,
                }}
                title={
                  <Space>
                    {passed ? <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      : isUnlocked ? <FileTextOutlined style={{ color: "#fa8c16" }} />
                      : <LockOutlined style={{ color: "#bfbfbf" }} />}
                    <Text strong>{quiz.title}</Text>
                    <Tag color="orange">اختبار</Tag>
                    {passed && <Tag color="success">ناجح ✓</Tag>}
                  </Space>
                }
              >
                {!isEnrolled ? <Text type="secondary">متاح بعد التسجيل</Text>
                  : !isUnlocked ? (
                    <Alert type="warning" showIcon icon={<LockOutlined />}
                      title="أكمل الدروس السابقة لفتح هذا الاختبار" />
                  ) : (
                    <Space>
                      {quiz.passingScore && <Text type="secondary">نسبة النجاح: {quiz.passingScore}%</Text>}
                      <Link to={`/dashboard/student/courses/${courseId}/quizzes/${qid}`}>
                        <Button type="primary" disabled={passed}>
                          {passed ? "تم الاجتياز ✓" : "ابدأ الاختبار"}
                        </Button>
                      </Link>
                    </Space>
                  )}
              </Card>
            </Col>
          );
        })}

        {/* الاختبار النهائي */}
        {finalExam && (() => {
          const fid       = getQuizId(finalExam);
          const passed    = isQuizPassed(fid);
          const canAccess = isEnrolled && (progress?.canAccessFinalExam ?? false);
          return (
            <Col xs={24} key={`final-${fid}`}>
              <Card size="small"
                style={{
                  borderLeft: `4px solid ${passed ? "#52c41a" : canAccess ? "#f5222d" : "#d9d9d9"}`,
                  background: canAccess && !passed ? "#fff1f0" : undefined,
                  opacity: canAccess || passed ? 1 : 0.65,
                }}
                title={
                  <Space>
                    {passed ? <TrophyOutlined style={{ color: "#faad14", fontSize: 18 }} />
                      : canAccess ? <FileTextOutlined style={{ color: "#f5222d" }} />
                      : <LockOutlined style={{ color: "#bfbfbf" }} />}
                    <Text strong>{finalExam.title}</Text>
                    <Tag color="red">اختبار نهائي 🏆</Tag>
                    {passed && <Tag color="gold">مكتمل ✓</Tag>}
                  </Space>
                }
              >
                {passed ? (
                  <Space>
                    <Alert type="success" showIcon title="حصلت على شهادتك!" />
                    <Link to="/dashboard/student/grades">
                      <Button type="primary" icon={<TrophyOutlined />}>عرض شهادتي</Button>
                    </Link>
                  </Space>
                ) : !isEnrolled ? (
                  <Text type="secondary">متاح بعد التسجيل</Text>
                ) : !canAccess ? (
                  <Alert type="info" showIcon icon={<LockOutlined />}
                    title={`أكمل جميع الدروس والاختبارات أولاً (${progress?.progressPct ?? 0}% مكتمل)`} />
                ) : (
                  <Space orientation="vertical" size={8}>
                    <Alert type="success" showIcon
                      title="أنت جاهز! قدّم الاختبار الآن للحصول على شهادتك." />
                    <Space>
                      {finalExam.passingScore && <Text type="secondary">نسبة النجاح: {finalExam.passingScore}%</Text>}
                      <Link to={`/dashboard/student/courses/${courseId}/quizzes/${fid}`}>
                        <Button type="primary" danger icon={<TrophyOutlined />} size="large">
                          ابدأ الاختبار النهائي 🏆
                        </Button>
                      </Link>
                    </Space>
                  </Space>
                )}
              </Card>
            </Col>
          );
        })()}
      </Row>

      {sorted.length === 0 && !finalExam && (
        <Card><Text type="secondary">لا توجد دروس منشورة في هذه الدورة بعد.</Text></Card>
      )}
    </Space>
  );
}
