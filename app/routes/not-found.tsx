// app/routes/not-found.tsx
import { Link } from "react-router";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t("notFound.subtitle")}
      extra={
        <Button type="primary">
          <Link to="/">{t("error.backHome")}</Link>
        </Button>
      }
      style={{ paddingTop: 80 }}
    />
  );
}