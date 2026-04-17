import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function StudentGradesPage() {
	return (
		<Card>
			<Title level={4}>الدرجات</Title>
			<Text type="secondary">لا توجد درجات لعرضها حاليا.</Text>
		</Card>
	);
}
