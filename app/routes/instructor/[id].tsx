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
import { useTranslation } from "react-i18next";
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
  role: "teacher";
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
  const { t } = useTranslation();
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
      message.error(t("instructorProfile.errors.missingId"));
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
        throw new Error(instructorPayload?.message || t("instructorProfile.errors.failedLoadInstructor"));
      }

      const user = instructorPayload?.user;
      // ✅ فقط الأستاذ يظهر كـ instructor — Admin ليس مدرساً
      if (!user || user.role !== "teacher") {
        throw new Error(t("instructorProfile.errors.notTeacher"));
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
      message.error(error instanceof Error ? error.message : t("instructorProfile.errors.failedLoadData"));
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
        throw new Error(payload?.message || t("instructorProfile.errors.failedUpdateProfile"));
      }

      message.success(payload?.message || t("instructorProfile.messages.profileUpdated"));
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
      message.error(error instanceof Error ? error.message : t("instructorProfile.errors.failedUpdateProfile"));
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
        <Title level={4}>{t("instructorProfile.infoTitle")}</Title>
        <Text type="secondary">{t("instructorProfile.errors.couldNotLoad")}</Text>
      </Card>
    );
  }

  const fullName =
    instructor.firstName && instructor.lastName
      ? `${instructor.firstName} ${instructor.lastName}`
      : instructor.userName || t("instructorProfile.fallbackTeacher");

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
                  @{instructor.userName || t("instructorProfile.userFallback")}
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
                    {t("instructorProfile.actions.editMyPage")}
                  </Button>
                ) : null}
                <Button icon={<ReloadOutlined />} onClick={() => void fetchInstructorData()}>
                  {t("instructorProfile.actions.refresh")}
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>

        {instructor.bio && (
          <>
            <Divider />
            <div>
              <Text strong>{t("instructorProfile.aboutMe")}</Text>
              <Paragraph style={{ marginTop: 8 }}>{instructor.bio}</Paragraph>
            </div>
          </>
        )}

        {instructor.createdAt && (
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("instructorProfile.memberSince", { date: new Date(instructor.createdAt).toLocaleDateString("ar-SA") })}
            </Text>
          </div>
        )}
      </Card>

      {/* ─── إحصائيات ─── */}
      <Card title={t("instructorProfile.stats.title")}>
        <Space size={32}>
          <div style={{ textAlign: "center" }}>
            <Title level={5} style={{ margin: 0, color: "#1890ff" }}>
              {courses.length}
            </Title>
            <Text type="secondary">{t("instructorProfile.stats.publishedCourses")}</Text>
          </div>
          <div style={{ textAlign: "center" }}>
            <Title level={5} style={{ margin: 0, color: "#52c41a" }}>
              {courses.filter((c) => c.type === "free").length}
            </Title>
            <Text type="secondary">{t("instructorProfile.stats.freeCourses")}</Text>
          </div>
          <div style={{ textAlign: "center" }}>
            <Title level={5} style={{ margin: 0, color: "#faad14" }}>
              {courses.filter((c) => c.type === "paid").length}
            </Title>
            <Text type="secondary">{t("instructorProfile.stats.paidCourses")}</Text>
          </div>
        </Space>
      </Card>

      {/* ─── الدورات المنشورة ─── */}
      <div>
        <Title level={4}>
          <BookOutlined style={{ marginRight: 8 }} />
          {t("instructorProfile.availableCourses")}
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          {t("instructorProfile.couponHint")}
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
                      {course.type === "paid" ? t("instructorProfile.courseType.paid") : t("instructorProfile.courseType.free")}
                    </Tag>
                  }
                >
                  <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                    <Text type="secondary">
                      {course.description || t("instructorProfile.noDescription")}
                    </Text>

                    {course.type === "paid" && course.price && (
                      <Text strong>{course.price} USD</Text>
                    )}

                    {course.averageRating && (
                      <Text type="secondary">⭐ {course.averageRating.toFixed(1)}</Text>
                    )}

                    <Link to={`/dashboard/student/courses/${course.id || course._id}`}>
                      <Button type="primary" block style={{ marginTop: 8 }}>
                        {t("instructorProfile.actions.viewCourse")}
                      </Button>
                    </Link>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card>
            <Text type="secondary">{t("instructorProfile.noPublishedCourses")}</Text>
          </Card>
        )}
      </div>

      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        title={t("instructorProfile.modal.editTitle")}
        okText={t("instructorProfile.modal.save")}
        cancelText={t("instructorProfile.modal.cancel")}
        onOk={() => form.submit()}
        confirmLoading={savingProfile}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
          <Form.Item name="firstName" label={t("instructorProfile.form.firstName")} rules={[{ required: true, message: t("instructorProfile.form.firstNameRequired") }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label={t("instructorProfile.form.lastName")} rules={[{ required: true, message: t("instructorProfile.form.lastNameRequired") }]}>
            <Input />
          </Form.Item>
          <Form.Item name="userName" label={t("instructorProfile.form.userName")} rules={[{ required: true, message: t("instructorProfile.form.userNameRequired") }]}>
            <Input />
          </Form.Item>
          <Form.Item name="country" label={t("instructorProfile.form.country")} rules={[{ required: true, message: t("instructorProfile.form.countryRequired") }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bio" label={t("instructorProfile.form.bio")}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="avatar" label={t("instructorProfile.form.avatarUrl")}>
            <Input placeholder={t("instructorProfile.form.avatarPlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
