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
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();
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
				throw new Error(payload?.message || t("adminSettings.errors.failedLoadCategories"));
			}

			setRows(payload?.categories ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : t("adminSettings.errors.failedLoadCategories"));
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
				throw new Error(payload?.message || t("adminSettings.errors.failedSaveCategory"));
			}

			message.success(payload?.message || t("adminSettings.messages.categorySaved"));
			closeModal();
			await fetchCategories();
		} catch (error) {
			message.error(error instanceof Error ? error.message : t("adminSettings.errors.failedSaveCategory"));
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
				throw new Error(payload?.message || t("adminSettings.errors.failedDeleteCategory"));
			}

			message.success(payload?.message || t("adminSettings.messages.categoryDeleted"));
			await fetchCategories();
		} catch (error) {
			message.error(error instanceof Error ? error.message : t("adminSettings.errors.failedDeleteCategory"));
		}
	};

	const columns: ColumnsType<CategoryRow> = [
		{ title: t("adminSettings.table.name"), dataIndex: "name", key: "name" },
		{ title: t("adminSettings.table.slug"), dataIndex: "slug", key: "slug" },
		{
			title: t("adminSettings.table.actions"),
			key: "actions",
			render: (_, row) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => openEdit(row)}>
						{t("adminSettings.actions.edit")}
					</Button>
					<Popconfirm
						title={t("adminSettings.actions.deleteTitle")}
						description={t("adminSettings.actions.deleteDescription")}
						onConfirm={() => void deleteCategory(row.id)}
						okText={t("adminSettings.actions.yes")}
						cancelText={t("adminSettings.actions.no")}
					>
						<Button icon={<DeleteOutlined />} danger>
							{t("adminSettings.actions.delete")}
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
					<Title level={4} style={{ margin: 0 }}>{t("adminSettings.title")}</Title>
					<Text type="secondary">{t("adminSettings.subtitle")}</Text>
				</div>
				<Space>
					<Button icon={<ReloadOutlined />} onClick={() => void fetchCategories()}>
						{t("adminSettings.actions.refresh")}
					</Button>
					<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
						{t("adminSettings.actions.addCategory")}
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
				title={editing ? t("adminSettings.modal.editTitle") : t("adminSettings.modal.addTitle")}
				okText={editing ? t("adminSettings.modal.save") : t("adminSettings.modal.create")}
				onOk={() => void form.submit()}
				confirmLoading={submitting}
			>
				<Form<CategoryFormValues> form={form} layout="vertical" onFinish={submitCategory}>
					<Form.Item
						name="name"
						label={t("adminSettings.modal.categoryName")}
						rules={[
							{ required: true, message: t("adminSettings.modal.categoryRequired") },
							{ min: 2, message: t("adminSettings.modal.min2") },
						]}
					>
						<Input placeholder={t("adminSettings.modal.placeholder")} />
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
}
