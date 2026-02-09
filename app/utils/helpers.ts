import type { AvatarProps } from "@nuxt/ui";
import countries from "~/assets/json/countries.json";

export { useTimeAgoIntl } from "@vueuse/core";

export const getIconURL = (iconId: number) => {
  return `https://cdn.communitydragon.org/latest/profile-icon/${iconId}`;
};

export const getRandomIconId = () => {
  const creationIcons = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  const randomIndex = Math.floor(Math.random() * creationIcons.length);
  return creationIcons[randomIndex]!;
};

export const getCountryName = (emoji: string) => {
  const country = countries.find(c => c.emoji === emoji);
  return country?.name;
};

const errorMap: Record<string, string> = {
  riot_account_already_linked: "La cuenta de Riot ya se ha vinculado o está vinculada a otro usuario.",
  riot_link_failed: "No se pudo vincular la cuenta de Riot.",
  riot_region_not_supported: "La región de esta cuenta de Riot no es soportada actualmente."
};

export const getErrorMessage = (code: string): string => {
  return errorMap[code] || "Ocurrió un error desconocido.";
};

export const toastImage: AvatarProps = {
  src: SITE.logo,
  alt: SITE.name,
  ui: { image: "light:invert" }
};

export const getRegionLabel = (value: string): string => {
  const region = regionMap.find(r => r.value.toLowerCase() === value.toLowerCase());
  return region ? region.label : "Unknown";
};

export const getTierLabel = (tier: string | null) => {
  if (!tier) return "UNRANKED";
  return tier;
};

export const getTierImage = (tier: string | null) => {
  if (!tier) return "/images/lol/unranked.png";
  return `/images/lol/${tier.toLowerCase()}.png`;
};
