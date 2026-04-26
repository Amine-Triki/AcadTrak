import { useEffect, useState } from "react";
import {
	App,
	Button,
	Card,
	Popconfirm,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, ReloadOutlined } from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

type CourseRow = {
	id: string;
	title: string;
	type: "free" | "paid";
	status: "draft" | "published";
	price: number;
	isHidden: boolean;
	category?: string;
	categoryDetails?: { id: string; name: string; slug?: string };
	instructorDetails?: { id: string; name: string; userName?: string };
};

export default function AdminCoursesPage() {
	const { message } = App.useApp();
	const [loading, setLoading] = useState(false);
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
	const [rows, setRows] = useState<CourseRow[]>([]);

	const fetchCourses = async () => {
		setLoading(true);
		try {
			const response = await apiFetch("/api/courses");
			const payload = (await response.json().catch(() => null)) as
				| { courses?: CourseRow[]; message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || "Failed to load courses");
			}

			setRows(payload?.courses ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "Failed to load courses");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchCourses();
	}, []);

	const removeCourse = async (courseId: string) => {
		setActionLoadingId(courseId);
		try {
			const response = await apiFetch(`/api/courses/${courseId}`, { method: "DELETE" });
			const payload = (await response.json().catch(() => null)) as { message?: string } | null;

			if (!response.ok) {
				throw new Error(payload?.message || "Action failed");
			}

			message.success(payload?.message || "Done");
			await fetchCourses();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "Action failed");
		} finally {
			setActionLoadingId(null);
		}
	};

	const columns: ColumnsType<CourseRow> = [
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			ellipsis: true,
		},
		{
			title: "Instructor",
			key: "instructor",
			render: (_, row) => row.instructorDetails?.name || "-",
		},
		{
			title: "Category",
			key: "category",
			render: (_, row) => row.categoryDetails?.name || row.category || "-",
		},
		{
			title: "Type",
			dataIndex: "type",
			key: "type",
			render: (type: CourseRow["type"]) => (
				<Tag color={type === "paid" ? "gold" : "green"}>{type.toUpperCase()}</Tag>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: CourseRow["status"]) => (
				<Tag color={status === "published" ? "blue" : "default"}>{status}</Tag>
			),
		},
		{
			title: "Visibility",
			key: "visibility",
			render: (_, row) =>
				row.isHidden ? (
					<Tag icon={<EyeInvisibleOutlined />} color="volcano">Hidden</Tag>
				) : (
					<Tag icon={<EyeOutlined />} color="success">Visible</Tag>
				),
		},
		{
			title: "Price",
			key: "price",
			render: (_, row) => (row.type === "free" ? "Free" : `${row.price} USD`),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, row) => {
				// ✅ إذا كان مخفياً → زر Restore (DELETE مرة ثانية يُعيده)
				if (row.isHidden) {
					return (
						<Tooltip title="Restore this hidden course">
							<Popconfirm
								title="Restore this course visibility?"
								onConfirm={() => void removeCourse(row.id)}
								okText="Yes"
								cancelText="No"
							>
								<Button
									icon={<EyeOutlined />}
									loading={actionLoadingId === row.id}
								>
									Restore
								</Button>
							</Popconfirm>
						</Tooltip>
					);
				}

				return (
					<Popconfirm
						title={
							row.type === "paid"
								? "Hide this paid course? (students keep access)"
								: "Permanently delete this free course?"
						}
						onConfirm={() => void removeCourse(row.id)}
						okText="Yes"
						cancelText="No"
					>
						<Button
							icon={<DeleteOutlined />}
							danger
							loading={actionLoadingId === row.id}
						>
							{row.type === "paid" ? "Hide" : "Delete"}
						</Button>
					</Popconfirm>
				);
			},
		},
	];

	return (
		<Card>
			<Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
				<div>
					<Title level={4} style={{ margin: 0 }}>Courses</Title>
					<Text type="secondary">
						Manage all courses. Paid courses are hidden (students keep access), free courses are deleted.
					</Text>
				</div>
				<Button icon={<ReloadOutlined />} onClick={() => void fetchCourses()}>
					Refresh
				</Button>
			</Space>

			<Table<CourseRow>
				rowKey="id"
				columns={columns}
				dataSource={rows}
				loading={loading}
				pagination={{ pageSize: 10 }}
				scroll={{ x: true }}
			/>
		</Card>
	);
}
