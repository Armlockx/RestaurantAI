"use client";

import { useEffect, useState } from "react";
import { Check, Palette, Smartphone } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  getPlatformLabel,
  getTheme,
  THEME_CATEGORIES,
  THEMES,
  type AppPlatform,
  type ThemeCategory,
  type ThemeId,
} from "@/lib/themes";
import { cn } from "@/lib/utils";

function ThemePreviewSwatch({
  themeId,
  selected,
  onSelect,
  onPreviewStart,
  onPreviewEnd,
}: {
  themeId: ThemeId;
  selected: boolean;
  onSelect: () => void;
  onPreviewStart: () => void;
  onPreviewEnd: () => void;
}) {
  const theme = getTheme(themeId);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onPreviewStart}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreviewStart}
      onBlur={onPreviewEnd}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border text-left transition-all",
        selected
          ? "border-brand ring-2 ring-brand/25"
          : "border-border hover:border-brand/40"
      )}
      aria-pressed={selected}
      aria-label={`Tema ${theme.name}`}
    >
      <div
        className="relative h-16 w-full"
        style={{
          background: theme.preview.surface,
        }}
      >
        <div
          className="absolute inset-0 opacity-80"
          data-theme-preview={themeId}
          aria-hidden
        />
        <div className="absolute bottom-2 left-2 flex gap-1">
          <span
            className="size-4 rounded-full border border-black/10 shadow-sm"
            style={{ background: theme.preview.brand }}
          />
          <span
            className="size-4 rounded-full border border-black/10 shadow-sm"
            style={{ background: theme.preview.accent }}
          />
        </div>
        {selected && (
          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-sm">
            <Check className="size-3.5" aria-hidden />
          </span>
        )}
      </div>
      <div className="bg-surface px-2.5 py-2">
        <p className="text-xs font-bold text-text">{theme.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-text-muted">
          {theme.description}
        </p>
      </div>
    </button>
  );
}

function PlatformTab({
  platform,
  active,
  currentTheme,
  onClick,
}: {
  platform: AppPlatform;
  active: boolean;
  currentTheme: ThemeId;
  onClick: () => void;
}) {
  const theme = getTheme(currentTheme);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-button px-3 py-2.5 text-center transition-colors",
        active
          ? "bg-brand text-brand-foreground"
          : "bg-surface-muted text-text-muted hover:text-text"
      )}
      aria-pressed={active}
    >
      <Smartphone className="size-4" aria-hidden />
      <span className="text-xs font-bold">{getPlatformLabel(platform)}</span>
      <span
        className={cn(
          "text-[10px] font-medium",
          active ? "text-brand-foreground/80" : "text-text-muted"
        )}
      >
        {theme.name}
      </span>
    </button>
  );
}

export function ThemeSelector() {
  const { preferences, activePlatform, setPlatformTheme, previewTheme } =
    useTheme();
  const [editingPlatform, setEditingPlatform] = useState<AppPlatform>(
    activePlatform
  );
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>("light");

  useEffect(() => {
    setEditingPlatform(activePlatform);
  }, [activePlatform]);

  const selectedThemeId = preferences[editingPlatform];
  const filteredThemes = THEMES.filter((theme) => theme.category === activeCategory);
  const canPreview = editingPlatform === activePlatform;

  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text">
          <Palette className="size-4" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text">Aparência do app</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Escolha temas separados para Android e iOS — claros, escuros ou
            texturas de gastronomia e delivery.
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <PlatformTab
          platform="android"
          active={editingPlatform === "android"}
          currentTheme={preferences.android}
          onClick={() => setEditingPlatform("android")}
        />
        <PlatformTab
          platform="ios"
          active={editingPlatform === "ios"}
          currentTheme={preferences.ios}
          onClick={() => setEditingPlatform("ios")}
        />
      </div>

      {activePlatform === editingPlatform ? (
        <p className="mb-3 rounded-button bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
          Este é o seu dispositivo atual — as alterações são aplicadas na hora.
        </p>
      ) : (
        <p className="mb-3 rounded-button bg-surface-muted px-3 py-2 text-xs text-text-muted">
          Tema salvo para quando abrir o app em{" "}
          <strong className="text-text">{getPlatformLabel(editingPlatform)}</strong>.
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-1.5">
        {THEME_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              activeCategory === category.id
                ? "bg-brand text-brand-foreground"
                : "bg-surface-muted text-text-muted hover:text-text"
            )}
            aria-pressed={activeCategory === category.id}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div
        className="grid grid-cols-2 gap-2"
        onMouseLeave={() => {
          if (canPreview) previewTheme(null);
        }}
      >
        {filteredThemes.map((theme) => (
          <ThemePreviewSwatch
            key={theme.id}
            themeId={theme.id}
            selected={selectedThemeId === theme.id}
            onSelect={() => setPlatformTheme(editingPlatform, theme.id)}
            onPreviewStart={() => {
              if (canPreview) previewTheme(theme.id);
            }}
            onPreviewEnd={() => {
              if (canPreview) previewTheme(null);
            }}
          />
        ))}
      </div>
    </section>
  );
}
