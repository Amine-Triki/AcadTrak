import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface TeacherStats {
	myCourses: number;
	enrolledStudents: number;
	publishedQuizzes: number;
}

export default function TeacherDashboardHome() {
	const [stats, setStats] = useState<TeacherStats>({
		myCourses: 0,
		enrolledStudents: 0,
		publishedQuizzes: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const loadStats = async () => {
			try {
				const response = await apiFetch("/api/users/dashboard-stats");
				const payload = (await response.json().catch(() => null)) as
					| { role?: string; stats?: TeacherStats }
					| null;

				if (response.ok && payload?.role === "teacher" && payload.stats && isMounted) {
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
				<Title level={4} style={{ marginBottom: 6 }}>لوحة الأستاذ</Title>
				<Text type="secondary">أنشئ دوراتك وتابع تفاعل الطلاب مع المحتوى والاختبارات.</Text>
			</Card>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title="دوراتي" value={stats.myCourses} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title="طلاب مسجلون" value={stats.enrolledStudents} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title="اختبارات منشورة" value={stats.publishedQuizzes} />
					</Card>
				</Col>
			</Row>
		</div>
	);
}
