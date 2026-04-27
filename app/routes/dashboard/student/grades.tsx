import { useEffect, useRef, useState } from "react";
import {
  Badge, Button, Card, Col, Empty, Modal,
  Row, Space, Spin, Table, Tag, Typography,
} from "antd";
import {
  CheckCircleOutlined, CloseCircleOutlined,
  PrinterOutlined, SafetyCertificateOutlined, TrophyOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

/* ── Types ─────────────────────────────────────── */
interface QuizAttempt {
  _id: string;
  score: number;
  passed: boolean;
  takenAt: string;
  quiz?:   { _id: string; title: string; type: "quiz" | "final_exam"; passingScore: number };
  course?: { _id: string; title: string };
}

interface Certificate {
  _id: string;
  certificateId: string;
  score: number;
  issuedAt: string;
  studentName?:    string;
  instructorName?: string;
  platformName?:   string;
  course?:     { _id: string; title: string };
  finalExam?:  { _id: string; title: string };
}

/* ── Certificate Print Modal ───────────────────── */
function CertificateModal({ cert, open, onClose }: { cert: Certificate; open: boolean; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>شهادة إتمام - ${cert.course?.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; }
          .cert { width: 794px; min-height: 562px; padding: 48px;
                  border: 12px double #c8a951; margin: 20px auto;
                  background: linear-gradient(135deg, #fffdf0 0%, #fff8e1 100%);
                  text-align: center; position: relative; }
          .cert::before {
            content: ''; position: absolute; inset: 16px;
            border: 2px solid #e8c84a; pointer-events: none;
          }
          .logo   { font-size: 28px; font-weight: 900; color: #c8a951; letter-spacing: 2px; margin-bottom: 4px; }
          .subtitle { font-size: 12px; color: #8a7540; letter-spacing: 3px; margin-bottom: 32px; }
          .title  { font-size: 42px; font-weight: bold; color: #3d2b00; margin-bottom: 24px; }
          .body   { font-size: 16px; color: #555; line-height: 2; margin-bottom: 32px; }
          .name   { font-size: 32px; font-weight: bold; color: #c8a951; border-bottom: 2px solid #c8a951;
                    display: inline-block; padding: 0 40px 6px; margin: 8px 0 16px; }
          .course-name { font-size: 22px; font-weight: 600; color: #1a1a1a; }
          .score  { font-size: 15px; color: #555; margin-top: 8px; }
          .footer { display: flex; justify-content: space-between; align-items: flex-end;
                    margin-top: 40px; padding-top: 24px; border-top: 1px solid #e0c060; }
          .sig    { text-align: center; }
          .sig-line { width: 160px; border-bottom: 1px solid #555; margin: 0 auto 6px; }
          .sig-name  { font-size: 13px; color: #555; }
          .cert-id   { font-size: 10px; color: #aaa; font-family: monospace; }
          .seal { width: 80px; height: 80px; background: radial-gradient(circle, #c8a951, #a07830);
                  border-radius: 50%; display: flex; align-items: center; justify-content: center;
                  color: #fff; font-size: 28px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="logo">AcadTrak</div>
          <div class="subtitle">CERTIFICATE OF COMPLETION</div>
          <div class="title">شهادة إتمام الدورة</div>
          <div class="body">
            نشهد بأن الطالب/ة
          </div>
          <div class="name">${cert.studentName ?? "الطالب"}</div>
          <div class="body">
            قد أتمَّ/أتمَّت بنجاح دورة
          </div>
          <div class="course-name">« ${cert.course?.title ?? "الدورة"} »</div>
          <div class="score">بدرجة <strong>${cert.score}%</strong></div>

          <div class="footer">
            <div class="sig">
              <div class="sig-line"></div>
              <div class="sig-name">${cert.instructorName ?? "الأستاذ"}</div>
              <div class="sig-name" style="font-size:11px;color:#aaa">المدرب / الأستاذ</div>
            </div>

            <div class="seal">🏆</div>

            <div class="sig">
              <div class="sig-line"></div>
              <div class="sig-name">${cert.platformName ?? "AcadTrak"}</div>
              <div class="sig-name" style="font-size:11px;color:#aaa">
                ${new Date(cert.issuedAt).toLocaleDateString("ar-TN", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>

          <div style="margin-top:20px">
            <div class="cert-id">رقم الشهادة: ${cert.certificateId}</div>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={860}
      footer={
        <Space>
          <Button icon={<PrinterOutlined />} type="primary" onClick={handlePrint}>
            طباعة الشهادة
          </Button>
          <Button onClick={onClose}>إغلاق</Button>
        </Space>
      }
      title={
        <Space>
          <TrophyOutlined style={{ color: "#faad14" }} />
          <span>شهادة إتمام — {cert.course?.title}</span>
        </Space>
      }
    >
      {/* معاينة الشهادة */}
      <div ref={printRef}>
        <div style={{
          border: "10px double #c8a951",
          background: "linear-gradient(135deg,#fffdf0,#fff8e1)",
          padding: 40,
          textAlign: "center",
          position: "relative",
          fontFamily: "sans-serif",
          borderRadius: 4,
        }}>
          {/* شعار */}
          <div style={{ fontSize: 26, fontWeight: 900, color: "#c8a951", letterSpacing: 2 }}>
            AcadTrak
          </div>
          <div style={{ fontSize: 11, color: "#8a7540", letterSpacing: 3, marginBottom: 24 }}>
            CERTIFICATE OF COMPLETION
          </div>

          <Title level={2} style={{ color: "#3d2b00", marginBottom: 16 }}>
            شهادة إتمام الدورة
          </Title>

          <Text style={{ fontSize: 15, color: "#555" }}>نشهد بأن الطالب/ة</Text>

          <div style={{
            fontSize: 28, fontWeight: "bold", color: "#c8a951",
            borderBottom: "2px solid #c8a951",
            padding: "0 32px 4px",
            margin: "12px auto 16px", display: "block",
          }}>
            {cert.studentName ?? "الطالب"}
          </div>

          <Text style={{ fontSize: 15, color: "#555" }}>
            قد أتمَّ/أتمَّت بنجاح دورة
          </Text>

          <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a", margin: "8px 0" }}>
            « {cert.course?.title ?? "الدورة"} »
          </div>

          <Text type="secondary" style={{ fontSize: 14 }}>
            بدرجة <strong style={{ color: "#52c41a" }}>{cert.score}%</strong>
          </Text>

          {/* التوقيعات */}
          <Row justify="space-between" align="bottom"
            style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #e0c060" }}>
            <Col style={{ textAlign: "center" }}>
              <div style={{ width: 140, borderBottom: "1px solid #555", marginBottom: 6 }} />
              <Text strong>{cert.instructorName ?? "الأستاذ"}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>المدرب / الأستاذ</Text>
            </Col>

            <Col style={{ textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "radial-gradient(circle,#c8a951,#a07830)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, color: "#fff", margin: "0 auto",
              }}>
                🏆
              </div>
            </Col>

            <Col style={{ textAlign: "center" }}>
              <div style={{ width: 140, borderBottom: "1px solid #555", marginBottom: 6 }} />
              <Text strong>{cert.platformName ?? "AcadTrak"}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {new Date(cert.issuedAt).toLocaleDateString("ar-TN", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </Text>
            </Col>
          </Row>

          {/* رقم الشهادة */}
          <div style={{ marginTop: 16 }}>
            <Text
              copyable={{ text: cert.certificateId }}
              style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace", direction: "ltr" }}
            >
              رقم الشهادة: {cert.certificateId}
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Main Page ─────────────────────────────────── */
export default function StudentGradesPage() {
  const { t } = useTranslation();
  const [loading,      setLoading]      = useState(true);
  const [attempts,     setAttempts]     = useState<QuizAttempt[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res  = await apiFetch("/api/quiz/my/grades");
        const data = await res.json().catch(() => null);
        setAttempts(data?.attempts ?? []);
        setCertificates(data?.certificates ?? []);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 48 }}><Spin size="large" /></div>;

  const quizAttempts  = attempts.filter((a) => a.quiz?.type === "quiz");
  const finalAttempts = attempts.filter((a) => a.quiz?.type === "final_exam");

  const attemptsColumns = [
    {
      title: "الدورة", key: "course",
      render: (_: unknown, r: QuizAttempt) => <Text strong>{r.course?.title ?? "—"}</Text>,
    },
    {
      title: "الاختبار", key: "quiz",
      render: (_: unknown, r: QuizAttempt) => r.quiz?.title ?? "—",
    },
    {
      title: "النوع", key: "type",
      render: (_: unknown, r: QuizAttempt) =>
        r.quiz?.type === "final_exam"
          ? <Tag color="red">اختبار نهائي</Tag>
          : <Tag color="orange">اختبار</Tag>,
    },
    {
      title: "الدرجة", key: "score",
      render: (_: unknown, r: QuizAttempt) => (
        <Space>
          <Text strong style={{ color: r.passed ? "#52c41a" : "#ff4d4f" }}>{r.score}%</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            (للنجاح: {r.quiz?.passingScore ?? "—"}%)
          </Text>
        </Space>
      ),
    },
    {
      title: "النتيجة", key: "passed",
      render: (_: unknown, r: QuizAttempt) =>
        r.passed
          ? <Tag icon={<CheckCircleOutlined />} color="success">ناجح</Tag>
          : <Tag icon={<CloseCircleOutlined />} color="error">راسب</Tag>,
    },
    {
      title: "التاريخ", key: "takenAt",
      render: (_: unknown, r: QuizAttempt) =>
        new Date(r.takenAt).toLocaleDateString("ar-TN"),
    },
  ];

  return (
    <Space orientation="vertical" size={24} style={{ width: "100%" }}>

      {/* ── الشهادات ─────────────────────────── */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: "#faad14", fontSize: 20 }} />
            <Title level={4} style={{ margin: 0 }}>{t("studentGrades.certificates")}</Title>
            <Badge count={certificates.length} color="#52c41a" />
          </Space>
        }
      >
        {certificates.length === 0 ? (
          <Empty
            image={<SafetyCertificateOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />}
            description={t("studentGrades.noCertificates")}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {certificates.map((cert) => (
              <Col xs={24} sm={12} md={8} key={cert._id}>
                <Card
                  hoverable
                  onClick={() => setSelectedCert(cert)}
                  style={{
                    background: "linear-gradient(135deg,#fffbe6,#fff7e6)",
                    border: "1px solid #faad14",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  <Space orientation="vertical" size={6} style={{ width: "100%" }}>
                    <SafetyCertificateOutlined style={{ fontSize: 40, color: "#faad14" }} />
                    <Text strong style={{ fontSize: 15 }}>{cert.course?.title ?? t("studentGrades.fallbackCourse")}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {cert.finalExam?.title ?? t("studentGrades.finalExam")}
                    </Text>
                    <Tag color="gold" style={{ fontSize: 13 }}>{t("studentGrades.score", { score: cert.score })}</Tag>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {cert.instructorName && `الأستاذ: ${cert.instructorName}`}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(cert.issuedAt).toLocaleDateString("ar-TN", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </Text>
                    <Button
                      size="small" type="dashed" icon={<PrinterOutlined />}
                      onClick={(e) => { e.stopPropagation(); setSelectedCert(cert); }}
                    >
                      {t("studentGrades.viewAndPrint")}
                    </Button>
                    <Text
                      copyable={{ text: cert.certificateId }}
                      style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace", direction: "ltr" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      #{cert.certificateId.slice(0, 12).toUpperCase()}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* ── الاختبارات النهائية ────────────────── */}
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>{t("studentGrades.finalExams")}</Title>
            <Badge count={finalAttempts.length} color="#ff4d4f" />
          </Space>
        }
      >
        {finalAttempts.length === 0 ? (
          <Empty description={t("studentGrades.noFinalExams")} />
        ) : (
          <Table dataSource={finalAttempts} columns={attemptsColumns}
            rowKey="_id" pagination={{ pageSize: 5 }} scroll={{ x: true }} />
        )}
      </Card>

      {/* ── الاختبارات العادية ─────────────────── */}
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>{t("studentGrades.quizzes")}</Title>
            <Badge count={quizAttempts.length} />
          </Space>
        }
      >
        {quizAttempts.length === 0 ? (
          <Empty description={t("studentGrades.noQuizzes")} />
        ) : (
          <Table dataSource={quizAttempts} columns={attemptsColumns}
            rowKey="_id" pagination={{ pageSize: 8 }} scroll={{ x: true }} />
        )}
      </Card>

      {/* ── نافذة الشهادة ──────────────────────── */}
      {selectedCert && (
        <CertificateModal
          cert={selectedCert}
          open={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </Space>
  );
}
