import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Submission, SubmissionCountry } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_READY = Boolean(url && anon);

let client: SupabaseClient | null = null;
if (SUPABASE_READY) {
  client = createClient(url as string, anon as string, {
    auth: { persistSession: false },
  });
}

const LS_KEY = "trewel:submissions";

// ── Local fallback (so the app fully works before Supabase is configured) ──
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

// ── Public API ──
export async function fetchSubmissions(): Promise<Submission[]> {
  if (client) {
    const { data, error } = await client
      .from("submissions")
      .select("id, name, countries, created_at")
      .eq("public", true)
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) return data as Submission[];
  }
  return readLocal();
}

export async function createSubmission(
  name: string,
  countries: SubmissionCountry[]
): Promise<Submission> {
  const entry: Submission = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    name,
    countries,
    created_at: new Date().toISOString(),
  };

  if (client) {
    const { data, error } = await client
      .from("submissions")
      .insert({ name, countries, public: true })
      .select("id, name, countries, created_at")
      .single();
    if (!error && data) return data as Submission;
  }

  // fallback to localStorage
  const list = readLocal();
  list.unshift(entry);
  writeLocal(list);
  return entry;
}
