import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  App,
  Checkbox,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
} from "antd";
import { MinusCircleOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { apiFetch } from "~/utils/api";
import { useAuth } from "~/context/auth";

const { Title, Text } = Typography;
const { TextArea } = Input;

type HealthStatus = "checking" | "ok" | "down";

type QuizType = "quiz" | "final_exam";

interface CourseItem {
  id: string;
  title: string;
  instructor: unknown;
}

interface QuizQuestion {
  text: string;
  options: string[];
  correctIndices: number[];
  explanation?: string;
}

interface QuizItem {
  id: string;
  title: string;
  type: QuizType;
  order: number;
  passingScore: number;
  isPublished: boolean;
  questions: QuizQuestion[];
}

interface QuizFormValues {
  title: string;
  type: QuizType;
  order: number;
  passingScore: number;
  isPublished: boolean;
  questions: QuizQuestion[];
}

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    text: "ما هو العنصر الأساسي في إنشاء React Component؟",
    options: ["className", "props", "querySelector", "middleware"],
    correctIndices: [1],
    explanation: "props هي الطريقة الأساسية لتمرير البيانات إلى المكون.",
  },
];

const normalizeQuestionForForm = (question: QuizQuestion) => ({
  text: question.text,
  options: question.options.length >= 2 ? question.options : ["", ""],
  correctIndices: question.correctIndices,
  explanation: question.explanation || "",
});

const getInstructorId = (instructor: unknown) => {
  if (!instructor) {
    return "";
  }

  if (typeof instructor === "string") {
    return instructor;
  }

  if (typeof instructor === "object" && "_id" in instructor) {
    return String((instructor as { _id: unknown })._id);
  }

  if (typeof instructor === "object" && "id" in instructor) {
    return String((instructor as { id: unknown }).id);
  }

  return "";
};

export default function TeacherQuizzesPage() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm<QuizFormValues>();

  const [health, setHealth] = useState<HealthStatus>("checking");
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizItem | null>(null);

  const myCourses = useMemo(() => {
    if (!user?.id) {
      return [];
    }

    if (user.role === "admin") {
      return courses;
    }

    return courses.filter((course) => getInstructorId(course.instructor) === user.id);
  }, [courses, user?.id, user?.role]);

  const fetchHealth = async () => {
    try {
      const response = await apiFetch("/api/quiz/health");
      setHealth(response.ok ? "ok" : "down");
    } catch {
      setHealth("down");
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await apiFetch("/api/courses");
      const payload = (await response.json().catch(() => null)) as
        | { courses?: CourseItem[]; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "فشل تحميل الدورات");
      }

      setCourses(payload?.courses ?? []);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل تحميل الدورات");
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchQuizzes = async (courseId: string) => {
    setQuizzesLoading(true);
    try {
      const response = await apiFetch(`/api/quiz/course/${courseId}`);
      const payload = (await response.json().catch(() => null)) as
        | { quizzes?: QuizItem[]; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "فشل تحميل الاختبارات");
      }

      setQuizzes(payload?.quizzes ?? []);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل تحميل الاختبارات");
      setQuizzes([]);
    } finally {
      setQuizzesLoading(false);
    }
  };

  useEffect(() => {
    void fetchHealth();
    void fetchCourses();
  }, []);

  useEffect(() => {
    if (!myCourses.length) {
      setSelectedCourseId(undefined);
      setQuizzes([]);
      return;
    }

    if (!selectedCourseId || !myCourses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(myCourses[0]?.id);
    }
  }, [myCourses, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) {
      setQuizzes([]);
      return;
    }

    void fetchQuizzes(selectedCourseId);
  }, [selectedCourseId]);

  const openCreateModal = () => {
    setEditingQuiz(null);
    form.setFieldsValue({
      title: "",
      type: "quiz",
      order: quizzes.length,
      passingScore: 70,
      isPublished: false,
      questions: DEFAULT_QUESTIONS.map(normalizeQuestionForForm) as QuizQuestion[],
    });
    setModalOpen(true);
  };

  const openEditModal = (quiz: QuizItem) => {
    setEditingQuiz(quiz);
    form.setFieldsValue({
      title: quiz.title,
      type: quiz.type,
      order: quiz.order,
      passingScore: quiz.passingScore,
      isPublished: quiz.isPublished,
      questions: quiz.questions.map((question) => ({
        text: question.text,
        options: question.options.length >= 2 ? question.options : ["", ""],
        correctIndices: question.correctIndices?.length
          ? question.correctIndices
          : typeof (question as { correctIndex?: number }).correctIndex === "number"
            ? [(question as { correctIndex: number }).correctIndex]
            : [],
        explanation: question.explanation || "",
      })) as QuizQuestion[],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingQuiz(null);
    form.resetFields();
  };

  const submitQuiz = async (values: QuizFormValues) => {
    if (!selectedCourseId) {
      message.error("اختر دورة أولًا");
      return;
    }

    if (!values.questions || values.questions.length === 0) {
      message.error("أضف سؤالًا واحدًا على الأقل");
      return;
    }

    const questions = values.questions.map((question, index) => {
      const text = question.text?.trim();
      if (!text) {
        throw new Error(`نص السؤال رقم ${index + 1} مطلوب`);
      }

      if (!Array.isArray(question.options) || question.options.length < 2) {
        throw new Error(`السؤال رقم ${index + 1} يجب أن يحتوي خيارين على الأقل`);
      }

      const correctIndices = [...new Set(question.correctIndices || [])].filter(
        (value) => Number.isInteger(value) && value >= 0 && value < question.options.length,
      );

      if (correctIndices.length === 0) {
        throw new Error(`السؤال رقم ${index + 1} يجب أن يحتوي إجابة صحيحة واحدة على الأقل`);
      }

      return {
        text,
        options: question.options.map((option) => option.trim()),
        correctIndices,
        ...(question.explanation?.trim() ? { explanation: question.explanation.trim() } : {}),
      };
    });

    const payload: Record<string, unknown> = {
      title: values.title,
      type: values.type,
      order: values.order,
      passingScore: values.passingScore,
      isPublished: values.isPublished,
      questions,
    };

    if (!editingQuiz) {
      payload.course = selectedCourseId;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch(editingQuiz ? `/api/quiz/${editingQuiz.id}` : "/api/quiz", {
        method: editingQuiz ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(result?.message || "فشل حفظ الاختبار");
      }

      message.success(editingQuiz ? "تم تحديث الاختبار" : "تم إنشاء الاختبار");
      closeModal();
      await fetchQuizzes(selectedCourseId);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل حفظ الاختبار");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!selectedCourseId) {
      return;
    }

    try {
      const response = await apiFetch(`/api/quiz/${quizId}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "فشل حذف الاختبار");
      }

      message.success(payload?.message || "تم حذف الاختبار");
      await fetchQuizzes(selectedCourseId);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل حذف الاختبار");
    }
  };

  const currentCourse = myCourses.find((course) => course.id === selectedCourseId);

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Card>
        <Space orientation="vertical" size={6} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>إدارة الاختبارات</Title>
          <Text type="secondary">
            من هنا يمكنك تنظيم اختبارات الدورات ومتابعة حالة خدمة Quiz.
          </Text>
          <Space wrap>
            <Tag color={health === "ok" ? "green" : health === "down" ? "red" : "blue"}>
              {health === "ok" ? "Quiz API Online" : health === "down" ? "Quiz API Offline" : "Checking Quiz API"}
            </Tag>
            {currentCourse ? <Tag color="gold">الدورة الحالية: {currentCourse.title}</Tag> : null}
          </Space>
        </Space>
      </Card>

      <Card>
        {coursesLoading ? (
          <Spin />
        ) : myCourses.length === 0 ? (
          <Alert
            type="warning"
            showIcon
            title="لا توجد دورات تملكها حاليًا"
            description="أنشئ دورة أولاً من صفحة الدورات ثم أضف لها اختبارات."
          />
        ) : (
          <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
            <Space wrap>
              <Text strong>الدورة:</Text>
              <Select
                style={{ width: 320 }}
                value={selectedCourseId}
                onChange={(value) => setSelectedCourseId(value)}
                options={myCourses.map((course) => ({ value: course.id, label: course.title }))}
              />
            </Space>

            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => {
                void fetchHealth();
                if (selectedCourseId) {
                  void fetchQuizzes(selectedCourseId);
                }
              }}>
                تحديث
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                اختبار جديد
              </Button>
            </Space>
          </Space>
        )}
      </Card>

      <Card>
        {quizzesLoading ? (
          <Spin />
        ) : quizzes.length === 0 ? (
          <Empty description="لا يوجد اختبارات في هذه الدورة" />
        ) : (
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                size="small"
                title={quiz.title}
                extra={
                  <Space>
                    <Button type="link" onClick={() => openEditModal(quiz)}>
                      تعديل
                    </Button>
                    <Popconfirm
                      title="حذف الاختبار"
                      description="هل أنت متأكد من حذف الاختبار؟"
                      okText="نعم"
                      cancelText="إلغاء"
                      onConfirm={() => handleDeleteQuiz(quiz.id)}
                    >
                      <Button type="link" danger>
                        حذف
                      </Button>
                    </Popconfirm>
                  </Space>
                }
              >
                <Space wrap>
                  <Tag color={quiz.type === "final_exam" ? "volcano" : "blue"}>
                    {quiz.type === "final_exam" ? "Final Exam" : "Quiz"}
                  </Tag>
                  <Tag color={quiz.isPublished ? "green" : "default"}>
                    {quiz.isPublished ? "Published" : "Draft"}
                  </Tag>
                  <Tag>الترتيب: {quiz.order}</Tag>
                  <Tag>النجاح: {quiz.passingScore}%</Tag>
                  <Tag>الأسئلة: {quiz.questions.length}</Tag>
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </Card>

      <Modal
        title={editingQuiz ? "تعديل الاختبار" : "إنشاء اختبار جديد"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={840}
        okText={editingQuiz ? "حفظ التعديلات" : "إنشاء"}
        cancelText="إلغاء"
      >
        <Form<QuizFormValues>
          form={form}
          layout="vertical"
          onFinish={submitQuiz}
          initialValues={{
            type: "quiz",
            order: 0,
            passingScore: 70,
            isPublished: false,
            questions: DEFAULT_QUESTIONS.map(normalizeQuestionForForm) as QuizQuestion[],
          }}
        >
          <Form.Item
            name="title"
            label="عنوان الاختبار"
            rules={[{ required: true, message: "عنوان الاختبار مطلوب" }]}
          >
            <Input placeholder="مثال: اختبار الوحدة الأولى" />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item name="type" label="نوع الاختبار" style={{ minWidth: 200 }}>
              <Select
                options={[
                  { value: "quiz", label: "Quiz" },
                  { value: "final_exam", label: "Final Exam" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="order"
              label="الترتيب"
              rules={[{ required: true, message: "الترتيب مطلوب" }]}
            >
              <InputNumber min={0} style={{ width: 160 }} />
            </Form.Item>

            <Form.Item
              name="passingScore"
              label="نسبة النجاح"
              rules={[{ required: true, message: "نسبة النجاح مطلوبة" }]}
            >
              <InputNumber min={1} max={100} style={{ width: 160 }} addonAfter="%" />
            </Form.Item>

            <Form.Item name="isPublished" label="نشر" valuePropName="checked" style={{ marginInlineStart: 12 }}>
              <Switch />
            </Form.Item>
          </Space>

          <Form.List name="questions">
            {(fields, { add, remove, move }) => (
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    title={`السؤال ${index + 1}`}
                    extra={
                      <Space>
                        <Button
                          type="text"
                          disabled={index === 0}
                          onClick={() => move(index, index - 1)}
                        >
                          ↑
                        </Button>
                        <Button
                          type="text"
                          disabled={index === fields.length - 1}
                          onClick={() => move(index, index + 1)}
                        >
                          ↓
                        </Button>
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                        >
                          حذف
                        </Button>
                      </Space>
                    }
                  >
                    <Form.Item
                      name={[field.name, "text"]}
                      label="نص السؤال"
                      rules={[{ required: true, message: "نص السؤال مطلوب" }]}
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.List name={[field.name, "options"]}>
                      {(optionFields, { add: addOption, remove: removeOption }) => (
                        <Space direction="vertical" size={8} style={{ width: "100%" }}>
                          {optionFields.map((optionField, optionIndex) => (
                            <Space key={optionField.key} style={{ width: "100%" }} align="baseline">
                              <Form.Item
                                name={optionField.name}
                                rules={[{ required: true, message: "الخيار مطلوب" }]}
                                style={{ flex: 1, marginBottom: 0 }}
                              >
                                <Input placeholder={`الخيار ${optionIndex + 1}`} />
                              </Form.Item>
                              {optionFields.length > 2 ? (
                                <Button
                                  type="text"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => removeOption(optionField.name)}
                                />
                              ) : null}
                            </Space>
                          ))}
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => addOption("")}
                          >
                            إضافة خيار
                          </Button>
                        </Space>
                      )}
                    </Form.List>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.questions?.[field.name]?.options !== currentValues.questions?.[field.name]?.options
                      }
                    >
                      {() => {
                        const optionValues = form.getFieldValue(["questions", field.name, "options"]) as string[] | undefined;
                        const checkboxOptions = (optionValues ?? []).map((option, optionIndex) => ({
                          label: option?.trim() || `الخيار ${optionIndex + 1}`,
                          value: optionIndex,
                        }));

                        return (
                          <Form.Item
                            name={[field.name, "correctIndices"]}
                            label="الإجابات الصحيحة"
                            rules={[{ required: true, message: "اختر إجابة صحيحة واحدة على الأقل" }]}
                          >
                            <Checkbox.Group options={checkboxOptions} />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>

                    <Form.Item
                      name={[field.name, "explanation"]}
                      label="الشرح (اختياري)"
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add({ text: "", options: ["", ""], correctIndices: [0] })}
                >
                  إضافة سؤال
                </Button>
              </Space>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Space>
  );
}
