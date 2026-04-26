import { useEffect, useState } from "react";
import { App, Button, Card, Empty, Space, Spin, Table, Tag, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
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
				throw new Error(payload?.message || "فشل تحميل الطلاب");
			}

			setStudents(payload?.students ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "فشل تحميل الطلاب");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchStudents();
	}, []);

	const columns = [
		{
			title: "الطالب",
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
			title: "التواصل",
			dataIndex: "email",
			key: "email",
			render: (value: string) => <Text>{value}</Text>,
		},
		{
			title: "الدورة",
			dataIndex: "courseTitle",
			key: "courseTitle",
			render: (value: string) => <Tag color="blue">{value}</Tag>,
		},
		{
			title: "المدفوع",
			dataIndex: "paidPrice",
			key: "paidPrice",
			render: (value: number) => <Text strong>{value} USD</Text>,
		},
		{
			title: "الكوبون",
			dataIndex: "couponCode",
			key: "couponCode",
			render: (value?: string) => (value ? <Tag color="gold">{value}</Tag> : <Text type="secondary">—</Text>),
		},
		{
			title: "تاريخ التسجيل",
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
						<Title level={4} style={{ margin: 0 }}>الطلاب</Title>
						<Text type="secondary">قائمة الطلاب المسجلين في دوراتك</Text>
					</div>
					<Button icon={<ReloadOutlined />} onClick={() => void fetchStudents()}>
						تحديث
					</Button>
				</Space>
			</Card>

			<Card>
				{loading ? (
					<div style={{ textAlign: "center", padding: 24 }}>
						<Spin />
					</div>
				) : students.length === 0 ? (
					<Empty description="لا يوجد طلاب مسجلين حالياً" />
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
