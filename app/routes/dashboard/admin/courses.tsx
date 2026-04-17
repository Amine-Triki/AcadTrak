import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function AdminCoursesPage() {
	return (
		<Card>
			<Title level={4}>الكورسات</Title>
			<Text type="secondary">إدارة الكورسات للإدارة ستضاف هنا.</Text>
		</Card>
	);
}
