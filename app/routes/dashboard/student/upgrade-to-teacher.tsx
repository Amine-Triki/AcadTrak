import { App, Button, Card, Space, Typography } from "antd";
import {
  CheckCircleOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useState } from "react";
import { apiFetch } from "~/utils/api";
import { useAuth } from "~/context/auth";

const { Title, Paragraph, Text } = Typography;

export default function UpgradeToTeacherPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // ✅ إذا كان الأستاذ بالفعل، نُعيد توجيهه للـ dashboard مباشرة
  if (user?.role === "teacher") {
    navigate("/dashboard/teacher", { replace: true });
    return null;
  }

  const benefits = [
    "Create and manage your own courses",
    "Build quizzes and monitor student progress",
    "Answer course discussions as an instructor",
    "Access teacher dashboard tools instantly",
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/api/users/upgrade-to-teacher", {
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            data?: string;
            user?: {
              id: string;
              firstName?: string;
              lastName?: string;
              userName?: string;
              country?: string;
              email?: string;
              role: "student" | "teacher" | "admin";
            };
          }
        | null;

      if (!response.ok || !payload?.user) {
        throw new Error(payload?.message || payload?.data || "Failed to upgrade account");
      }

      setUser(payload.user);
      message.success(payload.message || "Your account is now a teacher account");
      navigate("/dashboard/teacher", { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Space align="center">
            <UserSwitchOutlined style={{ fontSize: 22, color: "#1677ff" }} />
            <Title level={3} style={{ margin: 0 }}>
              Upgrade to Teacher
            </Title>
          </Space>

          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Activate your teacher role to start creating courses and managing your students.
            Your current account data stays the same.
          </Paragraph>

          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Text strong>
                <TeamOutlined style={{ marginRight: 8 }} />
                What you get as a teacher
              </Text>
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {benefits.map((item) => (
                  <div key={item} style={{ paddingInline: 0 }}>
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      <span>{item}</span>
                    </Space>
                  </div>
                ))}
              </Space>
            </Space>
          </Card>

          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={() => void handleUpgrade()}
            icon={<UserSwitchOutlined />}
          >
            Upgrade My Account to Teacher
          </Button>
        </Space>
      </Card>
    </div>
  );
}
