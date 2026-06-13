"use client";

import { useRouter } from "next/navigation";
import { FlagMatchGame } from "@/components/match-game/FlagMatchGame";

export default function MatchPage() {
  const router = useRouter();
  return <FlagMatchGame onExit={() => router.push("/games")} />;
}
