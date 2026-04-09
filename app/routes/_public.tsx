import { Outlet, Link, useLocation } from "react-router";
import { Layout, Menu, Button, Space } from "antd";
import { BookOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

export default function PublicLayout() {
  const location = useLocation();

  const menuItems = [
    { key: "/",        label: <Link to="/">home</Link> },
    { key: "/about",   label: <Link to="/about">about</Link> },
    { key: "/contact", label: <Link to="/contact">contact</Link> },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 48px",
        }}
      >
        {/* Logo */}
        <Space>
          <BookOutlined style={{ fontSize: 24, color: "#4f46e5" }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "#4f46e5" }}>
            AcadTrak
          </span>
        </Space>

        {/* Navigation */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ border: "none", flex: 1, justifyContent: "center" }}
        />

        {/* Auth Buttons */}
        <Space>
          <Button>
            <Link to="/login">Login</Link>
          </Button>
          <Button type="primary">
            <Link to="/register">Register</Link>
          </Button>
        </Space>
      </Header>

      <Content>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: "center", color: "#888" }}>
        AcadTrak ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}