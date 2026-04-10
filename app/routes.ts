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
  layout("routes/_public.tsx", [
    index("routes/_public.home.tsx"),              // /
    route("about",   "routes/_public.about.tsx"),  // /about
    route("contact", "routes/_public.contact.tsx"),// /contact
  ]),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔐 صفحات Auth — بدون layout
  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  route("login",    "routes/login.tsx"),
  route("register", "routes/register.tsx"),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 لوحة التحكم — Sidebar جانبي
  // ━━━━━━━━━━━━━━━━━━━━━━━━━
  layout("routes/_dashboard.tsx", [

    // الطالب
    route("dashboard/student",                "routes/student/index.tsx"),
    route("dashboard/student/courses",        "routes/student/courses.tsx"),
    route("dashboard/student/courses/:id",    "routes/student/course-detail.tsx"),
    route("dashboard/student/grades",         "routes/student/grades.tsx"),

    // الأستاذ
    route("dashboard/teacher",                "routes/teacher/index.tsx"),
    route("dashboard/teacher/courses",        "routes/teacher/courses.tsx"),
    route("dashboard/teacher/students",       "routes/teacher/students.tsx"),

    // المسؤول
    route("dashboard/admin",                  "routes/admin/index.tsx"),
    route("dashboard/admin/users",            "routes/admin/users.tsx"),
    route("dashboard/admin/courses",          "routes/admin/courses.tsx"),
    route("dashboard/admin/settings",         "routes/admin/settings.tsx"),
  ]),
   route("*", "routes/not-found.tsx"),

] satisfies RouteConfig;