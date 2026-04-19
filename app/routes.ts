/* import { type RouteConfig, index } from "@react-router/dev/routes"; */
/* export default [index("routes/home.tsx")] satisfies RouteConfig;
 */

import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";
export default [

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌐 الصفحات العامة — Navbar أفقي
  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  layout("routes/guest/_public.tsx", [
    index("routes/guest/_public.home.tsx"),              // /
    route("about",   "routes/guest/_public.about.tsx"),  // /about
    route("contact", "routes/guest/_public.contact.tsx"),// /contact
    route("courses", "routes/guest/_public.courses.tsx"),// /courses
  ]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔐 صفحات Auth — بدون layout
  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  route("login",    "routes/login.tsx"),
  route("register", "routes/register.tsx"),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 لوحة التحكم — Sidebar جانبي
  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  layout("routes/dashboard/_dashboard.tsx", [

    // الطالب
    route("dashboard/student",                "routes/dashboard/student/index.tsx"),
    route("dashboard/student/courses",        "routes/dashboard/student/courses.tsx"),
    route("dashboard/student/courses/:id",    "routes/dashboard/student/course-detail.tsx"),
    route("dashboard/student/grades",         "routes/dashboard/student/grades.tsx"),

    // الأستاذ
    route("dashboard/teacher",                "routes/dashboard/teacher/index.tsx"),
    route("dashboard/teacher/courses",        "routes/dashboard/teacher/courses.tsx"),
    route("dashboard/teacher/quizzes",        "routes/dashboard/teacher/quizzes.tsx"),
    route("dashboard/teacher/students",       "routes/dashboard/teacher/students.tsx"),

    // المسؤول
    route("dashboard/admin",                  "routes/dashboard/admin/index.tsx"),
    route("dashboard/admin/users",            "routes/dashboard/admin/users.tsx"),
    route("dashboard/admin/courses",          "routes/dashboard/admin/courses.tsx"),
    route("dashboard/admin/settings",         "routes/dashboard/admin/settings.tsx"),
  ]),
   route("*", "routes/not-found.tsx"),

] satisfies RouteConfig;