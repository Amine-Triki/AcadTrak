// app/routes/dashboard/_dashboard.tsx
import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate, redirect, useLoaderData } from "react-router";
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
  FileTextOutlined,
  MailOutlined,
  HomeOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useAuth } from "~/context/auth";
import { apiFetch } from "~/utils/api";

const { Header, Sider, Content } = Layout;

// ✅ النوع الصحيح من Ant Design
type MenuItem = MenuProps["items"];

// ━━━━━━━━━━━━━━━━━━━━━━━━
// المسارات المسموحة
// ━━━━━━━━━━━━━━━━━━━━━━━━
const ROLE_PATHS: Record<string, string[]> = {
  student: ["/dashboard/student"],
  teacher: ["/dashboard/teacher", "/dashboard/student"],
  // ✅ Admin لا يدخل /dashboard/teacher لأنه لا ينشئ دورات
  admin:   ["/dashboard/admin", "/dashboard/student"],
};

function hasAccess(role: string, pathname: string): boolean {
  return (ROLE_PATHS[role] ?? []).some((p) => pathname.startsWith(p));
}

export async function clientLoader() {
  const response = await apiFetch("/api/users/me");

  if (!response.ok) {
    throw redirect("/login");
  }

  const payload = (await response.json().catch(() => null)) as
    | {
        user?: {
          id: string;
          firstName: string;
          lastName: string;
          userName: string;
          country: string;
          email: string;
          role: "student" | "teacher" | "admin";
        };
      }
    | null;

  if (!payload?.user) {
    throw redirect("/login");
  }

  return payload;
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
      icon: <TrophyOutlined />,
      label: <Link to="/dashboard/student/grades">درجاتي وشهاداتي</Link>,
    },
    {
      key: "/dashboard/student/upgrade-to-teacher",
      icon: <UploadOutlined />,
      label: <Link to="/dashboard/student/upgrade-to-teacher">التحول إلى أستاذ</Link>,
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
          key: "/dashboard/teacher/quizzes",
          icon: <FileTextOutlined />,
          label: <Link to="/dashboard/teacher/quizzes">اختباراتي</Link>,
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
          icon: <TrophyOutlined />,
          label: <Link to="/dashboard/student/grades">درجاتي وشهاداتي</Link>,
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
      key: "/dashboard/admin/messages",
      icon: <MailOutlined />,
      label: <Link to="/dashboard/admin/messages">رسائل التواصل</Link>,
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
  const loaderData = useLoaderData() as {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      userName: string;
      country: string;
      email: string;
      role: "student" | "teacher" | "admin";
    };
  };
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken(); // ✅ Design Tokens من Ant Design
  const authUser = user ?? loaderData?.user ?? null;

  useEffect(() => {
    if (!user && loaderData?.user) {
      setUser(loaderData.user);
    }
  }, [loaderData, setUser, user]);

  // ── الحماية ──
  if (!isAuthenticated && !authUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!authUser || !hasAccess(authUser.role!, location.pathname)) {
    return <Navigate to={`/dashboard/${authUser?.role || "student"}`} replace />;
  }

  const menuItems = menuByRole[authUser.role!] ?? menuByRole.student;

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

  const handleUserMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      await apiFetch("/api/users/logout", { method: "POST" });
      setUser(null);
      navigate("/login");
    } else if (key === "profile") {
      navigate(`/dashboard/${authUser.role}`);
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

          {/* زر العودة للصفحة الرئيسية */}
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => window.open("/", "_blank")}
            style={{ fontSize: token.fontSizeLG }}
            title="الذهاب إلى الصفحة الرئيسية"
          />

          <Space size={token.marginSM}>


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
                    {authUser.firstName && authUser.lastName
                      ? `${authUser.firstName} ${authUser.lastName}`
                      : authUser.userName || authUser.email || "User"}
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