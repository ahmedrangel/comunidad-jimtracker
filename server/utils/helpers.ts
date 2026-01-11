export { z } from "zod";

export const LEAGUE_TIERS = [
  { id: "IRON", divisions: ["IV", "III", "II", "I"], color: "#6B4E24" },
  { id: "BRONZE", divisions: ["IV", "III", "II", "I"], color: "#A0522D" },
  { id: "SILVER", divisions: ["IV", "III", "II", "I"], color: "#C0C0C0" },
  { id: "GOLD", divisions: ["IV", "III", "II", "I"], color: "#FFD700" },
  { id: "PLATINUM", divisions: ["IV", "III", "II", "I"], color: "#40E0D0" },
  { id: "EMERALD", divisions: ["IV", "III", "II", "I"], color: "#50C878" },
  { id: "DIAMOND", divisions: ["IV", "III", "II", "I"], color: "#B9F2FF" },
  { id: "MASTER", divisions: [""], color: "#9932CC" },
  { id: "GRANDMASTER", divisions: [""], color: "#DC143C" },
  { id: "CHALLENGER", divisions: [""], color: "#F7931E" }
];

const divisionValues = { IV: 0, III: 100, II: 200, I: 300 };

export const eloToValue = (tier: string, division: string, lp: number): number => {
  const tierIndex = LEAGUE_TIERS.findIndex(t => t.id.toLowerCase() === tier.toLowerCase());
  if (tierIndex === -1) return 0;

  const baseValue = tierIndex * 400; // 400 puntos por tier

  if (tier.toLowerCase() === "master" || tier.toLowerCase() === "grandmaster" || tier.toLowerCase() === "challenger") {
    return baseValue + lp;
  }

  const divisionValue = divisionValues[division as keyof typeof divisionValues] || 0;
  return baseValue + divisionValue + lp;
};
