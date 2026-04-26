import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, Col, Row, Statistic, Typography, Divider } from "antd";
import {
  BookOutlined, SafetyCertificateOutlined,
  TeamOutlined, FileTextOutlined, ReadOutlined,
} from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface TeacherStats {
	myCourses: number;
	enrolledStudents: number;
	publishedQuizzes: number;
	enrolledAsStudent?: number;
	certificates?: number;
}

export default function TeacherDashboardHome() {
	const [stats, setStats] = useState<TeacherStats>({
		myCourses: 0,
		enrolledStudents: 0,
		publishedQuizzes: 0,
		enrolledAsStudent: 0,
		certificates: 0,
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

			{/* إحصائيات كأستاذ */}
			<Text strong style={{ fontSize: 15 }}>كأستاذ</Text>
			<Row gutter={[16, 16]}>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title="دوراتي" value={stats.myCourses} prefix={<BookOutlined />} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title="طلاب مسجلون" value={stats.enrolledStudents} prefix={<TeamOutlined />} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title="اختبارات منشورة" value={stats.publishedQuizzes} prefix={<FileTextOutlined />} />
					</Card>
				</Col>
			</Row>

			{/* إحصائيات كطالب (إذا مسجل في دورات) */}
			{((stats.enrolledAsStudent ?? 0) > 0 || (stats.certificates ?? 0) > 0) && (
				<>
					<Divider />
					<Text strong style={{ fontSize: 15 }}>كطالب في دورات أخرى</Text>
					<Row gutter={[16, 16]}>
						<Col xs={24} md={12}>
							<Card loading={loading}>
								<Statistic
									title="دورات مسجل فيها"
									value={stats.enrolledAsStudent}
									prefix={<ReadOutlined />}
								/>
								<Link to="/dashboard/student/courses" style={{ fontSize: 12 }}>
									عرض دوراتي ←
								</Link>
							</Card>
						</Col>
						<Col xs={24} md={12}>
							<Card loading={loading}>
								<Statistic
									title="شهاداتي"
									value={stats.certificates}
									prefix={<SafetyCertificateOutlined style={{ color: "#faad14" }} />}
								/>
								<Link to="/dashboard/student/grades" style={{ fontSize: 12 }}>
									عرض الشهادات ←
								</Link>
							</Card>
						</Col>
					</Row>
				</>
			)}
		</div>
	);
}
