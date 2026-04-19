import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  App,
  Button,
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
}

const getLessonId = (lesson: LessonItem) => lesson.id || lesson._id || `${lesson.title}-${lesson.order}`;

export default function StudentCourseDetailPage() {
  const { message } = App.useApp();
  const params = useParams();
  const courseId = params.id;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);

  const fetchCourseDetails = async () => {
    if (!courseId) {
      setLoading(false);
      message.error("معرف الكورس غير موجود");
      return;
    }

    setLoading(true);
    try {
      const [courseResponse, lessonsResponse] = await Promise.all([
        apiFetch(`/api/courses/${courseId}`),
        apiFetch(`/api/lessons/course/${courseId}`),
      ]);

      const coursePayload = (await courseResponse.json().catch(() => null)) as
        | { course?: CourseItem; message?: string }
        | null;
      const lessonsPayload = (await lessonsResponse.json().catch(() => null)) as
        | { lessons?: LessonItem[]; message?: string }
        | null;

      if (!courseResponse.ok) {
        throw new Error(coursePayload?.message || "فشل تحميل بيانات الكورس");
      }

      if (!lessonsResponse.ok) {
        throw new Error(lessonsPayload?.message || "فشل تحميل الدروس");
      }

      setCourse(coursePayload?.course ?? null);
      setLessons(lessonsPayload?.lessons ?? []);
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
          <Text strong>
            السعر: {course.type === "free" ? "مجاني" : `${course.effectivePrice ?? course.price} USD`}
          </Text>
        </Space>
      </Card>

      <Title level={4} style={{ marginBottom: 0 }}>الدروس</Title>

      <Row gutter={[16, 16]}>
        {lessons.map((lesson) => (
          <Col xs={24} key={getLessonId(lesson)}>
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
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {lessons.length === 0 ? (
        <Card>
          <Text type="secondary">لا توجد دروس متاحة حالياً لهذا الكورس.</Text>
        </Card>
      ) : null}
    </Space>
  );
}
