import { useEffect, useState, useCallback } from "react";
import { DEMO_REPORTS, type Report } from "./data";

const KEY = "moya-reports-v1";
const listeners = new Set<() => void>();

function read(): Report[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Report[]) : DEMO_REPORTS;
  } catch {
    return DEMO_REPORTS;
  }
}
function write(r: Report[]) {
  localStorage.setItem(KEY, JSON.stringify(r));
  listeners.forEach((l) => l());
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>(DEMO_REPORTS);
  useEffect(() => {
    const sync = () => setReports(read());
    sync();
    listeners.add(sync);
    return () => void listeners.delete(sync);
  }, []);
  const add = useCallback((r: Report) => write([r, ...read()]), []);
  const update = useCallback((id: string, patch: Partial<Report>) => write(read().map((r) => (r.id === id ? { ...r, ...patch } : r))), []);
  const remove = useCallback((id: string) => write(read().filter((r) => r.id !== id)), []);
  const reset = useCallback(() => write(DEMO_REPORTS), []);
  return { reports, add, update, remove, reset };
}

export function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  return w === 1 ? "1 week ago" : `${w} weeks ago`;
}
