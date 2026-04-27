import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface AdminStats {
	users: number;
	courses: number;
	payments: number;
	paymentsByStatus: {
		pending: number;
		success: number;
		failed: number;
		expired: number;
	};
}

export default function AdminDashboardHome() {
	const { t } = useTranslation();
	const [stats, setStats] = useState<AdminStats>({
		users: 0,
		courses: 0,
		payments: 0,
		paymentsByStatus: {
			pending: 0,
			success: 0,
			failed: 0,
			expired: 0,
		},
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const loadStats = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/api/users/dashboard-stats`, {
					credentials: "include",
				});
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
				<Title level={4} style={{ marginBottom: 6 }}>{t("adminDashboard.title")}</Title>
				<Text type="secondary">{t("adminDashboard.subtitle")}</Text>
			</Card>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title={t("adminDashboard.users")} value={stats.users} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title={t("adminDashboard.totalCourses")} value={stats.courses} />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card loading={loading}>
						<Statistic title={t("adminDashboard.totalPayments")} value={stats.payments} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card loading={loading}>
						<Statistic title={t("adminDashboard.successPayments")} value={stats.paymentsByStatus.success} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card loading={loading}>
						<Statistic title={t("adminDashboard.pendingPayments")} value={stats.paymentsByStatus.pending} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card loading={loading}>
						<Statistic title={t("adminDashboard.failedPayments")} value={stats.paymentsByStatus.failed} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card loading={loading}>
						<Statistic title={t("adminDashboard.expiredPayments")} value={stats.paymentsByStatus.expired} />
					</Card>
				</Col>
			</Row>
		</div>
	);
}
