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
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();
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
				throw new Error(payload?.message || t("adminCourses.errors.failedLoadCourses"));
			}

			setRows(payload?.courses ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : t("adminCourses.errors.failedLoadCourses"));
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
				throw new Error(payload?.message || t("adminCourses.errors.actionFailed"));
			}

			message.success(payload?.message || t("adminCourses.messages.done"));
			await fetchCourses();
		} catch (error) {
			message.error(error instanceof Error ? error.message : t("adminCourses.errors.actionFailed"));
		} finally {
			setActionLoadingId(null);
		}
	};

	const columns: ColumnsType<CourseRow> = [
		{
			title: t("adminCourses.table.title"),
			dataIndex: "title",
			key: "title",
			ellipsis: true,
		},
		{
			title: t("adminCourses.table.instructor"),
			key: "instructor",
			render: (_, row) => row.instructorDetails?.name || "-",
		},
		{
			title: t("adminCourses.table.category"),
			key: "category",
			render: (_, row) => row.categoryDetails?.name || row.category || "-",
		},
		{
			title: t("adminCourses.table.type"),
			dataIndex: "type",
			key: "type",
			render: (type: CourseRow["type"]) => (
				<Tag color={type === "paid" ? "gold" : "green"}>{type.toUpperCase()}</Tag>
			),
		},
		{
			title: t("adminCourses.table.status"),
			dataIndex: "status",
			key: "status",
			render: (status: CourseRow["status"]) => (
				<Tag color={status === "published" ? "blue" : "default"}>{status}</Tag>
			),
		},
		{
			title: t("adminCourses.table.visibility"),
			key: "visibility",
			render: (_, row) =>
				row.isHidden ? (
					<Tag icon={<EyeInvisibleOutlined />} color="volcano">{t("adminCourses.visibility.hidden")}</Tag>
				) : (
					<Tag icon={<EyeOutlined />} color="success">{t("adminCourses.visibility.visible")}</Tag>
				),
		},
		{
			title: t("adminCourses.table.price"),
			key: "price",
			render: (_, row) => (row.type === "free" ? t("adminCourses.free") : `${row.price} USD`),
		},
		{
			title: t("adminCourses.table.actions"),
			key: "actions",
			render: (_, row) => {
				// ✅ إذا كان مخفياً → زر Restore (DELETE مرة ثانية يُعيده)
				if (row.isHidden) {
					return (
						<Tooltip title={t("adminCourses.actions.restoreTooltip")}>
							<Popconfirm
								title={t("adminCourses.actions.restoreTitle")}
								onConfirm={() => void removeCourse(row.id)}
								okText={t("adminCourses.actions.yes")}
								cancelText={t("adminCourses.actions.no")}
							>
								<Button
									icon={<EyeOutlined />}
									loading={actionLoadingId === row.id}
								>
									{t("adminCourses.actions.restore")}
								</Button>
							</Popconfirm>
						</Tooltip>
					);
				}

				return (
					<Popconfirm
						title={
							row.type === "paid"
								? t("adminCourses.actions.hideTitle")
								: t("adminCourses.actions.deleteTitle")
						}
						onConfirm={() => void removeCourse(row.id)}
						okText={t("adminCourses.actions.yes")}
						cancelText={t("adminCourses.actions.no")}
					>
						<Button
							icon={<DeleteOutlined />}
							danger
							loading={actionLoadingId === row.id}
						>
							{row.type === "paid" ? t("adminCourses.actions.hide") : t("adminCourses.actions.delete")}
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
					<Title level={4} style={{ margin: 0 }}>{t("adminCourses.title")}</Title>
					<Text type="secondary">
						{t("adminCourses.subtitle")}
					</Text>
				</div>
				<Button icon={<ReloadOutlined />} onClick={() => void fetchCourses()}>
					{t("adminCourses.actions.refresh")}
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
