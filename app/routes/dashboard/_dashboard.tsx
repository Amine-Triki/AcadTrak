// app/routes/dashboard/_dashboard.tsx
import { useEffect, useState } from "react";
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
  Navigate,
  redirect,
  useLoaderData,
} from "react-router";
import type { MenuProps } from "antd";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  theme,
  Badge,
  Select,
  Spin,
} from "antd";
import { useTranslation } from "react-i18next";
import {
  DashboardOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
  UploadOutlined,
  FileTextOutlined,
  MailOutlined,
  HomeOutlined,
  TrophyOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useAuth } from "~/context/auth";
import { apiFetch } from "~/utils/api";
import type { AppLanguage } from "~/i18n/resources";

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
  admin: ["/dashboard/admin", "/dashboard/student"],
};

function hasAccess(role: string, pathname: string): boolean {
  return (ROLE_PATHS[role] ?? []).some((p) => pathname.startsWith(p));
}

export async function clientLoader() {
  const response = await apiFetch("/api/users/me");

  if (!response.ok) {
    throw redirect("/login");
  }

  const payload = (await response.json().catch(() => null)) as {
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      userName: string;
      country: string;
      email: string;
      role: "student" | "teacher" | "admin";
    };
  } | null;

  if (!payload?.user) {
    throw redirect("/login");
  }

  return payload;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━
// القوائم — النوع الصحيح
// ━━━━━━━━━━━━━━━━━━━━━━━━
const buildMenuByRole = (
  t: (key: string) => string,
): Record<string, MenuItem> => ({
  student: [
    {
      key: "/dashboard/student",
      icon: <DashboardOutlined />,
      label: (
        <Link to="/dashboard/student">{t("dashboardLayout.studentHome")}</Link>
      ),
    },
    {
      key: "/dashboard/student/courses",
      icon: <BookOutlined />,
      label: (
        <Link to="/dashboard/student/courses">{t("studentCourses.title")}</Link>
      ),
    },
    {
      key: "/dashboard/student/grades",
      icon: <TrophyOutlined />,
      label: (
        <Link to="/dashboard/student/grades">
          {t("dashboardLayout.myGrades")}
        </Link>
      ),
    },
    {
      key: "/dashboard/student/upgrade-to-teacher",
      icon: <UploadOutlined />,
      label: (
        <Link to="/dashboard/student/upgrade-to-teacher">
          {t("upgradeToTeacher.title")}
        </Link>
      ),
    },
  ],

  teacher: [
    // ✅ type: "group" يعمل الآن لأن MenuItem يعرفه
    {
      type: "group",
      label: t("dashboardLayout.asTeacher"),
      children: [
        {
          key: "/dashboard/teacher",
          icon: <DashboardOutlined />,
          label: (
            <Link to="/dashboard/teacher">
              {t("dashboardLayout.teacherHome")}
            </Link>
          ),
        },
        {
          key: "/dashboard/teacher/courses",
          icon: <UploadOutlined />,
          label: (
            <Link to="/dashboard/teacher/courses">
              {t("teacherDashboard.myCourses")}
            </Link>
          ),
        },
        {
          key: "/dashboard/teacher/quizzes",
          icon: <FileTextOutlined />,
          label: (
            <Link to="/dashboard/teacher/quizzes">
              {t("dashboardLayout.myQuizzes")}
            </Link>
          ),
        },
        {
          key: "/dashboard/teacher/students",
          icon: <TeamOutlined />,
          label: (
            <Link to="/dashboard/teacher/students">
              {t("teacherStudents.title")}
            </Link>
          ),
        },
      ],
    },
    {
      type: "group",
      label: t("dashboardLayout.asStudent"),
      children: [
        {
          key: "/dashboard/student/courses",
          icon: <BookOutlined />,
          label: (
            <Link to="/dashboard/student/courses">
              {t("dashboardLayout.enrolledCourses")}
            </Link>
          ),
        },
        {
          key: "/dashboard/student/grades",
          icon: <TrophyOutlined />,
          label: (
            <Link to="/dashboard/student/grades">
              {t("dashboardLayout.myGrades")}
            </Link>
          ),
        },
      ],
    },
  ],

  admin: [
    {
      key: "/dashboard/admin",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard/admin">{t("adminDashboard.title")}</Link>,
    },
    {
      key: "/dashboard/admin/users",
      icon: <TeamOutlined />,
      label: <Link to="/dashboard/admin/users">{t("adminUsers.title")}</Link>,
    },
    {
      key: "/dashboard/admin/courses",
      icon: <BookOutlined />,
      label: (
        <Link to="/dashboard/admin/courses">{t("adminCourses.title")}</Link>
      ),
    },
    {
      key: "/dashboard/admin/messages",
      icon: <MailOutlined />,
      label: (
        <Link to="/dashboard/admin/messages">{t("adminMessages.title")}</Link>
      ),
    },
    {
      key: "/dashboard/admin/settings",
      icon: <SettingOutlined />,
      label: (
        <Link to="/dashboard/admin/settings">{t("adminSettings.title")}</Link>
      ),
    },
  ],
});

// ━━━━━━━━━━━━━━━━━━━━━━━━
// المكون الرئيسي
// ━━━━━━━━━━━━━━━━━━━━━━━━
export default function DashboardLayout() {
  const { t, i18n } = useTranslation();
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

  const currentLanguage = (() => {
    const base = (i18n.resolvedLanguage ?? i18n.language ?? "en").split("-")[0];
    if (base === "fr" || base === "ar") return base;
    return "en";
  })() as AppLanguage;

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
    return (
      <Navigate to={`/dashboard/${authUser?.role || "student"}`} replace />
    );
  }

  const menuByRole = buildMenuByRole(t);
  const rawMenuItems = menuByRole[authUser.role!] ?? menuByRole.student ?? [];

  const menuItems = rawMenuItems;

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: t("dashboardLayout.profile"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("common.logout"),
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

  const handleLanguageChange = (value: AppLanguage) => {
    void i18n.changeLanguage(value);
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
            gap: token.marginSM, // ✅ token بدل px ثابتة
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
                fontWeight: token.fontWeightStrong, // ✅ من token
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
            paddingInline: token.paddingLG, // ✅ paddingInline = padding left+right
            position: "sticky",
            insetBlockStart: 0,
            zIndex: token.zIndexPopupBase, // ✅ z-index من token
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
            title={t("dashboardLayout.goHome")}
          />

          <Space size={token.marginSM}>
            <Select<AppLanguage>
              aria-label={t("common.language")}
              size="middle"
              prefix={<GlobalOutlined />}
              value={currentLanguage}
              onChange={handleLanguageChange}
              style={{ width: 130 }}
              options={[
                { value: "ar", label: "العربية" },
                { value: "fr", label: "Français" },
                { value: "en", label: "English" },
              ]}
            />

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
                      : authUser.userName ||
                        authUser.email ||
                        t("common.userFallback")}
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
            borderRadius: token.borderRadiusLG, // ✅ token
            minHeight: 360,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
