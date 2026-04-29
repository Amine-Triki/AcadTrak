import { App, Button, Card, Space, Typography } from "antd";
import {
  CheckCircleOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "~/utils/api";
import { useAuth } from "~/context/auth";

const { Title, Paragraph, Text } = Typography;

export default function UpgradeToTeacherPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "teacher") {
      navigate("/dashboard/teacher", { replace: true });
    }
  }, [navigate, user?.role]);

  if (user?.role === "teacher") {
    return null;
  }

  const benefits = [
    t("upgradeToTeacher.benefits.createCourses"),
    t("upgradeToTeacher.benefits.buildQuizzes"),
    t("upgradeToTeacher.benefits.answerDiscussions"),
    t("upgradeToTeacher.benefits.accessTools"),
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
        throw new Error(payload?.message || payload?.data || t("upgradeToTeacher.errors.failedUpgrade"));
      }

      setUser(payload.user);
      message.success(payload.message || t("upgradeToTeacher.messages.success"));
      navigate("/dashboard/teacher", { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("upgradeToTeacher.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <Card>
        <Space orientation="vertical" size={20} style={{ width: "100%" }}>
          <Space align="center">
            <UserSwitchOutlined style={{ fontSize: 22, color: "#1677ff" }} />
            <Title level={3} style={{ margin: 0 }}>
              {t("upgradeToTeacher.title")}
            </Title>
          </Space>

          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t("upgradeToTeacher.subtitle")}
          </Paragraph>

          <Card size="small" styles={{ body: { padding: 16 } }}>
            <Space orientation="vertical" size={10} style={{ width: "100%" }}>
              <Text strong>
                <TeamOutlined style={{ marginRight: 8 }} />
                {t("upgradeToTeacher.benefitsTitle")}
              </Text>
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
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
            {t("upgradeToTeacher.cta")}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
