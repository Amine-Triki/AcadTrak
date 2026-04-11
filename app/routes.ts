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
    route("dashboard/dashboard/student",                "routes/student/index.tsx"),
    route("dashboard/dashboard/student/courses",        "routes/student/courses.tsx"),
    route("dashboard/dashboard/student/courses/:id",    "routes/student/course-detail.tsx"),
    route("dashboard/dashboard/student/grades",         "routes/student/grades.tsx"),

    // الأستاذ
    route("dashboard/dashboard/teacher",                "routes/teacher/index.tsx"),
    route("dashboard/dashboard/teacher/courses",        "routes/teacher/courses.tsx"),
    route("dashboard/dashboard/teacher/students",       "routes/teacher/students.tsx"),

    // المسؤول
    route("dashboard/dashboard/admin",                  "routes/admin/index.tsx"),
    route("dashboard/dashboard/admin/users",            "routes/admin/users.tsx"),
    route("dashboard/dashboard/admin/courses",          "routes/admin/courses.tsx"),
    route("dashboard/dashboard/admin/settings",         "routes/admin/settings.tsx"),
  ]),
   route("*", "routes/not-found.tsx"),

] satisfies RouteConfig;