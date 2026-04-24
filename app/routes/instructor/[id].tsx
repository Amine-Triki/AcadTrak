import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Divider,
} from "antd";
import {
  MailOutlined,
  GlobalOutlined,
  ReloadOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text, Paragraph } = Typography;

interface InstructorProfile {
  id: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  country?: string;
  bio?: string;
  avatar?: string;
  role: "teacher" | "admin";
  createdAt?: string;
}

interface InstructorCourse {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  type: "free" | "paid";
  price?: number;
  thumbnail?: string;
  status: "draft" | "published";
  studentsCount?: number;
  averageRating?: number;
}

export default function InstructorProfilePage() {
  const { message } = App.useApp();
  const params = useParams();
  const instructorId = params.id;

  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);

  const fetchInstructorData = async () => {
    if (!instructorId) {
      setLoading(false);
      message.error("معرف الأستاذ غير موجود");
      return;
    }

    setLoading(true);
    try {
      const [instructorResponse, coursesResponse] = await Promise.all([
        apiFetch(`/api/users/${instructorId}`),
        apiFetch(`/api/courses?instructor=${instructorId}`),
      ]);

      const instructorPayload = (await instructorResponse.json().catch(() => null)) as
        | { user?: InstructorProfile; message?: string }
        | null;
      const coursesPayload = (await coursesResponse.json().catch(() => null)) as
        | { courses?: InstructorCourse[]; message?: string }
        | null;

      if (!instructorResponse.ok) {
        throw new Error(instructorPayload?.message || "فشل تحميل بيانات الأستاذ");
      }

      const user = instructorPayload?.user;
      if (!user || (user.role !== "teacher" && user.role !== "admin")) {
        throw new Error("هذا المستخدم ليس أستاذاً");
      }

      setInstructor(user);
      // فقط الدورات المنشورة والغير مخفية
      const publishedCourses = (coursesPayload?.courses ?? []).filter(
        (c) => c.status === "published"
      );
      setCourses(publishedCourses);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInstructorData();
  }, [instructorId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 24 }}>
        <Spin />
      </div>
    );
  }

  if (!instructor) {
    return (
      <Card>
        <Title level={4}>معلومات الأستاذ</Title>
        <Text type="secondary">تعذر تحميل بيانات الأستاذ.</Text>
      </Card>
    );
  }

  const fullName =
    instructor.firstName && instructor.lastName
      ? `${instructor.firstName} ${instructor.lastName}`
      : instructor.userName || "أستاذ";

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      {/* ─── معلومات الأستاذ الأساسية ─── */}
      <Card>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: "center" }}>
            <Avatar
              size={120}
              src={instructor.avatar}
              style={{ backgroundColor: "#1890ff", fontSize: 48 }}
            >
              {fullName.charAt(0)}
            </Avatar>
          </Col>
          <Col xs={24} sm={18}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {fullName}
                </Title>
                <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                  @{instructor.userName || "user"}
                </Text>
              </div>

              {instructor.country && (
                <Text>
                  <GlobalOutlined style={{ marginRight: 8 }} />
                  {instructor.country}
                </Text>
              )}

              <Space>
                <Button icon={<MailOutlined />} href={`mailto:${instructor.email}`}>
                  تواصل
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => void fetchInstructorData()}>
                  تحديث
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>

        {instructor.bio && (
          <>
            <Divider />
            <div>
              <Text strong>نبذة عني:</Text>
              <Paragraph style={{ marginTop: 8 }}>{instructor.bio}</Paragraph>
            </div>
          </>
        )}

        {instructor.createdAt && (
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              عضو منذ {new Date(instructor.createdAt).toLocaleDateString("ar-SA")}
            </Text>
          </div>
        )}
      </Card>

      {/* ─── إحصائيات ─── */}
      <Card title="الإحصائيات">
        <Space size={32}>
          <div style={{ textAlign: "center" }}>
            <Title level={5} style={{ margin: 0, color: "#1890ff" }}>
              {courses.length}
            </Title>
            <Text type="secondary">دورة منشورة</Text>
          </div>
          <div style={{ textAlign: "center" }}>
            <Title level={5} style={{ margin: 0, color: "#52c41a" }}>
              {courses.filter((c) => c.type === "free").length}
            </Title>
            <Text type="secondary">دورات مجانية</Text>
          </div>
          <div style={{ textAlign: "center" }}>
            <Title level={5} style={{ margin: 0, color: "#faad14" }}>
              {courses.filter((c) => c.type === "paid").length}
            </Title>
            <Text type="secondary">دورات مدفوعة</Text>
          </div>
        </Space>
      </Card>

      {/* ─── الدورات المنشورة ─── */}
      <div>
        <Title level={4}>
          <BookOutlined style={{ marginRight: 8 }} />
          الدورات المتاحة
        </Title>
        {courses.length > 0 ? (
          <Row gutter={[16, 16]}>
            {courses.map((course) => (
              <Col xs={24} md={12} lg={8} key={course.id || course._id}>
                <Card
                  hoverable
                  title={course.title}
                  extra={
                    <Tag color={course.type === "paid" ? "gold" : "green"}>
                      {course.type === "paid" ? "مدفوع" : "مجاني"}
                    </Tag>
                  }
                >
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Text type="secondary" ellipsis={{ rows: 2 }}>
                      {course.description || "بدون وصف"}
                    </Text>

                    {course.type === "paid" && course.price && (
                      <Text strong>{course.price} USD</Text>
                    )}

                    {course.averageRating && (
                      <Text type="secondary">⭐ {course.averageRating.toFixed(1)}</Text>
                    )}

                    <Link to={`/courses/${course.id || course._id}`}>
                      <Button type="primary" block style={{ marginTop: 8 }}>
                        عرض الدورة
                      </Button>
                    </Link>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card>
            <Text type="secondary">لا توجد دورات منشورة حالياً.</Text>
          </Card>
        )}
      </div>
    </Space>
  );
}
