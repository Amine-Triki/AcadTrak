import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Layout, Menu, Button, Avatar,
  Dropdown, Space, theme, Badge,
} from "antd";
import {
  DashboardOutlined, BookOutlined, UserOutlined,
  TeamOutlined, SettingOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, LogoutOutlined, BellOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

// تعريف القوائم حسب الدور
const menuByRole = {
  student: [
    { key: "/dashboard/student",          icon: <DashboardOutlined />, label: <Link to="/dashboard/student">لوحتي</Link> },
    { key: "/dashboard/student/courses",  icon: <BookOutlined />,      label: <Link to="/dashboard/student/courses">كورساتي</Link> },
    { key: "/dashboard/student/grades",   icon: <UserOutlined />,      label: <Link to="/dashboard/student/grades">درجاتي</Link> },
  ],
  teacher: [
    { key: "/dashboard/teacher",          icon: <DashboardOutlined />, label: <Link to="/dashboard/teacher">لوحتي</Link> },
    { key: "/dashboard/teacher/courses",  icon: <BookOutlined />,      label: <Link to="/dashboard/teacher/courses">كورساتي</Link> },
    { key: "/dashboard/teacher/students", icon: <TeamOutlined />,      label: <Link to="/dashboard/teacher/students">طلابي</Link> },
  ],
  admin: [
    { key: "/dashboard/admin",            icon: <DashboardOutlined />, label: <Link to="/dashboard/admin">لوحة التحكم</Link> },
    { key: "/dashboard/admin/users",      icon: <TeamOutlined />,      label: <Link to="/dashboard/admin/users">المستخدمون</Link> },
    { key: "/dashboard/admin/courses",    icon: <BookOutlined />,      label: <Link to="/dashboard/admin/courses">الكورسات</Link> },
    { key: "/dashboard/admin/settings",   icon: <SettingOutlined />,   label: <Link to="/dashboard/admin/settings">الإعدادات</Link> },
  ],
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // ⚠️ لاحقاً ستجلب الدور من Auth Context
  const role: "student" | "teacher" | "admin" = "admin";
  const menuItems = menuByRole[role];

  const userMenu = [
    { key: "profile", icon: <UserOutlined />, label: "الملف الشخصي" },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "تسجيل الخروج",
      danger: true,
      onClick: () => navigate("/login"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: token.colorBgContainer,
          borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        {/* Logo */}
        <div style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <BookOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
          {!collapsed && (
            <span style={{ fontWeight: 700, color: token.colorPrimary }}>
              AcadTrak
            </span>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderInlineEnd: "none", marginTop: 8 }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          <Space size={16}>
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} shape="circle" />
            </Badge>
            <Dropdown menu={{ items: userMenu }} placement="bottomLeft">
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  style={{ background: token.colorPrimary }}
                  icon={<UserOutlined />}
                />
                {!collapsed && <span>أحمد محمد</span>}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Page Content */}
        <Content style={{
          margin: 24,
          padding: 24,
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          minHeight: 360,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}