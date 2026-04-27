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
import { useTranslation } from "react-i18next";
import { apiFetch } from "~/utils/api";
import { useAuth } from "~/context/auth";

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
  const { t } = useTranslation();
  const { message }       = App.useApp();
  const { courseId }      = useParams<{ courseId: string }>();
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const { user }          = useAuth();

  // ✅ بعد التسجيل، وجّه حسب role — الأستاذ المسجل كطالب يذهب لـ student/courses أيضاً
  const enrolledRedirect = () => navigate("/dashboard/student/courses");

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
        if (!res.ok || !data?.course) throw new Error(t("payment.errors.failedLoadCourse"));
        setCourse(data.course);
        setEffective(data.course.effectivePrice ?? data.course.price);
      } catch (e) {
        message.error(e instanceof Error ? e.message : t("payment.errors.generic"));
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
        throw new Error(data?.message || t("payment.errors.failedEnroll"));
      }
      message.success(t("payment.messages.enrolledSuccess"));
      enrolledRedirect();
    } catch (e) {
      message.error(e instanceof Error ? e.message : t("payment.errors.failedEnroll"));
    } finally {
      setPaying(null);
    }
  };

  const applyCoupon = async () => {
    if (!courseId || !coupon.trim()) return;
    try {
      const res  = await apiFetch(`/api/courses/${courseId}?couponCode=${encodeURIComponent(coupon.trim())}`);
      const data = (await res.json().catch(() => null)) as { course?: CourseItem; message?: string } | null;

      // ✅ Bug 3 Fix: الـ backend يُرجع 400 عند كوبون خاطئ
      if (!res.ok) {
        throw new Error(data?.message || t("payment.errors.invalidCoupon"));
      }

      if (!data?.course) throw new Error(t("payment.errors.failedCouponCheck"));

      const newPrice = data.course.effectivePrice ?? data.course.price;
      setEffective(newPrice);

      if (newPrice < (course?.price ?? Infinity)) {
        message.success(newPrice === 0 ? t("payment.messages.coupon100") : t("payment.messages.discountApplied", { price: newPrice }));
      } else {
        message.warning(t("payment.messages.couponNoDiscount"));
      }
    } catch (e) {
      message.error(e instanceof Error ? e.message : t("payment.errors.invalidCoupon"));
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
        throw new Error((data as { message?: string })?.message || t("payment.errors.failedStartPayment"));
      }

      // كوبون 100% → مسجّل مباشرة
      if (data?.enrollmentId) {
        message.success(data.message || t("payment.messages.freeEnrollByCoupon"));
        enrolledRedirect();
        return;
      }

      // redirect لبوابة الدفع
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      throw new Error(t("payment.errors.paymentUrlMissing"));
    } catch (e) {
      message.error(e instanceof Error ? e.message : t("payment.errors.paymentFailed"));
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
          message={t("payment.redirect.successTitle")}
          description={t("payment.redirect.successDescription")}
          action={
            <Button type="primary" onClick={() => enrolledRedirect()}>
              {t("payment.redirect.goToMyCourses")}
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
          message={t("payment.redirect.failedTitle")}
          description={t("payment.redirect.failedDescription")}
          action={
            <Button onClick={() => navigate(`/payment/${courseId}`)}>
              {t("payment.redirect.tryAgain")}
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
    return <Alert type="error" title={t("payment.errors.courseNotFound")} />;
  }

  const isFree     = course.type === "free";
  const finalPrice = effectivePrice ?? course.price;
  const is100Off   = finalPrice === 0 && !isFree;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <Card>
        <Space orientation="vertical" size={20} style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Title level={3} style={{ margin: 0 }}>{t("payment.title")}</Title>
            {/* ✅ زر الصفحة الرئيسية + زر لوحة التحكم */}
            <Space>
              <Button size="small" href="/">{t("common.home")}</Button>
              <Button size="small" href={user?.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"}>
                {t("common.dashboard")}
              </Button>
            </Space>
          </div>

          {/* معلومات الكورس */}
          <Card size="small" style={{ background: "#f9f9ff" }}>
            <Space orientation="vertical" size={4}>
              <Text strong style={{ fontSize: 16 }}>{course.title}</Text>
              <Text type="secondary">{course.description.slice(0, 100)}...</Text>
              <Space>
                <Tag color={isFree ? "green" : "gold"}>{isFree ? t("payment.courseType.free") : t("payment.courseType.paid")}</Tag>
                {!isFree && (
                  <Text strong style={{ fontSize: 18, color: "#4f46e5" }}>
                    {is100Off ? t("payment.messages.freeByCoupon") : `${course.price} USD`}
                  </Text>
                )}
              </Space>
            </Space>
          </Card>

          {/* كوبون تخفيض */}
          {!isFree && (
            <>
              <div>
                <Text strong>{t("payment.coupon.label")}</Text>
                <Row gutter={8} style={{ marginTop: 8 }}>
                  <Col flex="auto">
                    <Input
                      placeholder={t("payment.coupon.placeholder")}
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      onPressEnter={applyCoupon}
                      allowClear
                    />
                  </Col>
                  <Col>
                    <Button onClick={applyCoupon} disabled={!coupon.trim()}>
                      {t("payment.coupon.apply")}
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
                        ? t("payment.messages.coupon100")
                        : t("payment.messages.priceAfterDiscount", { price: effectivePrice })
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
              <Col><Text type="secondary">{t("payment.total")}</Text></Col>
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
              {t("payment.actions.freeEnroll")}
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
              {t("payment.actions.freeEnrollByCoupon")}
            </Button>
          ) : (
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              {/* Konnect */}
              <Button
                size="large"
                block
                icon={<CreditCardOutlined />}
                loading={paying === "konnect"}
                disabled={paying !== null}
                onClick={() => void pay("konnect")}
              >
                {paying === "konnect" ? t("payment.actions.redirecting") : t("payment.actions.payWithKonnect")}
              </Button>
              <Text type="secondary" style={{ textAlign: "center", display: "block", fontSize: 12 }}>
                {t("payment.konnectHint")}
              </Text>
            </Space>
          )}

          {/* بطاقات الاختبار */}
          {import.meta.env.DEV && !isFree && (
            <Alert
              type="info"
              showIcon
              title={t("payment.dev.title")}
              description={t("payment.dev.description")}
            />
          )}
        </Space>
      </Card>
    </div>
  );
}
