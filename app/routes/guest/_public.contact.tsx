import type { Route } from "./+types/_public.home";

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

const CONTACT_INFO = [
  {
    icon: <MailOutlined />,
    title: "Email",
    value: "hello@acadtrak.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: <PhoneOutlined />,
    title: "Phone",
    value: "+1 (555) 123-4567",
    sub: "Mon–Fri, 9am–6pm PST",
  },
  {
    icon: <EnvironmentOutlined />,
    title: "Office",
    value: "San Francisco, CA",
    sub: "123 Learning St, Suite 400",
  },
  {
    icon: <ClockCircleOutlined />,
    title: "Support Hours",
    value: "Mon–Fri, 9am–6pm",
    sub: "Weekend: limited support",
  },
];

const FAQ_ITEMS = [
  {
    key: "1",
    label: "How do I enroll in a course?",
    children: "Simply create an account, browse our course catalog, and click 'Enroll Now'. You'll get instant access after payment.",
  },
  {
    key: "2",
    label: "What payment methods do you accept?",
    children: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for institutional purchases.",
  },
  {
    key: "3",
    label: "Can I get a refund?",
    children: "Yes! We offer a 30-day money-back guarantee on all courses. Contact our support team to initiate a refund.",
  },
  {
    key: "4",
    label: "Do courses have an expiry date?",
    children: "No. Once enrolled, you have lifetime access to the course content, including all future updates.",
  },
  {
    key: "5",
    label: "Can I become an instructor?",
    children: "We'd love to have you! Click 'Become an Instructor' in the dashboard or contact us at instructors@acadtrak.com.",
  },
];

export default function ContactPage() {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const handleSubmit = async (values: object) => {
    console.log(values);
    await new Promise((r) => setTimeout(r, 800));
    message.success("Message sent! We'll get back to you within 24 hours.");
    form.resetFields();
  };

  return (
    <div style={{ background: "#f8f9fc" }}>

      {/* ━━━━━━ Hero ━━━━━━ */}
      <section
        style={{
          background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
          padding: "80px 48px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#c4c0ff",
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 16px",
            borderRadius: 100,
            marginBottom: 20,
          }}
        >
          Get in Touch
        </span>
        <Title
          level={1}
          style={{ color: "#fff", fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}
        >
          We'd Love to Hear From You
        </Title>
        <Paragraph
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 16,
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.8,
          }}
        >
          Have a question, feedback, or partnership inquiry?
          Our team is always ready to help.
        </Paragraph>
      </section>

      {/* ━━━━━━ Contact Info Cards ━━━━━━ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {CONTACT_INFO.map((info) => (
            <Card
              key={info.title}
              style={{ borderRadius: 14, border: "1px solid #e5e7eb", textAlign: "center" }}
              styles={{ body: { padding: 24 } }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4f46e5",
                  fontSize: 20,
                  margin: "0 auto 16px",
                }}
              >
                {info.icon}
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                {info.title}
              </Text>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 4 }}>
                {info.value}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>{info.sub}</Text>
            </Card>
          ))}
        </div>
      </section>

      {/* ━━━━━━ Form + FAQ ━━━━━━ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 48px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* ── Form ── */}
          <Card
            style={{ borderRadius: 16, border: "1px solid #e5e7eb" }}
            styles={{ body: { padding: 36 } }}
          >
            <Title level={3} style={{ marginBottom: 8 }}>Send a Message</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 28 }}>
              Fill out the form and we'll respond within 24 hours.
            </Text>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="John" size="large" />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="Doe" size="large" />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Required" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="john@example.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input placeholder="How can we help you?" size="large" />
              </Form.Item>

              <Form.Item
                name="message"
                label="Message"
                rules={[
                  { required: true, message: "Required" },
                  { min: 20, message: "At least 20 characters" },
                ]}
              >
                <TextArea
                  rows={5}
                  placeholder="Tell us more about your inquiry..."
                  style={{ resize: "none" }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                icon={<SendOutlined />}
                iconPosition="end"
                style={{
                  background: "#4f46e5",
                  border: "none",
                  borderRadius: 8,
                  height: 48,
                  fontWeight: 600,
                }}
              >
                Send Message
              </Button>
            </Form>
          </Card>

          {/* ── FAQ ── */}
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>Frequently Asked Questions</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 28 }}>
              Quick answers to common questions.
            </Text>

            <Collapse
              items={FAQ_ITEMS}
              accordion
              style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}
              expandIconPosition="end"
            />

            {/* Still need help */}
            <Card
              style={{
                marginTop: 24,
                borderRadius: 14,
                border: "none",
                background: "#eef2ff",
              }}
              styles={{ body: { padding: 28, textAlign: "center" } }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <Title level={4} style={{ marginBottom: 8 }}>Still need help?</Title>
              <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
                Our support team is just a message away.
              </Text>
              <Button
                type="primary"
                style={{ background: "#4f46e5", border: "none", borderRadius: 8 }}
              >
                Chat with Support
              </Button>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}