import { Link, useNavigate } from "react-router";
import {
  Form, Input, Button, Card,
  Typography, Alert, App, Space,
} from "antd";
import {
  MailOutlined, LockOutlined,
  UserOutlined, BookOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "~/context/auth";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const handleRegister = async (values: {
    firstName: string;
    lastName: string;
    userName: string;
    country: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await apiFetch("/api/users/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          userName: values.userName,
          country: values.country,
          email: values.email,
          password: values.password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            data?: string;
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
        throw new Error(payload?.message || payload?.data || t("register.errors.failedCreate"));
      }

      setUser(payload.user);

      message.success(t("register.messages.success"));
      navigate("/dashboard/student");

    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("register.errors.generic");
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
        style={{ width: "100%", maxWidth: 460 }}
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
            {t("register.title")}
          </Title>
          <Text type="secondary">{t("register.subtitle")}</Text>
        </div>

        {/* ── Role Notice ── */}
        <Alert
          title={t("register.notice.title")}
          description={t("register.notice.description")}
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        {/* ── Form ── */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          requiredMark={false}
        >
          {/* First and last name side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="firstName"
              label={t("register.form.firstName")}
              rules={[{ required: true, message: t("register.form.required") }]}
              style={{ marginBottom: 16 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Ali"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              label={t("register.form.lastName")}
              rules={[{ required: true, message: t("register.form.required") }]}
              style={{ marginBottom: 16 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Mohamed"
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="userName"
            label={t("register.form.username")}
            rules={[
              { required: true, message: t("register.form.usernameRequired") },
              { min: 3, message: t("register.form.min3") },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="ali123"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="country"
            label={t("register.form.country")}
            rules={[{ required: true, message: t("register.form.countryRequired") }]}
          >
            <Input placeholder={t("register.form.countryPlaceholder")} size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label={t("register.form.email")}
            rules={[
              { required: true, message: t("register.form.emailRequired") },
              { type: "email", message: t("register.form.emailInvalid") },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="example@email.com"
              size="large"
            />
          </Form.Item>

          {/* Password and confirmation side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="password"
              label={t("register.form.password")}
              rules={[
                { required: true, message: t("register.form.required") },
                { min: 8, message: t("register.form.min8") },
                {
                  pattern: /[a-z]/,
                  message: t("register.form.passwordLower"),
                },
                {
                  pattern: /[A-Z]/,
                  message: t("register.form.passwordUpper"),
                },
                {
                  pattern: /[0-9]/,
                  message: t("register.form.passwordDigit"),
                },
              ]}
              style={{ marginBottom: 16 }}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={t("register.form.confirmPassword")}
              dependencies={["password"]}
              rules={[
                { required: true, message: t("register.form.required") },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t("register.form.passwordMismatch")));
                  },
                }),
              ]}
              style={{ marginBottom: 16 }}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••"
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
            >
              {t("register.form.submit")}
            </Button>
          </Form.Item>
        </Form>

        {/* ── Links ── */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Text type="secondary">{t("register.links.alreadyHaveAccount")} </Text>
          <Link to="/login" style={{ color: "#4f46e5", fontWeight: 500 }}>
            {t("register.links.signIn")}
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