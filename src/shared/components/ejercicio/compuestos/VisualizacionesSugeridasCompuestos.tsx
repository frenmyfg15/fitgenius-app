import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

// ── Tokens (mismo sistema compartido que IMCVisual) ───────────────────────────
const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    groupBgDark: "rgba(255,255,255,0.05)",
    groupBgLight: "#F8FAFC",
    groupBorderDark: "rgba(255,255,255,0.10)",
    groupBorderLight: "#E2E8F0",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#6B7280",
    textBodyDark: "#E2E8F0",
    textBodyLight: "#404040",
  },
  radius: { lg: 16, md: 12, sm: 8, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// Paleta badges de categoría — igual que VisualizacionesSugeridas
const CAT_COLORS: Record<SugCat, [string, string]> = {
  Carga: ["#e2e8f0", "#cbd5e1"],
  Volumen: ["#bfdbfe", "#93c5fd"],
  Técnica: ["#a7f3d0", "#6ee7b7"],
  Recuperación: ["#e9d5ff", "#d8b4fe"],
  Progresión: ["#fde68a", "#fcd34d"],
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
type RegistroPlanoCompuesto = {
  serieNumero: number;
  ejercicioId: number;
  nombre: string;
  pesoKg: number | null;
  repeticiones: number | null;
  duracionSegundos: number | null;
};

type Props = { registros: RegistroPlanoCompuesto[] };

type Metrics = {
  nSets: number;
  nEjercicios: number;
  totalReps: number;
  totalVol: number;
  volPorEjercicio: Array<{ ejercicioId: number; nombre: string; vol: number; reps: number }>;
  balanceIndice: number;
  pesoPromedioPorRep: number;
};

type SugCat = "Carga" | "Volumen" | "Técnica" | "Recuperación" | "Progresión";
type Sug = { cat: SugCat; text: string };

// ── Lógica ────────────────────────────────────────────────────────────────────
function computeCompoundMetrics(regs: RegistroPlanoCompuesto[]): Metrics {
  const valid = regs.filter(
    (r) =>
      (typeof r.repeticiones === "number" && r.repeticiones > 0) ||
      (typeof r.duracionSegundos === "number" && r.duracionSegundos > 0)
  );

  const sets = new Set<number>();
  const volMap = new Map<number, { nombre: string; vol: number; reps: number }>();

  let totalReps = 0;
  let totalVol = 0;

  for (const r of valid) {
    sets.add(r.serieNumero);
    const reps = typeof r.repeticiones === "number" ? r.repeticiones
      : typeof r.duracionSegundos === "number" ? r.duracionSegundos
        : 0;
    const peso = typeof r.pesoKg === "number" ? r.pesoKg : 0;
    const vol = peso * reps;

    totalReps += reps;
    totalVol += vol;

    const prev = volMap.get(r.ejercicioId);
    if (prev) { prev.vol += vol; prev.reps += reps; }
    else volMap.set(r.ejercicioId, { nombre: r.nombre, vol, reps });
  }

  const volPorEjercicio = Array.from(volMap, ([ejercicioId, v]) => ({
    ejercicioId, nombre: v.nombre, vol: v.vol, reps: v.reps,
  })).sort((a, b) => b.vol - a.vol);

  let balanceIndice = 1;
  if (volPorEjercicio.length > 1) {
    const vols = volPorEjercicio.map((v) => v.vol);
    const max = Math.max(...vols);
    const min = Math.min(...vols);
    balanceIndice = max === 0 ? 1 : 1 - (max - min) / max;
  }

  return {
    nSets: sets.size,
    nEjercicios: volMap.size,
    totalReps,
    totalVol,
    volPorEjercicio,
    balanceIndice,
    pesoPromedioPorRep: totalReps ? totalVol / totalReps : 0,
  };
}

function generateCompoundSuggestions(m: Metrics): Sug[] {
  if (m.totalReps === 0 && m.totalVol === 0) return [];
  const out: Sug[] = [];

  if (m.totalVol < 300)
    out.push({ cat: "Volumen", text: "Volumen bajo: añade 1 set o sube ligeramente la carga." });
  else if (m.totalVol > 1500)
    out.push({ cat: "Recuperación", text: "Volumen alto: vigila fatiga y añade descanso." });

  if (m.balanceIndice < 0.6 && m.volPorEjercicio.length > 1) {
    const top = m.volPorEjercicio[0];
    const low = m.volPorEjercicio[m.volPorEjercicio.length - 1];
    out.push({ cat: "Técnica", text: `Desbalance: ${top.nombre} tiene mucho más volumen que ${low.nombre}.` });
  } else {
    out.push({ cat: "Progresión", text: "Buen balance: usa progresión doble (reps → peso)." });
  }

  if (m.pesoPromedioPorRep < 15)
    out.push({ cat: "Carga", text: "Carga ligera: puedes subir peso manteniendo técnica." });

  return out;
}

function groupByCategory(sugs: Sug[]): Record<SugCat, string[]> {
  return sugs.reduce((acc, s) => {
    (acc[s.cat] ||= []).push(s.text);
    return acc;
  }, {} as Record<SugCat, string[]>);
}

// ── CatBadge ──────────────────────────────────────────────────────────────────
function CatBadge({ cat, isDark }: { cat: SugCat; isDark: boolean }) {
  const [c1, c2] = CAT_COLORS[cat];
  return (
    <LinearGradient
      colors={[c1, c2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.badge}
    >
      <Text style={[styles.badgeText, { color: isDark ? "#171717" : "#0F172A" }]}>
        {cat}
      </Text>
    </LinearGradient>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function VisualizacionesSugeridasCompuestos({ registros }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "KG").toLowerCase();

  const metrics = useMemo(() => computeCompoundMetrics(registros), [registros]);
  const sugs = useMemo(() => generateCompoundSuggestions(metrics), [metrics]);
  const byCat = useMemo(() => groupByCategory(sugs), [sugs]);

  const hasData = metrics.totalReps > 0 || metrics.totalVol > 0;

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textBody = isDark ? tokens.color.textBodyDark : tokens.color.textBodyLight;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={GRADIENT as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.frame}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
              borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
            },
          ]}
        >
          {/* Header — misma tipografía que IMCVisual */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>
              Sugerencias (compuestos)
            </Text>
            <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
              {Math.round(metrics.totalVol)} {unit}·reps
            </Text>
          </View>

          {/* Cuerpo */}
          <View style={styles.body}>
            {hasData ? (
              <View style={styles.groupStack}>
                {Object.entries(byCat).map(([cat, textos]) => (
                  <View
                    key={cat}
                    style={[
                      styles.group,
                      {
                        backgroundColor: isDark ? tokens.color.groupBgDark : tokens.color.groupBgLight,
                        borderColor: isDark ? tokens.color.groupBorderDark : tokens.color.groupBorderLight,
                      },
                    ]}
                  >
                    <View style={styles.groupBadgeWrap}>
                      <CatBadge cat={cat as SugCat} isDark={isDark} />
                    </View>
                    <View style={styles.bulletStack}>
                      {(textos as string[]).map((t, i) => (
                        <View key={`${cat}-${i}`} style={styles.bulletRow}>
                          <View
                            style={[
                              styles.dot,
                              {
                                backgroundColor: isDark
                                  ? tokens.color.textSecondaryDark
                                  : tokens.color.textSecondaryLight,
                              },
                            ]}
                          />
                          <Text style={[styles.bulletText, { color: textBody }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: textSecondary }]}>
                  Aún no hay datos suficientes para generar sugerencias.
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { width: "100%" },

  // Frame — valores exactos de IMCVisual
  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  // Card interior — sombra añadida igual que IMCVisual
  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Header — fontSize 13 + letterSpacing 0.2, igual que IMCVisual
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.sm,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerSubtitle: { fontSize: 11 },

  // Body
  body: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },

  // Grupos
  groupStack: { gap: tokens.spacing.lg },
  group: {
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderWidth: 1,
  },
  groupBadgeWrap: { marginBottom: tokens.spacing.sm },

  // Bullets
  bulletStack: { gap: tokens.spacing.sm },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: tokens.spacing.sm,
  },
  dot: {
    marginTop: 6,
    width: 6,
    height: 6,
    borderRadius: tokens.radius.full,
  },
  bulletText: { flex: 1, fontSize: 14 },

  // Badge
  badge: {
    alignSelf: "flex-start",
    borderRadius: tokens.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },

  // Empty
  empty: {
    paddingVertical: tokens.spacing.xl,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, textAlign: "center" },
});