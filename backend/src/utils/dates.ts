export function addInterval(date: Date, interval: "weekly" | "monthly" | "yearly"): Date {
  const d = new Date(date);
  if (interval === "weekly") d.setDate(d.getDate() + 7);
  if (interval === "monthly") d.setMonth(d.getMonth() + 1);
  if (interval === "yearly") d.setFullYear(d.getFullYear() + 1);
  return d;
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
