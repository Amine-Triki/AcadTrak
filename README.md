# AcadTrak - E-Learning Platform

---

## 🎓 Overview

**AcadTrak** is a modern and scalable educational platform that bridges the gap between instructors and learners. It enables teachers to publish their courses (free or paid) while allowing students to enroll or purchase courses easily.

**Note:** This repository contains the **Frontend (UI) only**. Full integration with production requires a complete Backend API.

---

## 🎯 Target Users

- **Teachers & Instructors:** Create and manage courses, track student performance
- **Students & Learners:** Search for courses, enroll, learn, and track progress
- **Administrators:** Manage system, users, courses, and global settings

---

## 🏗️ Four Main Sections

The platform is divided into four main interfaces:

### 1️⃣ Public Interface
Public browsing for all visitors before login:
- Home page
- About page
- Contact page
- Courses catalog page

### 2️⃣ Admin Dashboard
Complete system management:
- User management (teachers & students)
- Course management and moderation
- Internal messages overview
- Global settings management
- System monitoring and reports

### 3️⃣ Teacher Dashboard
Course and student management:
- Create and edit courses (free & paid)
- Manage course discussions
- Manage quizzes
- Monitor student data and performance
- Track analytics and reports

### 4️⃣ Student Dashboard
Learning path management:
- Browse enrolled/available courses
- Access course details and discussions
- View grades and certificates
- Track learning progress

---

## ✨ Key Features

- **Dynamic Course Management:** Publish free or paid courses easily
- **Secure Payment System:** **Flouci** and **Konnect** integrations for payment processing (currently in test mode)
- **Course Discussions:** Q&A workflow between students and instructors/admins
- **Progress Tracking:** Real-time student progress and grade updates
- **Coupon & Commission System:** Advanced discount and commission management (Backend)
- **Internal Messaging:** Communication between teachers and students (Backend)
- **Time Tracking:** Monitor lesson duration
- **Fast & Modern UI:** Built with React Router v7 and TailwindCSS

---

## 💳 Payment System (Flouci + Konnect)

The application is configured for **Flouci** and **Konnect** (trusted payment gateways):

- ✅ **Current Mode:** Sandbox/Test only
- ✅ **Enabled Providers:** Flouci, Konnect
- ❌ **Live Payments:** Not enabled (will be activated in production)
- 📘 **Provider Docs:**
  - Flouci: https://docs.flouci.com/getting-started/create-an-account
  - Konnect: https://docs.konnect.network/docs/en/dashboard/overview#api-key-management

**Note:** Most backend payment logic (charge processing, reconciliation, webhook handling) is handled by the Backend API and is not in this repository.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and NPM 9+
- Internet connection (for Backend API data)

### Installation

Install dependencies:

```bash
npm install
```

### Local Development

Start the development server:

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

### Build for Production

Create a production build:

```bash
npm run build
```

---

## 📦 Deployment

### Docker

Build and run the image:

```bash
docker build -t acadtrak-front .

# Run the container
docker run -p 3000:3000 acadtrak-front
```

Deploy on any Docker-supporting platform:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Manual Deployment

If you're familiar with deploying Node.js applications, the built-in server is production-ready.

Make sure to deploy the output of `npm run build`:

```
├── package.json
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server code
```

---

## 📂 Project Structure

```
/app
  /routes
    /guest
      /_public.tsx                # Public interface layout
      /_public.home.tsx           # Home
      /_public.about.tsx          # About
      /_public.contact.tsx        # Contact
      /_public.courses.tsx        # Public courses
    /dashboard
      /_dashboard.tsx             # Dashboard layout
      /admin
        /index.tsx                # Admin dashboard
        /users.tsx                # User management
        /courses.tsx              # Course moderation
        /messages.tsx             # Contact messages
        /settings.tsx             # System settings
      /teacher
        /index.tsx                # Teacher dashboard
        /courses.tsx              # Teacher courses
        /course-discussions.tsx   # Course discussions
        /quizzes.tsx              # Quiz management
        /students.tsx             # Students overview
      /student
        /index.tsx                # Student dashboard
        /courses.tsx              # Student courses
        /course-detail.tsx        # Course details
        /course-discussions.tsx   # Course discussions
        /grades.tsx               # Grades
    /login.tsx                    # Login page
    /register.tsx                 # Register page
    /payment.tsx                  # Payment page
    /not-found.tsx                # Not found page
  /app.css                        # Global styles
  /root.tsx                       # App root
/public                           # Static files
```

---

## 🛠️ Tech Stack

- **React Router v7** (Framework Mode)
- **TypeScript:** Strongly-typed code
- **TailwindCSS:** Modern styling
- **Ant Design v6:** Enterprise UI components for dashboards (tables, forms, modals, menus)
- **Vite:** Fast build tool
- **Hot Module Replacement (HMR):** Instant updates during development

### Ant Design Usage in Dashboards

Ant Design is primarily used for the three dashboard interfaces:

- **Admin Dashboard:** User management, course moderation, contact messages, and system settings
- **Teacher Dashboard:** Course management, discussions, quizzes, and students data
- **Student Dashboard:** Courses listing, course details, discussions, and grade views

```tsx
// Example: Ant Design Table in Teacher Dashboard
import { Table, Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function TeacherCourses() {
  const columns = [
    { title: 'Course Name', dataIndex: 'name', key: 'name' },
    { title: 'Students', dataIndex: 'students', key: 'students' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />}>Edit</Button>
          <Button danger icon={<DeleteOutlined />}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />}>New Course</Button>
      <Table columns={columns} dataSource={courses} />
    </div>
  );
}
```

---

## 📚 Resources

- [React Router Documentation](https://reactrouter.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Flouci Docs - Create an Account](https://docs.flouci.com/getting-started/create-an-account)
- [Konnect Docs - API Key Management](https://docs.konnect.network/docs/en/dashboard/overview#api-key-management)

---

## 📝 Important Notes

- This is **Frontend only**.
- Full integration requires a separate Backend API for authentication, data, and payments.
- Payments are currently in **Sandbox/Test mode** only (**Flouci** and **Konnect**).
- For production, you'll need to configure environment variables (API URLs, Flouci keys, Konnect keys, etc.).

---

Built with ❤️ using React Router

Developed by **Amine Triki** 👨‍💻

---

---

# AcadTrak - منصة تعليمية عربية

<div dir="rtl">

## 🎓 نظرة عامة

**AcadTrak** هي منصة تعليمية حديثة وقابلة للتوسع تجسر الفجوة بين الأساتذة والطلاب. تمكّن الأساتذة من نشر دوراتهم التعليمية (مجانية أو مدفوعة)، بينما يمكّن الطلاب من الالتحاق بالدورات أو شراء الدورات المدفوعة بسهولة.

**ملاحظة مهمة:** هذا المستودع يحتوي على **قسم الواجهة الأمامية (Frontend) فقط**. التكامل النهائي مع البيئة الإنتاجية يتطلب تكامل كامل مع Backend API.

---

## 🎯 الفئة المستهدفة

- **الأساتذة والمدربون:** إنشاء وإدارة دوراتهم، تتبع أداء الطلاب
- **الطلاب والمتعلمون:** البحث عن الدورات والالتحاق والتعلم وتتبع التقدم
- **المسؤولون:** إدارة النظام، المستخدمين، والدورات، والإعدادات العامة

---

## 🏗️ التقسيم الهيكلي (4 أجزاء رئيسية)

تنقسم المنصة إلى أربع واجهات رئيسية:

### 1️⃣ الواجهة العامة (Public)
تصفح علني لجميع الزوار قبل تسجيل الدخول:
- الصفحة الرئيسية
- صفحة "حول المنصة"
- صفحة التواصل
- صفحة استعراض الدورات

### 2️⃣ لوحة تحكم المسؤول (Admin Dashboard)
إدارة شاملة للنظام:
- إدارة المستخدمين (أساتذة وطلاب)
- إدارة الدورات وفحصها
- متابعة الرسائل الداخلية
- إدارة الإعدادات الكلية
- تقارير ومراقبة النظام

### 3️⃣ لوحة تحكم الأستاذ (Teacher Dashboard)
إدارة الدورات والطلاب:
- إنشاء وتعديل الدورات (مجانية ومدفوعة)
- إدارة مناقشات الدورات
- إدارة الاختبارات (Quizzes)
- مراقبة بيانات الطلاب والأداء
- تتبع الإحصائيات والتقارير

### 4️⃣ لوحة تحكم الطالب (Student Dashboard)
إدارة مسار التعلم:
- استعراض الدورات المتاحة/الملتحق بها
- الدخول إلى تفاصيل الدورة والمناقشات
- عرض الدرجات والشهادات
- تتبع التقدم الدراسي

---

## ✨ الخصائص الرئيسية

- **إدارة دورات ديناميكية:** نشر دورات مجانية أو مدفوعة بسهولة
- **نظام الدفع الآمن:** تكامل مع **Flouci** و **Konnect** لمعالجة الدفع (حاليًا في وضع الاختبار)
- **مناقشات الدورات:** نظام أسئلة وأجوبة بين الطلاب والأساتذة/المشرفين
- **تتبع التقدم:** تحديث فوري لتقدم الطالب والدرجات
- **نظام الكوبونات والعمولات:** نظام متقدم للخصومات والعمولات (Backend)
- **المراسلة الداخلية:** التواصل بين الأساتذة والطلاب (Backend)
- **تتبع الوقت:** مراقبة المدة الزمنية للدروس
- **واجهة سريعة وحديثة:** مبنية على React Router v7 و TailwindCSS

---

## 💳 نظام الدفع (Flouci + Konnect)

التطبيق الحالي مهيأ لـ **Flouci** و **Konnect** (بوابات دفع موثوقة):

- ✅ **الوضع الحالي:** Sandbox/Test فقط
- ✅ **مزودات الدفع المفعلة:** Flouci، Konnect
- ❌ **الدفع الحقيقي:** غير مفعّل حاليًا (سيتم تفعيله في الإنتاج)
- 📘 **توثيق المزودات:**
  - Flouci: https://docs.flouci.com/getting-started/create-an-account
  - Konnect: https://docs.konnect.network/docs/en/dashboard/overview#api-key-management

**ملاحظة:** معظم منطق الدفع الخلفي (charge processing, reconciliation, webhook handling) يتم على مستوى Backend API ولم يكن موجود في هذا المستودع.

---

## 🚀 البدء السريع

### المتطلبات الأساسية
- Node.js 18+ و NPM 9+
- اتصال إنترنت (للبيانات من Backend API)

### التثبيت

انسخ المتطلبات:

```bash
npm install
```

### التطوير المحلي

ابدأ خادم التطوير:

```bash
npm run dev
```

التطبيق سيكون متاحًا على: `http://localhost:5173`

### البناء للإنتاج

أنشئ بناءً للإنتاج:

```bash
npm run build
```

---

## 📦 النشر

### Docker

بناء وتشغيل الصورة:

```bash
docker build -t acadtrak-front .

# تشغيل الحاوية
docker run -p 3000:3000 acadtrak-front
```

يمكن نشر التطبيق على أي منصة تدعم Docker:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### نشر يدوي

إذا كنت معتادًا على نشر تطبيقات Node.js، فالخادم الداخلي جاهز للإنتاج.

تأكد من نشر مخرجات `npm run build`:

```
├── package.json
├── build/
│   ├── client/    # الأصول الثابتة
│   └── server/    # كود الخادم
```

---

## 📂 هيكل المشروع

```
/app
  /routes
    /guest
      /_public.tsx                # تخطيط الواجهة العامة
      /_public.home.tsx           # الصفحة الرئيسية
      /_public.about.tsx          # صفحة حول المنصة
      /_public.contact.tsx        # صفحة التواصل
      /_public.courses.tsx        # استعراض الدورات
    /dashboard
      /_dashboard.tsx             # تخطيط لوحات التحكم
      /admin
        /index.tsx                # لوحة المسؤول
        /users.tsx                # إدارة المستخدمين
        /courses.tsx              # إدارة/فحص الدورات
        /messages.tsx             # رسائل التواصل
        /settings.tsx             # إعدادات النظام
      /teacher
        /index.tsx                # لوحة الأستاذ
        /courses.tsx              # دورات الأستاذ
        /course-discussions.tsx   # مناقشات الدورات
        /quizzes.tsx              # إدارة الاختبارات
        /students.tsx             # بيانات الطلاب
      /student
        /index.tsx                # لوحة الطالب
        /courses.tsx              # الدورات
        /course-detail.tsx        # تفاصيل الدورة
        /course-discussions.tsx   # مناقشات الدورة
        /grades.tsx               # الدرجات
    /login.tsx                    # تسجيل الدخول
    /register.tsx                 # إنشاء حساب
    /payment.tsx                  # صفحة الدفع
    /not-found.tsx                # صفحة غير موجود
  /app.css                        # الأنماط العامة
  /root.tsx                       # جذر التطبيق
/public                           # ملفات ثابتة
```

---

## 🛠️ المميزات التقنية

- **React Router v7** (Framework Mode)
- **TypeScript:** كود محكم الأنواع
- **TailwindCSS:** تنسيق بسيط وحديث
- **Ant Design v6:** مكونات واجهة مؤسسية متقدمة لوحات التحكم (جداول، نماذج، نوافذ منبثقة، قوائم)
- **Vite:** بناء سريع وفعال
- **Hot Module Replacement (HMR):** تحديث فوري أثناء التطوير

### استخدام Ant Design في لوحات التحكم

يتم استخدام Ant Design بشكل أساسي في الواجهات الثلاث:

- **لوحة المسؤول:** إدارة المستخدمين، فحص الدورات، رسائل التواصل، وإعدادات النظام
- **لوحة الأستاذ:** إدارة الدورات، المناقشات، الاختبارات، وبيانات الطلاب
- **لوحة الطالب:** قوائم الدورات، تفاصيل الدورة، المناقشات، وعرض الدرجات

```tsx
// مثال: جدول Ant Design في لوحة الأستاذ
import { Table, Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function TeacherCourses() {
  const columns = [
    { title: 'اسم الدورة', dataIndex: 'name', key: 'name' },
    { title: 'عدد الطلاب', dataIndex: 'students', key: 'students' },
    { title: 'الحالة', dataIndex: 'status', key: 'status' },
    {
      title: 'الإجراءات',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />}>تعديل</Button>
          <Button danger icon={<DeleteOutlined />}>حذف</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />}>دورة جديدة</Button>
      <Table columns={columns} dataSource={courses} />
    </div>
  );
}
```

---

## 📚 الموارد

- [React Router Documentation](https://reactrouter.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Flouci Docs - Create an Account](https://docs.flouci.com/getting-started/create-an-account)
- [Konnect Docs - API Key Management](https://docs.konnect.network/docs/en/dashboard/overview#api-key-management)

---

## 📝 الملاحظات النهائية

- هذا الجزء هو **Frontend فقط**.
- التكامل الكامل يتطلب Backend API منفصل للمصادقة والبيانات والدفع.
- الدفع حاليًا في **وضع الاختبار (Sandbox/Test)** فقط (**Flouci** و **Konnect**).
- للإنتاج، ستحتاج إلى تكوين متغيرات البيئة (API URLs، Flouci keys، Konnect keys، إلخ).

---

بناء بـ ❤️ باستخدام React Router

طور بواسطة **أمين التريكي** 👨‍💻

</div> 