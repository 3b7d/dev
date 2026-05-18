import { AppShell } from "@/components/layout/app-shell";
import { CoursesView } from "@/components/courses/courses-view";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { CourseItem, CourseNote, CourseStatus } from "@/types/courses";
import type { TaskUser } from "@/types/tasks";

const CERTIFICATE_BUCKET = "course-certificates";

type RawCourse = {
  id: string;
  title: string;
  provider: string | null;
  url: string | null;
  status: CourseStatus;
  progress: number;
  start_date: string | null;
  completed_at: string | null;
  certificate_url: string | null;
  certificate_path: string | null;
  created_at: string;
  updated_at: string;
  user: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
  creator: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
  course_notes: Array<{
    id: string;
    title: string;
    summary: string;
    lesson_date: string;
    user: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
  }> | null;
};

export default async function CoursesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: coursesData }, { data: usersData }] = await Promise.all([
    supabase
      .from("courses")
      .select(
        "id,title,provider,url,status,progress,start_date,completed_at,certificate_url,certificate_path,created_at,updated_at,user:users!courses_user_id_fkey(id,full_name,email),creator:users!courses_created_by_fkey(id,full_name,email),course_notes(id,title,summary,lesson_date,user:users!course_notes_user_id_fkey(id,full_name,email))",
      )
      .order("updated_at", { ascending: false }),
    supabase.from("users").select("id,full_name,email").order("full_name", { ascending: true }),
  ]);

  const courses = await Promise.all(((coursesData ?? []) as RawCourse[]).map((course) => mapCourse(course, supabase)));
  const users = ((usersData ?? []) as Array<{ id: string; full_name: string | null; email: string }>).map(mapUser);

  return (
    <AppShell profile={profile}>
      <CoursesView profile={profile} courses={courses} users={users} />
    </AppShell>
  );
}

async function mapCourse(course: RawCourse, supabase: Awaited<ReturnType<typeof createClient>>): Promise<CourseItem> {
  return {
    id: course.id,
    title: course.title,
    provider: course.provider,
    url: course.url,
    status: course.status,
    progress: course.progress,
    startDate: course.start_date,
    completedAt: course.completed_at,
    certificateUrl: course.certificate_url,
    certificatePath: course.certificate_path,
    signedCertificateUrl: await getSignedCertificateUrl(course.certificate_path, supabase),
    user: normalizeUser(course.user),
    createdBy: normalizeUser(course.creator),
    notes: (course.course_notes ?? []).map((note): CourseNote => ({
      id: note.id,
      title: note.title,
      summary: note.summary,
      lessonDate: note.lesson_date,
      user: normalizeUser(note.user),
    })),
    createdAt: course.created_at,
    updatedAt: course.updated_at,
  };
}

async function getSignedCertificateUrl(path: string | null, supabase: Awaited<ReturnType<typeof createClient>>) {
  if (!path) {
    return null;
  }

  const { data } = await supabase.storage.from(CERTIFICATE_BUCKET).createSignedUrl(path, 60 * 20);
  return data?.signedUrl ?? null;
}

function normalizeUser(user: RawCourse["user"]): TaskUser | null {
  const value = Array.isArray(user) ? user[0] : user;
  return value ? mapUser(value) : null;
}

function mapUser(user: { id: string; full_name: string | null; email: string }): TaskUser {
  return {
    id: user.id,
    fullName: user.full_name ?? user.email,
    email: user.email,
  };
}
