import type { ReactNode } from "react";
import { Award, BookOpenCheck, FileText, GraduationCap, Link2, Plus, TrendingUp } from "lucide-react";
import { addCourseNote, createCourse, updateCourseCertificate, updateCourseProgress } from "@/app/courses/actions";
import {
  canCreateCourse,
  canManageCourse,
  canUseTeamCourseUser,
  courseStatuses,
  getCourseStatusLabel,
} from "@/lib/courses/constants";
import { cn } from "@/lib/utils";
import type { AuthProfile } from "@/types/auth";
import type { CourseItem } from "@/types/courses";
import type { TaskUser } from "@/types/tasks";

type CoursesViewProps = {
  profile: AuthProfile;
  courses: CourseItem[];
  users: TaskUser[];
};

const statusTone = {
  planned: "border-electric/30 bg-electric/10 text-blue-100",
  in_progress: "border-cyanx/30 bg-cyanx/10 text-cyan-100",
  completed: "border-success/30 bg-success/10 text-emerald-100",
  paused: "border-amber-400/30 bg-amber-400/10 text-amber-100",
};

export function CoursesView({ profile, courses, users }: CoursesViewProps) {
  const canCreate = canCreateCourse(profile.role);
  const inProgress = courses.filter((course) => course.status === "in_progress");
  const completed = courses.filter((course) => course.status === "completed");
  const notesCount = courses.reduce((total, course) => total + course.notes.length, 0);

  return (
    <div className="space-y-4">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(34,211,238,0.2),transparent_30%),linear-gradient(135deg,rgba(16,185,129,0.14),transparent_46%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="badge border-cyanx/30 bg-cyanx/10 text-cyan-100">Learning Track</span>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">الدورات والتعلم</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              متابعة تقدم الفريق التعليمي، توثيق ملخصات الدروس، وحفظ الشهادات كروابط أو ملفات مرفوعة.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="دورة" value={courses.length} />
            <Metric label="جارية" value={inProgress.length} />
            <Metric label="ملخص" value={notesCount} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(22rem,0.75fr)_minmax(0,1.25fr)]">
        <CourseCreatePanel profile={profile} users={users} canCreate={canCreate} />
        <LearningReport courses={courses} completedCount={completed.length} notesCount={notesCount} />
      </section>

      {courses.length ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} profile={profile} course={course} users={users} />
          ))}
        </section>
      ) : (
        <section className="glass-card grid min-h-80 place-items-center text-center">
          <div>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyanx/25 bg-cyanx/10 text-cyan-100">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-black">لا توجد دورات بعد</h2>
            <p className="mt-2 max-w-md text-sm leading-7 text-muted">أضف دورة جديدة وابدأ تتبع رحلة التعلم.</p>
          </div>
        </section>
      )}
    </div>
  );
}

function CourseCreatePanel({ profile, users, canCreate }: { profile: AuthProfile; users: TaskUser[]; canCreate: boolean }) {
  return (
    <section className="glass-card">
      <PanelTitle icon={<Plus className="h-5 w-5" />} title="إضافة دورة" subtitle="سجل دورة جديدة للفريق أو لنفسك." />
      {canCreate ? (
        <CourseForm profile={profile} users={users} />
      ) : (
        <p className="rounded-3xl border border-border bg-slate-950/35 p-5 text-sm leading-8 text-muted">
          حساب Viewer لا يمكنه إضافة دورات.
        </p>
      )}
    </section>
  );
}

function CourseCard({ profile, course, users }: { profile: AuthProfile; course: CourseItem; users: TaskUser[] }) {
  const canManage = canManageCourse(profile.role, profile.id, course.user?.id, course.createdBy?.id);

  return (
    <article className="glass-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Badge className={statusTone[course.status]}>{getCourseStatusLabel(course.status)}</Badge>
          <h2 className="mt-4 text-2xl font-black leading-9">{course.title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            {course.provider || "مزود غير محدد"} · {course.user?.fullName ?? "غير محدد"}
          </p>
        </div>
        <strong className="text-4xl font-black">{course.progress}%</strong>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-700/40">
        <div
          className="h-full rounded-full bg-gradient-to-l from-success via-cyanx to-electric shadow-glow"
          style={{ width: `${course.progress}%` }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {course.url ? (
          <a className="soft-button min-h-10" href={course.url} target="_blank" rel="noreferrer">
            <Link2 className="h-4 w-4" />
            رابط الدورة
          </a>
        ) : null}
        {course.certificateUrl ? (
          <a className="soft-button min-h-10" href={course.certificateUrl} target="_blank" rel="noreferrer">
            <Award className="h-4 w-4" />
            رابط الشهادة
          </a>
        ) : null}
        {course.signedCertificateUrl ? (
          <a className="soft-button min-h-10" href={course.signedCertificateUrl} target="_blank" rel="noreferrer">
            <Award className="h-4 w-4" />
            ملف الشهادة
          </a>
        ) : null}
      </div>

      {canManage ? (
        <div className="mt-5 grid gap-4 2xl:grid-cols-2">
          <ProgressPanel course={course} />
          <CertificatePanel course={course} />
        </div>
      ) : null}

      <NotesPanel course={course} canManage={canManage} />

      {canManage ? (
        <details className="mt-5 rounded-3xl border border-border bg-slate-950/30 p-4">
          <summary className="cursor-pointer list-none text-sm font-black text-cyanx">إضافة ملخص درس</summary>
          <form action={addCourseNote} className="mt-4 grid gap-3">
            <input name="courseId" type="hidden" value={course.id} />
            <Input label="عنوان الدرس" name="title" required />
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-muted">الملخص</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-slate-950/45 px-4 py-3 text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-cyanx/45"
                name="summary"
                placeholder="أهم ما تعلمته من الدرس..."
                required
              />
            </label>
            <Input label="تاريخ الدرس" name="lessonDate" type="date" defaultValue={new Date().toLocaleDateString("en-CA")} required />
            <button className="premium-button">إضافة الملخص</button>
          </form>
        </details>
      ) : null}
    </article>
  );
}

function CourseForm({ profile, users }: { profile: AuthProfile; users: TaskUser[] }) {
  const canChooseUser = canUseTeamCourseUser(profile.role);

  return (
    <form action={createCourse} className="grid gap-3">
      {!canChooseUser ? <input name="userId" type="hidden" value={profile.id} /> : null}
      <Input label="عنوان الدورة" name="title" required />
      <Input label="الجهة أو المنصة" name="provider" />
      <Input label="رابط الدورة" name="url" type="url" />
      <div className="grid gap-3 md:grid-cols-2">
        <Select name="status" label="الحالة" defaultValue="in_progress">
          {courseStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        <Input label="نسبة التقدم" name="progress" type="number" min="0" max="100" defaultValue="0" required />
      </div>
      <Select name="userId" label="المستخدم" defaultValue={profile.id} disabled={!canChooseUser}>
        {(canChooseUser ? users : [{ id: profile.id, fullName: profile.fullName, email: profile.email }]).map((user) => (
          <option key={user.id} value={user.id}>
            {user.fullName}
          </option>
        ))}
      </Select>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="تاريخ البداية" name="startDate" type="date" />
        <Input label="تاريخ الإكمال" name="completedAt" type="date" />
      </div>
      <Input label="رابط الشهادة" name="certificateUrl" type="url" />
      <button className="premium-button">إضافة الدورة</button>
    </form>
  );
}

function ProgressPanel({ course }: { course: CourseItem }) {
  return (
    <section className="rounded-3xl border border-border bg-slate-950/30 p-4">
      <PanelTitle icon={<TrendingUp className="h-5 w-5" />} title="تحديث التقدم" subtitle="نسبة وحالة الدورة." compact />
      <form action={updateCourseProgress} className="grid gap-3">
        <input name="courseId" type="hidden" value={course.id} />
        <Input label="نسبة التقدم" name="progress" type="number" min="0" max="100" defaultValue={String(course.progress)} required />
        <Select name="status" label="الحالة" defaultValue={course.status}>
          {courseStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        <button className="soft-button">تحديث</button>
      </form>
    </section>
  );
}

function CertificatePanel({ course }: { course: CourseItem }) {
  return (
    <section className="rounded-3xl border border-border bg-slate-950/30 p-4">
      <PanelTitle icon={<Award className="h-5 w-5" />} title="الشهادة" subtitle="رابط أو ملف مرفوع." compact />
      <form action={updateCourseCertificate} className="grid gap-3" encType="multipart/form-data">
        <input name="courseId" type="hidden" value={course.id} />
        <Input label="رابط الشهادة" name="certificateUrl" type="url" defaultValue={course.certificateUrl ?? ""} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-muted">رفع شهادة</span>
          <input
            className="w-full rounded-2xl border border-border bg-slate-950/45 px-4 py-3 text-sm text-muted file:ml-3 file:rounded-xl file:border-0 file:bg-cyanx/10 file:px-3 file:py-2 file:text-cyan-100"
            name="certificateFile"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
          />
        </label>
        <button className="soft-button">حفظ الشهادة</button>
      </form>
    </section>
  );
}

function NotesPanel({ course, canManage }: { course: CourseItem; canManage: boolean }) {
  return (
    <section className="mt-5 rounded-3xl border border-border bg-slate-950/30 p-4">
      <PanelTitle
        icon={<FileText className="h-5 w-5" />}
        title="ملخصات الدروس"
        subtitle={course.notes.length ? `${course.notes.length} ملخص` : canManage ? "أضف أول ملخص" : "لا توجد ملخصات"}
        compact
      />
      <div className="space-y-3">
        {course.notes.length ? (
          course.notes.map((note) => (
            <div key={note.id} className="rounded-2xl border border-border bg-slate-950/35 p-3">
              <strong className="block text-sm font-black">{note.title}</strong>
              <p className="mt-1 text-sm leading-7 text-muted">{note.summary}</p>
              <span className="mt-2 block text-xs font-bold text-muted">{note.lessonDate}</span>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-3 text-center text-sm text-muted">
            لا توجد ملخصات بعد.
          </p>
        )}
      </div>
    </section>
  );
}

function LearningReport({
  courses,
  completedCount,
  notesCount,
}: {
  courses: CourseItem[];
  completedCount: number;
  notesCount: number;
}) {
  const avgProgress = courses.length
    ? Math.round(courses.reduce((total, course) => total + course.progress, 0) / courses.length)
    : 0;

  return (
    <section className="glass-card">
      <PanelTitle icon={<BookOpenCheck className="h-5 w-5" />} title="تقرير التعلم" subtitle="ملخص بسيط للتقدم." />
      <div className="grid gap-3 md:grid-cols-3">
        <ReportMetric label="متوسط التقدم" value={`${avgProgress}%`} />
        <ReportMetric label="دورات مكتملة" value={completedCount} />
        <ReportMetric label="ملخصات دروس" value={notesCount} />
      </div>
      <p className="mt-5 text-sm leading-8 text-muted">
        يوجد {courses.filter((course) => course.status === "in_progress").length} دورة جارية حاليًا، مع{" "}
        {courses.filter((course) => course.certificateUrl || course.certificatePath).length} شهادة محفوظة.
      </p>
    </section>
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

function ReportMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-border bg-slate-950/35 p-4">
      <strong className="block text-3xl font-black">{value}</strong>
      <span className="text-xs font-bold text-muted">{label}</span>
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
