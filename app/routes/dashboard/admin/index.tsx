import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface AdminStats {
	users: number;
	courses: number;
	payments: number;
}

export default function AdminDashboardHome() {
	const [stats, setStats] = useState<AdminStats>({
		users: 0,
		courses: 0,
		payments: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const loadStats = async () => {
			try {
				const response = await apiFetch("/api/users/dashboard-stats");
				const payload = (await response.json().catch(() => null)) as
					| { role?: string; stats?: AdminStats }
					| null;

				if (response.ok && payload?.role === "admin" && payload.stats && isMounted) {
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
				<Title level={4} style={{ marginBottom: 6 }}>لوحة الإدارة</Title>
				<Text type="secondary">راقب المنصة بالكامل: المستخدمين، الدورات، والنشاط العام.</Text>
			</Card>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title="المستخدمون" value={stats.users} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title="الدورات" value={stats.courses} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title="المدفوعات" value={stats.payments} />
					</Card>
				</Col>
			</Row>
		</div>
	);
}
