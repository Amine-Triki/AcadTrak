// app/routes/guest/_public.tsx
import { useMemo, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Layout, Menu, Button, Drawer, Grid, theme } from "antd";
import { BookOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useAuth } from "~/context/auth";
import { apiFetch } from "~/utils/api";

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

type MenuItem = MenuProps["items"];

const navItems: MenuItem = [
  { key: "/", label: <Link to="/">Home</Link> },
  { key: "/about", label: <Link to="/about">About Us</Link> },
  { key: "/courses", label: <Link to="/courses">Courses</Link> },
  { key: "/contact", label: <Link to="/contact">Contact Us</Link> },
];

export default function PublicLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { user, isAuthenticated, setUser } = useAuth();
  const { token } = theme.useToken();

  // screens.md = true إذا العرض >= 768px
  const isMobile = !screens.md;

  const displayName = useMemo(() => {
    if (!user) return "";
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return fullName || user.userName || user.name || user.email || "User";
  }, [user]);

  const dashboardPath = useMemo(() => {
    if (!user?.role) return "/";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "teacher") return "/dashboard/teacher";
    return "/dashboard/student";
  }, [user]);

  const handleLogout = async () => {
    await apiFetch("/api/users/logout", { method: "POST" });
    setUser(null);
    setDrawerOpen(false);
    navigate("/");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ━━━━━━ Header ━━━━━━ */}
      <Header
        style={{
          // ✅ نتحكم بكل شيء عبر style — بدون تعارض مع Tailwind
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: 64,
          padding: 0, // إلغاء padding الافتراضي لـ Ant Design
          background: token.colorBgContainer, // #fff أو dark تلقائياً
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: "none",
        }}
      >
        {/*
          ✅ الهيكل الصحيح للـ Header:
          [ Logo ]  [ Menu — يمتد في المنتصف ]  [ Buttons ]

          نستخدم grid بدل flex لأن grid يوزع المساحة بدقة أكبر
        */}
        <div
          style={{
            height: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: isMobile ? "0 16px" : "0 48px",
            display: "grid",
            // على الحاسوب: Logo | Menu يمتد | Buttons
            // على الهاتف:  Logo | فراغ | زر Hamburger
            gridTemplateColumns: isMobile ? "auto 1fr auto" : "200px 1fr 200px",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* ── Logo ── */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <BookOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: token.colorPrimary,
                // إخفاء النص على الشاشات الصغيرة جداً
                display: screens.sm === false ? "none" : "inline",
              }}
            >
              AcadTrak
            </span>
          </Link>

          {/* ── Desktop: Menu في المنتصف ── */}
          {!isMobile ? (
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={navItems}
              style={{
                border: "none",
                background: "transparent",
                justifyContent: "center", // ✅ توسيط عناصر القائمة
                flex: 1,
              }}
            />
          ) : (
            // على الهاتف: فراغ ليبقى الزر على اليمين
            <div />
          )}

          {/* ── Desktop: أزرار Auth ── */}
          {!isMobile ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end", // ✅ محاذاة لليمين
                alignItems: "center",
                gap: 8,
              }}
            >
              {isAuthenticated ? (
                <>
                  <span
                    style={{
                      color: token.colorText,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName}
                  </span>
                  <Button type="primary" size="middle">
                    <Link to={dashboardPath}>Dashboard</Link>
                  </Button>
                  <Button danger size="middle" onClick={handleLogout}>
                    log out
                  </Button>
                </>
              ) : (
                <>
                  <Button size="middle">
                    <Link to="/login">login</Link>
                  </Button>
                  <Button type="primary" size="middle">
                    <Link to="/register">register</Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            /* ── Mobile: زر الهامبرغر ── */
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="text"
                icon={
                  <MenuOutlined
                    style={{ fontSize: 20, color: token.colorPrimary }}
                  />
                }
                onClick={() => setDrawerOpen(true)}
              />
            </div>
          )}
        </div>
      </Header>

      {/* ━━━━━━ Mobile Drawer ━━━━━━ */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="right"
        size="default"
        closeIcon={<CloseOutlined />}
        title={
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
            onClick={() => setDrawerOpen(false)}
          >
            <BookOutlined style={{ color: token.colorPrimary }} />
            <span style={{ fontWeight: 700, color: token.colorPrimary }}>
              AcadTrak
            </span>
          </Link>
        }
        styles={{
          body: { padding: 0, display: "flex", flexDirection: "column" },
          header: { borderBottom: `1px solid ${token.colorBorderSecondary}` },
        }}
      >
        {/* قائمة التنقل */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={navItems}
          onClick={() => setDrawerOpen(false)}
          style={{ border: "none", flex: 1 }}
        />

        {/* أزرار Auth في الأسفل */}
        <div
          style={{
            padding: 16,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {isAuthenticated ? (
            <>
              <div
                style={{
                  fontWeight: 600,
                  color: token.colorText,
                  padding: "0 4px",
                }}
              >
                {displayName}
              </div>
              <Button block type="primary" size="large" onClick={() => setDrawerOpen(false)}>
                <Link to={dashboardPath}>Dashboard</Link>
              </Button>
              <Button danger block size="large" onClick={handleLogout}>
                log out
              </Button>
            </>
          ) : (
            <>
              <Button block size="large" onClick={() => setDrawerOpen(false)}>
                <Link to="/login">login</Link>
              </Button>
              <Button
                type="primary"
                block
                size="large"
                onClick={() => setDrawerOpen(false)}
              >
                <Link to="/register">register</Link>
              </Button>
            </>
          )}
        </div>
      </Drawer>

      {/* ━━━━━━ Content ━━━━━━ */}
      <Content>
        <Outlet />
      </Content>

      {/* ━━━━━━ Footer ━━━━━━ */}
      <Footer
        style={{
          textAlign: "center",
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
          padding: "24px 48px",
          color: token.colorTextTertiary,
          fontSize: 13,
        }}
      >
        AcadTrak ©{new Date().getFullYear()} — made with ❤️ by  
        <Link to="https://amine-triki.tn"> Amine Triki</Link>
      </Footer>
    </Layout>
  );
}
