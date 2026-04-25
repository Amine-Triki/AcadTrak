import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  App,
  Button,
  Alert,
  Card,
  Col,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  FilePdfOutlined,
  MessageOutlined,
  ReloadOutlined,
  YoutubeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

type CourseType = "free" | "paid";
type CourseStatus = "draft" | "published";

interface CourseItem {
  id: string;
  title: string;
  description: string;
  type: CourseType;
  status: CourseStatus;
  price: number;
  effectivePrice?: number;
  isHidden: boolean;
  duration?: number; // مدة الكورس بالساعات
  instructor?: {
    id?: string;
    _id?: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
  };
}

interface LessonAsset {
  url: string;
  publicId: string;
  bytes?: number;
}

interface LessonVideo {
  youtubeId: string;
  duration?: number;
}

interface LessonItem {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  order: number;
  video?: LessonVideo;
  pdf?: LessonAsset;
  thumbnail?: LessonAsset;
  isPreview: boolean;
  isPublished: boolean;
  type?: "lesson"; // لتمييز الدروس
}

interface QuizItem {
  _id?: string;
  id?: string;
  title: string;
  type: "quiz" | "final_exam";
  order: number;
  questions?: Array<{
    text: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
  passingScore?: number;
  isPublished: boolean;
}

interface ContentItem {
  type: "lesson" | "quiz" | "final_exam";
  order: number;
  data: LessonItem | QuizItem;
}

const getLessonId = (lesson: LessonItem) => lesson.id || lesson._id || `${lesson.title}-${lesson.order}`;

export default function StudentCourseDetailPage() {
  const { message } = App.useApp();
  const params = useParams();
  const courseId = params.id;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchCourseDetails = async () => {
    if (!courseId) {
      setLoading(false);
      message.error("معرف الكورس غير موجود");
      return;
    }

    setLoading(true);
    try {
      const [courseResponse, lessonsResponse, quizzesResponse] = await Promise.all([
        apiFetch(`/api/courses/${courseId}`),
        apiFetch(`/api/lessons/course/${courseId}`),
        apiFetch(`/api/quiz/course/${courseId}`),
      ]);

      const coursePayload = (await courseResponse.json().catch(() => null)) as
        | { course?: CourseItem; message?: string }
        | null;
      const lessonsPayload = (await lessonsResponse.json().catch(() => null)) as
        | { lessons?: LessonItem[]; message?: string }
        | null;
      const quizzesPayload = (await quizzesResponse.json().catch(() => null)) as
        | { quizzes?: QuizItem[]; message?: string }
        | null;

      if (!courseResponse.ok) {
        throw new Error(coursePayload?.message || "فشل تحميل بيانات الكورس");
      }

      if (!lessonsResponse.ok) {
        throw new Error(lessonsPayload?.message || "فشل تحميل الدروس");
      }

      const enrollmentsResponse = await apiFetch("/api/enrollments/my");
      const enrollmentsData = (await enrollmentsResponse.json().catch(() => null)) as
        | { enrollments?: Array<{ course?: string | { id?: string; _id?: string } }> }
        | null;

      setCourse(coursePayload?.course ?? null);
      setLessons(lessonsPayload?.lessons ?? []);
      setQuizzes(quizzesPayload?.quizzes ?? []);
      setIsEnrolled(
        Boolean(
          enrollmentsData?.enrollments?.some((item) => {
            const enrolledCourse = item.course;
            if (typeof enrolledCourse === "string") {
              return enrolledCourse === courseId;
            }

            return enrolledCourse?.id === courseId || enrolledCourse?._id === courseId;
          }),
        ),
      );
    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل تحميل تفاصيل الكورس");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCourseDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 24 }}>
        <Spin />
      </div>
    );
  }

  if (!course) {
    return (
      <Card>
        <Title level={4}>تفاصيل الكورس</Title>
        <Text type="secondary">تعذر تحميل بيانات الكورس.</Text>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Row justify="space-between" align="middle" gutter={[12, 12]}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>{course.title}</Title>
          <Text type="secondary">تفاصيل الكورس والدروس المتاحة لك</Text>
        </Col>
        <Col>
          <Space>
            <Button href="/dashboard/student/courses">
              اذهب إلى حسابك
            </Button>
            {courseId ? (
              <Link to={`/dashboard/student/courses/${courseId}/discussions`}>
                <Button type="primary" icon={<MessageOutlined />}>
                  صفحة النقاشات
                </Button>
              </Link>
            ) : null}
            <Button icon={<ReloadOutlined />} onClick={() => void fetchCourseDetails()}>
              تحديث
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Space>
            <Tag color={course.type === "paid" ? "gold" : "green"}>
              {course.type === "paid" ? "مدفوع" : "مجاني"}
            </Tag>
            <Tag color={course.status === "published" ? "blue" : "default"}>
              {course.status === "published" ? "منشور" : "مسودة"}
            </Tag>
            {course.isHidden ? <Tag color="red">مخفي عن الكتالوج</Tag> : null}
          </Space>

          <Text>{course.description}</Text>
          
          {/* عدد الساعات والسعر */}
          <Space split="|">
            {course.duration && (
              <Space size={4}>
                <ClockCircleOutlined />
                <Text strong>{course.duration} ساعات</Text>
              </Space>
            )}
            <Text strong>
              السعر: {course.type === "free" ? "مجاني" : `${course.effectivePrice ?? course.price} USD`}
            </Text>
          </Space>

          {/* معلومات الأستاذ */}
          {course.instructor && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
              <Text type="secondary">الأستاذ: </Text>
              <Link 
                to={`/instructor/${course.instructor.id || course.instructor._id}`}
                style={{ marginLeft: 8 }}
              >
                <Text strong>
                  {course.instructor.firstName && course.instructor.lastName
                    ? `${course.instructor.firstName} ${course.instructor.lastName}`
                    : course.instructor.userName || "أستاذ"}
                </Text>
              </Link>
            </div>
          )}

          {!isEnrolled ? (
            <Alert
              type="info"
              showIcon
              message="الدروس الكاملة متاحة بعد أخذ الدورة"
              description="يمكنك مشاهدة المعاينة فقط الآن. لإتاحة كل الدروس اضغط على زر أخذ الدورة."
              action={
                courseId ? (
                  <Space>
                    <Button type="primary" href={`/payment/${courseId}`}>
                      أخذ الدورة
                    </Button>
                    <Button href="/dashboard/student/courses">
                      اذهب إلى حسابك
                    </Button>
                  </Space>
                ) : null
              }
            />
          ) : null}
        </Space>
      </Card>

      <Title level={4} style={{ marginBottom: 0 }}>المحتوى</Title>

      <Row gutter={[16, 16]}>
        {(() => {
          // دمج الدروس والاختبارات وترتيبها
          const contentItems: ContentItem[] = [
            ...lessons.map(lesson => ({
              type: "lesson" as const,
              order: lesson.order,
              data: lesson
            })),
            ...quizzes.map(quiz => ({
              type: quiz.type as "quiz" | "final_exam",
              order: quiz.order,
              data: quiz
            }))
          ].sort((a, b) => a.order - b.order);

          return contentItems.map((item) => {
            if (item.type === "lesson") {
              const lesson = item.data as LessonItem;
              return (
                <Col xs={24} key={`lesson-${getLessonId(lesson)}`}>
                  <Card
                    title={
                      <Space>
                        <Text strong>{lesson.title}</Text>
                        <Tag color="default">ترتيب: {lesson.order}</Tag>
                        {lesson.isPreview ? <Tag color="green">Preview</Tag> : null}
                      </Space>
                    }
                  >
                    <Space direction="vertical" size={10} style={{ width: "100%" }}>
                      <Text>{lesson.description || "لا يوجد وصف"}</Text>

                      {!isEnrolled && !lesson.isPreview ? (
                        // ✅ المحتوى مخفي كليًا — لا أزرار للزائر غير المسجل
                        <Alert
                          type="warning"
                          showIcon
                          message="هذا الدرس متاح بعد التسجيل في الدورة"
                        />
                      ) : (
                        // ✅ يظهر المحتوى فقط للمسجلين أو دروس المعاينة
                        <>
                          {lesson.video?.youtubeId ? (
                            <Button
                              type="link"
                              icon={<YoutubeOutlined />}
                              href={`https://www.youtube.com/watch?v=${lesson.video.youtubeId}`}
                              target="_blank"
                            >
                              مشاهدة الفيديو
                            </Button>
                          ) : null}

                          {lesson.pdf?.url ? (
                            <Button type="link" icon={<FilePdfOutlined />} href={lesson.pdf.url} target="_blank">
                              فتح PDF
                            </Button>
                          ) : null}
                        </>
                      )}
                    </Space>
                  </Card>
                </Col>
              );
            } else {
              // اختبار (quiz أو final_exam)
              const quiz = item.data as QuizItem;
              return (
                <Col xs={24} key={`quiz-${quiz.id || quiz._id}`}>
                  <Card
                    title={
                      <Space>
                        <FileTextOutlined style={{ color: "#faad14" }} />
                        <Text strong>{quiz.title}</Text>
                        <Tag color={quiz.type === "final_exam" ? "red" : "orange"}>
                          {quiz.type === "final_exam" ? "اختبار نهائي" : "اختبار"}
                        </Tag>
                        <Tag color="default">ترتيب: {quiz.order}</Tag>
                      </Space>
                    }
                  >
                    <Space direction="vertical" size={10} style={{ width: "100%" }}>
                      <Text>{quiz.questions ? `${quiz.questions.length} أسئلة` : "بدون أسئلة"}</Text>
                      {quiz.passingScore && (
                        <Text type="secondary">
                          نسبة النجاح: {quiz.passingScore}%
                        </Text>
                      )}
                      {!isEnrolled ? (
                        <Text type="secondary">الاختبار متاح بعد التسجيل في الدورة.</Text>
                      ) : (
                        <Link to={`/dashboard/student/courses/${courseId}/quizzes/${quiz.id || quiz._id}`}>
                          <Button type="primary">الذهاب للاختبار</Button>
                        </Link>
                      )}
                    </Space>
                  </Card>
                </Col>
              );
            }
          });
        })()}
      </Row>

      {lessons.length === 0 && quizzes.length === 0 ? (
        <Card>
          <Text type="secondary">لا توجد دروس أو اختبارات متاحة حالياً لهذا الكورس.</Text>
        </Card>
      ) : null}
    </Space>
  );
}
