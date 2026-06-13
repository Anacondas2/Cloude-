import type { Submission, SubmissionCountry } from "./types";

export interface CountryStat {
  code: string;
  nameRu: string;
  flag: string;
  count: number;
}

export function countryFrequencies(subs: Submission[]): CountryStat[] {
  const map = new Map<string, CountryStat>();
  for (const s of subs) {
    for (const c of s.countries) {
      const existing = map.get(c.code);
      if (existing) existing.count += 1;
      else map.set(c.code, { ...c, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function topTravellers(subs: Submission[], n = 5): Submission[] {
  return [...subs]
    .sort((a, b) => b.countries.length - a.countries.length)
    .slice(0, n);
}

export function popularCountries(subs: Submission[], n = 8): CountryStat[] {
  return countryFrequencies(subs).slice(0, n);
}

export function rareCountries(subs: Submission[], n = 8): CountryStat[] {
  const all = countryFrequencies(subs);
  return all.filter((c) => c.count === 1).slice(0, n);
}

export function totalUniqueCountries(subs: Submission[]): number {
  return countryFrequencies(subs).length;
}
