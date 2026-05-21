import { Activity, AlertTriangle, ArrowUpLeft, CheckCircle2, FileText, FolderGit2, GraduationCap, ListTodo, PlayCircle, Rocket } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const toneClasses = {
  cyan: "border-cyanx/30 bg-cyanx/10 text-cyan-100",
  blue: "border-electric/30 bg-electric/10 text-blue-100",
  green: "border-success/30 bg-success/10 text-emerald-100",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-100",
};

type Tone = keyof typeof toneClasses;

const kpiIcons = [ListTodo, PlayCircle, CheckCircle2, FolderGit2, AlertTriangle];

type DashboardViewProps = {
  activeProjects?: Array<{ id: string; name: string; description: string | null; progress: number; dueDate: string | null }> ;
  activeProjectsCount?: number;
  ongoingCourses?: Array<{ id: string; title: string; provider: string | null; progress: number }> ;
  tasks?: Array<{ id: string; title: string; status: string; priority: string; due_date: string | null; created_at: string }>;
};

type DashboardMetrics = {
  tasksToday: number;
  inProgress: number;
  attentionTasks: Array<{ id: string; title: string; status: string; priority: string; due_date: string | null; created_at: string; reason: string }>;
  usesDueDateFallback: boolean;
};

export function DashboardView({ activeProjects = [], activeProjectsCount = 0, ongoingCourses = [], tasks = [] }: DashboardViewProps) {
  const metrics = buildDashboardMetrics(tasks);

  return (
    <div className="space-y-3.5 lg:space-y-4">
      <HeroSection />
      <MetricGrid activeProjectsCount={activeProjectsCount} tasksToday={metrics.tasksToday} inProgress={metrics.inProgress} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(21rem,0.8fr)]">
        <TasksAttentionPanel tasks={metrics.attentionTasks} usesDueDateFallback={metrics.usesDueDateFallback} />
        <ActivityPanel />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <AchievementsPanel />
        <ActiveProjectsPanel projects={activeProjects} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <OngoingCoursesPanel courses={ongoingCourses} />
        <ManagerQuickReport />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="glass-panel rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">مركز إدارة قسم التطوير</h1>
          <p className="mt-3 text-sm leading-7 text-muted md:text-base">
            منصة موحدة لتنظيم المهام، توثيق الإنجازات، متابعة المشاريع، ومراقبة تطور الفريق من مكان واحد.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button className="premium-button h-10 px-4 text-sm">
              <Rocket className="h-4 w-4" />
              بدء يوم العمل
            </button>
            <button className="soft-button h-10 px-4 text-sm">
              <FileText className="h-4 w-4" />
              تقرير المدير
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-slate-950/45 px-4 py-3 text-right">
          <p className="text-xs text-muted">جاهزية الفريق</p>
          <p className="mt-1 text-2xl font-bold">76%</p>
        </div>
      </div>
    </section>
  );
}

const dashboardMetrics = [
  { label: "مهام اليوم", trend: "Live", tone: "cyan" },
  { label: "قيد التنفيذ", trend: "Live", tone: "blue" },
  { label: "مشاريع نشطة", trend: "Live", tone: "green" },
  { label: "عوائق مفتوحة", value: "0", trend: "0", tone: "amber" },
] as const;

function MetricGrid({ activeProjectsCount, tasksToday, inProgress }: { activeProjectsCount: number; tasksToday: number; inProgress: number }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {dashboardMetrics.slice(0, 5).map((metric, index) => {
        const Icon = kpiIcons[index] ?? Activity;
        const value = metric.label === "مشاريع نشطة" ? String(activeProjectsCount) : metric.label === "مهام اليوم" ? String(tasksToday) : metric.label === "قيد التنفيذ" ? String(inProgress) : (metric.value ?? "0");

        return (
          <article key={metric.label} className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className={cn("grid h-9 w-9 place-items-center rounded-xl border", toneClasses[metric.tone as Tone])}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn("badge min-h-6 px-2.5 text-[11px]", toneClasses[metric.tone as Tone])}>{metric.trend}</span>
            </div>
            <p className="mt-4 text-xs text-muted">{metric.label}</p>
            <strong className="mt-1.5 block text-2xl font-bold">{value}</strong>
          </article>
        );
      })}
    </section>
  );
}

function TasksAttentionPanel({ tasks, usesDueDateFallback }: { tasks: DashboardMetrics["attentionTasks"]; usesDueDateFallback: boolean }) {
  return <TasksTable tasks={tasks} usesDueDateFallback={usesDueDateFallback} />;
}

function AchievementsPanel() {
  return (
    <section className="glass-card">
      <PanelHeader eyebrow="Achievements" title="آخر الإنجازات" />
      <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted">
        لا توجد إنجازات لعرضها حاليًا.
      </div>
    </section>
  );
}

function ActiveProjectsPanel({ projects }: { projects: NonNullable<DashboardViewProps["activeProjects"]> }) {
  return <section className="glass-card"><PanelHeader eyebrow="Projects" title="المشاريع النشطة" />{projects.length ? <div className="grid gap-3">{projects.map((project)=><article key={project.id} className="rounded-2xl border border-border bg-slate-950/35 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">{project.name}</h3><span className="text-sm font-bold">{project.progress}%</span></div><p className="mt-2 text-xs text-muted">{project.description || "مشروع نشط بدون وصف."}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700/45"><div className="h-full rounded-full bg-gradient-to-l from-success to-cyanx" style={{ width: `${project.progress}%` }} /></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted">لا توجد مشاريع نشطة حاليًا.</div>}</section>;
}

function OngoingCoursesPanel({ courses }: { courses: NonNullable<DashboardViewProps["ongoingCourses"]> }) {
  return (
    <section className="glass-card">
      <PanelHeader eyebrow="Learning" title="تقدم الدورات" />
      {courses.length ? (
        <div className="space-y-3">
          {courses.map((course) => (
            <article key={course.id} className="rounded-2xl border border-border bg-slate-950/35 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5"><GraduationCap className="h-4 w-4 text-emerald-300" /><h3 className="text-sm font-bold">{course.title}</h3></div>
                <span className="text-sm font-bold">{course.progress}%</span>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted">لا توجد دورات جارية حاليًا.</div>}
    </section>
  );
}

function TasksTable({ tasks, usesDueDateFallback }: { tasks: DashboardMetrics["attentionTasks"]; usesDueDateFallback: boolean }) {
  return <section className="glass-card"><PanelHeader eyebrow="Priority" title="مهام تحتاج انتباه" />{tasks.length ? <div className="space-y-2.5">{tasks.map((task) => <article key={task.id} className="rounded-2xl border border-border bg-slate-950/35 p-3.5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold">{task.title}</h3><span className="badge min-h-6 px-2.5 text-[11px] border-amber-400/30 bg-amber-400/10 text-amber-100">{task.reason}</span></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted">Empty State</div>}{usesDueDateFallback ? <p className="mt-3 text-xs text-muted">ملاحظة: تم استخدام created_at مؤقتًا لعدم توفر due_date في بعض المهام.</p> : null}</section>;
}

function toRiyadhDate(dateInput: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(dateInput));
}

function buildDashboardMetrics(tasks: NonNullable<DashboardViewProps["tasks"]>): DashboardMetrics {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const hasAnyDueDate = tasks.some((task) => Boolean(task.due_date));
  const usesDueDateFallback = !hasAnyDueDate;

  const tasksToday = tasks.filter((task) => {
    const sourceDate = task.due_date ?? task.created_at;
    return toRiyadhDate(sourceDate) === today;
  }).length;

  const inProgress = tasks.filter((task) => task.status === "in_progress").length;

  const attentionTasks = tasks.filter((task) => {
    const dueDate = task.due_date ? toRiyadhDate(task.due_date) : null;
    const fallbackDate = toRiyadhDate(task.created_at);
    const referenceDate = dueDate ?? fallbackDate;
    const isDueToday = referenceDate === today;
    const isOverdue = task.status === "overdue" || (referenceDate < today && task.status !== "completed" && task.status !== "cancelled");
    const isUrgent = task.priority === "urgent";
    return isDueToday || isOverdue || isUrgent;
  }).slice(0, 6).map((task) => {
    const dateForCompare = toRiyadhDate(task.due_date ?? task.created_at);
    const isOverdue = task.status === "overdue" || (dateForCompare < today && task.status !== "completed" && task.status !== "cancelled");
    const isUrgent = task.priority === "urgent";
    const reason = isOverdue ? "متأخرة" : isUrgent ? "عاجلة" : "تستحق اليوم";
    return { ...task, reason };
  });

  return { tasksToday, inProgress, attentionTasks, usesDueDateFallback };
}

function ActivityPanel() {
  return (
    <aside className="glass-card">
      <PanelHeader eyebrow="Activity" title="آخر الإنجازات" />
      <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted">
        لا توجد نشاطات حديثة لعرضها حاليًا.
      </div>
    </aside>
  );
}

function ManagerQuickReport() {
  return (
    <section className="glass-card">
      <PanelHeader eyebrow="Manager" title="تقرير سريع للمدير" action={<button className="soft-button h-9 px-3 text-xs">عرض التفاصيل <ArrowUpLeft className="h-4 w-4" /></button>} />
      <div className="space-y-3 text-sm text-muted">
        <p>لا توجد بيانات كافية لإعداد التقرير السريع حاليًا.</p>
        <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs">
          Empty State
        </div>
      </div>
    </section>
  );
}

function PanelHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="mb-4 flex items-start justify-between gap-4"><div><span className="text-[11px] font-bold uppercase tracking-wide text-cyanx">{eyebrow}</span><h2 className="mt-1 text-lg font-bold md:text-xl">{title}</h2></div>{action}</div>;
}
