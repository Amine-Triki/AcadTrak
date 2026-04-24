import { useEffect, useMemo, useState } from "react";
import { App, Button, Card, Col, Row, Space, Spin, Tag, Typography } from "antd";
import { Link } from "react-router";
import { ReloadOutlined } from "@ant-design/icons";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

interface EnrollmentCourse {
	_id?: string;
	id?: string;
	title?: string;
	slug?: string;
	description?: string;
	thumbnail?: string;
	type?: "free" | "paid";
	status?: "draft" | "published";
	price?: number;
	isHidden?: boolean;
	instructor?: {
		id?: string;
		_id?: string;
		firstName?: string;
		lastName?: string;
		userName?: string;
	};
}

interface EnrollmentItem {
	_id: string;
	paidPrice: number;
	couponCode?: string;
	enrolledAt: string;
	course: EnrollmentCourse | string;
}

const getCourseId = (course: EnrollmentCourse | string) => {
	if (typeof course === "string") {
		return course;
	}

	return course.id || course._id || "";
};

export default function StudentCoursesPage() {
	const { message } = App.useApp();
	const [loading, setLoading] = useState(true);
	const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);

	const fetchEnrollments = async () => {
		setLoading(true);
		try {
			const response = await apiFetch("/api/enrollments/my");
			const payload = (await response.json().catch(() => null)) as
				| { enrollments?: EnrollmentItem[]; message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || "فشل تحميل الدورات المشتراة");
			}

			setEnrollments(payload?.enrollments ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "فشل تحميل الدورات المشتراة");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchEnrollments();
	}, []);

	const totalPaid = useMemo(
		() => enrollments.reduce((acc, item) => acc + (item.paidPrice || 0), 0),
		[enrollments],
	);

	return (
		<Space orientation="vertical" size={16} style={{ width: "100%" }}>
			<Row justify="space-between" align="middle">
				<Col>
					<Title level={3} style={{ margin: 0 }}>الدورات المشتراة</Title>
					<Text type="secondary">
						هذه البيانات قادمة مباشرة من API التسجيلات في الباك إند
					</Text>
				</Col>
				<Col>
					<Button icon={<ReloadOutlined />} onClick={() => void fetchEnrollments()}>
						تحديث
					</Button>
				</Col>
			</Row>

			{!loading ? (
				<Card>
					<Space size={24} wrap>
						<Text>عدد الدورات: <strong>{enrollments.length}</strong></Text>
						<Text>إجمالي ما دفعته: <strong>{totalPaid.toFixed(2)} USD</strong></Text>
					</Space>
				</Card>
			) : null}

			{loading ? (
				<div style={{ textAlign: "center", padding: 24 }}>
					<Spin />
				</div>
			) : (
				<Row gutter={[16, 16]}>
					{enrollments.map((item) => {
						const course = item.course;
						const courseId = getCourseId(course);
						const normalized = typeof course === "string" ? null : course;

						return (
							<Col key={item._id} xs={24} md={12} xl={8}>
								<Card
									title={normalized?.title || "Course"}
									extra={
										<Space>
											{normalized?.type ? (
												<Tag color={normalized.type === "paid" ? "gold" : "green"}>
													{normalized.type === "paid" ? "مدفوع" : "مجاني"}
												</Tag>
											) : null}
											{normalized?.isHidden ? <Tag color="red">مخفي عن الكتالوج</Tag> : null}
										</Space>
									}
								>
									<Space orientation="vertical" size={8} style={{ width: "100%" }}>
										<Text>{normalized?.description || "لا يوجد وصف"}</Text>
										<Text type="secondary">تاريخ التسجيل: {new Date(item.enrolledAt).toLocaleDateString()}</Text>
										<Text strong>السعر المدفوع: {item.paidPrice} USD</Text>
										{item.couponCode ? <Text type="secondary">كوبون: {item.couponCode}</Text> : null}

										{/* معلومات الأستاذ */}
										{normalized?.instructor && (
											<div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
												<Text type="secondary">الأستاذ: </Text>
												<Link 
													to={`/instructor/${normalized.instructor.id || normalized.instructor._id}`}
													style={{ marginLeft: 8 }}
												>
													<Text>
														{normalized.instructor.firstName && normalized.instructor.lastName
															? `${normalized.instructor.firstName} ${normalized.instructor.lastName}`
															: normalized.instructor.userName || "أستاذ"}
													</Text>
												</Link>
											</div>
										)}

										{courseId ? (
											<Space style={{ marginTop: 8 }}>
												<Link to={`/dashboard/student/courses/${courseId}`}>تفاصيل الكورس</Link>
												<Link to={`/dashboard/student/courses/${courseId}/discussions`}>
													النقاشات
												</Link>
											</Space>
										) : null}
									</Space>
								</Card>
							</Col>
						);
					})}
				</Row>
			)}

			{!loading && enrollments.length === 0 ? (
				<Card>
					<Text type="secondary">لا تملك أي دورة مشتراة حتى الآن.</Text>
				</Card>
			) : null}
		</Space>
	);
}
