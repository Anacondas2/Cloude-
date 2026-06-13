import type { RegionKey } from "./types";

export interface RegionDef {
  key: RegionKey | "all";
  labelRu: string;
  emoji: string;
}

export const REGIONS: RegionDef[] = [
  { key: "all", labelRu: "Все", emoji: "🌍" },
  { key: "europe", labelRu: "Европа", emoji: "🇪🇺" },
  { key: "asia", labelRu: "Азия", emoji: "🌏" },
  { key: "north_america", labelRu: "Северная Америка", emoji: "🗽" },
  { key: "south_america", labelRu: "Южная Америка", emoji: "🌴" },
  { key: "africa", labelRu: "Африка", emoji: "🦁" },
  { key: "oceania", labelRu: "Океания", emoji: "🏝️" },
];

export const REGION_LABEL: Record<RegionKey, string> = {
  europe: "Европа",
  asia: "Азия",
  north_america: "Северная Америка",
  south_america: "Южная Америка",
  africa: "Африка",
  oceania: "Океания",
};
