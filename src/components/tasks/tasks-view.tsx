import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, Columns3, Filter, LayoutList, Plus, Trash2 } from "lucide-react";
import { createTask, deleteTask, updateTask, updateTaskStatus } from "@/app/tasks/actions";
import {
  canCreateTask,
  canDeleteAnyTask,
  canEditAnyTask,
  canUseTeamAssignee,
  getTaskPriorityLabel,
  getTaskStatusLabel,
  taskPriorities,
  taskStatuses,
} from "@/lib/tasks/constants";
import { cn } from "@/lib/utils";
import type { AuthProfile } from "@/types/auth";
import type { TaskItem, TaskPriority, TaskProject, TaskStatus, TaskUser } from "@/types/tasks";

type TasksViewProps = {
  profile: AuthProfile;
  tasks: TaskItem[];
  users: TaskUser[];
  projects: TaskProject[];
  filters: {
    status: TaskStatus | "all";
    priority: TaskPriority | "all";
    assignee: string | "all";
    view: "table" | "kanban";
  };
};

const statusTone = {
  new: "border-cyanx/30 bg-cyanx/10 text-cyan-100",
  in_progress: "border-electric/30 bg-electric/10 text-blue-100",
  review: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  completed: "border-success/30 bg-success/10 text-emerald-100",
  overdue: "border-red-400/30 bg-red-500/10 text-red-100",
  cancelled: "border-border bg-white/5 text-muted",
};

const priorityTone = {
  low: "border-success/30 bg-success/10 text-emerald-100",
  medium: "border-electric/30 bg-electric/10 text-blue-100",
  high: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  urgent: "border-red-400/30 bg-red-500/10 text-red-100",
};

export function TasksView({ profile, tasks, users, projects, filters }: TasksViewProps) {
  const canCreate = canCreateTask(profile.role);

  return (
    <div className="space-y-4">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(34,211,238,0.2),transparent_28%),linear-gradient(135deg,rgba(59,130,246,0.16),transparent_44%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="badge border-cyanx/30 bg-cyanx/10 text-cyan-100">Tasks Operations</span>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">قسم المهام</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              إدارة المهام اليومية مع فلترة ذكية، عرض جدولي، لوحة Kanban، وربط كل مهمة بالمستخدم
              والمشروع ضمن صلاحيات الدور الحالي.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="إجمالي" value={tasks.length} />
            <Metric label="مكتملة" value={tasks.filter((task) => task.status === "completed").length} />
            <Metric label="متأخرة" value={tasks.filter((task) => task.status === "overdue").length} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(22rem,0.75fr)_minmax(0,1.35fr)]">
        <TaskCreatePanel profile={profile} users={users} projects={projects} canCreate={canCreate} />
        <TaskFilters users={users} filters={filters} />
      </section>

      {filters.view === "kanban" ? (
        <TaskKanban profile={profile} tasks={tasks} />
      ) : (
        <TaskTable profile={profile} tasks={tasks} users={users} projects={projects} />
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-3xl border border-border bg-slate-950/35 p-4 backdrop-blur-xl">
      <strong className="block text-3xl font-black">{value}</strong>
      <span className="text-xs font-bold text-muted">{label}</span>
    </div>
  );
}

function TaskCreatePanel({
  profile,
  users,
  projects,
  canCreate,
}: {
  profile: AuthProfile;
  users: TaskUser[];
  projects: TaskProject[];
  canCreate: boolean;
}) {
  return (
    <section className="glass-card">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyanx/30 bg-cyanx/10 text-cyan-100">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="section-title">إضافة مهمة</h2>
          <p className="text-sm text-muted">Viewer يستطيع المشاهدة فقط.</p>
        </div>
      </div>

      {canCreate ? (
        <TaskForm action={createTask} profile={profile} users={users} projects={projects} submitLabel="إضافة المهمة" />
      ) : (
        <div className="rounded-3xl border border-border bg-slate-950/35 p-5 text-sm leading-8 text-muted">
          حسابك بصلاحية Viewer، لذلك لا يمكنك إنشاء مهام جديدة.
        </div>
      )}
    </section>
  );
}

function TaskFilters({ users, filters }: { users: TaskUser[]; filters: TasksViewProps["filters"] }) {
  return (
    <section className="glass-card">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-electric/30 bg-electric/10 text-blue-100">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <h2 className="section-title">الفلاتر والعرض</h2>
            <p className="text-sm text-muted">حسب الحالة، الأولوية، المستخدم، ونوع العرض.</p>
          </div>
        </div>
        <div className="flex rounded-2xl border border-border bg-slate-950/35 p-1">
          <ViewLink active={filters.view === "table"} view="table" icon={<LayoutList className="h-4 w-4" />} />
          <ViewLink active={filters.view === "kanban"} view="kanban" icon={<Columns3 className="h-4 w-4" />} />
        </div>
      </div>

      <form className="grid gap-3 md:grid-cols-3" method="get">
        <input name="view" type="hidden" value={filters.view} />
        <Select name="status" label="الحالة" defaultValue={filters.status}>
          <option value="all">كل الحالات</option>
          {taskStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        <Select name="priority" label="الأولوية" defaultValue={filters.priority}>
          <option value="all">كل الأولويات</option>
          {taskPriorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </Select>
        <Select name="assignee" label="المستخدم" defaultValue={filters.assignee}>
          <option value="all">كل المستخدمين</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </Select>
        <button className="premium-button md:col-span-3">تطبيق الفلاتر</button>
      </form>
    </section>
  );
}

function ViewLink({ active, view, icon }: { active: boolean; view: "table" | "kanban"; icon: ReactNode }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-black transition",
        active ? "bg-electric/25 text-foreground" : "text-muted hover:text-foreground",
      )}
      href={`/tasks?view=${view}`}
    >
      {icon}
      {view === "table" ? "Table" : "Kanban"}
    </Link>
  );
}

function TaskTable({
  profile,
  tasks,
  users,
  projects,
}: {
  profile: AuthProfile;
  tasks: TaskItem[];
  users: TaskUser[];
  projects: TaskProject[];
}) {
  if (tasks.length === 0) {
    return <EmptyTasks />;
  }

  return (
    <section className="glass-card">
      <div className="mb-5">
        <h2 className="section-title">جدول المهام</h2>
        <p className="mt-1 text-sm text-muted">تعديل المهمة متاح من السهم داخل كل صف حسب صلاحيتك.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="border-b border-border text-right text-xs font-black text-muted">
              <th className="pb-4">المهمة</th>
              <th className="pb-4">المشروع</th>
              <th className="pb-4">المسؤول</th>
              <th className="pb-4">الأولوية</th>
              <th className="pb-4">الحالة</th>
              <th className="pb-4">التاريخ</th>
              <th className="pb-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const canEdit = canEditTask(profile, task);
              const canDelete = canDeleteTask(profile, task);

              return (
                <tr key={task.id} className="border-b border-border/70 align-top last:border-0">
                  <td className="py-4 pl-5">
                    <details>
                      <summary className="cursor-pointer list-none">
                        <strong className="block text-sm font-black">{task.title}</strong>
                        <span className="mt-1 block text-xs leading-6 text-muted">
                          {task.description || "لا يوجد وصف."}
                        </span>
                      </summary>
                      {canEdit ? (
                        <div className="mt-4 rounded-3xl border border-border bg-slate-950/35 p-4">
                          <TaskForm
                            action={updateTask}
                            profile={profile}
                            users={users}
                            projects={projects}
                            task={task}
                            submitLabel="حفظ التعديل"
                          />
                        </div>
                      ) : null}
                    </details>
                  </td>
                  <td className="py-4 text-sm text-blue-100">{task.project?.name ?? "بدون مشروع"}</td>
                  <td className="py-4 text-sm text-blue-100">{task.assignee?.fullName ?? "غير محدد"}</td>
                  <td className="py-4">
                    <Badge className={priorityTone[task.priority]}>{getTaskPriorityLabel(task.priority)}</Badge>
                  </td>
                  <td className="py-4">
                    <Badge className={statusTone[task.status]}>{getTaskStatusLabel(task.status)}</Badge>
                  </td>
                  <td className="py-4 text-sm text-muted">{task.dueDate ?? "بدون موعد"}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      {canEdit ? <StatusForm task={task} compact /> : null}
                      {canDelete ? (
                        <form action={deleteTask}>
                          <input name="taskId" type="hidden" value={task.id} />
                          <button
                            className="grid h-10 w-10 place-items-center rounded-2xl border border-red-400/25 bg-red-500/10 text-red-100 transition hover:border-red-400/50"
                            title="حذف المهمة"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TaskKanban({ profile, tasks }: { profile: AuthProfile; tasks: TaskItem[] }) {
  return (
    <section className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
      {taskStatuses.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status.value);

        return (
          <div key={status.value} className="glass-card min-h-80">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Badge className={statusTone[status.value]}>{status.label}</Badge>
              <b className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-sm">{columnTasks.length}</b>
            </div>
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <article key={task.id} className="rounded-3xl border border-border bg-slate-950/35 p-4">
                  <Badge className={priorityTone[task.priority]}>{getTaskPriorityLabel(task.priority)}</Badge>
                  <h3 className="mt-3 text-base font-black leading-7">{task.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{task.description || "لا يوجد وصف."}</p>
                  <div className="mt-4 space-y-2 text-xs font-bold text-muted">
                    <p>المسؤول: {task.assignee?.fullName ?? "غير محدد"}</p>
                    <p>المشروع: {task.project?.name ?? "بدون مشروع"}</p>
                  </div>
                  {canEditTask(profile, task) ? <StatusForm task={task} /> : null}
                </article>
              ))}
              {columnTasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-5 text-center text-sm leading-7 text-muted">
                  لا توجد مهام في هذه الحالة.
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function TaskForm({
  action,
  profile,
  users,
  projects,
  task,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  profile: AuthProfile;
  users: TaskUser[];
  projects: TaskProject[];
  task?: TaskItem;
  submitLabel: string;
}) {
  const canAssignTeam = canUseTeamAssignee(profile.role);

  return (
    <form action={action} className="grid gap-3">
      {task ? <input name="taskId" type="hidden" value={task.id} /> : null}
      {!canAssignTeam ? <input name="assigneeId" type="hidden" value={profile.id} /> : null}

      <Input label="عنوان المهمة" name="title" defaultValue={task?.title} required />
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-muted">الوصف</span>
        <textarea
          className="min-h-24 w-full rounded-2xl border border-border bg-slate-950/45 px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-cyanx/45"
          name="description"
          defaultValue={task?.description ?? ""}
          placeholder="اكتب وصفًا مختصرًا للمهمة..."
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <Select name="status" label="الحالة" defaultValue={task?.status ?? "new"}>
          {taskStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        <Select name="priority" label="الأولوية" defaultValue={task?.priority ?? "medium"}>
          {taskPriorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Select name="assigneeId" label="المستخدم" defaultValue={task?.assignee?.id ?? profile.id} disabled={!canAssignTeam}>
          {(canAssignTeam ? users : [{ id: profile.id, fullName: profile.fullName, email: profile.email }]).map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </Select>
        <Select name="projectId" label="المشروع" defaultValue={task?.project?.id ?? ""}>
          <option value="">بدون مشروع</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-muted">تاريخ الاستحقاق</span>
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-slate-950/45 px-4 transition focus-within:border-cyanx/45">
          <CalendarDays className="h-5 w-5 text-muted" />
          <input
            className="w-full bg-transparent text-sm text-foreground outline-none"
            name="dueDate"
            type="date"
            defaultValue={task?.dueDate ?? ""}
          />
        </div>
      </label>

      <button className="premium-button">{submitLabel}</button>
    </form>
  );
}

function StatusForm({ task, compact = false }: { task: TaskItem; compact?: boolean }) {
  return (
    <form action={updateTaskStatus} className={cn("flex gap-2", !compact && "mt-4")}>
      <input name="taskId" type="hidden" value={task.id} />
      <select
        className="h-10 rounded-2xl border border-border bg-slate-950/70 px-3 text-xs font-bold text-foreground outline-none"
        name="status"
        defaultValue={task.status}
      >
        {taskStatuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <button className="soft-button min-h-10 px-3 text-xs">تحديث</button>
    </form>
  );
}

function EmptyTasks() {
  return (
    <section className="glass-card grid min-h-72 place-items-center text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyanx/25 bg-cyanx/10 text-cyan-100">
          <LayoutList className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-black">لا توجد مهام مطابقة</h2>
        <p className="mt-2 max-w-md text-sm leading-7 text-muted">
          غيّر الفلاتر أو أضف مهمة جديدة لبدء تنظيم العمل اليومي.
        </p>
      </div>
    </section>
  );
}

function Input({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-muted">{label}</span>
      <input
        className="h-12 w-full rounded-2xl border border-border bg-slate-950/45 px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-cyanx/45"
        name={name}
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
  disabled,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-muted">{label}</span>
      <select
        className="h-12 w-full rounded-2xl border border-border bg-slate-950/45 px-4 text-sm text-foreground outline-none transition focus:border-cyanx/45 disabled:cursor-not-allowed disabled:opacity-70"
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
      >
        {children}
      </select>
    </label>
  );
}

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={cn("badge", className)}>{children}</span>;
}

function canEditTask(profile: AuthProfile, task: TaskItem) {
  if (profile.role === "viewer") {
    return false;
  }

  return (
    canEditAnyTask(profile.role) ||
    task.assignee?.id === profile.id ||
    task.createdBy?.id === profile.id
  );
}

function canDeleteTask(profile: AuthProfile, task: TaskItem) {
  if (profile.role === "viewer") {
    return false;
  }

  return canDeleteAnyTask(profile.role) || task.createdBy?.id === profile.id;
}
