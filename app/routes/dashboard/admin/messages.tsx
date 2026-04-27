import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  App,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  ReadOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { apiFetch } from "~/utils/api";

const { Title, Text, Paragraph } = Typography;

type ContactMessageRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
};

type ContactMessagesResponse = {
  messages: ContactMessageRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const formatDateTime = (dateIso: string) => {
  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
};

export default function AdminContactMessagesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [rows, setRows] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const reloadMessages = () => {
    setCurrentPage((page) => page);
  };

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(pageSize),
        });

        if (appliedSearch.trim()) {
          params.set("search", appliedSearch.trim());
        }

        if (unreadOnly) {
          params.set("unreadOnly", "true");
        }

        if (includeArchived) {
          params.set("includeArchived", "true");
        }

        const response = await apiFetch(`/api/contact?${params.toString()}`);
        const payload = (await response.json().catch(() => null)) as
          | (ContactMessagesResponse & { message?: string })
          | null;

        if (!response.ok || !payload?.messages || !payload.pagination) {
          throw new Error(payload?.message || t("adminMessages.errors.failedLoadMessages"));
        }

        if (cancelled) {
          return;
        }

        setRows(payload.messages);
        setTotal(payload.pagination.total);
      } catch (error) {
        if (!cancelled) {
          const errorMessage =
            error instanceof Error ? error.message : t("adminMessages.errors.failedLoadMessages");
          message.error(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [appliedSearch, currentPage, includeArchived, message, pageSize, unreadOnly]);

  const updateReadStatus = async (
    row: ContactMessageRow,
    isRead: boolean,
    silent = false,
  ) => {
    setActionLoadingId(row.id);

    try {
      const response = await apiFetch(`/api/contact/${row.id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ isRead }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; contactMessage?: ContactMessageRow }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || t("adminMessages.errors.failedUpdateRead"));
      }

      setRows((previous) =>
        previous.map((item) =>
          item.id === row.id
            ? {
                ...item,
                isRead,
                readAt: isRead ? new Date().toISOString() : null,
              }
            : item,
        ),
      );

      setSelectedMessage((current) =>
        current?.id === row.id
          ? {
              ...current,
              isRead,
              readAt: isRead ? new Date().toISOString() : null,
            }
          : current,
      );

      if (!silent) {
        message.success(payload?.message || (isRead ? t("adminMessages.messages.markedRead") : t("adminMessages.messages.markedUnread")));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("adminMessages.errors.failedUpdateRead");
      message.error(errorMessage);
    } finally {
      setActionLoadingId(null);
    }
  };

  const updateArchiveStatus = async (row: ContactMessageRow, isArchived: boolean) => {
    setActionLoadingId(row.id);

    try {
      const response = await apiFetch(`/api/contact/${row.id}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ isArchived }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; contactMessage?: ContactMessageRow }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || t("adminMessages.errors.failedUpdateArchive"));
      }

      message.success(payload?.message || (isArchived ? t("adminMessages.messages.archived") : t("adminMessages.messages.restored")));

      if (!includeArchived && isArchived) {
        setRows((previous) => previous.filter((item) => item.id !== row.id));
        setTotal((value) => Math.max(0, value - 1));
      } else {
        setRows((previous) =>
          previous.map((item) =>
            item.id === row.id
              ? {
                  ...item,
                  isArchived,
                  archivedAt: isArchived ? new Date().toISOString() : null,
                }
              : item,
          ),
        );
      }

      setSelectedMessage((current) =>
        current?.id === row.id
          ? {
              ...current,
              isArchived,
              archivedAt: isArchived ? new Date().toISOString() : null,
            }
          : current,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("adminMessages.errors.failedUpdateArchive");
      message.error(errorMessage);
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteMessage = async (row: ContactMessageRow) => {
    setActionLoadingId(row.id);

    try {
      const response = await apiFetch(`/api/contact/${row.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || t("adminMessages.errors.failedDelete"));
      }

      message.success(payload?.message || t("adminMessages.messages.deleted"));
      setRows((previous) => previous.filter((item) => item.id !== row.id));
      setTotal((value) => Math.max(0, value - 1));
      setSelectedMessage((current) => (current?.id === row.id ? null : current));
      setDetailsOpen((open) => (selectedMessage?.id === row.id ? false : open));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("adminMessages.errors.failedDelete");
      message.error(errorMessage);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDetails = async (row: ContactMessageRow) => {
    setSelectedMessage(row);
    setDetailsOpen(true);

    if (!row.isRead) {
      await updateReadStatus(row, true, true);
    }
  };

  const columns: ColumnsType<ContactMessageRow> = useMemo(
    () => [
      {
        title: t("adminMessages.table.sender"),
        key: "sender",
        width: 220,
        render: (_, row) => (
          <div>
            <div style={{ fontWeight: 600 }}>{`${row.firstName} ${row.lastName}`}</div>
            <Text type="secondary">{row.email}</Text>
          </div>
        ),
      },
      {
        title: t("adminMessages.table.subject"),
        dataIndex: "subject",
        key: "subject",
        width: 220,
        render: (value: string, row) => (
          <Space size={8}>
            <span>{value}</span>
            {!row.isRead ? <Tag color="blue">{t("adminMessages.tags.new")}</Tag> : null}
            {row.isArchived ? <Tag>{t("adminMessages.tags.archived")}</Tag> : null}
          </Space>
        ),
      },
      {
        title: t("adminMessages.table.message"),
        dataIndex: "message",
        key: "message",
        render: (value: string) => (
          <Paragraph
            style={{ marginBottom: 0, maxWidth: 500 }}
            ellipsis={{ rows: 2, expandable: true, symbol: t("adminMessages.actions.showMore") }}
          >
            {value}
          </Paragraph>
        ),
      },
      {
        title: t("adminMessages.table.sentAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 200,
        render: (value: string) => formatDateTime(value),
      },
      {
        title: t("adminMessages.table.actions"),
        key: "actions",
        width: 280,
        render: (_, row) => (
          <Space wrap>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                void openDetails(row);
              }}
            >
              {t("adminMessages.actions.details")}
            </Button>

            <Button
              size="small"
              icon={row.isRead ? <InboxOutlined /> : <ReadOutlined />}
              loading={actionLoadingId === row.id}
              onClick={() => {
                void updateReadStatus(row, !row.isRead);
              }}
            >
              {row.isRead ? t("adminMessages.actions.markUnread") : t("adminMessages.actions.markRead")}
            </Button>

            <Button
              size="small"
              loading={actionLoadingId === row.id}
              onClick={() => {
                void updateArchiveStatus(row, !row.isArchived);
              }}
            >
              {row.isArchived ? t("adminMessages.actions.restore") : t("adminMessages.actions.archive")}
            </Button>

            <Popconfirm
              title={t("adminMessages.actions.deleteTitle")}
              description={t("adminMessages.actions.deleteDescription")}
              okText={t("adminMessages.actions.yes")}
              cancelText={t("adminMessages.actions.cancel")}
              onConfirm={() => {
                void deleteMessage(row);
              }}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={actionLoadingId === row.id}
              >
                {t("adminMessages.actions.delete")}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [actionLoadingId],
  );

  const hasActiveSearch = appliedSearch.trim().length > 0;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <Title level={4} style={{ marginBottom: 6 }}>
          {t("adminMessages.title")}
        </Title>
        <Text type="secondary">
          {t("adminMessages.subtitle")}
        </Text>
      </Card>

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            allowClear
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onPressEnter={() => {
              setCurrentPage(1);
              setAppliedSearch(searchInput);
            }}
            placeholder={t("adminMessages.searchPlaceholder")}
            style={{ minWidth: 320 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              setCurrentPage(1);
              setAppliedSearch(searchInput);
            }}
          >
            {t("adminMessages.actions.search")}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchInput("");
              setAppliedSearch("");
              setUnreadOnly(false);
              setIncludeArchived(false);
              setCurrentPage(1);
              reloadMessages();
            }}
          >
            {t("adminMessages.actions.reset")}
          </Button>

          <Space>
            <Text>{t("adminMessages.filters.unreadOnly")}</Text>
            <Switch
              checked={unreadOnly}
              onChange={(checked) => {
                setUnreadOnly(checked);
                setCurrentPage(1);
              }}
            />
          </Space>

          <Space>
            <Text>{t("adminMessages.filters.includeArchived")}</Text>
            <Switch
              checked={includeArchived}
              onChange={(checked) => {
                setIncludeArchived(checked);
                setCurrentPage(1);
              }}
            />
          </Space>
        </Space>

        {hasActiveSearch ? (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            title={t("adminMessages.searchResults", { value: appliedSearch })}
          />
        ) : null}

        <Table<ContactMessageRow>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (nextPage, nextPageSize) => {
              if (nextPageSize !== pageSize) {
                setPageSize(nextPageSize);
                setCurrentPage(1);
                return;
              }

              setCurrentPage(nextPage);
            },
          }}
        />
      </Card>

      <Drawer
        title={t("adminMessages.details.title")}
        open={detailsOpen}
        width={620}
        onClose={() => setDetailsOpen(false)}
      >
        {selectedMessage ? (
          <Space orientation="vertical" style={{ width: "100%" }} size={16}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label={t("adminMessages.details.sender")}>
                {selectedMessage.firstName} {selectedMessage.lastName}
              </Descriptions.Item>
              <Descriptions.Item label={t("adminMessages.details.email")}>
                {selectedMessage.email}
              </Descriptions.Item>
              <Descriptions.Item label={t("adminMessages.details.subject")}>
                {selectedMessage.subject}
              </Descriptions.Item>
              <Descriptions.Item label={t("adminMessages.details.status")}>
                <Space>
                  {selectedMessage.isRead ? (
                    <Tag color="green">{t("adminMessages.tags.read")}</Tag>
                  ) : (
                    <Tag color="blue">{t("adminMessages.tags.unread")}</Tag>
                  )}
                  {selectedMessage.isArchived ? <Tag>{t("adminMessages.tags.archivedFemale")}</Tag> : null}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={t("adminMessages.details.sentTime")}>
                {formatDateTime(selectedMessage.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="IP">
                {selectedMessage.ipAddress || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Card size="small" title={t("adminMessages.details.messageText")}>
              <Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                {selectedMessage.message}
              </Paragraph>
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
}
