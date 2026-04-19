import { Card, Col, Row, Statistic, Typography } from "antd";

const { Title, Text } = Typography;

export default function StudentDashboardHome() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <Title level={4} style={{ marginBottom: 6 }}>لوحة الطالب</Title>
        <Text type="secondary">تابع تقدّمك، دروسك، ونتائج اختباراتك من مكان واحد.</Text>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="الدورات المسجّلة" value={0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="الدروس المكتملة" value={0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="الشهادات" value={0} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
