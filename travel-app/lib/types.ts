export type RegionKey =
  | "europe"
  | "asia"
  | "north_america"
  | "south_america"
  | "africa"
  | "oceania";

export interface Country {
  code: string;        // ISO alpha-2, lowercase
  nameRu: string;
  nameEn: string;
  flag: string;        // emoji flag
  region: RegionKey;
  symbol: string;      // landmark / identity emoji
  landmark: string;    // short RU description
  accent: [string, string]; // gradient hex pair
  motif: string;       // micro-animation keyword
}

export interface SubmissionCountry {
  code: string;
  nameRu: string;
  flag: string;
}

export interface Submission {
  id: string;
  name: string;
  countries: SubmissionCountry[];
  created_at: string;
}
