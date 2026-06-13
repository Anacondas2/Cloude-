import type { Submission, SubmissionCountry } from "./types";

const LS_KEY = "trewel:submissions";

// ── Local fallback (only if the API is unreachable) ──
function readLocal(): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(list: Submission[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 200)));
}

// ── Public API (backed by Vercel KV via /api/submissions) ──
export async function fetchSubmissions(): Promise<Submission[]> {
  try {
    const res = await fetch("/api/submissions", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as Submission[];
      if (Array.isArray(data)) return data;
    }
  } catch {
    // fall through to local
  }
  return readLocal();
}

export async function createSubmission(
  name: string,
  countries: SubmissionCountry[]
): Promise<Submission> {
  try {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, countries }),
    });
    if (res.ok) return (await res.json()) as Submission;
  } catch {
    // fall through to local
  }

  const entry: Submission = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    name,
    countries,
    created_at: new Date().toISOString(),
  };
  const list = readLocal();
  list.unshift(entry);
  writeLocal(list);
  return entry;
}
