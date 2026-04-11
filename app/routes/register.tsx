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

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const handleRegister = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      // ستُستبدل بـ API call لاحقاً
      await new Promise((r) => setTimeout(r, 800));

      // الحساب الجديد = student دائماً
      setUser({
        id: Date.now().toString(),
        name: `${values.firstName} ${values.lastName}`,
        role: "student",
        token: "new-token",
      });

      message.success("تم إنشاء حسابك بنجاح!");
      navigate("/dashboard/student");

    } catch {
      message.error("حدث خطأ أثناء التسجيل، حاول مرة أخرى");
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
            إنشاء حساب جديد
          </Title>
          <Text type="secondary">انضم إلى AcadTrak مجاناً</Text>
        </div>

        {/* ── تنبيه الدور ── */}
        <Alert
          message="الحساب الجديد يكون طالباً تلقائياً — يمكن الترقية لاحقاً"
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
          {/* الاسم — سطرين جنباً لجنب */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="firstName"
              label="الاسم الأول"
              rules={[{ required: true, message: "مطلوب" }]}
              style={{ marginBottom: 16 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="علي"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="اسم العائلة"
              rules={[{ required: true, message: "مطلوب" }]}
              style={{ marginBottom: 16 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="محمد"
                size="large"
              />
            </Form.Item>
          </div>

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

          {/* كلمة المرور — سطرين جنباً لجنب */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="password"
              label="كلمة المرور"
              rules={[
                { required: true, message: "مطلوبة" },
                { min: 6, message: "6 أحرف على الأقل" },
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
              label="تأكيد كلمة المرور"
              dependencies={["password"]}
              rules={[
                { required: true, message: "مطلوب" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("كلمتا المرور غير متطابقتين");
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
              إنشاء الحساب
            </Button>
          </Form.Item>
        </Form>

        {/* ── روابط ── */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Text type="secondary">لديك حساب بالفعل؟ </Text>
          <Link to="/login" style={{ color: "#4f46e5", fontWeight: 500 }}>
            سجّل دخولك
          </Link>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/" style={{ color: "#4f46e5" }}>
            العودة للرئيسية
          </Link>
        </div>
      </Card>
    </div>
  );
}