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
	Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, ReloadOutlined, RollbackOutlined } from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

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
	const { message } = App.useApp();
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
				throw new Error(payload?.message || "Failed to load users");
			}

			setRows(payload?.users ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "Failed to load users");
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
				throw new Error(payload?.message || "Action failed");
			}

			message.success(payload?.message || "Done");
			await fetchUsers();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "Action failed");
		} finally {
			setActionLoadingId(null);
		}
	};

	const columns: ColumnsType<UserRow> = [
		{
			title: "Name",
			key: "name",
			render: (_, row) => `${row.firstName} ${row.lastName}`.trim() || row.userName,
		},
		{ title: "Username", dataIndex: "userName", key: "userName" },
		{ title: "Email", dataIndex: "email", key: "email" },
		{ title: "Country", dataIndex: "country", key: "country" },
		{
			title: "Role",
			dataIndex: "role",
			key: "role",
			render: (role: UserRow["role"]) => {
				const color = role === "admin" ? "red" : role === "teacher" ? "blue" : "green";
				return <Tag color={color}>{role.toUpperCase()}</Tag>;
			},
		},
		{
			title: "Status",
			key: "status",
			render: (_, row) =>
				row.deletedAt ? <Tag color="volcano">Deleted</Tag> : <Tag color="success">Active</Tag>,
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, row) => (
				row.deletedAt ? (
					<Button
						icon={<RollbackOutlined />}
						loading={actionLoadingId === row.id}
						onClick={() => void runAction(row, "restore")}
					>
						Restore
					</Button>
				) : (
					<Popconfirm
						title="Soft delete this user?"
						onConfirm={() => void runAction(row, "delete")}
						okText="Yes"
						cancelText="No"
					>
						<Button danger icon={<DeleteOutlined />} loading={actionLoadingId === row.id}>
							Delete
						</Button>
					</Popconfirm>
				)
			),
		},
	];

	return (
		<Card>
			<Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
				<div>
					<Title level={4} style={{ margin: 0 }}>Users</Title>
					<Text type="secondary">Manage active and soft-deleted users.</Text>
				</div>
				<Space>
					<Text>Include deleted</Text>
					<Switch checked={includeDeleted} onChange={setIncludeDeleted} />
					<Button icon={<ReloadOutlined />} onClick={() => void fetchUsers()}>
						Refresh
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
