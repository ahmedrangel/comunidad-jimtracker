import countries from "~/assets/json/countries.json";

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

export const normalizeBidi = (str: string) => {
  // remove bidirectional characters
  return str.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
};

const errorMap: Record<string, string> = {
  riot_account_already_linked: "La cuenta de Riot ya se ha vinculado o está vinculada a otro usuario.",
  riot_link_failed: "No se pudo vincular la cuenta de Riot."
};

export const getErrorMessage = (code: string): string => {
  return errorMap[code] || "Ocurrió un error desconocido.";
};
