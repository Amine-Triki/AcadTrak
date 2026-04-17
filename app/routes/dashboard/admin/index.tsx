import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function AdminDashboardHome() {
	return (
		<Card>
			<Title level={4}>لوحة الإدارة</Title>
			<Text type="secondary">مرحبًا بك في لوحة تحكم الإدارة.</Text>
		</Card>
	);
}
