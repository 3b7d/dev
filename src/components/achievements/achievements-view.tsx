import type { ReactNode } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, FileText, Plus, Target, Trash2 } from "lucide-react";
import { createAchievement, deleteAchievement, updateAchievement } from "@/app/achievements/actions";
import { canCreateAchievement, canManageAchievement, canUseTeamAchievementUser } from "@/lib/achievements/permissions";
import { getTaskPriorityLabel } from "@/lib/tasks/constants";
import { cn } from "@/lib/utils";
import type { DailyAchievement } from "@/types/achievements";
import type { AuthProfile } from "@/types/auth";
import type { TaskPriority, TaskStatus, TaskUser } from "@/types/tasks";

type CompletedTaskOption = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
};

type AchievementsViewProps = {
  profile: AuthProfile;
  achievements: DailyAchievement[];
  users: TaskUser[];
  completedTasks: CompletedTaskOption[];
  selectedDate: string;
  selectedUser: string;
};

const priorityTone = {
  low: "border-success/30 bg-success/10 text-emerald-100",
  medium: "border-electric/30 bg-electric/10 text-blue-100",
  high: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  urgent: "border-red-400/30 bg-red-500/10 text-red-100",
};

export function AchievementsView({
  profile,
  achievements,
  users,
  completedTasks,
  selectedDate,
  selectedUser,
}: AchievementsViewProps) {
  const blockers = achievements.filter((item) => item.blockers);
  const tomorrowPlans = achievements.filter((item) => item.tomorrowPlan);
  const linkedTasks = achievements.filter((item) => item.task);
  const canCreate = canCreateAchievement(profile.role);

  return (
    <div className="space-y-4">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.2),transparent_28%),linear-gradient(135deg,rgba(34,211,238,0.16),transparent_46%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="badge border-success/30 bg-success/10 text-emerald-100">Daily Wins</span>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">إنجازات اليوم</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              وثّق إنجازات الفريق، اربطها بالمهام المكتملة، وسجّل خطة الغد والعوائق ليصبح التقرير
              اليومي جاهزًا للإدارة.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="إنجاز" value={achievements.length} />
            <Metric label="مرتبطة بمهام" value={linkedTasks.length} />
            <Metric label="عوائق" value={blockers.length} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(22rem,0.75fr)_minmax(0,1.35fr)]">
        <AchievementCreatePanel
          profile={profile}
          users={users}
          completedTasks={completedTasks}
          selectedDate={selectedDate}
          canCreate={canCreate}
        />
        <AchievementFilters users={users} selectedDate={selectedDate} selectedUser={selectedUser} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
        <AchievementsList
          profile={profile}
          achievements={achievements}
          users={users}
          completedTasks={completedTasks}
        />
        <DailyReport
          selectedDate={selectedDate}
          achievements={achievements}
          tomorrowPlans={tomorrowPlans}
          blockers={blockers}
        />
      </section>
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

function AchievementCreatePanel({
  profile,
  users,
  completedTasks,
  selectedDate,
  canCreate,
}: {
  profile: AuthProfile;
  users: TaskUser[];
  completedTasks: CompletedTaskOption[];
  selectedDate: string;
  canCreate: boolean;
}) {
  return (
    <section className="glass-card">
      <PanelTitle icon={<Plus className="h-5 w-5" />} title="إضافة إنجاز يومي" subtitle="اربط الإنجاز بمهمة مكتملة إن وجدت." />
      {canCreate ? (
        <AchievementForm
          action={createAchievement}
          profile={profile}
          users={users}
          completedTasks={completedTasks}
          selectedDate={selectedDate}
          submitLabel="إضافة الإنجاز"
        />
      ) : (
        <div className="rounded-3xl border border-border bg-slate-950/35 p-5 text-sm leading-8 text-muted">
          حساب Viewer لا يمكنه إضافة إنجازات.
        </div>
      )}
    </section>
  );
}

function AchievementFilters({
  users,
  selectedDate,
  selectedUser,
}: {
  users: TaskUser[];
  selectedDate: string;
  selectedUser: string;
}) {
  return (
    <section className="glass-card">
      <PanelTitle icon={<CalendarDays className="h-5 w-5" />} title="فلترة الإنجازات" subtitle="حسب التاريخ والمستخدم." />
      <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" method="get">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-muted">التاريخ</span>
          <input
            className="h-12 w-full rounded-2xl border border-border bg-slate-950/45 px-4 text-sm text-foreground outline-none transition focus:border-cyanx/45"
            name="date"
            type="date"
            defaultValue={selectedDate}
          />
        </label>
        <Select name="user" label="المستخدم" defaultValue={selectedUser}>
          <option value="all">كل المستخدمين</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </Select>
        <button className="premium-button self-end">تطبيق</button>
      </form>
    </section>
  );
}

function AchievementsList({
  profile,
  achievements,
  users,
  completedTasks,
}: {
  profile: AuthProfile;
  achievements: DailyAchievement[];
  users: TaskUser[];
  completedTasks: CompletedTaskOption[];
}) {
  if (achievements.length === 0) {
    return (
      <section className="glass-card grid min-h-80 place-items-center text-center">
        <div>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-success/25 bg-success/10 text-emerald-100">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-black">لا توجد إنجازات لهذا اليوم</h2>
          <p className="mt-2 max-w-md text-sm leading-7 text-muted">
            أضف إنجازًا جديدًا أو غيّر التاريخ والمستخدم من الفلاتر.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card">
      <PanelTitle icon={<CheckCircle2 className="h-5 w-5" />} title="إنجازات اليوم" subtitle="سجل اليوم التفصيلي." />
      <div className="space-y-3">
        {achievements.map((achievement) => {
          const canManage = canManageAchievement(profile.role, profile.id, achievement.user?.id, achievement.createdBy?.id);

          return (
            <article key={achievement.id} className="rounded-3xl border border-border bg-slate-950/35 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-black leading-8">{achievement.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-muted">{achievement.description || "لا يوجد وصف إضافي."}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="border-success/30 bg-success/10 text-emerald-100">
                      {achievement.user?.fullName ?? "غير محدد"}
                    </Badge>
                    {achievement.task ? (
                      <Badge className={priorityTone[achievement.task.priority]}>
                        مهمة مكتملة: {achievement.task.title}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                {canManage ? (
                  <div className="flex gap-2">
                    <details className="group">
                      <summary className="soft-button min-h-10 list-none px-3 text-xs">تعديل</summary>
                      <div className="mt-3 w-full min-w-80 rounded-3xl border border-border bg-[#071022] p-4 shadow-premium md:absolute md:left-8 md:z-20">
                        <AchievementForm
                          action={updateAchievement}
                          profile={profile}
                          users={users}
                          completedTasks={completedTasks}
                          achievement={achievement}
                          selectedDate={achievement.achievementDate}
                          submitLabel="حفظ التعديل"
                        />
                      </div>
                    </details>
                    <form action={deleteAchievement}>
                      <input name="achievementId" type="hidden" value={achievement.id} />
                      <button className="grid h-10 w-10 place-items-center rounded-2xl border border-red-400/25 bg-red-500/10 text-red-100 transition hover:border-red-400/50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DailyReport({
  selectedDate,
  achievements,
  tomorrowPlans,
  blockers,
}: {
  selectedDate: string;
  achievements: DailyAchievement[];
  tomorrowPlans: DailyAchievement[];
  blockers: DailyAchievement[];
}) {
  return (
    <aside className="space-y-4">
      <section className="glass-card">
        <PanelTitle icon={<FileText className="h-5 w-5" />} title="تقرير يومي بسيط" subtitle={selectedDate} />
        <div className="space-y-3 text-sm leading-8 text-muted">
          <p>
            تم توثيق <strong className="text-foreground">{achievements.length}</strong> إنجاز لهذا اليوم، منها{" "}
            <strong className="text-foreground">{achievements.filter((item) => item.task).length}</strong> مرتبطة
            بمهام مكتملة.
          </p>
          <p>
            خطة الغد تحتوي على <strong className="text-foreground">{tomorrowPlans.length}</strong> عنصر، والعوائق
            المسجلة <strong className="text-foreground">{blockers.length}</strong>.
          </p>
        </div>
      </section>

      <ReportSection
        icon={<Target className="h-5 w-5" />}
        title="خطة الغد"
        empty="لا توجد خطة غد مسجلة."
        items={tomorrowPlans.map((item) => item.tomorrowPlan).filter(Boolean)}
      />

      <ReportSection
        icon={<AlertTriangle className="h-5 w-5" />}
        title="العوائق"
        empty="لا توجد عوائق مسجلة."
        items={blockers.map((item) => item.blockers).filter(Boolean)}
        danger
      />
    </aside>
  );
}

function AchievementForm({
  action,
  profile,
  users,
  completedTasks,
  selectedDate,
  achievement,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  profile: AuthProfile;
  users: TaskUser[];
  completedTasks: CompletedTaskOption[];
  selectedDate: string;
  achievement?: DailyAchievement;
  submitLabel: string;
}) {
  const canChooseUser = canUseTeamAchievementUser(profile.role);

  return (
    <form action={action} className="grid gap-3">
      {achievement ? <input name="achievementId" type="hidden" value={achievement.id} /> : null}
      {!canChooseUser ? <input name="userId" type="hidden" value={profile.id} /> : null}
      <Input label="عنوان الإنجاز" name="title" defaultValue={achievement?.title} required />
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-muted">الوصف</span>
        <textarea
          className="min-h-24 w-full rounded-2xl border border-border bg-slate-950/45 px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-cyanx/45"
          name="description"
          defaultValue={achievement?.description ?? ""}
          placeholder="ماذا تم إنجازه؟"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-muted">التاريخ</span>
          <input
            className="h-12 w-full rounded-2xl border border-border bg-slate-950/45 px-4 text-sm text-foreground outline-none transition focus:border-cyanx/45"
            name="achievementDate"
            type="date"
            defaultValue={achievement?.achievementDate ?? selectedDate}
          />
        </label>
        <Select name="userId" label="المستخدم" defaultValue={achievement?.user?.id ?? profile.id} disabled={!canChooseUser}>
          {(canChooseUser ? users : [{ id: profile.id, fullName: profile.fullName, email: profile.email }]).map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </Select>
      </div>

      <Select name="taskId" label="ربط بمهمة مكتملة" defaultValue={achievement?.task?.id ?? ""}>
        <option value="">بدون ربط</option>
        {completedTasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.title} - {getTaskPriorityLabel(task.priority)}
          </option>
        ))}
      </Select>

      <Input label="خطة الغد" name="tomorrowPlan" defaultValue={achievement?.tomorrowPlan ?? ""} />
      <Input label="العوائق" name="blockers" defaultValue={achievement?.blockers ?? ""} />
      <button className="premium-button">{submitLabel}</button>
    </form>
  );
}

function ReportSection({
  icon,
  title,
  empty,
  items,
  danger,
}: {
  icon: ReactNode;
  title: string;
  empty: string;
  items: Array<string | null | undefined>;
  danger?: boolean;
}) {
  const visibleItems = items.filter(Boolean) as string[];

  return (
    <section className="glass-card">
      <PanelTitle icon={icon} title={title} subtitle={visibleItems.length ? `${visibleItems.length} عنصر` : empty} danger={danger} />
      <div className="space-y-3">
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <p key={item} className="rounded-2xl border border-border bg-slate-950/35 p-3 text-sm leading-7 text-muted">
              {item}
            </p>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted">{empty}</p>
        )}
      </div>
    </section>
  );
}

function PanelTitle({ icon, title, subtitle, danger }: { icon: ReactNode; title: string; subtitle: string; danger?: boolean }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div
        className={cn(
          "grid h-11 w-11 place-items-center rounded-2xl border",
          danger ? "border-red-400/30 bg-red-500/10 text-red-100" : "border-cyanx/30 bg-cyanx/10 text-cyan-100",
        )}
      >
        {icon}
      </div>
      <div>
        <h2 className="section-title">{title}</h2>
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
