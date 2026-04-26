import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { App, Alert, Button, Card, Checkbox, Form, Radio, Space, Spin, Typography, Result } from "antd";
import type { CheckboxValueType, RadioChangeEvent } from "antd";
import { ReloadOutlined, TrophyOutlined } from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text, Paragraph } = Typography;

interface QuizQuestion {
  text: string;
  options: string[];
  allowMultipleAnswers?: boolean;
  explanation?: string;
}

interface QuizItem {
  id: string;
  title: string;
  type: "quiz" | "final_exam";
  order: number;
  passingScore: number;
  questions: QuizQuestion[];
}

interface QuizResult {
  questionIndex: number;
  chosenIndices: number[];
  isCorrect: boolean;
  correctIndices?: number[];
  explanation?: string;
}

export default function StudentCourseQuizPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.courseId;
  const quizId = params.quizId;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    results: QuizResult[];
    certificateIssued?: boolean;
    message?: string;
  } | null>(null);

  const fetchQuiz = async () => {
    if (!courseId || !quizId) {
      setLoading(false);
      message.error("بيانات الاختبار غير مكتملة");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch(`/api/quiz/course/${courseId}`);
      const payload = (await response.json().catch(() => null)) as
        | { quizzes?: QuizItem[]; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "فشل تحميل الاختبار");
      }

      const foundQuiz = payload?.quizzes?.find((item) => item.id === quizId);
      if (!foundQuiz) {
        throw new Error("الاختبار غير موجود أو غير متاح لك");
      }

      setQuiz(foundQuiz);
      setAnswers(Array.from({ length: foundQuiz.questions.length }, () => []));
      setResult(null);
      form.resetFields();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل تحميل الاختبار");
      navigate(`/dashboard/student/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchQuiz();
  }, [courseId, quizId]);

  const canSubmit = useMemo(() => quiz && answers.every((answer) => answer.length > 0), [answers, quiz]);

  const handleSingleAnswerChange = (questionIndex: number, value: number) => {
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = [value];
      return next;
    });
  };

  const handleMultipleAnswerChange = (questionIndex: number, values: CheckboxValueType[]) => {
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = values.filter((value): value is number => typeof value === "number");
      return next;
    });
  };

  const submitQuiz = async () => {
    if (!quizId || !quiz) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; score?: number; passed?: boolean; results?: QuizResult[]; certificateIssued?: boolean }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "فشل إرسال الإجابات");
      }

      setResult({
        score: payload?.score ?? 0,
        passed: Boolean(payload?.passed),
        results: payload?.results ?? [],
        certificateIssued: payload?.certificateIssued,
        message: payload?.message,
      });

      message.success(payload?.message || "تم تسليم الاختبار بنجاح");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "فشل إرسال الإجابات");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 32 }}>
        <Spin />
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Card>
        <Space orientation="vertical" size={8} style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>{quiz.title}</Title>
          <Text type="secondary">
            {quiz.type === "final_exam" ? "اختبار نهائي" : "Quiz"} • نسبة النجاح {quiz.passingScore}%
          </Text>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void fetchQuiz()}>
              تحديث
            </Button>
            <Button onClick={() => navigate(`/dashboard/student/courses/${courseId}`)}>
              رجوع للدورة
            </Button>
          </Space>
        </Space>
      </Card>

      {result ? (
        result.certificateIssued ? (
          // ✅ شهادة جديدة — احتفال كامل
          <Result
            icon={<TrophyOutlined style={{ color: "#faad14" }} />}
            status="success"
            title={`🎓 تهانينا! اجتزت الاختبار النهائي بنسبة ${result.score}%`}
            subTitle="تم إصدار شهادتك تلقائياً — يمكنك رؤيتها في صفحة درجاتي"
            extra={[
              <Button
                type="primary"
                key="grades"
                href="/dashboard/student/grades"
              >
                عرض شهادتي 🏆
              </Button>,
              <Button
                key="course"
                onClick={() => navigate(`/dashboard/student/courses/${courseId}`)}
              >
                رجوع للدورة
              </Button>,
            ]}
          />
        ) : (
          <Alert
            type={result.passed ? "success" : "warning"}
            showIcon
            title={result.passed ? `نجحت بنسبة ${result.score}%` : `لم تنجح. نتيجتك ${result.score}%`}
            description={
              result.passed
                ? "يمكنك الآن متابعة المحتوى التالي."
                : "راجع الإجابات وحاول مرة أخرى إذا سمح الأستاذ بذلك."
            }
          />
        )
      ) : null}

      <Card>
        <Form layout="vertical" onFinish={submitQuiz}>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            {quiz.questions.map((question, questionIndex) => (
              <Card key={`${questionIndex}-${question.text}`} size="small" title={`السؤال ${questionIndex + 1}`}>
                <Paragraph style={{ marginBottom: 16 }}>{question.text}</Paragraph>
                {question.allowMultipleAnswers ? (
                  <Checkbox.Group
                    style={{ width: "100%" }}
                    value={answers[questionIndex]}
                    onChange={(values) => handleMultipleAnswerChange(questionIndex, values)}
                  >
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      {question.options.map((option, optionIndex) => (
                        <Checkbox key={optionIndex} value={optionIndex}>
                          {option}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                ) : (
                  <Radio.Group
                    style={{ width: "100%" }}
                    value={answers[questionIndex]?.[0] ?? -1}
                    onChange={(event: RadioChangeEvent) => handleSingleAnswerChange(questionIndex, event.target.value)}
                  >
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      {question.options.map((option, optionIndex) => (
                        <Radio key={optionIndex} value={optionIndex}>
                          {option}
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                )}
              </Card>
            ))}

            <Button type="primary" htmlType="submit" loading={submitting} disabled={!canSubmit}>
              إرسال الاختبار
            </Button>
          </Space>
        </Form>
      </Card>

      {result ? (
        <Card title="تفاصيل الإجابات">
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            {result.results.map((item, index) => (
              <Alert
                key={index}
                type={item.isCorrect ? "success" : "error"}
                showIcon
                title={`السؤال ${index + 1}: ${item.isCorrect ? "إجابة صحيحة" : "إجابة خاطئة"}`}
                description={item.explanation || ""}
              />
            ))}
          </Space>
        </Card>
      ) : null}
    </Space>
  );
}