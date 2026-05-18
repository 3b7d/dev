import type { ReportPeriod } from "@/types/reports";

export function getReportDateRange(period: ReportPeriod, date: string) {
  const base = parseDate(date);

  if (period === "weekly") {
    const day = base.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = addDays(base, diffToMonday);
    const end = addDays(start, 6);
    return {
      from: formatDate(start),
      to: formatDate(end),
      label: `${formatDate(start)} إلى ${formatDate(end)}`,
    };
  }

  const formatted = formatDate(base);
  return {
    from: formatted,
    to: formatted,
    label: formatted,
  };
}

export function getTodayDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${getTodayDate()}T00:00:00.000Z`);
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
