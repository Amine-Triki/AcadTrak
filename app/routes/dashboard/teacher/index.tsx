import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function TeacherDashboardHome() {
	return (
		<Card>
			<Title level={4}>لوحة الأستاذ</Title>
			<Text type="secondary">مرحبًا بك في لوحة تحكم الأستاذ.</Text>
		</Card>
	);
}
