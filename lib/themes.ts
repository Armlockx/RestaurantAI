export type ThemeCategory = "light" | "dark" | "texture";

export type ThemeId =
  | "light"
  | "dark"
  | "wood"
  | "marble"
  | "linen"
  | "terracotta"
  | "delivery";

export type AppPlatform = "android" | "ios";

export type ThemePreferences = Record<AppPlatform, ThemeId>;

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  category: ThemeCategory;
  preview: {
    surface: string;
    brand: string;
    accent: string;
  };
}

const STORAGE_KEY = "restaurantai-theme-preferences";

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  android: "light",
  ios: "light",
};

export const THEMES: ThemeDefinition[] = [
  {
    id: "light",
    name: "Claro",
    description: "Visual limpo e minimalista para o dia a dia.",
    category: "light",
    preview: { surface: "#ffffff", brand: "#111111", accent: "#f5f5f5" },
  },
  {
    id: "dark",
    name: "Escuro",
    description: "Confortável à noite, com alto contraste.",
    category: "dark",
    preview: { surface: "#141414", brand: "#f5f5f5", accent: "#2a2a2a" },
  },
  {
    id: "wood",
    name: "Madeira",
    description: "Textura de tábua de madeira, estilo cozinha artesanal.",
    category: "texture",
    preview: { surface: "#f3e4d0", brand: "#5c3d2e", accent: "#c9a882" },
  },
  {
    id: "marble",
    name: "Mármore",
    description: "Superfície elegante de mármore para restaurantes refinados.",
    category: "texture",
    preview: { surface: "#f0eeeb", brand: "#2c2c2c", accent: "#d4d0cb" },
  },
  {
    id: "linen",
    name: "Toalha de mesa",
    description: "Padrão de linho xadrez, ambiente de mesa posta.",
    category: "texture",
    preview: { surface: "#faf6f0", brand: "#8b4513", accent: "#e8dcc8" },
  },
  {
    id: "terracotta",
    name: "Terracota",
    description: "Tons quentes de forno e pizza artesanal.",
    category: "texture",
    preview: { surface: "#f5e6d8", brand: "#a0522d", accent: "#d4956a" },
  },
  {
    id: "delivery",
    name: "Delivery",
    description: "Padrão de embalagem e entrega, ideal para pedidos rápidos.",
    category: "texture",
    preview: { surface: "#fff8f0", brand: "#e85d04", accent: "#ffd6a5" },
  },
];

export const THEME_CATEGORIES: { id: ThemeCategory; label: string }[] = [
  { id: "light", label: "Claro" },
  { id: "dark", label: "Escuro" },
  { id: "texture", label: "Textura" },
];

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}

export function detectPlatform(): AppPlatform {
  if (typeof navigator === "undefined") return "android";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "android";
}

export function getPlatformLabel(platform: AppPlatform): string {
  return platform === "ios" ? "iOS" : "Android";
}

export function loadThemePreferences(): ThemePreferences {
  if (typeof window === "undefined") return DEFAULT_THEME_PREFERENCES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_PREFERENCES;

    const parsed = JSON.parse(raw) as Partial<ThemePreferences>;
    const android = isValidThemeId(parsed.android)
      ? parsed.android
      : DEFAULT_THEME_PREFERENCES.android;
    const ios = isValidThemeId(parsed.ios)
      ? parsed.ios
      : DEFAULT_THEME_PREFERENCES.ios;

    return { android, ios };
  } catch {
    return DEFAULT_THEME_PREFERENCES;
  }
}

export function saveThemePreferences(preferences: ThemePreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function getActiveThemeId(
  preferences: ThemePreferences,
  platform: AppPlatform = detectPlatform()
): ThemeId {
  return preferences[platform];
}

function isValidThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEMES.some((theme) => theme.id === value);
}

export function getThemeColor(themeId: ThemeId): string {
  switch (themeId) {
    case "dark":
      return "#141414";
    case "wood":
      return "#5c3d2e";
    case "marble":
      return "#2c2c2c";
    case "linen":
      return "#8b4513";
    case "terracotta":
      return "#a0522d";
    case "delivery":
      return "#e85d04";
    default:
      return "#111111";
  }
}
