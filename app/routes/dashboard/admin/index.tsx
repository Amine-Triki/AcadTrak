import { Card, Col, Row, Statistic, Typography } from "antd";

const { Title, Text } = Typography;

export default function AdminDashboardHome() {
	return (
		<div style={{ display: "grid", gap: 16 }}>
			<Card>
				<Title level={4} style={{ marginBottom: 6 }}>لوحة الإدارة</Title>
				<Text type="secondary">راقب المنصة بالكامل: المستخدمين، الدورات، والنشاط العام.</Text>
			</Card>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8}>
					<Card>
						<Statistic title="المستخدمون" value={0} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card>
						<Statistic title="الدورات" value={0} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card>
						<Statistic title="المدفوعات" value={0} />
					</Card>
				</Col>
			</Row>
		</div>
	);
}
