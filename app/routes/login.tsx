import { Link, useNavigate, useLocation } from "react-router";
import {
  Form, Input, Button, Card,
  Typography, App, Space,
} from "antd";
import {
  UserOutlined, LockOutlined, BookOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "~/context/auth";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

const REDIRECT_MAP: Record<string, string> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  admin:   "/dashboard/admin",
};

export default function LoginPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  // If the user comes from a protected page, redirect back after login.
  const from = (location.state as { from?: string })?.from;

  const handleLogin = async (values: { identifier: string; password: string }) => {
    try {
      const response = await apiFetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            user?: {
              id: string;
              firstName: string;
              lastName: string;
              userName: string;
              country: string;
              email: string;
              role: "student" | "teacher" | "admin";
            };
          }
        | null;

      if (!response.ok || !payload?.user) {
        throw new Error(payload?.message || t("login.errors.invalidCredentials"));
      }

      const userName = `${payload.user.firstName} ${payload.user.lastName}`.trim();
      setUser(payload.user);
      message.success(t("login.messages.welcomeBack", { userName }));
      navigate(from ?? REDIRECT_MAP[payload.user.role] ?? "/");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("login.errors.invalidCredentials");
      message.error(errorMessage);
    }
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
            {t("login.title")}
          </Title>
          <Text type="secondary">{t("login.subtitle")}</Text>
        </div>

        {/* ── Form ── */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          requiredMark={false}
        >
          <Form.Item
            name="identifier"
            label={t("login.form.identifierLabel")}
            rules={[
              { required: true, message: t("login.form.identifierRequired") },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("login.form.identifierPlaceholder")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t("login.form.passwordLabel")}
            rules={[{ required: true, message: t("login.form.passwordRequired") }]}
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
              {t("login.form.submit")}
            </Button>
          </Form.Item>
        </Form>

        {/* ── Links ── */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Text type="secondary">{t("login.links.noAccount")} </Text>
          <Link to="/register" style={{ color: "#4f46e5", fontWeight: 500 }}>
            {t("login.links.createNow")}
          </Link>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/" style={{ color: "#4f46e5" }}>
            {t("common.home")}
          </Link>
        </div>

      </Card>
    </div>
  );
}