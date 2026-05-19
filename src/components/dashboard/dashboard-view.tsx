import {
  Activity,
  ArrowUpLeft,
  Circle,
  FileText,
  FolderGit2,
  GraduationCap,
  Rocket,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  activityFeed,
  dashboardMetrics,
  focusItems,
  kanbanColumns,
  taskTable,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const toneClasses = {
  cyan: "border-cyanx/30 bg-cyanx/10 text-cyan-100",
  blue: "border-electric/30 bg-electric/10 text-blue-100",
  green: "border-success/30 bg-success/10 text-emerald-100",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-100",
};

type Tone = keyof typeof toneClasses;

type DashboardViewProps = {
  activeProjects?: Array<{
    id: string;
    name: string;
    description: string | null;
    progress: number;
    dueDate: string | null;
  }>;
  ongoingCourses?: Array<{
    id: string;
    title: string;
    provider: string | null;
    progress: number;
  }>;
};

export function DashboardView({ activeProjects = [], ongoingCourses = [] }: DashboardViewProps) {
  return (
    <div className="space-y-4">
      <HeroSection />
      <MetricGrid />
      <div className="grid gap-4 xl:grid-cols-2">
        <ActiveProjectsPanel projects={activeProjects} />
        <OngoingCoursesPanel courses={ongoingCourses} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.75fr)]">
        <WorkflowPanel />
        <FocusPanel />
      </div>
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <TasksTable />
        <ActivityPanel />
      </div>
    </div>
  );
}

function ActiveProjectsPanel({ projects }: { projects: NonNullable<DashboardViewProps["activeProjects"]> }) {
  return (
    <section className="glass-card">
      <PanelHeader eyebrow="Active Projects" title="المشاريع النشطة" />
      {projects.length ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="rounded-3xl border border-border bg-slate-950/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyanx/30 bg-cyanx/10 text-cyan-100">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <strong className="text-2xl font-black">{project.progress}%</strong>
              </div>
              <h3 className="mt-4 text-lg font-black leading-7">{project.name}</h3>
              <p className="mt-2 max-h-14 overflow-hidden text-sm leading-7 text-muted">
                {project.description || "مشروع نشط بدون وصف."}
              </p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-700/45">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-success via-cyanx to-electric"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <p className="mt-3 text-xs font-bold text-muted">التسليم: {project.dueDate ?? "غير محدد"}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm leading-7 text-muted">
          لا توجد مشاريع نشطة حاليًا.
        </div>
      )}
    </section>
  );
}

function OngoingCoursesPanel({ courses }: { courses: NonNullable<DashboardViewProps["ongoingCourses"]> }) {
  return (
    <section className="glass-card">
      <PanelHeader eyebrow="Learning" title="الدورات الجارية" />
      {courses.length ? (
        <div className="grid gap-3">
          {courses.map((course) => (
            <article key={course.id} className="rounded-3xl border border-border bg-slate-950/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-success/30 bg-success/10 text-emerald-100">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black leading-7">{course.title}</h3>
                    <p className="text-sm text-muted">{course.provider ?? "مزود غير محدد"}</p>
                  </div>
                </div>
                <strong className="text-2xl font-black">{course.progress}%</strong>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-700/45">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-success via-cyanx to-electric"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm leading-7 text-muted">
          لا توجد دورات جارية حاليًا.
        </div>
      )}
    </section>
  );
}

function HeroSection() {
  return (
    <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 md:p-8 xl:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(34,211,238,0.22),transparent_28%),linear-gradient(135deg,rgba(59,130,246,0.18),transparent_42%)]" />
      <div className="relative grid items-center gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <div>
          <span className="badge border-cyanx/30 bg-cyanx/10 text-cyan-100">DevHub Command Center</span>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.08] text-foreground md:text-6xl">
مركز إدارة قسم التطوير </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
نظام داخلي يساعد فريق التطوير على متابعة المهام اليومية، توثيق الإنجازات، إدارة المشاريع، ومتابعة الدورات من مكان واحد وبأسلوب احترافي.
    </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="premium-button">
              <Rocket className="h-5 w-5" />
              بدء يوم العمل
            </button>
            <button className="soft-button">
              <FileText className="h-5 w-5" />
              معاينة تقرير
            </button>
          </div>
        </div>

        <div className="relative mx-auto grid min-h-72 w-full max-w-md place-items-center">
          <div className="absolute h-72 w-72 rounded-full border border-cyanx/25 bg-[radial-gradient(circle,rgba(34,211,238,0.2),transparent_42%)] shadow-glow" />
          <div className="absolute right-2 top-8 w-56 rounded-3xl border border-border bg-slate-950/70 p-4 shadow-premium backdrop-blur-xl">
            <p className="text-sm font-bold text-muted">المهام المكتملة</p>
            <strong className="mt-1 block text-5xl font-black">38</strong>
            <div className="mt-4 flex h-14 items-end gap-2">
              {[36, 62, 44, 86, 70].map((height) => (
                <span
                  key={height}
                  className="flex-1 rounded-t-full bg-gradient-to-t from-electric to-cyanx"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
          <div className="absolute bottom-8 left-3 rounded-3xl border border-success/25 bg-slate-950/75 p-4 shadow-premium backdrop-blur-xl">
            <p className="text-xs font-bold text-muted">سرعة الإنجاز</p>
            <strong className="mt-1 block text-3xl font-black text-emerald-200">+24%</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {dashboardMetrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article key={metric.label} className="glass-card min-h-44">
            <div className="flex items-start justify-between gap-4">
              <div
                className={cn("grid h-12 w-12 place-items-center rounded-2xl border", toneClasses[metric.tone as Tone])}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn("badge", toneClasses[metric.tone as Tone])}>{metric.trend}</span>
            </div>
            <p className="metric-label mt-5">{metric.label}</p>
            <strong className="mt-2 block text-4xl font-black">{metric.value}</strong>
            <p className="mt-2 text-sm leading-7 text-muted">{metric.hint}</p>
          </article>
        );
      })}
    </section>
  );
}

function WorkflowPanel() {
  return (
    <section className="glass-card">
      <PanelHeader
        eyebrow="Workflow"
        title="تدفق العمل الحالي"
        action={
          <button className="soft-button">
            عرض التفاصيل
            <ArrowUpLeft className="h-4 w-4" />
          </button>
        }
      />
      <div className="grid gap-3 lg:grid-cols-3">
        {kanbanColumns.map((column) => (
          <div key={column.title} className="rounded-3xl border border-border bg-slate-950/30 p-3">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <span className="font-extrabold text-muted">{column.title}</span>
              <b className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-sm">{column.count}</b>
            </div>
            <div className="space-y-3">
              {column.cards.map((card) => (
                <div
                  key={card.title}
                  className={cn(
                    "rounded-2xl border border-border bg-slate-900/60 p-4 transition hover:-translate-y-0.5 hover:border-cyanx/35",
                    card.featured && "bg-gradient-to-br from-electric/20 to-cyanx/10",
                  )}
                >
                  <span className={cn("badge", toneClasses[card.tone as Tone])}>{card.tag}</span>
                  <strong className="mt-3 block text-base font-black">{card.title}</strong>
                  <p className="mt-2 text-sm leading-7 text-muted">جاهزة للربط بالبيانات في المراحل القادمة.</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FocusPanel() {
  return (
    <aside className="glass-card">
      <PanelHeader eyebrow="Today" title="تركيز اليوم" />
      <div className="space-y-4">
        {focusItems.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full border",
                item.done ? "border-success bg-success shadow-[0_0_16px_rgba(16,185,129,0.6)]" : "border-border",
              )}
            >
              {item.done ? <Circle className="h-2 w-2 fill-white text-white" /> : null}
            </span>
            <p className={cn("text-sm leading-7", item.done ? "text-foreground" : "text-muted")}>{item.title}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 grid h-48 w-48 place-items-center rounded-full bg-[conic-gradient(#22D3EE_0_76%,rgba(148,163,184,0.14)_76%_100%)]">
        <div className="grid h-36 w-36 place-items-center rounded-full border border-border bg-[#071022]">
          <div className="text-center">
            <strong className="block text-4xl font-black">76%</strong>
            <span className="text-xs font-bold text-muted">جاهزية المرحلة</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TasksTable() {
  return (
    <section className="glass-card">
      <PanelHeader eyebrow="Tasks Preview" title="مهام اليوم" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-border text-right text-xs font-black text-muted">
              <th className="pb-4">المهمة</th>
              <th className="pb-4">المسؤول</th>
              <th className="pb-4">الأولوية</th>
              <th className="pb-4">الحالة</th>
              <th className="pb-4">التقدم</th>
            </tr>
          </thead>
          <tbody>
            {taskTable.map((task) => (
              <tr key={task.title} className="border-b border-border/70 last:border-0">
                <td className="py-4 pl-5">
                  <strong className="block text-sm font-black">{task.title}</strong>
                  <span className="mt-1 block text-xs text-muted">{task.description}</span>
                </td>
                <td className="py-4 text-sm text-blue-100">{task.owner}</td>
                <td className="py-4">
                  <span className="badge border-cyanx/25 bg-cyanx/10 text-cyan-100">{task.priority}</span>
                </td>
                <td className="py-4">
                  <span className="badge border-electric/25 bg-electric/10 text-blue-100">{task.status}</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-28 overflow-hidden rounded-full bg-slate-700/45">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-success via-cyanx to-electric"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-muted">{task.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ActivityPanel() {
  return (
    <aside className="glass-card">
      <PanelHeader eyebrow="Activity" title="آخر النشاط" />
      <div className="space-y-3">
        {activityFeed.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3 rounded-2xl border border-border bg-slate-950/28 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-cyanx/25 bg-cyanx/10 text-cyan-100">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <strong className="block text-sm font-black leading-7">{item.title}</strong>
                <span className="text-xs font-bold text-muted">{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 rounded-3xl border border-electric/25 bg-electric/10 p-4">
        <div className="flex items-center gap-2 text-blue-100">
          <Activity className="h-5 w-5" />
          <strong className="text-sm font-black">مؤشر اليوم</strong>
        </div>
        <p className="mt-2 text-sm leading-7 text-muted">
          الفريق يسير بوتيرة جيدة، والواجهة الأساسية جاهزة لتوسيعها في المرحلة الثانية.
        </p>
      </div>
    </aside>
  );
}

function PanelHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <span className="text-xs font-black uppercase text-cyanx">{eyebrow}</span>
        <h2 className="section-title mt-1">{title}</h2>
      </div>
      {action}
    </div>
  );
}
