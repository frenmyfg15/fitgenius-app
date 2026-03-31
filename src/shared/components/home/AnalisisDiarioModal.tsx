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
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { obtenerAnalisisDiario } from "@/features/api/coach.api";
import type { AnalisisDiarioData, MoodDiario } from "@/features/api/coach.api";

// ── Tokens ─────────────────────────────────────────────────────────────────────

const C = {
  dark: {
    bg: "#080D17",
    card: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.08)",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "rgba(255,255,255,0.45)",
    divider: "rgba(255,255,255,0.08)",
    pill: "rgba(255,255,255,0.07)",
  },
  light: {
    bg: "#F8FAFC",
    card: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.07)",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "rgba(15,23,42,0.45)",
    divider: "rgba(0,0,0,0.07)",
    pill: "rgba(0,0,0,0.04)",
  },
} as const;

// ── Mood config ────────────────────────────────────────────────────────────────

const MOOD_CONFIG: Record<
  MoodDiario,
  { label: string; color: string; bg: string; symbol: string }
> = {
  FUEGO: {
    label: "Sesión de fuego",
    color: "#F97316",
    bg: "rgba(249,115,22,0.14)",
    symbol: "◆",
  },
  SOLIDO: {
    label: "Sesión sólida",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.14)",
    symbol: "◆",
  },
  RECUPERA: {
    label: "A recuperar",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.14)",
    symbol: "◆",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtVol(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)} t`;
  return `${v} kg`;
}

// ── StatPill ──────────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  accent,
  isDark,
}: {
  label: string;
  value: string;
  accent?: string;
  isDark: boolean;
}) {
  const t = isDark ? C.dark : C.light;
  return (
    <View style={[styles.statPill, { backgroundColor: t.pill, borderColor: t.border }]}>
      <Text style={[styles.statPillValue, { color: accent ?? t.textPrimary }]}>
        {value}
      </Text>
      <Text style={[styles.statPillLabel, { color: t.textMuted }]}>{label}</Text>
    </View>
  );
}

// ── PuntoCard ─────────────────────────────────────────────────────────────────

function PuntoCard({
  punto,
  index,
  isDark,
}: {
  punto: string;
  index: number;
  isDark: boolean;
}) {
  const t = isDark ? C.dark : C.light;
  return (
    <View style={[styles.puntoCard, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={[styles.puntoIndex, { backgroundColor: "rgba(100,116,139,0.18)" }]}>
        <Text style={[styles.puntoIndexText, { color: t.textSecondary }]}>
          {index + 1}
        </Text>
      </View>
      <Text style={[styles.puntoText, { color: t.textPrimary }]}>{punto}</Text>
    </View>
  );
}

// ── AnalisisDiarioModal ───────────────────────────────────────────────────────

export type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AnalisisDiarioModal({ visible, onClose }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const t = isDark ? C.dark : C.light;

  const [data, setData] = useState<AnalisisDiarioData | null>(null);
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
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();

    if (hasLoaded.current) return;
    hasLoaded.current = true;

    (async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await obtenerAnalisisDiario();
        if (result) {
          setData(result);
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

  const mood = data?.mood ?? "SOLIDO";
  const moodCfg = MOOD_CONFIG[mood];

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
            RESUMEN DEL DÍA
          </Text>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            Tu coach habla
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
        style={[
          styles.contentWrapper,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={isDark ? "#E2E8F0" : "#0F172A"}
            />
            <Text style={[styles.loadingText, { color: t.textSecondary }]}>
              Tu coach está analizando el día...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorTitle, { color: t.textPrimary }]}>
              No disponible
            </Text>
            <Text style={[styles.errorText, { color: t.textSecondary }]}>
              El análisis del día no está disponible ahora mismo. Activa Coach Premium para acceder a esta funcionalidad.
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
              <Text style={[styles.moodSymbol, { color: moodCfg.color }]}>
                {moodCfg.symbol}
              </Text>
              <Text style={[styles.moodLabel, { color: moodCfg.color }]}>
                {moodCfg.label.toUpperCase()}
              </Text>
            </View>

            {/* Saludo */}
            <Text style={[styles.saludo, { color: t.textPrimary }]}>
              {data.saludo}
            </Text>

            {/* Resumen del coach */}
            <View
              style={[
                styles.resumenCard,
                { backgroundColor: t.card, borderColor: t.border },
              ]}
            >
              <Text style={[styles.resumenLabel, { color: t.textMuted }]}>
                ANÁLISIS
              </Text>
              <Text style={[styles.resumenText, { color: t.textPrimary }]}>
                {data.resumen}
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatPill
                label="Ejercicios"
                value={String(data.stats.ejerciciosCompletados)}
                accent={moodCfg.color}
                isDark={isDark}
              />
              <StatPill
                label="Volumen"
                value={fmtVol(data.stats.volumenTotal)}
                isDark={isDark}
              />
              <StatPill
                label="Calorías"
                value={`${data.stats.caloriasQuemadas} kcal`}
                isDark={isDark}
              />
              {data.stats.estresPromedio != null && (
                <StatPill
                  label="Estrés"
                  value={`${data.stats.estresPromedio}/10`}
                  accent={
                    data.stats.estresPromedio >= 8
                      ? "#F97316"
                      : data.stats.estresPromedio >= 6
                        ? "#F59E0B"
                        : "#22C55E"
                  }
                  isDark={isDark}
                />
              )}
            </View>

            {/* Puntos destacados */}
            {data.puntos.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: t.textMuted }]}>
                  OBSERVACIONES
                </Text>
                {data.puntos.map((p, i) => (
                  <PuntoCard key={i} punto={p} index={i} isDark={isDark} />
                ))}
              </View>
            )}

            {/* Recomendación */}
            <View
              style={[
                styles.recomendacionCard,
                { backgroundColor: `${moodCfg.color}12`, borderColor: `${moodCfg.color}30` },
              ]}
            >
              <Text style={[styles.recomendacionLabel, { color: moodCfg.color }]}>
                PRÓXIMA SESIÓN
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
                Gracias, coach
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
    zIndex: 9999,
    elevation: 9999,
    paddingHorizontal: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    gap: 2,
  },
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
  contentWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 8,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 80,
  },
  moodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  moodSymbol: {
    fontSize: 10,
    fontWeight: "900",
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  saludo: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  resumenCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  resumenLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  resumenText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 72,
    flex: 1,
  },
  statPillValue: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  statPillLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
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
});
