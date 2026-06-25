"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME_PREFERENCES,
  detectPlatform,
  getActiveThemeId,
  getTheme,
  getThemeColor,
  loadThemePreferences,
  saveThemePreferences,
  type AppPlatform,
  type ThemeId,
  type ThemePreferences,
} from "@/lib/themes";

type ThemeContextValue = {
  preferences: ThemePreferences;
  activePlatform: AppPlatform;
  activeThemeId: ThemeId;
  activeTheme: ReturnType<typeof getTheme>;
  setPlatformTheme: (platform: AppPlatform, themeId: ThemeId) => void;
  previewTheme: (themeId: ThemeId | null) => void;
  previewing: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(themeId: ThemeId) {
  const root = document.documentElement;
  root.dataset.theme = themeId;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", getThemeColor(themeId));
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(
    DEFAULT_THEME_PREFERENCES
  );
  const [activePlatform, setActivePlatform] = useState<AppPlatform>("android");
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadThemePreferences();
    const platform = detectPlatform();
    setPreferences(stored);
    setActivePlatform(platform);
    applyThemeToDocument(getActiveThemeId(stored, platform));
    setHydrated(true);
  }, []);

  const activeThemeId = previewThemeId ?? getActiveThemeId(preferences, activePlatform);
  const activeTheme = getTheme(activeThemeId);

  useEffect(() => {
    if (!hydrated) return;
    applyThemeToDocument(activeThemeId);
  }, [activeThemeId, hydrated]);

  const setPlatformTheme = useCallback(
    (platform: AppPlatform, themeId: ThemeId) => {
      setPreferences((current) => {
        const next = { ...current, [platform]: themeId };
        saveThemePreferences(next);

        if (platform === activePlatform) {
          setPreviewThemeId(null);
          applyThemeToDocument(themeId);
        }

        return next;
      });
    },
    [activePlatform]
  );

  const previewTheme = useCallback(
    (themeId: ThemeId | null) => {
      setPreviewThemeId(themeId);
      if (themeId) {
        applyThemeToDocument(themeId);
      } else {
        applyThemeToDocument(getActiveThemeId(preferences, activePlatform));
      }
    },
    [preferences, activePlatform]
  );

  const value = useMemo(
    () => ({
      preferences,
      activePlatform,
      activeThemeId,
      activeTheme,
      setPlatformTheme,
      previewTheme,
      previewing: previewThemeId !== null,
    }),
    [
      preferences,
      activePlatform,
      activeThemeId,
      activeTheme,
      setPlatformTheme,
      previewTheme,
      previewThemeId,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
