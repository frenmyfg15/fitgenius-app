/**
 * Design tokens de FitGenius.
 * No modifica ningún archivo de constantes existente — es el único origen de verdad de color.
 *
 * Uso:
 *   import { Colors, scheme } from "@/shared/constants/colors";
 *   const t = scheme(isDark);
 *   style={{ color: t.textPrimary, backgroundColor: Colors.primary }}
 */

export const Colors = {
  // ── Fondos base ───────────────────────────────────────────────────────────
  primary:   "#111111",  // fondo oscuro universal
  secondary: "#ffffff",  // fondo claro universal

  // ── Acento (verde neón) ───────────────────────────────────────────────────
  accent:        "#39FF14",              // acento principal
  accentPressed: "#2DB800",             // estado pressed / variante oscura
  accentSubtle:  "rgba(57,255,20,0.10)", // fondo tenue
  accentSoft:    "rgba(57,255,20,0.18)", // fondo medio
  accentMuted:   "rgba(57,255,20,0.25)", // fondo notorio
  accentBorder:  "rgba(57,255,20,0.35)", // borde estándar
  accentStrong:  "rgba(57,255,20,0.50)", // borde/énfasis fuerte

  // ── Escala sobre fondo oscuro (#111111) — texto en blanco ─────────────────
  dark: {
    textPrimary:   "#F1F5F9",               // títulos, texto principal
    textSecondary: "#94A3B8",               // subtítulos, metadatos
    textTertiary:  "#64748B",               // placeholders, hints
    textDisabled:  "#334155",               // elementos deshabilitados
    border:        "rgba(255,255,255,0.08)", // bordes sutiles
    borderStrong:  "rgba(255,255,255,0.16)", // bordes visibles
    surface:       "#1A1A1A",               // tarjetas / superficies elevadas
    surfaceAlt:    "#222222",               // superficies secundarias
    overlay:       "rgba(0,0,0,0.60)",      // overlays / backdrops
  },

  // ── Escala sobre fondo claro (#ffffff) — texto en negro ───────────────────
  light: {
    textPrimary:   "#0F172A",               // títulos, texto principal
    textSecondary: "#475569",               // subtítulos, metadatos
    textTertiary:  "#94A3B8",               // placeholders, hints
    textDisabled:  "#CBD5E1",               // elementos deshabilitados
    border:        "rgba(15,23,42,0.08)",   // bordes sutiles
    borderStrong:  "rgba(15,23,42,0.16)",   // bordes visibles
    surface:       "#F8FAFC",               // tarjetas / superficies elevadas
    surfaceAlt:    "#F1F5F9",               // superficies secundarias
    overlay:       "rgba(255,255,255,0.90)", // overlays / backdrops
  },
} as const;

/** Devuelve los tokens del esquema activo según isDark. */
export const scheme = (isDark: boolean) =>
  isDark ? Colors.dark : Colors.light;
