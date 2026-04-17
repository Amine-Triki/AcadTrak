import { useEffect, useMemo, useState } from "react";
import { App, Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Spin, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useAuth } from "~/context/auth";
import { apiFetch } from "~/utils/api";

const { Title, Text } = Typography;

type CourseType = "free" | "paid";
type CourseStatus = "draft" | "published";

interface CourseItem {
	id: string;
	title: string;
	description: string;
	category: string;
	instructor: string;
	type: CourseType;
	status: CourseStatus;
	price: number;
	isHidden: boolean;
	hiddenAt?: string | null;
}

interface CoursePayload {
	title: string;
	description: string;
	category: string;
	type: CourseType;
	status: CourseStatus;
	price?: number;
}

const getInstructorId = (instructor: unknown) => {
	if (!instructor) {
		return "";
	}

	if (typeof instructor === "string") {
		return instructor;
	}

	if (typeof instructor === "object" && "_id" in instructor) {
		return String((instructor as { _id: unknown })._id);
	}

	if (typeof instructor === "object" && "id" in instructor) {
		return String((instructor as { id: unknown }).id);
	}

	return "";
};

export default function TeacherCoursesPage() {
	const { message } = App.useApp();
	const { user } = useAuth();
	const [form] = Form.useForm<CoursePayload>();

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [open, setOpen] = useState(false);
	const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
	const [courses, setCourses] = useState<CourseItem[]>([]);

	const isAdmin = user?.role === "admin";

	const myCourses = useMemo(() => {
		if (!user?.id) {
			return [];
		}

		if (isAdmin) {
			return courses;
		}

		return courses.filter((course) => getInstructorId(course.instructor) === user.id);
	}, [courses, isAdmin, user?.id]);

	const fetchCourses = async () => {
		setLoading(true);
		try {
			const response = await apiFetch("/api/courses");
			const payload = (await response.json().catch(() => null)) as
				| { courses?: CourseItem[]; message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || "فشل تحميل الدورات");
			}

			setCourses(payload?.courses ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "فشل تحميل الدورات");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchCourses();
	}, []);

	const openCreateModal = () => {
		setEditingCourse(null);
		form.setFieldsValue({
			title: "",
			description: "",
			category: "",
			type: "free",
			status: "draft",
			price: 0,
		});
		setOpen(true);
	};

	const openEditModal = (course: CourseItem) => {
		setEditingCourse(course);
		form.setFieldsValue({
			title: course.title,
			description: course.description,
			category: course.category,
			type: course.type,
			status: course.status,
			price: course.price,
		});
		setOpen(true);
	};

	const closeModal = () => {
		setOpen(false);
		setEditingCourse(null);
		form.resetFields();
	};

	const onSubmit = async (values: CoursePayload) => {
		setSubmitting(true);
		try {
			const body: Record<string, unknown> = {
				title: values.title,
				description: values.description,
				category: values.category,
				type: values.type,
				status: values.status,
			};

			if (values.type === "paid") {
				body.price = values.price;
			}

			const isEdit = Boolean(editingCourse);
			const path = isEdit
				? `/api/courses/${editingCourse?.id}`
				: "/api/courses";

			const response = await apiFetch(path, {
				method: isEdit ? "PATCH" : "POST",
				body: JSON.stringify(body),
			});

			const payload = (await response.json().catch(() => null)) as
				| { message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || "فشل حفظ الكورس");
			}

			message.success(isEdit ? "تم تحديث الكورس" : "تم إنشاء الكورس");
			closeModal();
			await fetchCourses();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "فشل حفظ الكورس");
		} finally {
			setSubmitting(false);
		}
	};

	const onDelete = async (course: CourseItem) => {
		try {
			const response = await apiFetch(`/api/courses/${course.id}`, {
				method: "DELETE",
			});

			const payload = (await response.json().catch(() => null)) as
				| { message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || "فشل العملية");
			}

			message.success(payload?.message || "تم تنفيذ العملية بنجاح");
			await fetchCourses();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "فشل العملية");
		}
	};

	return (
		<Space direction="vertical" size={16} style={{ width: "100%" }}>
			<Row justify="space-between" align="middle" gutter={[12, 12]}>
				<Col>
					<Title level={3} style={{ margin: 0 }}>دوراتي</Title>
					<Text type="secondary">
						إنشاء وتحديث الكورسات مع ربط مباشر بالباك إند
					</Text>
				</Col>
				<Col>
					<Space>
						<Button icon={<ReloadOutlined />} onClick={() => void fetchCourses()}>
							تحديث
						</Button>
						<Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
							إنشاء كورس
						</Button>
					</Space>
				</Col>
			</Row>

			{loading ? (
				<div style={{ padding: 24, textAlign: "center" }}>
					<Spin />
				</div>
			) : (
				<Row gutter={[16, 16]}>
					{myCourses.map((course) => (
						<Col xs={24} md={12} xl={8} key={course.id}>
							<Card
								title={course.title}
								extra={
									<Space>
										<Tag color={course.type === "paid" ? "gold" : "green"}>
											{course.type === "paid" ? "مدفوع" : "مجاني"}
										</Tag>
										<Tag color={course.status === "published" ? "blue" : "default"}>
											{course.status === "published" ? "منشور" : "مسودة"}
										</Tag>
										{course.isHidden ? <Tag color="red">مخفي</Tag> : null}
									</Space>
								}
								actions={[
									<Button
										key={`edit-${course.id}`}
										type="text"
										icon={<EditOutlined />}
										onClick={() => openEditModal(course)}
									>
										تعديل
									</Button>,
									<Popconfirm
										key={`delete-${course.id}`}
										title={course.type === "free" ? "حذف الكورس المجاني؟" : "إخفاء الكورس المدفوع؟"}
										description={course.type === "free" ? "سيتم الحذف النهائي." : "سيتم إخفاؤه ويبقى للمشتركين فقط."}
										okText="نعم"
										cancelText="إلغاء"
										onConfirm={() => void onDelete(course)}
									>
										<Button type="text" danger icon={<DeleteOutlined />}>
											{course.type === "free" ? "حذف" : "إخفاء"}
										</Button>
									</Popconfirm>,
								]}
							>
								<Space direction="vertical" size={8} style={{ width: "100%" }}>
									<Text>{course.description}</Text>
									<Text type="secondary">Category ID: {course.category}</Text>
									<Text strong>
										السعر: {course.type === "free" ? "مجاني" : `${course.price} USD`}
									</Text>
									{course.isHidden && course.hiddenAt ? (
										<Text type="secondary">تم الإخفاء في: {new Date(course.hiddenAt).toLocaleString()}</Text>
									) : null}
								</Space>
							</Card>
						</Col>
					))}
				</Row>
			)}

			{!loading && myCourses.length === 0 ? (
				<Card>
					<Text type="secondary">لا توجد دورات بعد. أنشئ أول دورة للبدء.</Text>
				</Card>
			) : null}

			<Modal
				open={open}
				onCancel={closeModal}
				title={editingCourse ? "تعديل كورس" : "إنشاء كورس"}
				okText={editingCourse ? "حفظ التعديلات" : "إنشاء"}
				onOk={() => void form.submit()}
				confirmLoading={submitting}
			>
				<Form<CoursePayload>
					layout="vertical"
					form={form}
					onFinish={onSubmit}
					initialValues={{ type: "free", status: "draft", price: 0 }}
				>
					<Form.Item name="title" label="العنوان" rules={[{ required: true, message: "العنوان مطلوب" }]}>
						<Input />
					</Form.Item>

					<Form.Item
						name="description"
						label="الوصف"
						rules={[{ required: true, message: "الوصف مطلوب" }, { min: 10, message: "الوصف 10 أحرف على الأقل" }]}
					>
						<Input.TextArea rows={4} />
					</Form.Item>

					<Form.Item
						name="category"
						label="Category ID"
						rules={[
							{ required: true, message: "Category id مطلوب" },
							{ pattern: /^[a-fA-F0-9]{24}$/, message: "ObjectId غير صالح" },
						]}
					>
						<Input placeholder="مثال: 68000f51ce6df2d4f9c0f123" />
					</Form.Item>

					<Row gutter={12}>
						<Col span={12}>
							<Form.Item name="type" label="النوع" rules={[{ required: true }]}> 
								<Select
									options={[
										{ value: "free", label: "مجاني" },
										{ value: "paid", label: "مدفوع" },
									]}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="status" label="الحالة" rules={[{ required: true }]}> 
								<Select
									options={[
										{ value: "draft", label: "مسودة" },
										{ value: "published", label: "منشور" },
									]}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item shouldUpdate={(prev, curr) => prev.type !== curr.type} noStyle>
						{({ getFieldValue }) =>
							getFieldValue("type") === "paid" ? (
								<Form.Item
									name="price"
									label="السعر"
									rules={[{ required: true, message: "السعر مطلوب للكورس المدفوع" }]}
								>
									<InputNumber min={1} style={{ width: "100%" }} />
								</Form.Item>
							) : null
						}
					</Form.Item>
				</Form>
			</Modal>
		</Space>
	);
}
