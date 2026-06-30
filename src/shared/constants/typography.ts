/**
 * Design tokens de tipografía de FitGenius.
 *
 * Familias:
 *  - Rajdhani  → títulos grandes, encabezados, métricas destacadas
 *                Geométrica, condensada, espíritu deportivo/tech
 *  - Inter     → cuerpo de texto, etiquetas, subtítulos, UI en general
 *                Máxima legibilidad en pantallas pequeñas
 *
 * Instalación (Expo):
 *   npx expo install @expo-google-fonts/rajdhani @expo-google-fonts/inter
 *   Luego carga con useFonts() en el entry point.
 *
 * Uso:
 *   import { Font, TextStyle } from "@/shared/constants/typography";
 *   style={{ fontFamily: Font.title.bold, fontSize: TextStyle.h1.fontSize }}
 */

export const Font = {
  // ── Rajdhani (títulos) ────────────────────────────────────────────────────
  title: {
    regular:    "Rajdhani_400Regular",
    medium:     "Rajdhani_500Medium",
    semiBold:   "Rajdhani_600SemiBold",
    bold:       "Rajdhani_700Bold",
  },

  // ── Inter (cuerpo / UI) ───────────────────────────────────────────────────
  body: {
    regular:    "Inter_400Regular",
    medium:     "Inter_500Medium",
    semiBold:   "Inter_600SemiBold",
    bold:       "Inter_700Bold",
  },
} as const;

/** Escala tipográfica — tamaños y alturas de línea listos para usar. */
export const TextStyle = {
  // Rajdhani
  display: { fontFamily: Font.title.bold,     fontSize: 40, lineHeight: 44, letterSpacing: -0.5 },
  h1:      { fontFamily: Font.title.bold,     fontSize: 32, lineHeight: 36, letterSpacing: -0.3 },
  h2:      { fontFamily: Font.title.semiBold, fontSize: 26, lineHeight: 30, letterSpacing: -0.2 },
  h3:      { fontFamily: Font.title.semiBold, fontSize: 22, lineHeight: 26 },
  metric:  { fontFamily: Font.title.bold,     fontSize: 36, lineHeight: 40, letterSpacing: -0.5 },

  // Inter
  bodyLg:  { fontFamily: Font.body.regular,   fontSize: 16, lineHeight: 24 },
  body:    { fontFamily: Font.body.regular,   fontSize: 14, lineHeight: 21 },
  bodySm:  { fontFamily: Font.body.regular,   fontSize: 12, lineHeight: 18 },
  label:   { fontFamily: Font.body.medium,    fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: Font.body.regular,   fontSize: 11, lineHeight: 16 },
  button:  { fontFamily: Font.body.bold,      fontSize: 15, lineHeight: 20, letterSpacing: 0.3 },
} as const;
