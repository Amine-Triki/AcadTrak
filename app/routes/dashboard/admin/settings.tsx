import { useEffect, useState } from "react";
import {
	App,
	Button,
	Card,
	Form,
	Input,
	Modal,
	Popconfirm,
	Space,
	Table,
	Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

type CategoryRow = {
	id: string;
	name: string;
	slug: string;
};

type CategoryFormValues = {
	name: string;
};

export default function AdminSettingsPage() {
	const { message } = App.useApp();
	const [form] = Form.useForm<CategoryFormValues>();
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<CategoryRow | null>(null);
	const [rows, setRows] = useState<CategoryRow[]>([]);

	const fetchCategories = async () => {
		setLoading(true);
		try {
			const response = await apiFetch("/api/categories");
			const payload = (await response.json().catch(() => null)) as
				| { categories?: CategoryRow[]; message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || "Failed to load categories");
			}

			setRows(payload?.categories ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "Failed to load categories");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchCategories();
	}, []);

	const openCreate = () => {
		setEditing(null);
		form.setFieldsValue({ name: "" });
		setOpen(true);
	};

	const openEdit = (row: CategoryRow) => {
		setEditing(row);
		form.setFieldsValue({ name: row.name });
		setOpen(true);
	};

	const closeModal = () => {
		setOpen(false);
		setEditing(null);
		form.resetFields();
	};

	const submitCategory = async (values: CategoryFormValues) => {
		setSubmitting(true);
		try {
			const isEdit = Boolean(editing);
			const path = isEdit ? `/api/categories/${editing?.id}` : "/api/categories";
			const method = isEdit ? "PATCH" : "POST";

			const response = await apiFetch(path, {
				method,
				body: JSON.stringify({ name: values.name.trim() }),
			});
			const payload = (await response.json().catch(() => null)) as { message?: string } | null;

			if (!response.ok) {
				throw new Error(payload?.message || "Failed to save category");
			}

			message.success(payload?.message || "Category saved");
			closeModal();
			await fetchCategories();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "Failed to save category");
		} finally {
			setSubmitting(false);
		}
	};

	const deleteCategory = async (categoryId: string) => {
		try {
			const response = await apiFetch(`/api/categories/${categoryId}`, {
				method: "DELETE",
			});
			const payload = (await response.json().catch(() => null)) as { message?: string } | null;

			if (!response.ok) {
				throw new Error(payload?.message || "Failed to delete category");
			}

			message.success(payload?.message || "Category deleted");
			await fetchCategories();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "Failed to delete category");
		}
	};

	const columns: ColumnsType<CategoryRow> = [
		{ title: "Name", dataIndex: "name", key: "name" },
		{ title: "Slug", dataIndex: "slug", key: "slug" },
		{
			title: "Actions",
			key: "actions",
			render: (_, row) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => openEdit(row)}>
						Edit
					</Button>
					<Popconfirm
						title="Delete this category?"
						description="Deletion is blocked if this category is used by courses."
						onConfirm={() => void deleteCategory(row.id)}
						okText="Yes"
						cancelText="No"
					>
						<Button icon={<DeleteOutlined />} danger>
							Delete
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<Card>
			<Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
				<div>
					<Title level={4} style={{ margin: 0 }}>Settings</Title>
					<Text type="secondary">Manage categories used by courses.</Text>
				</div>
				<Space>
					<Button icon={<ReloadOutlined />} onClick={() => void fetchCategories()}>
						Refresh
					</Button>
					<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
						Add Category
					</Button>
				</Space>
			</Space>

			<Table<CategoryRow>
				rowKey="id"
				columns={columns}
				dataSource={rows}
				loading={loading}
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				open={open}
				onCancel={closeModal}
				title={editing ? "Edit Category" : "Add Category"}
				okText={editing ? "Save" : "Create"}
				onOk={() => void form.submit()}
				confirmLoading={submitting}
			>
				<Form<CategoryFormValues> form={form} layout="vertical" onFinish={submitCategory}>
					<Form.Item
						name="name"
						label="Category Name"
						rules={[
							{ required: true, message: "Category name is required" },
							{ min: 2, message: "At least 2 characters" },
						]}
					>
						<Input placeholder="e.g. Programming" />
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
}
