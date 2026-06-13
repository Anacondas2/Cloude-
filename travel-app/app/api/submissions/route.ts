import { NextResponse } from "next/server";
import { createClient, type VercelKV } from "@vercel/kv";
import type { Submission, SubmissionCountry } from "@/lib/types";

export const dynamic = "force-dynamic";

const KEY = "trewel:submissions";
const MAX = 500;

// Support both Vercel KV and Upstash Redis env var names.
const KV_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const hasKV = Boolean(KV_URL && KV_TOKEN);

// In-memory fallback for local `next dev` (no persistence across deploys).
const mem: Submission[] =
  ((globalThis as any).__trewelMem ??= [] as Submission[]);

let kvClient: VercelKV | null = null;
function getKv(): VercelKV {
  if (!kvClient) {
    kvClient = createClient({
      url: KV_URL as string,
      token: KV_TOKEN as string,
    });
  }
  return kvClient;
}

function sanitize(body: any): Submission | null {
  if (!body || typeof body.name !== "string") return null;
  const name = body.name.trim().slice(0, 80);
  if (name.length < 1) return null;

  if (!Array.isArray(body.countries) || body.countries.length === 0) return null;
  const countries: SubmissionCountry[] = body.countries
    .filter((c: any) => c && c.code && c.nameRu && c.flag)
    .slice(0, 200)
    .map((c: any) => ({
      code: String(c.code).slice(0, 6),
      nameRu: String(c.nameRu).slice(0, 60),
      flag: String(c.flag).slice(0, 8),
    }));
  if (countries.length === 0) return null;

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(36).slice(2),
    name,
    countries,
    created_at: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    if (hasKV) {
      const kv = await getKv();
      const raw = await kv.lrange<Submission | string>(KEY, 0, MAX - 1);
      const list = (raw || []).map((r) =>
        typeof r === "string" ? (JSON.parse(r) as Submission) : r
      );
      return NextResponse.json(list);
    }
    return NextResponse.json(mem);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const entry = sanitize(body);
  if (!entry) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  try {
    if (hasKV) {
      const kv = await getKv();
      await kv.lpush(KEY, JSON.stringify(entry));
      await kv.ltrim(KEY, 0, MAX - 1);
    } else {
      mem.unshift(entry);
      if (mem.length > MAX) mem.length = MAX;
    }
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "storage error" }, { status: 500 });
  }
}
