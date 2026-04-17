import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function AdminUsersPage() {
	return (
		<Card>
			<Title level={4}>المستخدمون</Title>
			<Text type="secondary">إدارة المستخدمين ستضاف هنا.</Text>
		</Card>
	);
}
