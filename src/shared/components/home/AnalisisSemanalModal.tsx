import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Lock } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { obtenerAnalisisSemanal } from "@/features/api/coach.api";
import type {
  AnalisisSemanalData,
  MoodSemanal,
  DiaSemanaInfo,
  GrupoMuscularSemana,
} from "@/features/api/coach.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { useAnalisisStore } from "@/features/store/useAnalisisStore";
import { getSemanaISO } from "@/shared/utils/getSemanaISO";

const GRADIENT = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;

// ── Tokens ─────────────────────────────────────────────────────────────────────

const C = {
  dark: {
    bg: "#080D17",
    card: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.08)",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "rgba(255,255,255,0.45)",
    pill: "rgba(255,255,255,0.07)",
    trackBg: "rgba(255,255,255,0.07)",
  },
  light: {
    bg: "#F8FAFC",
    card: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.07)",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "rgba(15,23,42,0.45)",
    pill: "rgba(0,0,0,0.04)",
    trackBg: "rgba(0,0,0,0.06)",
  },
} as const;

// ── Mood config ────────────────────────────────────────────────────────────────

const MOOD_CONFIG: Record<
  MoodSemanal,
  { label: string; color: string; bg: string }
> = {
  SEMANA_ELITE: {
    label: "Semana de élite",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.14)",
  },
  SEMANA_SOLIDA: {
    label: "Semana sólida",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.14)",
  },
  SEMANA_IRREGULAR: {
    label: "Semana irregular",
    color: "#F97316",
    bg: "rgba(249,115,22,0.14)",
  },
  SEMANA_RECUPERA: {
    label: "Semana de recuperación",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.14)",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtVol(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)} t`;
  return `${v} kg`;
}

// ── DiasRow ───────────────────────────────────────────────────────────────────

function DiasRow({
  dias,
  accentColor,
  isDark,
}: {
  dias: DiaSemanaInfo[];
  accentColor: string;
  isDark: boolean;
}) {
  const t = isDark ? C.dark : C.light;
  return (
    <View style={styles.diasRow}>
      {dias.map((d, i) => (
        <View key={i} style={styles.diaItem}>
          <View
            style={[
              styles.diaDot,
              {
                backgroundColor: d.completado
                  ? accentColor
                  : t.trackBg,
                borderColor: d.completado ? accentColor : t.border,
              },
            ]}
          >
            {d.completado && (
              <Text style={styles.diaDotCheck}>✓</Text>
            )}
          </View>
          <Text
            style={[
              styles.diaDotLabel,
              {
                color: d.completado ? accentColor : t.textMuted,
                fontWeight: d.completado ? "800" : "500",
              },
            ]}
          >
            {d.dia}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── GrupoBar ──────────────────────────────────────────────────────────────────

function GrupoBar({
  grupo,
  volumen,
  maxVolumen,
  accentColor,
  isDark,
}: {
  grupo: GrupoMuscularSemana;
  volumen: number;
  maxVolumen: number;
  accentColor: string;
  isDark: boolean;
}) {
  const t = isDark ? C.dark : C.light;
  const pct = maxVolumen > 0 ? volumen / maxVolumen : 0;

  return (
    <View style={styles.grupoRow}>
      <Text
        style={[styles.grupoNombre, { color: t.textSecondary }]}
        numberOfLines={1}
      >
        {grupo.grupo}
      </Text>
      <View style={[styles.grupoTrack, { backgroundColor: t.trackBg }]}>
        <View
          style={[
            styles.grupoFill,
            { width: `${Math.round(pct * 100)}%`, backgroundColor: accentColor },
          ]}
        />
      </View>
      <Text style={[styles.grupoVol, { color: t.textMuted }]}>
        {fmtVol(volumen)}
      </Text>
    </View>
  );
}

// ── AnalisisSemanalSkeleton ───────────────────────────────────────────────────

function AnalisisSemanalSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(148,163,184,0.14)" : "#E5E7EB";
  const border = isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB";
  const card = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <View style={{ gap: 12, opacity: 0.65 }}>
      {/* mood badge */}
      <View style={{ width: 140, height: 28, borderRadius: 999, backgroundColor: base }} />
      {/* saludo */}
      <View style={{ gap: 6 }}>
        <View style={{ width: "80%", height: 22, borderRadius: 8, backgroundColor: base }} />
        <View style={{ width: "55%", height: 22, borderRadius: 8, backgroundColor: base }} />
      </View>
      {/* adherencia card */}
      <View style={{ borderRadius: 18, borderWidth: 1, borderColor: border, backgroundColor: card, padding: 16, gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: 80, height: 10, borderRadius: 5, backgroundColor: base }} />
          <View style={{ width: 44, height: 20, borderRadius: 5, backgroundColor: base }} />
        </View>
        <View style={{ width: 160, height: 12, borderRadius: 5, backgroundColor: base }} />
        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: base }} />
          ))}
        </View>
      </View>
      {/* stats grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, minWidth: 72, borderRadius: 14, borderWidth: 1, borderColor: border, backgroundColor: card, padding: 12, alignItems: "center", gap: 5 }}>
            <View style={{ width: 40, height: 16, borderRadius: 5, backgroundColor: base }} />
            <View style={{ width: 50, height: 9, borderRadius: 5, backgroundColor: base }} />
          </View>
        ))}
      </View>
      {/* grupos musculares */}
      <View style={{ borderRadius: 18, borderWidth: 1, borderColor: border, backgroundColor: card, padding: 16, gap: 10 }}>
        <View style={{ width: 140, height: 10, borderRadius: 5, backgroundColor: base }} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 100, height: 12, borderRadius: 5, backgroundColor: base }} />
            <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: base }} />
            <View style={{ width: 40, height: 11, borderRadius: 5, backgroundColor: base }} />
          </View>
        ))}
      </View>
      {/* puntos */}
      {[0, 1].map((i) => (
        <View key={i} style={{ borderRadius: 14, borderWidth: 1, borderColor: border, backgroundColor: card, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: base }} />
          <View style={{ flex: 1, gap: 5 }}>
            <View style={{ height: 13, borderRadius: 5, backgroundColor: base }} />
            <View style={{ width: "70%", height: 13, borderRadius: 5, backgroundColor: base }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── AnalisisSemanalModal ──────────────────────────────────────────────────────

export type Props = {
  visible: boolean;
  onClose: () => void;
  onGoPremium?: () => void;
  semana?: string;
};

export default function AnalisisSemanalModal({ visible, onClose, onGoPremium, semana }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const t = isDark ? C.dark : C.light;

  const usuario = useUsuarioStore((s) => s.usuario);
  const locked = !(usuario?.planActual === "PREMIUM" && (usuario?.haPagado ?? false));

  const semanaKey = semana ?? getSemanaISO();
  const isHistorico = semanaKey !== getSemanaISO();

  const guardarSemanal = useAnalisisStore((s) => s.guardarSemanal);
  const historico = useAnalisisStore((s) => s.semanal[semanaKey]);

  const [data, setData] = useState<AnalisisSemanalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!visible) {
      hasLoaded.current = false;
      setData(null);
      setError(false);
      return;
    }

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();

    if (locked) return;

    // Histórico: cargar del store sin llamar a la API
    if (isHistorico) {
      if (historico) setData(historico);
      else setError(true);
      return;
    }

    if (hasLoaded.current) return;
    hasLoaded.current = true;

    (async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await obtenerAnalisisSemanal();
        if (result) {
          setData(result);
          guardarSemanal(semanaKey, result);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  if (!visible) return null;

  if (locked) {
    return (
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: t.bg,
            opacity: opacityAnim,
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.eyebrow, { color: t.textMuted }]}>RESUMEN DE LA SEMANA</Text>
            <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Debrief semanal</Text>
          </View>
          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: t.pill, borderColor: t.border }]}
            hitSlop={12}
          >
            <Text style={[styles.closeBtnText, { color: t.textSecondary }]}>✕</Text>
          </Pressable>
        </View>

        <Animated.View style={[styles.contentWrapper, { transform: [{ translateY: slideAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <AnalisisSemanalSkeleton isDark={isDark} />

            <LinearGradient
              colors={GRADIENT as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lockFrame}
            >
              <Pressable
                onPress={() => {
                  onClose();
                  onGoPremium?.();
                }}
                style={[
                  styles.lockCard,
                  {
                    backgroundColor: isDark ? "rgba(15,23,42,0.88)" : "rgba(240,253,250,0.95)",
                    borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(15,118,110,0.18)",
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Hazte Premium para ver el análisis semanal"
              >
                <View
                  style={[
                    styles.lockIconWrap,
                    {
                      backgroundColor: isDark ? "rgba(15,23,42,1)" : "#FFFFFF",
                      borderColor: isDark ? "rgba(148,163,184,0.50)" : "rgba(16,185,129,0.35)",
                    },
                  ]}
                >
                  <Lock size={18} color={isDark ? "#A7F3D0" : "#047857"} strokeWidth={2} />
                </View>
                <View style={styles.lockTextWrap}>
                  <Text style={[styles.lockTitle, { color: isDark ? "#F1F5F9" : "#065F46" }]}>
                    Debrief semanal Premium
                  </Text>
                  <Text style={[styles.lockDesc, { color: isDark ? "#9CA3AF" : "#047857" }]}>
                    Hazte Premium para acceder al análisis completo de tu semana con métricas y recomendaciones personalizadas.
                  </Text>
                </View>
                <Text style={[styles.lockMore, { color: isDark ? "#A7F3D0" : "#047857" }]}>
                  Ver más
                </Text>
              </Pressable>
            </LinearGradient>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    );
  }

  const mood = data?.mood ?? "SEMANA_SOLIDA";
  const moodCfg = MOOD_CONFIG[mood];
  const maxVol =
    data?.gruposMusculares.length
      ? Math.max(...data.gruposMusculares.map((g) => g.volumen), 1)
      : 1;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: t.bg,
          opacity: opacityAnim,
          paddingTop: insets.top + 8,
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.eyebrow, { color: t.textMuted }]}>
            RESUMEN DE LA SEMANA
          </Text>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            Debrief semanal
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          style={[styles.closeBtn, { backgroundColor: t.pill, borderColor: t.border }]}
          hitSlop={12}
        >
          <Text style={[styles.closeBtnText, { color: t.textSecondary }]}>✕</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[styles.contentWrapper, { transform: [{ translateY: slideAnim }] }]}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={isDark ? "#E2E8F0" : "#0F172A"} />
            <Text style={[styles.loadingText, { color: t.textSecondary }]}>
              Tu coach está revisando la semana...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={[styles.errorTitle, { color: t.textPrimary }]}>
              No disponible
            </Text>
            <Text style={[styles.errorText, { color: t.textSecondary }]}>
              El análisis semanal requiere Coach Premium activo.
            </Text>
            <Pressable
              onPress={onClose}
              style={[styles.ctaBtn, { borderColor: isDark ? "#22C55E" : "rgba(15,23,42,0.18)" }]}
            >
              <Text style={[styles.ctaBtnText, { color: t.textPrimary }]}>
                Entendido
              </Text>
            </Pressable>
          </View>
        ) : data ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Mood badge */}
            <View style={[styles.moodBadge, { backgroundColor: moodCfg.bg }]}>
              <Text style={[styles.moodLabel, { color: moodCfg.color }]}>
                {moodCfg.label.toUpperCase()}
              </Text>
            </View>

            {/* Saludo */}
            <Text style={[styles.saludo, { color: t.textPrimary }]}>
              {data.saludo}
            </Text>

            {/* Adherencia visual + días */}
            <View style={[styles.section, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={styles.adherenciaHeader}>
                <Text style={[styles.sectionLabel, { color: t.textMuted }]}>
                  ADHERENCIA
                </Text>
                <Text style={[styles.adherenciaPct, { color: moodCfg.color }]}>
                  {data.stats.adherencia}%
                </Text>
              </View>
              <Text style={[styles.adherenciaSub, { color: t.textSecondary }]}>
                {data.stats.diasCompletados} de {data.stats.diasPlanificados} días completados
              </Text>
              {data.diasSemana.length > 0 && (
                <DiasRow
                  dias={data.diasSemana}
                  accentColor={moodCfg.color}
                  isDark={isDark}
                />
              )}
            </View>

            {/* Stats globales */}
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: t.card, borderColor: t.border }]}>
                <Text style={[styles.statBoxValue, { color: t.textPrimary }]}>
                  {data.stats.ejerciciosTotales}
                </Text>
                <Text style={[styles.statBoxLabel, { color: t.textMuted }]}>SESIONES</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: t.card, borderColor: t.border }]}>
                <Text style={[styles.statBoxValue, { color: t.textPrimary }]}>
                  {fmtVol(data.stats.volumenTotal)}
                </Text>
                <Text style={[styles.statBoxLabel, { color: t.textMuted }]}>VOLUMEN</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: t.card, borderColor: t.border }]}>
                <Text style={[styles.statBoxValue, { color: t.textPrimary }]}>
                  {data.stats.caloriasTotal}
                </Text>
                <Text style={[styles.statBoxLabel, { color: t.textMuted }]}>KCAL</Text>
              </View>
              {data.stats.estresPromedio != null && (
                <View
                  style={[
                    styles.statBox,
                    { backgroundColor: t.card, borderColor: t.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.statBoxValue,
                      {
                        color:
                          data.stats.estresPromedio >= 8
                            ? "#F97316"
                            : data.stats.estresPromedio >= 6
                              ? "#F59E0B"
                              : "#22C55E",
                      },
                    ]}
                  >
                    {data.stats.estresPromedio}/10
                  </Text>
                  <Text style={[styles.statBoxLabel, { color: t.textMuted }]}>ESTRÉS</Text>
                </View>
              )}
            </View>

            {/* Grupos musculares */}
            {data.gruposMusculares.length > 0 && (
              <View style={[styles.section, { backgroundColor: t.card, borderColor: t.border }]}>
                <Text style={[styles.sectionLabel, { color: t.textMuted }]}>
                  GRUPOS MUSCULARES
                </Text>
                {data.gruposMusculares.map((g, i) => (
                  <GrupoBar
                    key={i}
                    grupo={g}
                    volumen={g.volumen}
                    maxVolumen={maxVol}
                    accentColor={moodCfg.color}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}

            {/* Análisis del coach */}
            <View style={[styles.section, { backgroundColor: t.card, borderColor: t.border }]}>
              <Text style={[styles.sectionLabel, { color: t.textMuted }]}>
                ANÁLISIS
              </Text>
              <Text style={[styles.resumenText, { color: t.textPrimary }]}>
                {data.resumen}
              </Text>
            </View>

            {/* Puntos destacados */}
            {data.puntos.length > 0 && (
              <View style={styles.puntosList}>
                {data.puntos.map((p, i) => (
                  <View
                    key={i}
                    style={[
                      styles.puntoCard,
                      { backgroundColor: t.card, borderColor: t.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.puntoIndex,
                        { backgroundColor: `${moodCfg.color}22` },
                      ]}
                    >
                      <Text style={[styles.puntoIndexText, { color: moodCfg.color }]}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text style={[styles.puntoText, { color: t.textPrimary }]}>
                      {p}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recomendación próxima semana */}
            <View
              style={[
                styles.recomendacionCard,
                {
                  backgroundColor: `${moodCfg.color}10`,
                  borderColor: `${moodCfg.color}30`,
                },
              ]}
            >
              <Text style={[styles.recomendacionLabel, { color: moodCfg.color }]}>
                PRÓXIMA SEMANA
              </Text>
              <Text style={[styles.recomendacionText, { color: t.textPrimary }]}>
                {data.recomendacion}
              </Text>
            </View>

            {/* CTA */}
            <Pressable
              onPress={onClose}
              style={[
                styles.ctaBtn,
                { borderColor: isDark ? "#22C55E" : "rgba(15,23,42,0.18)" },
              ]}
            >
              <Text style={[styles.ctaBtnText, { color: t.textPrimary }]}>
                A por la próxima semana
              </Text>
            </Pressable>
          </ScrollView>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
    elevation: 9998,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: { gap: 2 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  contentWrapper: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontWeight: "500",
  },
  scroll: { flex: 1 },
  scrollContent: { gap: 12, paddingBottom: 80 },
  moodBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  saludo: {
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 29,
    letterSpacing: -0.3,
  },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  adherenciaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adherenciaPct: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  adherenciaSub: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: -4,
  },
  diasRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  diaItem: {
    alignItems: "center",
    gap: 5,
  },
  diaDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  diaDotCheck: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "900",
  },
  diaDotLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statBox: {
    flex: 1,
    minWidth: 72,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statBoxValue: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  grupoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  grupoNombre: {
    fontSize: 12,
    fontWeight: "600",
    width: 100,
    flexShrink: 0,
  },
  grupoTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  grupoFill: {
    height: "100%",
    borderRadius: 3,
  },
  grupoVol: {
    fontSize: 11,
    fontWeight: "700",
    width: 48,
    textAlign: "right",
    flexShrink: 0,
  },
  resumenText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  puntosList: { gap: 8 },
  puntoCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  puntoIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  puntoIndexText: {
    fontSize: 12,
    fontWeight: "800",
  },
  puntoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  recomendacionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  recomendacionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  recomendacionText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
  },
  ctaBtn: {
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "#22C55E",
    marginTop: 4,
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  lockFrame: {
    borderRadius: 16,
    padding: 1.5,
    overflow: "hidden",
  },
  lockCard: {
    borderRadius: 15,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  lockIconWrap: {
    height: 36,
    width: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    flexShrink: 0,
  },
  lockTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  lockTitle: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 17,
  },
  lockDesc: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  lockMore: {
    marginLeft: 10,
    fontSize: 11,
    fontWeight: "800",
  },
});
