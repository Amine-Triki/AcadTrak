import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface StudentStats {
  enrolledCourses: number;
  completedAssessments: number;
  certificates: number;
}

export default function StudentDashboardHome() {
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    completedAssessments: 0,
    certificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const response = await apiFetch("/api/users/dashboard-stats");
        const payload = (await response.json().catch(() => null)) as
          | { role?: string; stats?: StudentStats }
          | null;

        if (response.ok && payload?.role === "student" && payload.stats && isMounted) {
          setStats(payload.stats);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <Title level={4} style={{ marginBottom: 6 }}>لوحة الطالب</Title>
        <Text type="secondary">تابع تقدّمك، دروسك، ونتائج اختباراتك من مكان واحد.</Text>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="الدورات المسجّلة" value={stats.enrolledCourses} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="الاختبارات المنجزة" value={stats.completedAssessments} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="الشهادات" value={stats.certificates} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
