import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
	App,
	Button,
	Card,
	Col,
	Drawer,
	Form,
	Image,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Row,
	Select,
	Space,
	Spin,
	Switch,
	Tag,
	Typography,
	Upload,
} from "antd";
import type { UploadFile } from "antd";
import { DeleteOutlined, EditOutlined, FilePdfOutlined, FolderOpenOutlined, MessageOutlined, PlusOutlined, ReloadOutlined, UploadOutlined, YoutubeOutlined } from "@ant-design/icons";
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

interface LessonAsset {
	url: string;
	publicId: string;
	bytes?: number;
}

interface LessonVideo {
	youtubeId: string;
	duration?: number;
}

interface LessonItem {
	_id?: string;
	id?: string;
	course: string;
	title: string;
	description?: string;
	order: number;
	video?: LessonVideo;
	pdf?: LessonAsset;
	thumbnail?: LessonAsset;
	isPreview: boolean;
	isPublished: boolean;
}

interface LessonFormPayload {
	title: string;
	description?: string;
	order?: number;
	youtubeId?: string;
	duration?: number;
	isPreview: boolean;
	isPublished: boolean;
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

const getLessonId = (lesson: LessonItem) => lesson.id || lesson._id || "";

export default function TeacherCoursesPage() {
	const { message } = App.useApp();
	const { user } = useAuth();
	const [form] = Form.useForm<CoursePayload>();
	const [lessonForm] = Form.useForm<LessonFormPayload>();

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [open, setOpen] = useState(false);
	const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
	const [courses, setCourses] = useState<CourseItem[]>([]);

	const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
	const [lessonsOpen, setLessonsOpen] = useState(false);
	const [lessonsLoading, setLessonsLoading] = useState(false);
	const [lessonsSubmitting, setLessonsSubmitting] = useState(false);
	const [lessons, setLessons] = useState<LessonItem[]>([]);
	const [lessonModalOpen, setLessonModalOpen] = useState(false);
	const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);
	const [pdfFileList, setPdfFileList] = useState<UploadFile[]>([]);
	const [thumbnailFileList, setThumbnailFileList] = useState<UploadFile[]>([]);
	const [removeVideo, setRemoveVideo] = useState(false);
	const [removePdf, setRemovePdf] = useState(false);
	const [removeThumbnail, setRemoveThumbnail] = useState(false);

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

	const fetchLessonsForCourse = async (courseId: string) => {
		setLessonsLoading(true);
		try {
			const response = await apiFetch(`/api/lessons/course/${courseId}`);
			const payload = (await response.json().catch(() => null)) as
				| { lessons?: LessonItem[]; message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || "فشل تحميل الدروس");
			}

			setLessons(payload?.lessons ?? []);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "فشل تحميل الدروس");
		} finally {
			setLessonsLoading(false);
		}
	};

	const openLessonsDrawer = (course: CourseItem) => {
		setSelectedCourse(course);
		setLessonsOpen(true);
		void fetchLessonsForCourse(course.id);
	};

	const closeLessonsDrawer = () => {
		setLessonsOpen(false);
		setSelectedCourse(null);
		setLessons([]);
	};

	const openCreateLessonModal = () => {
		setEditingLesson(null);
		lessonForm.setFieldsValue({
			title: "",
			description: "",
			order: lessons.length,
			youtubeId: "",
			duration: undefined,
			isPreview: false,
			isPublished: false,
		});
		setPdfFileList([]);
		setThumbnailFileList([]);
		setLessonModalOpen(true);
		setRemoveVideo(false);
		setRemovePdf(false);
		setRemoveThumbnail(false);
	};

	const openEditLessonModal = (lesson: LessonItem) => {
		setEditingLesson(lesson);
		lessonForm.setFieldsValue({
			title: lesson.title,
			description: lesson.description || "",
			order: lesson.order,
			youtubeId: lesson.video?.youtubeId || "",
			duration: lesson.video?.duration,
			isPreview: lesson.isPreview,
			isPublished: lesson.isPublished,
		});
		setPdfFileList([]);
		setThumbnailFileList([]);
		setLessonModalOpen(true);
		setRemoveVideo(false);
		setRemovePdf(false);
		setRemoveThumbnail(false);
	};

	const closeLessonModal = () => {
		setLessonModalOpen(false);
		setEditingLesson(null);
		setPdfFileList([]);
		setThumbnailFileList([]);
		setRemoveVideo(false);
		setRemovePdf(false);
		setRemoveThumbnail(false);
		lessonForm.resetFields();
	};

	const submitLesson = async (values: LessonFormPayload) => {
		if (!selectedCourse) {
			message.error("اختر كورس أولاً");
			return;
		}

		if (!editingLesson && !values.youtubeId?.trim() && !pdfFileList[0]?.originFileObj) {
			message.error("يجب إضافة فيديو YouTube أو ملف PDF على الأقل");
			return;
		}

		setLessonsSubmitting(true);
		try {
			const formData = new FormData();
			const youtubeId = values.youtubeId?.trim();
			const pdfFile = pdfFileList[0]?.originFileObj;
			const thumbnailFile = thumbnailFileList[0]?.originFileObj;

			if (editingLesson) {
				const existingHasVideo = Boolean(editingLesson.video?.youtubeId);
				const existingHasPdf = Boolean(editingLesson.pdf?.url);

				const willHaveVideo = removeVideo ? false : Boolean(youtubeId) || existingHasVideo;
				const willHavePdf = removePdf ? Boolean(pdfFile) : Boolean(pdfFile) || existingHasPdf;

				if (!willHaveVideo && !willHavePdf) {
					message.error("لا يمكن حذف الفيديو وPDF معًا بدون بديل. يجب أن يبقى واحد على الأقل.");
					setLessonsSubmitting(false);
					return;
				}
			}

			if (!editingLesson) {
				formData.append("course", selectedCourse.id);
			}

			formData.append("title", values.title.trim());
			if (values.description?.trim()) {
				formData.append("description", values.description.trim());
			}

			if (values.order !== undefined) {
				formData.append("order", String(values.order));
			}

			if (editingLesson && removeVideo) {
				formData.append("removeVideo", "true");
			} else if (youtubeId) {
				formData.append("youtubeId", youtubeId);
			}

			if (!removeVideo && values.duration !== undefined && values.duration !== null) {
				formData.append("duration", String(values.duration));
			}

			formData.append("isPreview", String(Boolean(values.isPreview)));
			formData.append("isPublished", String(Boolean(values.isPublished)));

			if (editingLesson && removePdf) {
				formData.append("removePdf", "true");
			}

			if (pdfFile) {
				formData.append("pdf", pdfFile);
			}

			if (editingLesson && removeThumbnail) {
				formData.append("removeThumbnail", "true");
			}

			if (thumbnailFile) {
				formData.append("thumbnail", thumbnailFile);
			}

			const lessonId = editingLesson ? getLessonId(editingLesson) : "";
			const response = await apiFetch(editingLesson ? `/api/lessons/${lessonId}` : "/api/lessons", {
				method: editingLesson ? "PATCH" : "POST",
				body: formData,
			});

			const payload = (await response.json().catch(() => null)) as
				| { message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || "فشل حفظ الدرس");
			}

			message.success(editingLesson ? "تم تحديث الدرس" : "تم إنشاء الدرس");
			closeLessonModal();
			await fetchLessonsForCourse(selectedCourse.id);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "فشل حفظ الدرس");
		} finally {
			setLessonsSubmitting(false);
		}
	};

	const deleteLesson = async (lesson: LessonItem) => {
		const lessonId = getLessonId(lesson);
		if (!selectedCourse || !lessonId) {
			message.error("بيانات الدرس غير مكتملة");
			return;
		}

		try {
			const response = await apiFetch(`/api/lessons/${lessonId}`, {
				method: "DELETE",
			});
			const payload = (await response.json().catch(() => null)) as
				| { message?: string }
				| null;

			if (!response.ok) {
				throw new Error(payload?.message || "فشل حذف الدرس");
			}

			message.success(payload?.message || "تم حذف الدرس");
			await fetchLessonsForCourse(selectedCourse.id);
		} catch (error) {
			message.error(error instanceof Error ? error.message : "فشل حذف الدرس");
		}
	};

	return (
		<Space orientation="vertical" size={16} style={{ width: "100%" }}>
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
										key={`lessons-${course.id}`}
										type="text"
										icon={<FolderOpenOutlined />}
										onClick={() => openLessonsDrawer(course)}
									>
										الدروس
									</Button>,
									<Link key={`discussions-${course.id}`} to={`/dashboard/teacher/courses/${course.id}/discussions`}>
										<Button type="text" icon={<MessageOutlined />}>
											النقاشات
										</Button>
									</Link>,
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
								<Space orientation="vertical" size={8} style={{ width: "100%" }}>
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

			<Drawer
				title={selectedCourse ? `دروس: ${selectedCourse.title}` : "الدروس"}
				open={lessonsOpen}
				onClose={closeLessonsDrawer}
				size={720}
				extra={
					<Space>
						<Button
							icon={<ReloadOutlined />}
							onClick={() => selectedCourse && void fetchLessonsForCourse(selectedCourse.id)}
						>
							تحديث
						</Button>
						<Button type="primary" icon={<PlusOutlined />} onClick={openCreateLessonModal}>
							إضافة درس
						</Button>
					</Space>
				}
			>
				{lessonsLoading ? (
					<div style={{ textAlign: "center", padding: 24 }}>
						<Spin />
					</div>
				) : (
					<Space orientation="vertical" size={12} style={{ width: "100%" }}>
						{lessons.map((lesson) => {
							const lessonId = getLessonId(lesson);
							return (
								<Card
									key={lessonId || `${lesson.title}-${lesson.order}`}
									title={
										<Space>
											<Text strong>{lesson.title}</Text>
											<Tag color="default">ترتيب: {lesson.order}</Tag>
											{lesson.isPublished ? <Tag color="blue">منشور</Tag> : <Tag>مسودة</Tag>}
											{lesson.isPreview ? <Tag color="green">Preview</Tag> : null}
										</Space>
									}
									extra={
										<Space>
											<Button type="text" icon={<EditOutlined />} onClick={() => openEditLessonModal(lesson)}>
												تعديل
											</Button>
											<Popconfirm
												title="حذف الدرس؟"
												description="سيتم حذف الدرس وملفاته من التخزين"
												onConfirm={() => void deleteLesson(lesson)}
												okText="نعم"
												cancelText="إلغاء"
											>
												<Button type="text" danger icon={<DeleteOutlined />}>
													حذف
												</Button>
											</Popconfirm>
										</Space>
									}
								>
									<Space orientation="vertical" size={10} style={{ width: "100%" }}>
										{lesson.description ? <Text>{lesson.description}</Text> : <Text type="secondary">بدون وصف</Text>}

										{lesson.thumbnail?.url ? (
											<Image src={lesson.thumbnail.url} alt={lesson.title} style={{ maxHeight: 180, objectFit: "cover" }} />
										) : null}

										{lesson.video?.youtubeId ? (
											<Button type="link" icon={<YoutubeOutlined />} href={`https://www.youtube.com/watch?v=${lesson.video.youtubeId}`} target="_blank">
												مشاهدة فيديو YouTube
											</Button>
										) : null}

										{lesson.pdf?.url ? (
											<Button type="link" icon={<FilePdfOutlined />} href={lesson.pdf.url} target="_blank">
												فتح PDF
											</Button>
										) : null}
									</Space>
								</Card>
							);
						})}

						{lessons.length === 0 ? (
							<Card>
								<Text type="secondary">لا توجد دروس في هذا الكورس بعد.</Text>
							</Card>
						) : null}
					</Space>
				)}
			</Drawer>

			<Modal
				open={lessonModalOpen}
				onCancel={closeLessonModal}
				title={editingLesson ? "تعديل درس" : "إضافة درس"}
				onOk={() => void lessonForm.submit()}
				confirmLoading={lessonsSubmitting}
				okText={editingLesson ? "حفظ" : "إضافة"}
			>
				<Form<LessonFormPayload>
					form={lessonForm}
					layout="vertical"
					onFinish={submitLesson}
					initialValues={{
						isPreview: false,
						isPublished: false,
					}}
				>
					<Form.Item name="title" label="عنوان الدرس" rules={[{ required: true, message: "العنوان مطلوب" }, { min: 2, message: "العنوان حرفان على الأقل" }]}> 
						<Input />
					</Form.Item>

					<Form.Item name="description" label="وصف الدرس">
						<Input.TextArea rows={3} />
					</Form.Item>

					<Row gutter={12}>
						<Col span={12}>
							<Form.Item name="order" label="الترتيب">
								<InputNumber min={0} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="duration" label="مدة الفيديو (ثانية)">
								<InputNumber min={0} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>

					<Form.Item
						name="youtubeId"
						label="YouTube ID"
						rules={[
							{
								validator: async (_, value: string | undefined) => {
									if (!value || /^[a-zA-Z0-9_-]{11}$/.test(value.trim())) {
										return Promise.resolve();
									}
									return Promise.reject(new Error("YouTube ID غير صالح"));
								},
							},
						]}
					>
						<Input placeholder="مثال: dQw4w9WgXcQ" />
					</Form.Item>

					{editingLesson?.video?.youtubeId ? (
						<Form.Item label="إدارة الفيديو الحالي">
							<Space orientation="vertical" size={6} style={{ width: "100%" }}>
								<Text type="secondary">
									الفيديو الحالي: {editingLesson.video.youtubeId}
								</Text>
								<Switch
									checked={removeVideo}
									onChange={(checked) => setRemoveVideo(checked)}
									checkedChildren="حذف الفيديو"
									unCheckedChildren="الإبقاء"
								/>
							</Space>
						</Form.Item>
					) : null}

					<Row gutter={12}>
						<Col span={12}>
							<Form.Item name="isPreview" label="Preview" valuePropName="checked">
								<Switch checkedChildren="نعم" unCheckedChildren="لا" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="isPublished" label="منشور" valuePropName="checked">
								<Switch checkedChildren="نعم" unCheckedChildren="لا" />
							</Form.Item>
						</Col>
					</Row>

					<Form.Item label="PDF (اختياري)">
						<Upload
							accept=".pdf,application/pdf"
							maxCount={1}
							beforeUpload={() => false}
							fileList={pdfFileList}
							onChange={({ fileList }) => {
								const next = fileList.slice(-1);
								setPdfFileList(next);
								if (next.length > 0) {
									setRemovePdf(false);
								}
							}}
						>
							<Button icon={<UploadOutlined />}>اختر ملف PDF</Button>
						</Upload>
						{editingLesson?.pdf?.url ? (
							<Space orientation="vertical" size={6} style={{ width: "100%", marginTop: 8 }}>
								<Button type="link" icon={<FilePdfOutlined />} href={editingLesson.pdf.url} target="_blank">
									عرض ملف PDF الحالي
								</Button>
								<Switch
									checked={removePdf}
									onChange={(checked) => setRemovePdf(checked)}
									checkedChildren="حذف PDF"
									unCheckedChildren="الإبقاء"
								/>
							</Space>
						) : null}
					</Form.Item>

					<Form.Item label="Thumbnail (اختياري)">
						<Upload
							accept="image/*"
							maxCount={1}
							beforeUpload={() => false}
							fileList={thumbnailFileList}
							onChange={({ fileList }) => {
								const next = fileList.slice(-1);
								setThumbnailFileList(next);
								if (next.length > 0) {
									setRemoveThumbnail(false);
								}
							}}
						>
							<Button icon={<UploadOutlined />}>اختر صورة</Button>
						</Upload>
						{editingLesson?.thumbnail?.url ? (
							<Space orientation="vertical" size={6} style={{ width: "100%", marginTop: 8 }}>
								<Image
									src={editingLesson.thumbnail.url}
									alt="thumbnail"
									style={{ maxHeight: 120, objectFit: "cover" }}
								/>
								<Switch
									checked={removeThumbnail}
									onChange={(checked) => setRemoveThumbnail(checked)}
									checkedChildren="حذف الصورة"
									unCheckedChildren="الإبقاء"
								/>
							</Space>
						) : null}
					</Form.Item>
				</Form>
			</Modal>
		</Space>
	);
}
