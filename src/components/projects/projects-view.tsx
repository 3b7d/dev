import type { ReactNode } from "react";
import { FolderGit2, Link2, Plus, Route, Trash2 } from "lucide-react";
import {
  addProjectLink,
  addTimelineEvent,
  createProject,
  deleteProject,
  deleteProjectLink,
  deleteTimelineEvent,
  updateProject,
} from "@/app/projects/actions";
import {
  canManageProjects,
  getProjectPriorityLabel,
  getProjectStatusLabel,
  projectPriorities,
  projectStatuses,
} from "@/lib/projects/constants";
import { cn } from "@/lib/utils";
import type { AuthProfile } from "@/types/auth";
import type { ProjectItem } from "@/types/projects";
import type { TaskUser } from "@/types/tasks";

type ProjectsViewProps = {
  profile: AuthProfile;
  projects: ProjectItem[];
  users: TaskUser[];
};

const statusTone = {
  active: "border-cyanx/30 bg-cyanx/10 text-cyan-100",
  paused: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  completed: "border-success/30 bg-success/10 text-emerald-100",
  cancelled: "border-border bg-white/5 text-muted",
};

const priorityTone = {
  low: "border-success/30 bg-success/10 text-emerald-100",
  medium: "border-electric/30 bg-electric/10 text-blue-100",
  high: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  urgent: "border-red-400/30 bg-red-500/10 text-red-100",
};

export function ProjectsView({ profile, projects, users }: ProjectsViewProps) {
  const canManage = canManageProjects(profile.role);
  const activeProjects = projects.filter((project) => project.status === "active");
  const avgProgress = projects.length
    ? Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length)
    : 0;

  return (
    <div className="space-y-4">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.2),transparent_30%),linear-gradient(135deg,rgba(34,211,238,0.14),transparent_46%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="badge border-electric/30 bg-electric/10 text-blue-100">Projects Portfolio</span>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">المشاريع</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              إدارة المشاريع، الحالة، نسبة الإنجاز، الروابط، الجدول الزمني، والمهام المرتبطة من مساحة
              واحدة واضحة للفريق.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="مشروع" value={projects.length} />
            <Metric label="نشط" value={activeProjects.length} />
            <Metric label="متوسط الإنجاز" value={`${avgProgress}%`} />
          </div>
        </div>
      </section>

      {canManage ? (
        <section className="glass-card">
          <PanelTitle icon={<Plus className="h-5 w-5" />} title="إضافة مشروع" subtitle="Admin و Team Lead فقط." />
          <ProjectForm action={createProject} users={users} submitLabel="إضافة المشروع" />
        </section>
      ) : null}

      {projects.length ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} users={users} canManage={canManage} />
          ))}
        </section>
      ) : (
        <section className="glass-card grid min-h-80 place-items-center text-center">
          <div>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyanx/25 bg-cyanx/10 text-cyan-100">
              <FolderGit2 className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-black">لا توجد مشاريع بعد</h2>
            <p className="mt-2 max-w-md text-sm leading-7 text-muted">
              أضف أول مشروع لتبدأ ربط المهام وتتبع نسبة الإنجاز.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectCard({ project, users, canManage }: { project: ProjectItem; users: TaskUser[]; canManage: boolean }) {
  return (
    <article className="glass-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge className={statusTone[project.status]}>{getProjectStatusLabel(project.status)}</Badge>
            <Badge className={priorityTone[project.priority]}>{getProjectPriorityLabel(project.priority)}</Badge>
          </div>
          <h2 className="mt-4 text-2xl font-black leading-9">{project.name}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{project.description || "لا يوجد وصف للمشروع."}</p>
        </div>
        <strong className="text-4xl font-black">{project.progress}%</strong>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-700/40">
        <div
          className="h-full rounded-full bg-gradient-to-l from-success via-cyanx to-electric shadow-glow"
          style={{ width: `${project.progress}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-muted md:grid-cols-3">
        <Info label="المالك" value={project.owner?.fullName ?? "غير محدد"} />
        <Info label="المهام" value={`${project.tasks.completed}/${project.tasks.total} مكتملة`} />
        <Info label="الموعد" value={project.dueDate ?? "غير محدد"} />
      </div>

      <div className="mt-5 grid gap-4 2xl:grid-cols-2">
        <ProjectLinks project={project} canManage={canManage} />
        <ProjectTimeline project={project} canManage={canManage} />
      </div>

      {canManage ? (
        <details className="mt-5 rounded-3xl border border-border bg-slate-950/30 p-4">
          <summary className="cursor-pointer list-none text-sm font-black text-cyanx">تعديل المشروع</summary>
          <div className="mt-4">
            <ProjectForm action={updateProject} users={users} project={project} submitLabel="حفظ التعديل" />
            <form action={deleteProject} className="mt-3">
              <input name="projectId" type="hidden" value={project.id} />
              <button className="soft-button border-red-400/25 text-red-100 hover:border-red-400/50">
                <Trash2 className="h-4 w-4" />
                حذف المشروع
              </button>
            </form>
          </div>
        </details>
      ) : null}
    </article>
  );
}

function ProjectForm({
  action,
  users,
  project,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  users: TaskUser[];
  project?: ProjectItem;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      {project ? <input name="projectId" type="hidden" value={project.id} /> : null}
      <Input label="اسم المشروع" name="name" defaultValue={project?.name} required />
      <Select name="ownerId" label="مالك المشروع" defaultValue={project?.owner?.id ?? ""}>
        <option value="">بدون مالك</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.fullName}
          </option>
        ))}
      </Select>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-sm font-bold text-muted">الوصف</span>
        <textarea
          className="min-h-24 w-full rounded-2xl border border-border bg-slate-950/45 px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-cyanx/45"
          name="description"
          defaultValue={project?.description ?? ""}
          placeholder="وصف مختصر للمشروع..."
        />
      </label>
      <Select name="status" label="حالة المشروع" defaultValue={project?.status ?? "active"}>
        {projectStatuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </Select>
      <Select name="priority" label="الأولوية" defaultValue={project?.priority ?? "medium"}>
        {projectPriorities.map((priority) => (
          <option key={priority.value} value={priority.value}>
            {priority.label}
          </option>
        ))}
      </Select>
      <Input label="نسبة الإنجاز" name="progress" type="number" min="0" max="100" defaultValue={String(project?.progress ?? 0)} required />
      <Input label="تاريخ البداية" name="startDate" type="date" defaultValue={project?.startDate ?? ""} />
      <Input label="تاريخ التسليم" name="dueDate" type="date" defaultValue={project?.dueDate ?? ""} />
      <button className="premium-button self-end">{submitLabel}</button>
    </form>
  );
}

function ProjectLinks({ project, canManage }: { project: ProjectItem; canManage: boolean }) {
  return (
    <section className="rounded-3xl border border-border bg-slate-950/30 p-4">
      <PanelTitle icon={<Link2 className="h-5 w-5" />} title="روابط المشروع" subtitle={`${project.links.length} رابط`} compact />
      <div className="space-y-2">
        {project.links.length ? (
          project.links.map((link) => (
            <div key={link.id} className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-slate-950/35 p-3">
              <a className="truncate text-sm font-bold text-cyan-100 hover:underline" href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
              {canManage ? (
                <form action={deleteProjectLink}>
                  <input name="linkId" type="hidden" value={link.id} />
                  <button className="text-red-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-3 text-center text-sm text-muted">لا توجد روابط.</p>
        )}
      </div>
      {canManage ? (
        <form action={addProjectLink} className="mt-3 grid gap-2">
          <input name="projectId" type="hidden" value={project.id} />
          <Input label="اسم الرابط" name="label" required />
          <Input label="الرابط" name="url" type="url" required />
          <button className="soft-button">إضافة رابط</button>
        </form>
      ) : null}
    </section>
  );
}

function ProjectTimeline({ project, canManage }: { project: ProjectItem; canManage: boolean }) {
  return (
    <section className="rounded-3xl border border-border bg-slate-950/30 p-4">
      <PanelTitle icon={<Route className="h-5 w-5" />} title="Timeline" subtitle={`${project.timeline.length} حدث`} compact />
      <div className="space-y-3">
        {project.timeline.length ? (
          project.timeline.map((event) => (
            <div key={event.id} className="relative border-r border-cyanx/25 pr-4">
              <span className="absolute -right-1.5 top-1.5 h-3 w-3 rounded-full bg-cyanx shadow-glow" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <strong className="block text-sm font-black">{event.title}</strong>
                  <p className="mt-1 text-xs leading-6 text-muted">{event.description || event.eventDate}</p>
                </div>
                {canManage ? (
                  <form action={deleteTimelineEvent}>
                    <input name="eventId" type="hidden" value={event.id} />
                    <button className="text-red-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-3 text-center text-sm text-muted">لا توجد أحداث.</p>
        )}
      </div>
      {canManage ? (
        <form action={addTimelineEvent} className="mt-3 grid gap-2">
          <input name="projectId" type="hidden" value={project.id} />
          <Input label="عنوان الحدث" name="title" required />
          <Input label="وصف مختصر" name="description" />
          <Input label="تاريخ الحدث" name="eventDate" type="date" defaultValue={new Date().toLocaleDateString("en-CA")} required />
          <button className="soft-button">إضافة حدث</button>
        </form>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-24 rounded-3xl border border-border bg-slate-950/35 p-4 backdrop-blur-xl">
      <strong className="block text-3xl font-black">{value}</strong>
      <span className="text-xs font-bold text-muted">{label}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-950/30 p-3">
      <span className="block text-xs font-bold text-muted">{label}</span>
      <strong className="mt-1 block truncate text-sm font-black text-foreground">{value}</strong>
    </div>
  );
}

function PanelTitle({
  icon,
  title,
  subtitle,
  compact,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", compact ? "mb-3" : "mb-5")}>
      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyanx/30 bg-cyanx/10 text-cyan-100">
        {icon}
      </div>
      <div>
        <h2 className={cn("font-black", compact ? "text-base" : "section-title")}>{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  min,
  max,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-muted">{label}</span>
      <input
        className="h-12 w-full rounded-2xl border border-border bg-slate-950/45 px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-cyanx/45"
        name={name}
        type={type}
        min={min}
        max={max}
        defaultValue={defaultValue}
        required={required}
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

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={cn("badge", className)}>{children}</span>;
}
