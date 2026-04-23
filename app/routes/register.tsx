import { Link, useNavigate } from "react-router";
import {
  Form, Input, Button, Card,
  Typography, Alert, App, Space,
} from "antd";
import {
  MailOutlined, LockOutlined,
  UserOutlined, BookOutlined,
} from "@ant-design/icons";
import { useAuth } from "~/context/auth";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

export default function RegisterPage() {
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
        throw new Error(payload?.message || payload?.data || "Failed to create account");
      }

      setUser(payload.user);

      message.success("Your account has been created successfully!");
      navigate("/dashboard/student");

    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during registration. Please try again.";
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
            Create a New Account
          </Title>
          <Text type="secondary">Join AcadTrak for free</Text>
        </div>

        {/* ── Role Notice ── */}
        <Alert
          title="New accounts are assigned as Student by default"
          description="You can upgrade later."
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
              label="First Name"
              rules={[{ required: true, message: "Required" }]}
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
              label="Last Name"
              rules={[{ required: true, message: "Required" }]}
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
            label="Username"
            rules={[
              { required: true, message: "Username is required" },
              { min: 3, message: "At least 3 characters" },
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
            label="Country"
            rules={[{ required: true, message: "Country is required" }]}
          >
            <Input placeholder="Algeria" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email format" },
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
              label="Password"
              rules={[
                { required: true, message: "Required" },
                { min: 8, message: "At least 8 characters" },
                {
                  pattern: /[a-z]/,
                  message: "Must contain at least one lowercase letter (a-z)",
                },
                {
                  pattern: /[A-Z]/,
                  message: "Must contain at least one uppercase letter (A-Z)",
                },
                {
                  pattern: /[0-9]/,
                  message: "Must contain at least one digit (0-9)",
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
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Required" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("Passwords do not match");
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
              Create Account
            </Button>
          </Form.Item>
        </Form>

        {/* ── Links ── */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Text type="secondary">Already have an account? </Text>
          <Link to="/login" style={{ color: "#4f46e5", fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/" style={{ color: "#4f46e5" }}>
            Back to Home
          </Link>
        </div>
      </Card>
    </div>
  );
}