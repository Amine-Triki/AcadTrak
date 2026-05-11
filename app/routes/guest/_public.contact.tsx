import type { Route } from "./+types/_public.contact";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "~/utils/api";
import {
  contactFormSchema,
  type ContactFormInput,
} from "~/lib/validations/contact";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AcadTrak | Contact Us" },
    {
      name: "description",
      content:
        "Get in touch with AcadTrak! Have questions or feedback? We'd love to hear from you.",
    },
  ];
}

import { Typography, Card, Form, Input, Button, Collapse, App } from "antd";
import {
  MailOutlined, PhoneOutlined, EnvironmentOutlined,
  ClockCircleOutlined, SendOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

let contactIdempotencyCounter = 0;

const generateIdempotencyKey = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  const timeFragment =
    typeof performance !== "undefined" ? performance.now().toString(36) : "0";

  contactIdempotencyCounter += 1;

  return `${Date.now()}-${timeFragment}-${contactIdempotencyCounter}`;
};

const CONTACT_INFO = [
  {
    icon: <MailOutlined />,
    key: "email",
    value: "hello@acadtrak.com",
    subKey: "replyWithin24h",
  },
  {
    icon: <PhoneOutlined />,
    key: "phoneWhatsapp",
    value: "+1 (555) 123-4567",
    subKey: "workdaysPst",
  },
  {
    icon: <EnvironmentOutlined />,
    key: "office",
    value: "San Francisco, CA",
    subKey: "officeAddress",
  },
  {
    icon: <ClockCircleOutlined />,
    key: "supportHours",
    value: "Mon–Fri, 9am–6pm",
    subKey: "weekendSupport",
  },
];

const FAQ_ITEMS = [
  { key: "1", id: "enroll" },
  { key: "2", id: "payments" },
  { key: "3", id: "refund" },
  { key: "4", id: "expiry" },
  { key: "5", id: "instructor" },
];

export default function ContactPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  const faqItems = FAQ_ITEMS.map((item) => ({
    key: item.key,
    label: t(`publicContact.faq.items.${item.id}.question`),
    children: t(`publicContact.faq.items.${item.id}.answer`),
  }));

  const handleSubmit = async (values: ContactFormInput) => {
    if (submitting) {
      return;
    }

    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      message.error(parsed.error.issues[0]?.message || t("publicContact.messages.invalidData"));
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        headers: {
          "X-Idempotency-Key": generateIdempotencyKey(),
        },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; duplicate?: boolean }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || t("publicContact.errors.failedSend"));
      }

      if (payload?.duplicate) {
        message.info(t("publicContact.messages.duplicate"));
        return;
      }

      message.success(t("publicContact.messages.sentSuccess"));
      form.resetFields();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("publicContact.errors.tryAgain");
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#f8f9fc" }}>

      {/* ━━━━━━ Hero ━━━━━━ */}
      <section
        style={{
          background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
          padding: "clamp(40px, 10vw, 80px) clamp(16px, 5vw, 48px)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#c4c0ff",
            fontSize: "clamp(10px, 2.5vw, 12px)",
            fontWeight: 600,
            padding: "4px 16px",
            borderRadius: 100,
            marginBottom: 20,
          }}
        >
          {t("publicContact.hero.badge")}
        </span>
        <Title
          level={1}
          style={{ color: "#fff", fontSize: "clamp(24px, 6vw, 48px)", marginBottom: 16 }}
        >
          {t("publicContact.hero.title")}
        </Title>
        <Paragraph
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "clamp(14px, 4vw, 16px)",
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.8,
          }}
        >
          {t("publicContact.hero.description")}
        </Paragraph>
      </section>

      {/* ━━━━━━ Contact Info Cards ━━━━━━ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(32px, 8vw, 64px) clamp(16px, 5vw, 48px) 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "clamp(12px, 3vw, 16px)",
          }}
        >
          {CONTACT_INFO.map((info) => (
            <Card
              key={info.key}
              style={{ borderRadius: 14, border: "1px solid #e5e7eb", textAlign: "center" }}
              styles={{ body: { padding: "clamp(16px, 4vw, 24px)" } }}
            >
              <div
                style={{
                  width: "clamp(40px, 10vw, 48px)",
                  height: "clamp(40px, 10vw, 48px)",
                  borderRadius: 12,
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4f46e5",
                  fontSize: "clamp(16px, 4vw, 20px)",
                  margin: "0 auto 16px",
                }}
              >
                {info.icon}
              </div>
              <Text type="secondary" style={{ fontSize: "clamp(11px, 2.5vw, 12px)", display: "block", marginBottom: 4 }}>
                {t(`publicContact.contactInfo.${info.key}.title`)}
              </Text>
              <div style={{ fontWeight: 600, fontSize: "clamp(13px, 3vw, 14px)", color: "#111827", marginBottom: 4 }}>
                {info.value}
              </div>
              <Text type="secondary" style={{ fontSize: "clamp(11px, 2.5vw, 12px)" }}>
                {t(`publicContact.contactInfo.${info.key}.${info.subKey}`)}
              </Text>
            </Card>
          ))}
        </div>
      </section>

      {/* ━━━━━━ Form + FAQ ━━━━━━ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(32px, 8vw, 48px) clamp(16px, 5vw, 48px) clamp(40px, 10vw, 80px)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(24px, 6vw, 40px)",
            alignItems: "start",
          }}
        >
          {/* ── Form ── */}
          <Card
            style={{ borderRadius: 16, border: "1px solid #e5e7eb" }}
            styles={{ body: { padding: "clamp(20px, 5vw, 36px)" } }}
          >
            <Title level={3} style={{ marginBottom: 8, fontSize: "clamp(18px, 4vw, 20px)" }}>{t("publicContact.form.title")}</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 28, fontSize: "clamp(13px, 3vw, 14px)" }}>
              {t("publicContact.form.subtitle")}
            </Text>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
                <Form.Item
                  name="firstName"
                  label={t("publicContact.form.firstName")}
                  rules={[{ required: true, message: t("publicContact.form.required") }]}
                >
                  <Input placeholder={t("publicContact.form.firstNamePlaceholder")} size="large" />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  label={t("publicContact.form.lastName")}
                  rules={[{ required: true, message: t("publicContact.form.required") }]}
                >
                  <Input placeholder={t("publicContact.form.lastNamePlaceholder")} size="large" />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                label={t("publicContact.form.email")}
                rules={[
                  { required: true, message: t("publicContact.form.required") },
                  { type: "email", message: t("publicContact.form.invalidEmail") },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                  placeholder={t("publicContact.form.emailPlaceholder")}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="subject"
                label={t("publicContact.form.subject")}
                rules={[{ required: true, message: t("publicContact.form.required") }]}
              >
                <Input placeholder={t("publicContact.form.subjectPlaceholder")} size="large" />
              </Form.Item>

              <Form.Item
                name="message"
                label={t("publicContact.form.message")}
                rules={[
                  { required: true, message: t("publicContact.form.required") },
                  { min: 20, message: t("publicContact.form.min20") },
                ]}
              >
                <TextArea
                  rows={5}
                  placeholder={t("publicContact.form.messagePlaceholder")}
                  style={{ resize: "none" }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={submitting}
                disabled={submitting}
                icon={<SendOutlined />}
                iconPlacement="end"
                style={{
                  background: "#4f46e5",
                  border: "none",
                  borderRadius: 8,
                  height: 48,
                  fontWeight: 600,
                }}
              >
                {t("publicContact.form.submit")}
              </Button>
            </Form>
          </Card>
          {/* ── FAQ ── */}
          <div>
            <Title level={3} style={{ marginBottom: 8, fontSize: "clamp(18px, 4vw, 20px)" }}>{t("publicContact.faq.title")}</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 28, fontSize: "clamp(13px, 3vw, 14px)" }}>
              {t("publicContact.faq.subtitle")}
            </Text>

            <Collapse
              items={faqItems}
              accordion
              style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}
              expandIconPlacement="end"
            />

   
          </div>
        </div>
      </section>

    </div>
  );
}