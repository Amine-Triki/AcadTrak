import { Card, Col, Row, Statistic, Typography } from "antd";

const { Title, Text } = Typography;

export default function TeacherDashboardHome() {
	return (
		<div style={{ display: "grid", gap: 16 }}>
			<Card>
				<Title level={4} style={{ marginBottom: 6 }}>لوحة الأستاذ</Title>
				<Text type="secondary">أنشئ دوراتك وتابع تفاعل الطلاب مع المحتوى والاختبارات.</Text>
			</Card>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8}>
					<Card>
						<Statistic title="دوراتي" value={0} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card>
						<Statistic title="طلاب مسجلون" value={0} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card>
						<Statistic title="اختبارات منشورة" value={0} />
					</Card>
				</Col>
			</Row>
		</div>
	);
}
