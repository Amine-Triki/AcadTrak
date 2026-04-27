import { useEffect, useState } from "react";
import { App, Button, Card, Empty, Space, Spin, Table, Tag, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface TeacherStudentItem {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  country: string;
  role: string;
  courseId: string;
  courseTitle: string;
  paidPrice: number;
  couponCode?: string;
  enrolledAt: string;
}

export default function TeacherStudentsPage() {
	const { t } = useTranslation();
	const { message } = App.useApp();
	const [loading, setLoading] = useState(true);
	const [students, setStudents] = useState<TeacherStudentItem[]>([]);

	const fetchStudents = async () => {
		setLoading(true);
		try {
			const response = await apiFetch("/api/enrollments/teacher/students");
			const payload = (await response.json().catch(() => null)) as
				| { students?: TeacherStudentItem[]; message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || t("teacherStudents.errors.failedLoadStudents"));
			}

			setStudents(payload?.students ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : t("teacherStudents.errors.failedLoadStudents"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchStudents();
	}, []);

	const columns = [
		{
			title: t("teacherStudents.table.student"),
			dataIndex: "fullName",
			key: "fullName",
			render: (_: unknown, record: TeacherStudentItem) => (
				<Space orientation="vertical" size={0}>
					<Text strong>{`${record.firstName} ${record.lastName}`.trim() || record.userName}</Text>
					<Text type="secondary">@{record.userName}</Text>
				</Space>
			),
		},
		{
			title: t("teacherStudents.table.contact"),
			dataIndex: "email",
			key: "email",
			render: (value: string) => <Text>{value}</Text>,
		},
		{
			title: t("teacherStudents.table.course"),
			dataIndex: "courseTitle",
			key: "courseTitle",
			render: (value: string) => <Tag color="blue">{value}</Tag>,
		},
		{
			title: t("teacherStudents.table.paid"),
			dataIndex: "paidPrice",
			key: "paidPrice",
			render: (value: number) => <Text strong>{value} USD</Text>,
		},
		{
			title: t("teacherStudents.table.coupon"),
			dataIndex: "couponCode",
			key: "couponCode",
			render: (value?: string) => (value ? <Tag color="gold">{value}</Tag> : <Text type="secondary">{t("teacherStudents.none")}</Text>),
		},
		{
			title: t("teacherStudents.table.enrolledAt"),
			dataIndex: "enrolledAt",
			key: "enrolledAt",
			render: (value: string) => new Date(value).toLocaleDateString(),
		},
	];

	return (
		<Space orientation="vertical" size={16} style={{ width: "100%" }}>
			<Card>
				<Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
					<div>
						<Title level={4} style={{ margin: 0 }}>{t("teacherStudents.title")}</Title>
						<Text type="secondary">{t("teacherStudents.subtitle")}</Text>
					</div>
					<Button icon={<ReloadOutlined />} onClick={() => void fetchStudents()}>
						{t("teacherStudents.actions.refresh")}
					</Button>
				</Space>
			</Card>

			<Card>
				{loading ? (
					<div style={{ textAlign: "center", padding: 24 }}>
						<Spin />
					</div>
				) : students.length === 0 ? (
					<Empty description={t("teacherStudents.empty")} />
				) : (
					<Table
						rowKey={(record) => `${record.id}-${record.courseId}-${record.enrolledAt}`}
						columns={columns}
						dataSource={students}
						pagination={{ pageSize: 10 }}
					/>
				)}
			</Card>
		</Space>
	);
}
