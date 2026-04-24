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
  Form,
  Input,
  Modal,
} from "antd";
import {
  GlobalOutlined,
  ReloadOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { apiFetch } from "~/utils/api";
import { useAuth } from "~/context/auth";

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
  instructor?: string | { id?: string; _id?: string };
  studentsCount?: number;
  averageRating?: number;
}

export default function InstructorProfilePage() {
  const { message } = App.useApp();
  const { user, setUser } = useAuth();
  const [form] = Form.useForm();
  const params = useParams();
  const instructorId = params.id;

  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isOwnProfile = Boolean(user?.id && instructorId && user.id === instructorId);

  const fetchInstructorData = async () => {
    if (!instructorId) {
      setLoading(false);
      message.error("معرف الأستاذ غير موجود");
      return;
    }

    setLoading(true);
    try {
      const [instructorResponse, coursesResponse] = await Promise.all([
        apiFetch(`/api/users/public/${instructorId}`),
        apiFetch(`/api/courses`),
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
      const publishedCourses = (coursesPayload?.courses ?? []).filter((c) => {
        const rawInstructor = c.instructor;
        const ownerId = typeof rawInstructor === "string" ? rawInstructor : rawInstructor?.id || rawInstructor?._id;
        return c.status === "published" && ownerId === instructorId;
      });

      setCourses(publishedCourses);

    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (values: {
    firstName?: string;
    lastName?: string;
    userName?: string;
    country?: string;
    bio?: string;
    avatar?: string;
  }) => {
    setSavingProfile(true);
    try {
      const response = await apiFetch("/api/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; user?: InstructorProfile }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "فشل تحديث الملف الشخصي");
      }

      message.success(payload?.message || "تم تحديث الملف الشخصي");
      if (payload?.user) {
        setInstructor((prev) => (prev ? { ...prev, ...payload.user } : prev));
        setUser((user && user.id === payload.user.id)
          ? {
              ...user,
              firstName: payload.user.firstName,
              lastName: payload.user.lastName,
              userName: payload.user.userName,
              country: payload.user.country,
              bio: payload.user.bio,
              avatar: payload.user.avatar,
            }
          : user);
      }
      setEditOpen(false);
      await fetchInstructorData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل تحديث الملف الشخصي");
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    void fetchInstructorData();
  }, [instructorId]);

  useEffect(() => {
    if (!editOpen || !instructor) {
      return;
    }

    form.setFieldsValue({
      firstName: instructor.firstName || "",
      lastName: instructor.lastName || "",
      userName: instructor.userName || "",
      country: instructor.country || "",
      bio: instructor.bio || "",
      avatar: instructor.avatar || undefined,
    });
  }, [editOpen, instructor, form]);

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
    <Space orientation="vertical" size={24} style={{ width: "100%" }}>
      {/* ─── معلومات الأستاذ الأساسية ─── */}
      <Card>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: "center" }}>
            <Avatar
              size={120}
              src={instructor.avatar || undefined}
              style={{ backgroundColor: "#1890ff", fontSize: 48 }}
            >
              {fullName.charAt(0)}
            </Avatar>
          </Col>
          <Col xs={24} sm={18}>
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
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
                {isOwnProfile ? (
                  <Button type="primary" onClick={() => setEditOpen(true)}>
                    تعديل صفحتي
                  </Button>
                ) : null}
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
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          إضافة أو تعديل coupon تتم من لوحة الأستاذ: دوراتي ثم تعديل الدورة.
        </Text>
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
                  <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                    <Text type="secondary">
                      {course.description || "بدون وصف"}
                    </Text>

                    {course.type === "paid" && course.price && (
                      <Text strong>{course.price} USD</Text>
                    )}

                    {course.averageRating && (
                      <Text type="secondary">⭐ {course.averageRating.toFixed(1)}</Text>
                    )}

                    <Link to={`/dashboard/student/courses/${course.id || course._id}`}>
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

      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        title="تعديل الصفحة الشخصية"
        okText="حفظ"
        cancelText="إلغاء"
        onOk={() => form.submit()}
        confirmLoading={savingProfile}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
          <Form.Item name="firstName" label="الاسم" rules={[{ required: true, message: "الاسم مطلوب" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="اللقب" rules={[{ required: true, message: "اللقب مطلوب" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="userName" label="اسم المستخدم" rules={[{ required: true, message: "اسم المستخدم مطلوب" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="country" label="الدولة" rules={[{ required: true, message: "الدولة مطلوبة" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="نبذة عني">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="avatar" label="رابط الصورة الشخصية">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
