import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  MessageOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useAuth } from "~/context/auth";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface CourseItem {
  id: string;
  title: string;
  description: string;
}

interface LessonItem {
  _id?: string;
  id?: string;
  title: string;
  order: number;
}

interface DiscussionUser {
  id: string;
  userName: string;
  displayName: string;
}

interface DiscussionLesson {
  id: string;
  title?: string;
  order?: number;
}

interface DiscussionItem {
  id: string;
  course: string;
  lesson?: DiscussionLesson;
  student: DiscussionUser;
  question: string | null;
  isQuestionEdited: boolean;
  questionEditedAt?: string;
  answer?: string;
  answerBy?: DiscussionUser;
  isAnswerEdited: boolean;
  answerEditedAt?: string;
  isResolved: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface QuestionFormValues {
  question: string;
  lesson?: string;
}

interface AnswerFormValues {
  answer: string;
}

const getLessonId = (lesson: LessonItem) => lesson.id || lesson._id || `${lesson.title}-${lesson.order}`;

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
};

export default function CourseDiscussionsPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useParams();
  const location = useLocation();
  const courseId = params.id;

  const [questionForm] = Form.useForm<QuestionFormValues>();
  const [answerForm] = Form.useForm<AnswerFormValues>();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [answerTarget, setAnswerTarget] = useState<DiscussionItem | null>(null);

  // ✅ الأستاذ المسجل في دورة أستاذ آخر يمكنه طرح سؤال أيضاً
  // الـ backend يتحقق من الـ enrollment، هنا نعرض الزر لأي مستخدم مسجل
  const canAskQuestion = user?.role === "student" || user?.role === "teacher";
  // ✅ فقط الأستاذ يُجيب — Admin لا يجيب
  const canAnswer = user?.role === "teacher";

  const isQuestionOwner = (discussion: DiscussionItem) => {
    // ✅ صاحب السؤال يمكنه تعديله وحذفه بصرف النظر عن الـ role
    return user?.id === discussion.student.id;
  };

  const fetchDiscussions = async (targetCourseId: string) => {
    setDiscussionsLoading(true);
    try {
      const response = await apiFetch(`/api/discussions/course/${targetCourseId}`);
      const payload = (await response.json().catch(() => null)) as
        | { discussions?: DiscussionItem[]; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || t("studentDiscussions.errors.failedLoadDiscussions"));
      }

      setDiscussions(payload?.discussions ?? []);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("studentDiscussions.errors.failedLoadDiscussions"));
    } finally {
      setDiscussionsLoading(false);
    }
  };

  const fetchPageData = async () => {
    if (!courseId) {
      setLoading(false);
      message.error(t("studentDiscussions.errors.missingCourseId"));
      return;
    }

    setLoading(true);
    try {
      const [courseResponse, lessonsResponse, discussionsResponse] = await Promise.all([
        apiFetch(`/api/courses/${courseId}`),
        apiFetch(`/api/lessons/course/${courseId}`),
        apiFetch(`/api/discussions/course/${courseId}`),
      ]);

      const coursePayload = (await courseResponse.json().catch(() => null)) as
        | { course?: CourseItem; message?: string }
        | null;
      const lessonsPayload = (await lessonsResponse.json().catch(() => null)) as
        | { lessons?: LessonItem[]; message?: string }
        | null;
      const discussionsPayload = (await discussionsResponse.json().catch(() => null)) as
        | { discussions?: DiscussionItem[]; message?: string }
        | null;

      if (!courseResponse.ok) {
        throw new Error(coursePayload?.message || t("studentDiscussions.errors.failedLoadCourse"));
      }

      if (!lessonsResponse.ok) {
        throw new Error(lessonsPayload?.message || t("studentDiscussions.errors.failedLoadLessons"));
      }

      if (!discussionsResponse.ok) {
        throw new Error(discussionsPayload?.message || t("studentDiscussions.errors.failedLoadDiscussions"));
      }

      setCourse(coursePayload?.course ?? null);
      setLessons(lessonsPayload?.lessons ?? []);
      setDiscussions(discussionsPayload?.discussions ?? []);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("studentDiscussions.errors.failedLoadPage"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPageData();
  }, [courseId]);

  const handleQuestionSubmit = async (values: QuestionFormValues) => {
    if (!courseId) {
      return;
    }

    setQuestionSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        question: values.question.trim(),
      };

      if (values.lesson) {
        body.lesson = values.lesson;
      }

      let response: Response;
      if (editingQuestionId) {
        response = await apiFetch(`/api/discussions/${editingQuestionId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        response = await apiFetch("/api/discussions", {
          method: "POST",
          body: JSON.stringify({
            course: courseId,
            ...body,
          }),
        });
      }

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || t("studentDiscussions.errors.failedSaveQuestion"));
      }

      message.success(editingQuestionId ? t("studentDiscussions.messages.questionUpdated") : t("studentDiscussions.messages.questionPosted"));
      setEditingQuestionId(null);
      questionForm.resetFields();
      await fetchDiscussions(courseId);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("studentDiscussions.errors.failedSaveQuestion"));
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleEditQuestion = (discussion: DiscussionItem) => {
    setEditingQuestionId(discussion.id);
    questionForm.setFieldsValue({
      question: discussion.question || "",
      lesson: discussion.lesson?.id,
    });
  };

  const cancelQuestionEdit = () => {
    setEditingQuestionId(null);
    questionForm.resetFields();
  };

  const handleDeleteQuestion = async (discussionId: string) => {
    if (!courseId) {
      return;
    }

    try {
      const response = await apiFetch(`/api/discussions/${discussionId}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || t("studentDiscussions.errors.failedDeleteQuestion"));
      }

      message.success(payload?.message || t("studentDiscussions.messages.questionDeleted"));
      await fetchDiscussions(courseId);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("studentDiscussions.errors.failedDeleteQuestion"));
    }
  };

  const openAnswerModal = (discussion: DiscussionItem) => {
    setAnswerTarget(discussion);
    answerForm.setFieldsValue({ answer: discussion.answer || "" });
    setAnswerModalOpen(true);
  };

  const closeAnswerModal = () => {
    setAnswerTarget(null);
    setAnswerModalOpen(false);
    answerForm.resetFields();
  };

  const submitAnswer = async (values: AnswerFormValues) => {
    if (!courseId || !answerTarget) {
      return;
    }

    setAnswerSubmitting(true);
    try {
      const response = await apiFetch(`/api/discussions/${answerTarget.id}/answer`, {
        method: "PATCH",
        body: JSON.stringify({ answer: values.answer.trim() }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || t("studentDiscussions.errors.failedSaveAnswer"));
      }

      message.success(payload?.message || t("studentDiscussions.messages.answerSaved"));
      closeAnswerModal();
      await fetchDiscussions(courseId);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("studentDiscussions.errors.failedSaveAnswer"));
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const teacherRoute = location.pathname.startsWith("/dashboard/teacher/");
  const backPath = teacherRoute
    ? "/dashboard/teacher/courses"
    : courseId
      ? `/dashboard/student/courses/${courseId}`
      : "/dashboard/student/courses";

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
        <Title level={4}>{t("studentDiscussions.title")}</Title>
        <Text type="secondary">{t("studentDiscussions.errors.courseUnavailable")}</Text>
      </Card>
    );
  }

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Row justify="space-between" align="middle" gutter={[12, 12]}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <MessageOutlined style={{ marginInlineEnd: 8 }} />
            {t("studentDiscussions.courseDiscussions")}: {course.title}
          </Title>
          <Text type="secondary">{t("studentDiscussions.subtitle")}</Text>
        </Col>
        <Col>
          <Space>
            <Link to={backPath}>
              <Button icon={<LeftOutlined />}>{t("studentDiscussions.actions.back")}</Button>
            </Link>
            <Button icon={<ReloadOutlined />} onClick={() => void fetchPageData()}>
              {t("studentDiscussions.actions.refresh")}
            </Button>
          </Space>
        </Col>
      </Row>

      {canAskQuestion ? (
        <Card>
          <Form<QuestionFormValues>
            form={questionForm}
            layout="vertical"
            onFinish={handleQuestionSubmit}
          >
            <Form.Item
              name="question"
              label={t("studentDiscussions.form.question")}
              rules={[
                { required: true, message: t("studentDiscussions.form.questionRequired") },
                { min: 3, message: t("studentDiscussions.form.questionMin") },
              ]}
            >
              <Input.TextArea rows={3} placeholder={t("studentDiscussions.form.questionPlaceholder")} />
            </Form.Item>

            <Form.Item name="lesson" label={t("studentDiscussions.form.lessonOptional")}>
              <Select
                allowClear
                placeholder={t("studentDiscussions.form.lessonPlaceholder")}
                options={lessons.map((lesson) => ({
                  value: getLessonId(lesson),
                  label: `${lesson.order}. ${lesson.title}`,
                }))}
              />
            </Form.Item>

            <Space>
              <Button type="primary" htmlType="submit" loading={questionSubmitting}>
                {editingQuestionId ? t("studentDiscussions.actions.saveEdit") : t("studentDiscussions.actions.postQuestion")}
              </Button>
              {editingQuestionId ? (
                <Button onClick={cancelQuestionEdit}>{t("studentDiscussions.actions.cancel")}</Button>
              ) : null}
            </Space>
          </Form>
        </Card>
      ) : null}

      {discussionsLoading ? (
        <div style={{ textAlign: "center", padding: 16 }}>
          <Spin />
        </div>
      ) : null}

      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        {discussions.map((discussion) => (
          <Card
            key={discussion.id}
            title={
              <Space wrap>
                <Text strong>{discussion.student.userName}</Text>
                {discussion.isDeleted ? <Tag color="red">{t("studentDiscussions.tags.deleted")}</Tag> : null}
                {discussion.isResolved ? <Tag color="green">{t("studentDiscussions.tags.resolved")}</Tag> : <Tag>{t("studentDiscussions.tags.open")}</Tag>}
                {discussion.isQuestionEdited ? <Tag color="processing">{t("studentDiscussions.tags.questionEdited")}</Tag> : null}
              </Space>
            }
            extra={<Text type="secondary">{formatDate(discussion.createdAt)}</Text>}
          >
            <Space orientation="vertical" size={10} style={{ width: "100%" }}>
              {discussion.lesson ? (
                <Tag color="default">
                  {discussion.lesson.order !== undefined ? `${discussion.lesson.order}. ` : ""}
                  {discussion.lesson.title || t("studentDiscussions.lessonFallback")}
                </Tag>
              ) : null}

              {discussion.isDeleted ? (
                <Text type="secondary">{t("studentDiscussions.messages.deletedByOwner")}</Text>
              ) : (
                <Text>{discussion.question}</Text>
              )}

              {discussion.answer ? (
                <Card size="small" style={{ background: "#fafafa" }}>
                  <Space orientation="vertical" size={6} style={{ width: "100%" }}>
                    <Space wrap>
                      <Text strong>
                        {t("studentDiscussions.answerByTeacher")}: {discussion.answerBy?.userName || t("studentDiscussions.instructorFallback")}
                      </Text>
                      {discussion.isAnswerEdited ? <Tag color="processing">{t("studentDiscussions.tags.answerEdited")}</Tag> : null}
                    </Space>
                    <Text>{discussion.answer}</Text>
                    <Text type="secondary">{formatDate(discussion.updatedAt)}</Text>
                  </Space>
                </Card>
              ) : null}

              <Space wrap>
                {isQuestionOwner(discussion) && !discussion.isDeleted ? (
                  <>
                    <Button icon={<EditOutlined />} onClick={() => handleEditQuestion(discussion)}>
                      {t("studentDiscussions.actions.editQuestion")}
                    </Button>
                    <Popconfirm
                      title={t("studentDiscussions.actions.deleteQuestionTitle")}
                      description={t("studentDiscussions.actions.deleteQuestionDescription")}
                      onConfirm={() => void handleDeleteQuestion(discussion.id)}
                      okText={t("studentDiscussions.actions.yes")}
                      cancelText={t("studentDiscussions.actions.cancel")}
                    >
                      <Button danger icon={<DeleteOutlined />}>
                        {t("studentDiscussions.actions.deleteQuestion")}
                      </Button>
                    </Popconfirm>
                  </>
                ) : null}

                {canAnswer && !discussion.isDeleted ? (
                  <Button type="primary" onClick={() => openAnswerModal(discussion)}>
                    {discussion.answer ? t("studentDiscussions.actions.editAnswer") : t("studentDiscussions.actions.addAnswer")}
                  </Button>
                ) : null}
              </Space>
            </Space>
          </Card>
        ))}
      </Space>

      {!discussionsLoading && discussions.length === 0 ? (
        <Card>
          <Text type="secondary">{t("studentDiscussions.empty")}</Text>
        </Card>
      ) : null}

      <Modal
        open={answerModalOpen}
        onCancel={closeAnswerModal}
        title={answerTarget?.answer ? t("studentDiscussions.actions.editAnswer") : t("studentDiscussions.actions.addAnswer")}
        onOk={() => void answerForm.submit()}
        confirmLoading={answerSubmitting}
      >
        <Form<AnswerFormValues>
          form={answerForm}
          layout="vertical"
          onFinish={submitAnswer}
        >
          <Form.Item
            name="answer"
            label={t("studentDiscussions.form.answer")}
            rules={[
              { required: true, message: t("studentDiscussions.form.answerRequired") },
              { min: 1, message: t("studentDiscussions.form.answerRequired") },
            ]}
          >
            <Input.TextArea rows={4} placeholder={t("studentDiscussions.form.answerPlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
