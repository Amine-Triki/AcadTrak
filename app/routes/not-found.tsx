// app/routes/not-found.tsx
import { Link } from "react-router";
import { Button, Result } from "antd";

export default function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="هذه الصفحة غير موجودة"
      extra={
        <Button type="primary">
          <Link to="/">العودة للرئيسية</Link>
        </Button>
      }
      style={{ paddingTop: 80 }}
    />
  );
}