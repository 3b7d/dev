import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Rocket,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

export const sidebarItems = [
  { title: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { title: "المهام", href: "/tasks", icon: ListChecks },
  { title: "إنجازات اليوم", href: "/achievements", icon: Sparkles },
  { title: "المشاريع", href: "/projects", icon: FolderGit2 },
  { title: "الدورات", href: "/courses", icon: GraduationCap },
  { title: "التقارير", href: "/reports", icon: BarChart3 },
  { title: "المستخدمون", href: "/users", icon: UsersRound, disabled: true },
];

export const dashboardMetrics = [
  {
    label: "مهام اليوم",
    value: "14",
    hint: "9 مهام مكتملة حتى الآن",
    trend: "+18%",
    icon: CheckCircle2,
    tone: "cyan",
  },
  {
    label: "قيد التنفيذ",
    value: "6",
    hint: "متوسط الإنجاز 72%",
    trend: "+7%",
    icon: TimerReset,
    tone: "blue",
  },
  {
    label: "مشاريع نشطة",
    value: "4",
    hint: "مشروعان قريبان من الإطلاق",
    trend: "+2",
    icon: FolderGit2,
    tone: "green",
  },
  {
    label: "عوائق مفتوحة",
    value: "1",
    hint: "بانتظار اعتماد من الإدارة",
    trend: "مهم",
    icon: TriangleAlert,
    tone: "amber",
  },
];

export const focusItems = [
  { title: "إغلاق تصميم Dashboard الأولي", done: true },
  { title: "تثبيت لغة التصميم والـ Tokens", done: true },
  { title: "مراجعة قابلية القراءة على الجوال", done: false },
  { title: "تجهيز المرحلة الثانية للمصادقة", done: false },
];

export const taskTable = [
  {
    title: "تصميم واجهة لوحة التحكم",
    description: "Hero + Metrics + Activity Feed",
    owner: "أحمد",
    priority: "عالية",
    status: "قيد التنفيذ",
    progress: 84,
  },
  {
    title: "تجهيز نظام الثيم الداكن",
    description: "ألوان، حدود، ظلال، حالات Hover",
    owner: "سارة",
    priority: "متوسطة",
    status: "مراجعة",
    progress: 66,
  },
  {
    title: "رسم تصور حماية الصفحات",
    description: "Admin / Lead / Member / Viewer",
    owner: "محمد",
    priority: "عالية",
    status: "مخطط",
    progress: 42,
  },
];

export const kanbanColumns = [
  {
    title: "مخطط",
    count: 3,
    cards: [
      { title: "صفحة تسجيل الدخول", tag: "Auth", tone: "blue" },
      { title: "نموذج صلاحيات الأدوار", tag: "Roles", tone: "cyan" },
    ],
  },
  {
    title: "قيد التنفيذ",
    count: 4,
    cards: [
      { title: "Dashboard Premium", tag: "UI", tone: "green", featured: true },
      { title: "Topbar سريع", tag: "UX", tone: "blue" },
    ],
  },
  {
    title: "مراجعة",
    count: 2,
    cards: [{ title: "RTL وتجاوب الجوال", tag: "Quality", tone: "amber" }],
  },
];

export const activityFeed = [
  { title: "تم اعتماد اتجاه الواجهة RTL بالكامل", time: "قبل 12 دقيقة", icon: ShieldCheck },
  { title: "تم إنشاء بيانات وهمية للوحة التحكم", time: "قبل 28 دقيقة", icon: Rocket },
  { title: "تم تثبيت شكل كروت الإحصائيات", time: "اليوم 10:40 م", icon: Clock3 },
];
