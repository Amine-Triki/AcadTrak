import { useEffect, useState } from "react";
import {
	App,
	Button,
	Card,
	Popconfirm,
	Space,
	Switch,
	Table,
	Tag,
	Tooltip,
	Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, ReloadOutlined, RollbackOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { apiFetch } from "~/utils/api";
import { useAuth } from "~/context/auth";

const { Title, Text } = Typography;

type UserRow = {
	id: string;
	firstName: string;
	lastName: string;
	userName: string;
	country: string;
	email: string;
	role: "student" | "teacher" | "admin";
	deletedAt: string | null;
};

export default function AdminUsersPage() {
	const { t } = useTranslation();
	const { message } = App.useApp();
	const { user: currentUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
	const [includeDeleted, setIncludeDeleted] = useState(true);
	const [rows, setRows] = useState<UserRow[]>([]);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const response = await apiFetch(`/api/users?includeDeleted=${includeDeleted}`);
			const payload = (await response.json().catch(() => null)) as
				| { users?: UserRow[]; message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || t("adminUsers.errors.failedLoadUsers"));
			}

			setRows(payload?.users ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : t("adminUsers.errors.failedLoadUsers"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchUsers();
	}, [includeDeleted]);

	const runAction = async (user: UserRow, action: "delete" | "restore") => {
		setActionLoadingId(user.id);
		try {
			const path = action === "delete"
				? `/api/users/${user.id}/soft-delete`
				: `/api/users/${user.id}/restore`;

			const response = await apiFetch(path, { method: "PATCH" });
			const payload = (await response.json().catch(() => null)) as { message?: string } | null;

			if (!response.ok) {
				throw new Error(payload?.message || t("adminUsers.errors.actionFailed"));
			}

			message.success(payload?.message || t("adminUsers.messages.done"));
			await fetchUsers();
		} catch (error) {
			message.error(error instanceof Error ? error.message : t("adminUsers.errors.actionFailed"));
		} finally {
			setActionLoadingId(null);
		}
	};

	const columns: ColumnsType<UserRow> = [
		{
			title: t("adminUsers.table.name"),
			key: "name",
			render: (_, row) => `${row.firstName} ${row.lastName}`.trim() || row.userName,
		},
		{ title: t("adminUsers.table.username"), dataIndex: "userName", key: "userName" },
		{ title: t("adminUsers.table.email"), dataIndex: "email", key: "email" },
		{ title: t("adminUsers.table.country"), dataIndex: "country", key: "country" },
		{
			title: t("adminUsers.table.role"),
			dataIndex: "role",
			key: "role",
			render: (role: UserRow["role"]) => {
				const color = role === "admin" ? "red" : role === "teacher" ? "blue" : "green";
				return <Tag color={color}>{role.toUpperCase()}</Tag>;
			},
		},
		{
			title: t("adminUsers.table.status"),
			key: "status",
			render: (_, row) =>
				row.deletedAt ? <Tag color="volcano">{t("adminUsers.status.deleted")}</Tag> : <Tag color="success">{t("adminUsers.status.active")}</Tag>,
		},
		{
			title: t("adminUsers.table.actions"),
			key: "actions",
			render: (_, row) => {
				// ✅ لا يمكن حذف حسابات Admin أو حذف النفس
				const isProtected = row.role === "admin" || row.id === currentUser?.id;

				if (row.deletedAt) {
					return (
						<Button
							icon={<RollbackOutlined />}
							loading={actionLoadingId === row.id}
							onClick={() => void runAction(row, "restore")}
						>
							{t("adminUsers.actions.restore")}
						</Button>
					);
				}

				if (isProtected) {
					return (
						<Tooltip title={row.role === "admin" ? t("adminUsers.actions.adminProtected") : t("adminUsers.actions.selfProtected")}>
							<Button danger icon={<DeleteOutlined />} disabled>
								{t("adminUsers.actions.delete")}
							</Button>
						</Tooltip>
					);
				}

				return (
					<Popconfirm
						title={t("adminUsers.actions.softDeleteTitle")}
						onConfirm={() => void runAction(row, "delete")}
						okText={t("adminUsers.actions.yes")}
						cancelText={t("adminUsers.actions.no")}
					>
						<Button danger icon={<DeleteOutlined />} loading={actionLoadingId === row.id}>
							{t("adminUsers.actions.delete")}
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
					<Title level={4} style={{ margin: 0 }}>{t("adminUsers.title")}</Title>
					<Text type="secondary">{t("adminUsers.subtitle")}</Text>
				</div>
				<Space>
					<Text>{t("adminUsers.includeDeleted")}</Text>
					<Switch checked={includeDeleted} onChange={setIncludeDeleted} />
					<Button icon={<ReloadOutlined />} onClick={() => void fetchUsers()}>
						{t("adminUsers.actions.refresh")}
					</Button>
				</Space>
			</Space>

			<Table<UserRow>
				rowKey="id"
				columns={columns}
				dataSource={rows}
				loading={loading}
				pagination={{ pageSize: 10 }}
			/>
		</Card>
	);
}
