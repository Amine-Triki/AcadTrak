// app/routes/dashboard/_dashboard.tsx
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router";
import type { MenuProps } from "antd";
import {
  Layout, Menu, Button, Avatar,
  Dropdown, Space, theme, Badge,
} from "antd";
import {
  DashboardOutlined, BookOutlined, UserOutlined,
  TeamOutlined, SettingOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, LogoutOutlined, BellOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAuth } from "~/context/auth";

const { Header, Sider, Content } = Layout;

// ✅ النوع الصحيح من Ant Design
type MenuItem = MenuProps["items"];

// ━━━━━━━━━━━━━━━━━━━━━━━━
// المسارات المسموحة
// ━━━━━━━━━━━━━━━━━━━━━━━━
const ROLE_PATHS: Record<string, string[]> = {
  student: ["/dashboard/student"],
  teacher: ["/dashboard/teacher", "/dashboard/student"],
  admin:   ["/dashboard/admin", "/dashboard/teacher", "/dashboard/student"],
};

function hasAccess(role: string, pathname: string): boolean {
  return (ROLE_PATHS[role] ?? []).some((p) => pathname.startsWith(p));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━
// القوائم — النوع الصحيح
// ━━━━━━━━━━━━━━━━━━━━━━━━
const menuByRole: Record<string, MenuItem> = {

  student: [
    {
      key: "/dashboard/student",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard/student">لوحتي</Link>,
    },
    {
      key: "/dashboard/student/courses",
      icon: <BookOutlined />,
      label: <Link to="/dashboard/student/courses">كورساتي</Link>,
    },
    {
      key: "/dashboard/student/grades",
      icon: <UserOutlined />,
      label: <Link to="/dashboard/student/grades">درجاتي</Link>,
    },
  ],

  teacher: [
    // ✅ type: "group" يعمل الآن لأن MenuItem يعرفه
    {
      type: "group",
      label: "كأستاذ",
      children: [
        {
          key: "/dashboard/teacher",
          icon: <DashboardOutlined />,
          label: <Link to="/dashboard/teacher">لوحتي</Link>,
        },
        {
          key: "/dashboard/teacher/courses",
          icon: <UploadOutlined />,
          label: <Link to="/dashboard/teacher/courses">دوراتي</Link>,
        },
        {
          key: "/dashboard/teacher/students",
          icon: <TeamOutlined />,
          label: <Link to="/dashboard/teacher/students">طلابي</Link>,
        },
      ],
    },
    {
      type: "group",
      label: "كطالب",
      children: [
        {
          key: "/dashboard/student/courses",
          icon: <BookOutlined />,
          label: <Link to="/dashboard/student/courses">الدورات المشتراة</Link>,
        },
        {
          key: "/dashboard/student/grades",
          icon: <UserOutlined />,
          label: <Link to="/dashboard/student/grades">درجاتي</Link>,
        },
      ],
    },
  ],

  admin: [
    {
      key: "/dashboard/admin",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard/admin">لوحة التحكم</Link>,
    },
    {
      key: "/dashboard/admin/users",
      icon: <TeamOutlined />,
      label: <Link to="/dashboard/admin/users">المستخدمون</Link>,
    },
    {
      key: "/dashboard/admin/courses",
      icon: <BookOutlined />,
      label: <Link to="/dashboard/admin/courses">الكورسات</Link>,
    },
    {
      key: "/dashboard/admin/settings",
      icon: <SettingOutlined />,
      label: <Link to="/dashboard/admin/settings">الإعدادات</Link>,
    },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━
// المكون الرئيسي
// ━━━━━━━━━━━━━━━━━━━━━━━━
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAuthenticated, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken(); // ✅ Design Tokens من Ant Design

  // ── الحماية ──
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!hasAccess(user.role!, location.pathname)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  const menuItems = menuByRole[user.role!] ?? menuByRole.student;

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "الملف الشخصي",
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "تسجيل الخروج",
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      setUser(null);
      navigate("/login");
    } else if (key === "profile") {
      navigate(`/dashboard/${user.role}`);
    }
  };

  return (
    // ✅ minHeight بدل min-h-screen — Ant Design style
    <Layout style={{ minHeight: "100vh" }}>

      {/* ━━ Sidebar ━━ */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        // ✅ كل الألوان من token — تتغير تلقائياً مع Dark Mode
        style={{
          background: token.colorBgContainer,
          borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
          position: "sticky",
          insetBlockStart: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: token.marginSM,         // ✅ token بدل px ثابتة
            padding: `${token.padding}px`,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <BookOutlined
            style={{ fontSize: token.fontSizeXL, color: token.colorPrimary }}
          />
          {!collapsed && (
            <span
              style={{
                fontWeight: token.fontWeightStrong,  // ✅ من token
                color: token.colorPrimary,
                fontSize: token.fontSizeLG,
              }}
            >
              AcadTrak
            </span>
          )}
        </div>

        {/* ✅ Menu من Ant Design — بدون CSS خارجي */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{
            borderInlineEnd: "none",
            marginBlockStart: token.marginXS,
          }}
        />
      </Sider>

      <Layout>
        {/* ━━ Header ━━ */}
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: token.paddingLG,  // ✅ paddingInline = padding left+right
            position: "sticky",
            insetBlockStart: 0,
            zIndex: token.zIndexPopupBase,   // ✅ z-index من token
            // Ant Design Layout Header له height ثابت = 64px تلقائياً
          }}
        >
          {/* زر طي الـ Sidebar */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: token.fontSizeLG }}
          />

          <Space size={token.marginSM}>
            {/* 🔔 الإشعارات */}
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                shape="circle"
                style={{ fontSize: token.fontSizeLG }}
              />
            </Badge>

            {/* 👤 قائمة المستخدم */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomLeft"
              trigger={["click"]}
            >
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  style={{ backgroundColor: token.colorPrimary }}
                  icon={<UserOutlined />}
                />
                {!collapsed && (
                  <span style={{ color: token.colorText }}>
                    {user.name}
                  </span>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* ━━ المحتوى ━━ */}
        <Content
          style={{
            margin: token.margin,
            padding: token.padding,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,  // ✅ token
            minHeight: 360,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}