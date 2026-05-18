import type { ReactNode } from "react";
import { Award, BarChart3, CalendarDays, CheckCircle2, FileText, FolderGit2, Target, Trophy, UsersRound } from "lucide-react";
import { PrintButton } from "@/components/reports/print-button";
import { cn } from "@/lib/utils";
import type { AuthProfile } from "@/types/auth";
import type {
  ReportAchievement,
  ReportCourse,
  ReportFilters,
  ReportProjectOption,
  ReportStats,
  ReportTask,
  ReportUserOption,
} from "@/types/reports";

type ReportsViewProps = {
  profile: AuthProfile;
  filters: ReportFilters;
  range: {
    from: string;
    to: string;
    label: string;
  };
  users: ReportUserOption[];
  projects: ReportProjectOption[];
  tasks: ReportTask[];
  achievements: ReportAchievement[];
  courses: ReportCourse[];
  stats: ReportStats;
};

const taskStatusLabels: Record<string, string> = {
  new: "جديدة",
  in_progress: "قيد التنفيذ",
  review: "بانتظار مراجعة",
  completed: "مكتملة",
  overdue: "متأخرة",
  cancelled: "ملغاة",
};

const courseStatusLabels: Record<string, string> = {
  planned: "مخططة",
  in_progress: "جارية",
  completed: "مكتملة",
  paused: "متوقفة",
};

export function ReportsView({
  profile,
  filters,
  range,
  users,
  projects,
  tasks,
  achievements,
  courses,
  stats,
}: ReportsViewProps) {
  return (
    <div className="space-y-4">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 md:p-8 print:rounded-none print:border-0 print:bg-white print:text-slate-950 print:shadow-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.2),transparent_30%),linear-gradient(135deg,rgba(34,211,238,0.14),transparent_46%)] print:hidden" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="badge border-cyanx/30 bg-cyanx/10 text-cyan-100 print:border-slate-300 print:bg-white print:text-slate-700">
              Management Reports
            </span>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl print:text-4xl">التقارير</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted print:text-slate-600">
              تقرير {filters.period === "weekly" ? "أسبوعي" : "يومي"} للفترة {range.label}، يشمل المهام
              والإنجازات والتعلم مع إمكانية التصفية حسب المستخدم أو المشروع.
            </p>
          </div>
          <PrintButton />
        </div>
      </section>

      <section className="glass-card print:hidden">
        <PanelTitle icon={<CalendarDays className="h-5 w-5" />} title="إعدادات التقرير" subtitle="اختر الفترة، المستخدم، والمشروع." />
        <form className="grid gap-3 md:grid-cols-4" method="get">
          <Select name="period" label="نوع التقرير" defaultValue={filters.period}>
            <option value="daily">تقرير يومي</option>
            <option value="weekly">تقرير أسبوعي</option>
          </Select>
          <Input label="التاريخ" name="date" type="date" defaultValue={filters.date} />
          <Select name="user" label="المستخدم" defaultValue={filters.user}>
            <option value="all">كل المستخدمين</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </Select>
          <Select name="project" label="المشروع" defaultValue={filters.project}>
            <option value="all">كل المشاريع</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <button className="premium-button md:col-span-4">تطبيق الفلاتر</button>
        </form>
      </section>

      <section id="printable-report" className="space-y-4 print:bg-white print:p-0 print:text-slate-950">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Target className="h-5 w-5" />} label="إجمالي المهام" value={stats.tasks.total} hint={`${stats.tasks.completed} مكتملة`} />
          <StatCard icon={<Trophy className="h-5 w-5" />} label="الإنجازات" value={stats.achievements.total} hint={`${stats.achievements.blockers} عوائق`} />
          <StatCard icon={<Award className="h-5 w-5" />} label="الدورات" value={stats.courses.total} hint={`${stats.courses.averageProgress}% متوسط`} />
          <StatCard icon={<UsersRound className="h-5 w-5" />} label="نوع التقرير" value={filters.period === "weekly" ? "أسبوعي" : "يومي"} hint={range.label} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
          <TasksStats stats={stats} />
          <LearningStats stats={stats} />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <ReportList
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="أحدث المهام"
            empty="لا توجد مهام ضمن الفلتر."
            items={tasks.slice(0, 8).map((task) => ({
              title: task.title,
              meta: `${taskStatusLabels[task.status] ?? task.status} · ${task.priority}`,
            }))}
          />
          <ReportList
            icon={<Trophy className="h-5 w-5" />}
            title="الإنجازات"
            empty="لا توجد إنجازات ضمن الفلتر."
            items={achievements.slice(0, 8).map((achievement) => ({
              title: achievement.title,
              meta: achievement.blockers ? "يوجد عائق" : achievement.achievementDate,
            }))}
          />
          <ReportList
            icon={<Award className="h-5 w-5" />}
            title="التعلم"
            empty="لا توجد دورات ضمن الفلتر."
            items={courses.slice(0, 8).map((course) => ({
              title: course.title,
              meta: `${courseStatusLabels[course.status] ?? course.status} · ${course.progress}%`,
            }))}
          />
        </div>

        <section className="glass-card print:border print:border-slate-200 print:bg-white print:shadow-none">
          <PanelTitle icon={<FileText className="h-5 w-5" />} title="ملخص تنفيذي" subtitle={`أُنشئ بواسطة ${profile.fullName}`} />
          <div className="grid gap-4 text-sm leading-8 text-muted print:text-slate-700 md:grid-cols-3">
            <p>
              تم تسجيل <strong className="text-foreground print:text-slate-950">{stats.tasks.total}</strong> مهمة في
              الفترة المحددة، منها <strong className="text-foreground print:text-slate-950">{stats.tasks.completed}</strong>{" "}
              مكتملة.
            </p>
            <p>
              الإنجازات المسجلة بلغت{" "}
              <strong className="text-foreground print:text-slate-950">{stats.achievements.total}</strong>، مع{" "}
              <strong className="text-foreground print:text-slate-950">{stats.achievements.blockers}</strong> عائق.
            </p>
            <p>
              نشاط التعلم يشمل <strong className="text-foreground print:text-slate-950">{stats.courses.total}</strong>{" "}
              دورة ومتوسط تقدم <strong className="text-foreground print:text-slate-950">{stats.courses.averageProgress}%</strong>.
            </p>
          </div>
        </section>
      </section>
    </div>
  );
}

function TasksStats({ stats }: { stats: ReportStats }) {
  const segments = [
    { label: "مكتملة", value: stats.tasks.completed, color: "bg-success" },
    { label: "قيد التنفيذ", value: stats.tasks.inProgress, color: "bg-cyanx" },
    { label: "مراجعة", value: stats.tasks.review, color: "bg-electric" },
    { label: "متأخرة", value: stats.tasks.overdue, color: "bg-red-400" },
  ];

  return (
    <section className="glass-card print:border print:border-slate-200 print:bg-white print:shadow-none">
      <PanelTitle icon={<BarChart3 className="h-5 w-5" />} title="إحصائيات المهام" subtitle={`${stats.tasks.urgent} مهمة عاجلة`} />
      <div className="space-y-4">
        {segments.map((segment) => (
          <ProgressRow key={segment.label} label={segment.label} value={segment.value} total={Math.max(stats.tasks.total, 1)} color={segment.color} />
        ))}
      </div>
    </section>
  );
}

function LearningStats({ stats }: { stats: ReportStats }) {
  return (
    <section className="glass-card print:border print:border-slate-200 print:bg-white print:shadow-none">
      <PanelTitle icon={<FolderGit2 className="h-5 w-5" />} title="إحصائيات الإنجاز والتعلم" subtitle="نظرة مركبة" />
      <div className="grid gap-3">
        <MiniStat label="إنجازات مرتبطة بمشاريع" value={stats.achievements.linkedToProjects} />
        <MiniStat label="دورات جارية" value={stats.courses.inProgress} />
        <MiniStat label="دورات مكتملة" value={stats.courses.completed} />
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: number | string; hint: string }) {
  return (
    <article className="glass-card print:border print:border-slate-200 print:bg-white print:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyanx/30 bg-cyanx/10 text-cyan-100 print:border-slate-200 print:bg-slate-50 print:text-slate-700">
          {icon}
        </div>
      </div>
      <p className="metric-label mt-5 print:text-slate-500">{label}</p>
      <strong className="mt-2 block text-4xl font-black">{value}</strong>
      <p className="mt-2 text-sm leading-7 text-muted print:text-slate-600">{hint}</p>
    </article>
  );
}

function ReportList({
  icon,
  title,
  items,
  empty,
}: {
  icon: ReactNode;
  title: string;
  items: Array<{ title: string; meta: string }>;
  empty: string;
}) {
  return (
    <section className="glass-card print:border print:border-slate-200 print:bg-white print:shadow-none">
      <PanelTitle icon={icon} title={title} subtitle={`${items.length} عنصر`} />
      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={`${item.title}-${item.meta}`} className="rounded-2xl border border-border bg-slate-950/35 p-3 print:border-slate-200 print:bg-white">
              <strong className="block text-sm font-black">{item.title}</strong>
              <span className="mt-1 block text-xs font-bold text-muted print:text-slate-500">{item.meta}</span>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted print:border-slate-200 print:text-slate-500">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const width = Math.round((value / total) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span className="text-muted print:text-slate-600">{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-700/40 print:bg-slate-100">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-950/35 p-4 print:border-slate-200 print:bg-white">
      <span className="text-sm font-bold text-muted print:text-slate-600">{label}</span>
      <strong className="text-2xl font-black">{value}</strong>
    </div>
  );
}

function PanelTitle({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyanx/30 bg-cyanx/10 text-cyan-100 print:border-slate-200 print:bg-slate-50 print:text-slate-700">
        {icon}
      </div>
      <div>
        <h2 className="section-title print:text-xl print:text-slate-950">{title}</h2>
        <p className="text-sm text-muted print:text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-muted">{label}</span>
      <input
        className="h-12 w-full rounded-2xl border border-border bg-slate-950/45 px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-cyanx/45"
        name={name}
        type={type}
        defaultValue={defaultValue}
      />
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-muted">{label}</span>
      <select
        className="h-12 w-full rounded-2xl border border-border bg-slate-950/45 px-4 text-sm text-foreground outline-none transition focus:border-cyanx/45"
        name={name}
        defaultValue={defaultValue}
      >
        {children}
      </select>
    </label>
  );
}
