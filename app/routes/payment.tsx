import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  Alert, App, Button, Card, Col, Divider,
  Input, Row, Space, Spin, Tag, Typography,
} from "antd";
import {
  CheckCircleOutlined, CloseCircleOutlined,
  CreditCardOutlined, SafetyCertificateOutlined,
} from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface CourseItem {
  id: string; title: string; description: string;
  type: "free" | "paid"; price: number; effectivePrice?: number;
  thumbnail?: string;
}

interface PaymentResult {
  paymentUrl?: string;
  paymentId?:  string;
  paymentRef?: string;
  provider?:   "konnect";
  amountTND?:  number;
  // تسجيل مجاني بكوبون 100%
  enrollmentId?: string;
  message?:      string;
}

export default function PaymentPage() {
  const { message }       = App.useApp();
  const { courseId }      = useParams<{ courseId: string }>();
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();

  const [loading, setLoading]           = useState(true);
  const [paying,  setPaying]            = useState<"konnect" | null>(null);
  const [course, setCourse]             = useState<CourseItem | null>(null);
  const [coupon, setCoupon]             = useState("");
  const [effectivePrice, setEffective]  = useState<number | null>(null);

  // ── نتيجة Redirect من بوابة الدفع ──────────────────────────────────
  const paymentStatus  = searchParams.get("payment");

  // ── تحميل بيانات الكورس ────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    void (async () => {
      setLoading(true);
      try {
        const res  = await apiFetch(`/api/courses/${courseId}`);
        const data = (await res.json().catch(() => null)) as { course?: CourseItem } | null;
        if (!res.ok || !data?.course) throw new Error("فشل تحميل الكورس");
        setCourse(data.course);
        setEffective(data.course.effectivePrice ?? data.course.price);
      } catch (e) {
        message.error(e instanceof Error ? e.message : "خطأ");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const enrollFreeCourse = async () => {
    if (!courseId) return;
    setPaying("konnect");
    try {
      const res = await apiFetch(`/api/enrollments/course/${courseId}/enroll`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        throw new Error(data?.message || "فشل التسجيل");
      }
      message.success("تم التسجيل بنجاح! 🎉");
      navigate("/dashboard/student/courses");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "فشل التسجيل");
    } finally {
      setPaying(null);
    }
  };

  const applyCoupon = async () => {
    if (!courseId || !coupon.trim()) return;
    try {
      const res  = await apiFetch(`/api/courses/${courseId}?couponCode=${coupon.trim()}`);
      const data = (await res.json().catch(() => null)) as { course?: CourseItem } | null;
      if (!res.ok || !data?.course) throw new Error("كوبون غير صالح");
      setEffective(data.course.effectivePrice ?? data.course.price);
      message.success("تم تطبيق الكوبون ✅");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "كوبون غير صالح");
    }
  };

  const pay = async (provider:  "konnect") => {
    if (!courseId) return;
    setPaying(provider);
    try {
      const endpoint = `/api/payments/${provider}/checkout/${courseId}`;
      const res  = await apiFetch(endpoint, {
        method: "POST",
        body:   JSON.stringify({ couponCode: coupon.trim() || undefined }),
      });
      const data = (await res.json().catch(() => null)) as PaymentResult | null;

      if (!res.ok) {
        throw new Error((data as { message?: string })?.message || "فشل بدء الدفع");
      }

      // كوبون 100% → مسجّل مباشرة
      if (data?.enrollmentId) {
        message.success(data.message || "تم التسجيل مجاناً! 🎉");
        navigate("/dashboard/student/courses");
        return;
      }

      // redirect لبوابة الدفع
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      throw new Error("لم يُعَد رابط الدفع");
    } catch (e) {
      message.error(e instanceof Error ? e.message : "خطأ في الدفع");
    } finally {
      setPaying(null);
    }
  };

  // ── عرض نتيجة الـ redirect ──────────────────────────────────────────
  if (paymentStatus === "success") {
    return (
      <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message="تم إرسال عملية الدفع بنجاح"
          description="يجري الآن تأكيد العملية وتفعيل التسجيل. إذا لم يظهر الكورس مباشرة، حدّث الصفحة بعد لحظات."
          action={
            <Button type="primary" onClick={() => navigate("/dashboard/student/courses")}>
              الذهاب إلى دوراتي
            </Button>
          }
        />
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div style={{ maxWidth: 500, margin: "40px auto" }}>
        <Alert
          type="error"
          showIcon
          icon={<CloseCircleOutlined />}
          message="فشل الدفع"
          description="تعذر إتمام عملية الدفع. يمكنك المحاولة مرة أخرى."
          action={
            <Button onClick={() => navigate(`/payment/${courseId}`)}>
              حاول مجدداً
            </Button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: 48 }}><Spin size="large" /></div>;
  }

  if (!course) {
    return <Alert type="error" message="الكورس غير موجود" />;
  }

  const isFree     = course.type === "free";
  const finalPrice = effectivePrice ?? course.price;
  const is100Off   = finalPrice === 0 && !isFree;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <Card>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>إتمام التسجيل</Title>

          {/* معلومات الكورس */}
          <Card size="small" style={{ background: "#f9f9ff" }}>
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 16 }}>{course.title}</Text>
              <Text type="secondary">{course.description.slice(0, 100)}...</Text>
              <Space>
                <Tag color={isFree ? "green" : "gold"}>{isFree ? "مجاني" : "مدفوع"}</Tag>
                {!isFree && (
                  <Text strong style={{ fontSize: 18, color: "#4f46e5" }}>
                    {is100Off ? "مجاني بكوبون" : `${course.price} USD`}
                  </Text>
                )}
              </Space>
            </Space>
          </Card>

          {/* كوبون تخفيض */}
          {!isFree && (
            <>
              <div>
                <Text strong>كوبون تخفيض (اختياري)</Text>
                <Row gutter={8} style={{ marginTop: 8 }}>
                  <Col flex="auto">
                    <Input
                      placeholder="أدخل كود الكوبون"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      onPressEnter={applyCoupon}
                      allowClear
                    />
                  </Col>
                  <Col>
                    <Button onClick={applyCoupon} disabled={!coupon.trim()}>
                      تطبيق
                    </Button>
                  </Col>
                </Row>
                {effectivePrice !== null && effectivePrice !== course.price && (
                  <Alert
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    style={{ marginTop: 8 }}
                    message={
                      effectivePrice === 0
                        ? "🎉 كوبون 100%! التسجيل مجاني"
                        : `السعر بعد الخصم: ${effectivePrice} USD`
                    }
                  />
                )}
              </div>
              <Divider style={{ margin: "4px 0" }} />
            </>
          )}

          {/* المبلغ النهائي */}
          {!isFree && !is100Off && (
            <Row justify="space-between" align="middle">
              <Col><Text type="secondary">الإجمالي</Text></Col>
              <Col>
                <Text strong style={{ fontSize: 22, color: "#4f46e5" }}>
                  {finalPrice} USD
                </Text>
              </Col>
            </Row>
          )}

          {/* أزرار الدفع */}
          {isFree ? (
            <Button
              type="primary"
              size="large"
              block
              icon={<CheckCircleOutlined />}
              onClick={() => void enrollFreeCourse()}
              loading={paying !== null}
            >
              تسجيل مجاني
            </Button>
          ) : is100Off ? (
            <Button
              type="primary"
              size="large"
              block
              icon={<SafetyCertificateOutlined />}
              onClick={() => void pay("konnect")}
              loading={paying !== null}
            >
              تسجيل مجاني بالكوبون
            </Button>
          ) : (
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {/* Konnect */}
              <Button
                size="large"
                block
                icon={<CreditCardOutlined />}
                loading={paying === "konnect"}
                disabled={paying !== null}
                onClick={() => void pay("konnect")}
              >
                {paying === "konnect" ? "جاري التحويل..." : "ادفع عبر Konnect 🌍"}
              </Button>
              <Text type="secondary" style={{ textAlign: "center", display: "block", fontSize: 12 }}>
                Konnect — يقبل Visa/Mastercard + e-DINAR + محفظة
              </Text>
            </Space>
          )}

          {/* بطاقات الاختبار */}
          {import.meta.env.DEV && !isFree && (
            <Alert
              type="info"
              showIcon
              message="وضع الاختبار (Development فقط)"
              description="استخدم حساب/بيانات Sandbox الخاصة بـ Konnect من لوحة المزود."
            />
          )}
        </Space>
      </Card>
    </div>
  );
}
