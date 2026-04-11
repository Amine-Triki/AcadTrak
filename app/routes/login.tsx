import { Link, useNavigate, useLocation } from "react-router";
import {
  Form, Input, Button, Card,
  Typography, Divider, Tag, App, Space,
} from "antd";
import {
  MailOutlined, LockOutlined, BookOutlined,
} from "@ant-design/icons";
import { useAuth } from "~/context/auth";

const { Title, Text } = Typography;

// ━━━━━━━━━━━━━━━━━━━━━━━━
// مؤقت — تُحذف عند ربط API
// ━━━━━━━━━━━━━━━━━━━━━━━━
async function fakeLogin(email: string, password: string) {
  await new Promise((r) => setTimeout(r, 600)); // محاكاة تأخير
  if (email === "student@test.com" && password === "123456")
    return { id: "1", name: "علي محمد",   role: "student" as const, token: "tok1" };
  if (email === "teacher@test.com" && password === "123456")
    return { id: "2", name: "أحمد سالم",  role: "teacher" as const, token: "tok2" };
  if (email === "admin@test.com"   && password === "123456")
    return { id: "3", name: "سارة يوسف", role: "admin"   as const, token: "tok3" };
  throw new Error("بيانات خاطئة");
}

const DEMO_ACCOUNTS = [
  { email: "student@test.com", label: "طالب" },
  { email: "teacher@test.com", label: "أستاذ" },
  { email: "admin@test.com",   label: "مسؤول" },
];

const REDIRECT_MAP: Record<string, string> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  admin:   "/dashboard/admin",
};

export default function LoginPage() {
  const [form] = Form.useForm();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  // إذا جاء من صفحة محمية — يرجع إليها بعد الدخول
  const from = (location.state as { from?: string })?.from;

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const res = await fakeLogin(values.email, values.password);
      setUser({ id: res.id, name: res.name, role: res.role, token: res.token });
      message.success(`أهلاً ${res.name} 👋`);
      navigate(from ?? REDIRECT_MAP[res.role] ?? "/");
    } catch {
      message.error("البريد الإلكتروني أو كلمة المرور خاطئة");
    }
  };

  // ملء بيانات الحساب التجريبي بضغطة واحدة
  const fillDemo = (email: string) => {
    form.setFieldsValue({ email, password: "123456" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "#f5f5f5",
      }}
    >
      <Card
        style={{ width: "100%", maxWidth: 420 }}
        styles={{ body: { padding: "32px 28px" } }}
      >
        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Space align="center">
            <BookOutlined style={{ fontSize: 28, color: "#4f46e5" }} />
            <Title level={3} style={{ margin: 0, color: "#4f46e5" }}>
              AcadTrak
            </Title>
          </Space>
          <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
            أهلاً بعودتك
          </Title>
          <Text type="secondary">سجّل دخولك للمتابعة</Text>
        </div>

        {/* ── Form ── */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[
              { required: true, message: "أدخل بريدك الإلكتروني" },
              { type: "email", message: "صيغة البريد غير صحيحة" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="example@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="كلمة المرور"
            rules={[{ required: true, message: "أدخل كلمة المرور" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
            >
              تسجيل الدخول
            </Button>
          </Form.Item>
        </Form>

        {/* ── روابط ── */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Text type="secondary">ليس لديك حساب؟ </Text>
          <Link to="/register" style={{ color: "#4f46e5", fontWeight: 500 }}>
            أنشئ حساباً الآن
          </Link>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/" style={{ color: "#4f46e5" }}>
            العودة للرئيسية
          </Link>
        </div>

        {/* ── حسابات تجريبية ── */}
        <Divider plain>
          <Text type="secondary" style={{ fontSize: 12 }}>
            حسابات تجريبية (كلمة المرور: 123456)
          </Text>
        </Divider>
        <Space wrap style={{ justifyContent: "center", width: "100%" }}>
          {DEMO_ACCOUNTS.map((acc) => (
            <Tag
              key={acc.email}
              color="purple"
              style={{ cursor: "pointer", padding: "4px 10px" }}
              onClick={() => fillDemo(acc.email)}
            >
              {acc.label}
            </Tag>
          ))}
        </Space>
      </Card>
    </div>
  );
}