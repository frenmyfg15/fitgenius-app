// File: src/shared/components/ejercicio/CoachFeedbackModal.tsx
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, Platform, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import {
  X,
  Loader2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Target,
  Zap,
  Flame,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import type {
  CoachResponse,
  CoachSuggestion,
  ObjetivoSesion,
} from "@/features/api/coach.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";

// ── Tokens ────────────────────────────────────────────────────────────────────

const tokens = {
  color: {
    frameGradient: ["#00E85A", "#A855F7"] as string[],
    ctaBg: "#22C55E",
    ctaText: "#FFFFFF",
    subiendo: "#22C55E",
    bajando: "#EF4444",
    estable: "#94A3B8",
    estancado: "#F97316",
    progresar: "#22C55E",
    mantener: "#3B82F6",
    descargar: "#F97316",
  },
  radius: { lg: 18, md: 12, sm: 6, full: 999 },
  spacing: { xs: 2, sm: 6, md: 12, lg: 16 },
} as const;

const categoriaLabel: Record<CoachSuggestion["categoria"], string> = {
  carga: "Carga",
  volumen: "Volumen",
  tecnica: "Técnica",
  estres: "Estrés",
  progresion: "Progresión",
  consistencia: "Consistencia",
  riesgo: "Riesgo",
  general: "General",
  rir: "RIR",
  calentamiento: "Calentamiento",
  objetivo: "Objetivo",
  periodizacion: "Periodización",
  frecuencia: "Frecuencia",
};

const categoriaColor: Record<CoachSuggestion["categoria"], string> = {
  carga: "#38BDF8",
  volumen: "#A855F7",
  tecnica: "#22C55E",
  estres: "#F97316",
  progresion: "#3B82F6",
  consistencia: "#0EA5E9",
  riesgo: "#EF4444",
  general: "#6B7280",
  rir: "#10B981",
  calentamiento: "#F59E0B",
  objetivo: "#6366F1",
  periodizacion: "#8B5CF6",
  frecuencia: "#14B8A6",
};

const formatNumber = (val: number | null | undefined, suffix = "") => {
  if (val == null) return "--";
  return `${Number(val).toFixed(1)}${suffix}`;
};

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  loading: boolean;
  coach: CoachResponse | null;
  onClose: () => void;
  onGoPremium?: () => void;
  autoDisabled?: boolean;
  onToggleAutoDisabled?: (next: boolean) => void;
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function CoachFeedbackModal({
  visible,
  loading,
  coach,
  onClose,
  onGoPremium,
  autoDisabled,
  onToggleAutoDisabled,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const usuario = useUsuarioStore((s) => s.usuario);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const wasVisible = useRef(false);

  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const topInset = Math.max(insets.top, 12);
  const medidaPeso = (usuario?.medidaPeso ?? "KG").toUpperCase();

  useEffect(() => {
    if (visible && !wasVisible.current) {
      bottomSheetModalRef.current?.present();
      wasVisible.current = true;
    }
    if (!visible && wasVisible.current) {
      bottomSheetModalRef.current?.dismiss();
      wasVisible.current = false;
    }
  }, [visible]);

  const handleClosePress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    []
  );

  const esPremium = coach?.ok === true;
  const esUpsell = coach?.ok === false;
  const primeraSugerencia = coach?.data?.sugerencias?.[0];

  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#64748B" : "#4B5563";
  const textMuted = isDark ? "#6B7280" : "#6B7280";
  const toggleActivo = !autoDisabled;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableOverDrag={false}
      topInset={topInset}
      handleIndicatorStyle={{ backgroundColor: isDark ? "#64748b" : "#94a3b8" }}
      backgroundStyle={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}
      style={styles.modalZIndex}
      containerStyle={styles.modalZIndex}
    >
      <View className="flex-row justify-between items-center px-6 pt-2 mb-4">
        <View className="flex-row items-center gap-3">
          <View
            style={[
              styles.headerIcon,
              {
                backgroundColor: isDark
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(22,163,74,0.08)",
              },
            ]}
          >
            <Sparkles size={16} color={isDark ? "#BBF7D0" : "#16A34A"} strokeWidth={2.5} />
          </View>
          <View>
            <Text
              className={
                isDark
                  ? "text-white font-bold text-base"
                  : "text-neutral-900 font-bold text-base"
              }
            >
              Coach Premium
            </Text>
            <Text style={{ fontSize: 10, color: textSecondary }}>
              Feedback personalizado
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {typeof autoDisabled === "boolean" && (
            <Pressable
              onPress={() => onToggleAutoDisabled?.(!autoDisabled)}
              style={[
                styles.togglePill,
                {
                  backgroundColor: toggleActivo
                    ? isDark
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(34,197,94,0.10)"
                    : isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.05)",
                  borderColor: toggleActivo
                    ? "rgba(34,197,94,0.35)"
                    : isDark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(0,0,0,0.08)",
                },
              ]}
            >
              <View
                style={[
                  styles.toggleDot,
                  {
                    backgroundColor: toggleActivo
                      ? "#22C55E"
                      : isDark
                        ? "#475569"
                        : "#CBD5E1",
                  },
                ]}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: toggleActivo
                    ? "#22C55E"
                    : isDark
                      ? "#64748B"
                      : "#94A3B8",
                  letterSpacing: 0.2,
                }}
              >
                {toggleActivo ? "Mostrar al entrar" : "No mostrar"}
              </Text>
            </Pressable>
          )}

          <TouchableOpacity
            onPress={handleClosePress}
            activeOpacity={0.85}
            className={
              "p-2 rounded-full " + (isDark ? "bg-white/10" : "bg-neutral-200")
            }
          >
            <X size={20} color={isDark ? "#e5e7eb" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 180 }}
      >
        {loading ? (
          <View className="items-center justify-center py-10">
            <Loader2 size={28} color={textPrimary} />
            <Text style={{ marginTop: 12, color: textSecondary, fontSize: 12 }}>
              Analizando sesión...
            </Text>
          </View>
        ) : esPremium ? (
          <ContenidoPremium
            coach={coach}
            isDark={isDark}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            medidaPeso={medidaPeso}
          />
        ) : esUpsell ? (
          <ContenidoUpsell
            primeraSugerencia={primeraSugerencia}
            isDark={isDark}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            onGoPremium={onGoPremium}
          />
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

// ── ContenidoPremium ──────────────────────────────────────────────────────────

function ContenidoPremium({
  coach,
  isDark,
  textPrimary,
  textSecondary,
  medidaPeso,
}: any) {
  const data = coach?.data;
  const sugerencias = data?.sugerencias ?? [];
  const tendenciaVolumen = data?.tendenciaVolumen ?? "SIN_DATOS";
  const tendenciaCarga = data?.tendenciaCarga ?? "SIN_DATOS";
  const grupoEstancado = data?.grupoEstancado ?? false;
  const plateauEjercicio = data?.plateauEjercicio ?? false;
  const objetivoSesion: ObjetivoSesion | null = data?.objetivoSesion ?? null;
  const programacion = data?.programacion ?? null;
  const unRMEstimado: number | null = data?.unRMEstimado ?? null;
  const porcentajeUnRM: number | null = data?.porcentajeUnRM ?? null;
  const mood: string | undefined = data?.mood;
  const readinessScore: number | null = data?.readinessScore ?? null;

  const hayAlerta = grupoEstancado || plateauEjercicio;

  return (
    <View style={{ gap: 10 }}>
      {/* Mood + readiness */}
      {mood && (
        <MoodBanner
          mood={mood}
          readinessScore={readinessScore}
          isDark={isDark}
        />
      )}

      {/* Métricas: Estrés | Volumen (tendencia) | Carga (tendencia) */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Metric
          label="Estrés"
          value={formatNumber(data?.estresPromedio, "/10")}
          isDark={isDark}
        />
        <MetricConTendencia
          label="Volumen"
          value={formatNumber(data?.volumenPromedio)}
          tendencia={tendenciaVolumen}
          isDark={isDark}
        />
        <MetricConTendencia
          label="Carga"
          value={
            data?.cargaPromedio == null
              ? "--"
              : medidaPeso === "KG"
                ? `${Number(data.cargaPromedio).toFixed(1)} kg`
                : kgToLb(Number(data.cargaPromedio))
          }
          tendencia={tendenciaCarga}
          isDark={isDark}
        />
      </View>

      {/* 1RM estimado */}
      {unRMEstimado != null && (
        <View style={styles.rmRow}>
          <Text style={{ color: isDark ? "#64748B" : "#6B7280", fontSize: 11 }}>
            1RM estimado
          </Text>
          <Text style={{ color: isDark ? "#F1F5F9" : "#0F172A", fontSize: 11, fontWeight: "700" }}>
            {medidaPeso === "KG"
              ? `${unRMEstimado.toFixed(1)} kg`
              : kgToLb(unRMEstimado)}
          </Text>
          {porcentajeUnRM != null && (
            <Text style={{ color: isDark ? "#64748B" : "#6B7280", fontSize: 11 }}>
              · trabajas al{" "}
              <Text style={{ fontWeight: "700", color: isDark ? "#CBD5E1" : "#374151" }}>
                {porcentajeUnRM}%
              </Text>
            </Text>
          )}
        </View>
      )}

      {/* Objetivo de la sesión */}
      {objetivoSesion && (
        <ObjetivoSesionCard
          objetivo={objetivoSesion}
          isDark={isDark}
          medidaPeso={medidaPeso}
        />
      )}

      {/* Alerta: grupo o ejercicio estancado */}
      {hayAlerta && (
        <View
          style={[
            styles.alertaBanner,
            {
              backgroundColor: isDark
                ? "rgba(249,115,22,0.10)"
                : "rgba(249,115,22,0.08)",
              borderColor: "rgba(249,115,22,0.30)",
            },
          ]}
        >
          <AlertCircle size={14} color={tokens.color.estancado} strokeWidth={2} />
          <Text
            style={{
              color: tokens.color.estancado,
              fontSize: 12,
              fontWeight: "600",
              flex: 1,
            }}
          >
            {plateauEjercicio && grupoEstancado
              ? "Ejercicio y grupo muscular estancados — revisa las sugerencias de periodización"
              : plateauEjercicio
              ? "Este ejercicio lleva varias sesiones sin progresar en carga ni volumen"
              : "Este grupo muscular está estancado según tu seguimiento semanal"}
          </Text>
        </View>
      )}

      {/* Programación de rutina (solo si no hay objetivoSesion calculado) */}
      {!objetivoSesion && programacion?.seriesSugeridas && (
        <View
          style={[
            styles.programacionBanner,
            {
              backgroundColor: isDark
                ? "rgba(59,130,246,0.08)"
                : "rgba(59,130,246,0.06)",
              borderColor: "rgba(59,130,246,0.25)",
            },
          ]}
        >
          <Text
            style={{
              color: isDark ? "#93C5FD" : "#2563EB",
              fontSize: 11,
              fontWeight: "700",
              marginBottom: 2,
            }}
          >
            Programación de hoy
          </Text>
          <Text style={{ color: isDark ? "#BFDBFE" : "#3B82F6", fontSize: 12 }}>
            {programacion.seriesSugeridas} series ×{" "}
            {programacion.repeticionesSugeridas} reps
            {programacion.pesoSugerido != null
              ? ` · ${
                  medidaPeso === "KG"
                    ? `${Number(programacion.pesoSugerido).toFixed(1)} kg`
                    : kgToLb(Number(programacion.pesoSugerido))
                }`
              : ""}
          </Text>
        </View>
      )}

      {/* Sugerencias */}
      {sugerencias.map((sug: any, idx: number) => (
        <SugerenciaCard
          key={idx}
          sug={sug}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
        />
      ))}
    </View>
  );
}

// ── MoodBanner ────────────────────────────────────────────────────────────────

function MoodBanner({
  mood,
  readinessScore,
  isDark,
}: {
  mood: string;
  readinessScore: number | null;
  isDark: boolean;
}) {
  type MoodKey = "PROGRESAR" | "MANTENER" | "DESCARGAR";

  const moodConfig: Record<
    MoodKey,
    { label: string; color: string; Icon: any; bgDark: string; bgLight: string }
  > = {
    PROGRESAR: {
      label: "Día de progreso",
      color: "#22C55E",
      Icon: TrendingUp,
      bgDark: "rgba(34,197,94,0.10)",
      bgLight: "rgba(34,197,94,0.07)",
    },
    MANTENER: {
      label: "Sesión de consolidación",
      color: "#3B82F6",
      Icon: Minus,
      bgDark: "rgba(59,130,246,0.10)",
      bgLight: "rgba(59,130,246,0.07)",
    },
    DESCARGAR: {
      label: "Sesión de descarga",
      color: "#F97316",
      Icon: TrendingDown,
      bgDark: "rgba(249,115,22,0.10)",
      bgLight: "rgba(249,115,22,0.07)",
    },
  };

  const cfg = moodConfig[mood as MoodKey];
  if (!cfg) return null;

  const readinessColor =
    readinessScore == null
      ? "#6B7280"
      : readinessScore >= 80
      ? "#22C55E"
      : readinessScore >= 60
      ? "#F59E0B"
      : "#EF4444";

  return (
    <View
      style={[
        styles.moodBanner,
        {
          backgroundColor: isDark ? cfg.bgDark : cfg.bgLight,
          borderColor: `${cfg.color}30`,
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <cfg.Icon size={15} color={cfg.color} strokeWidth={2.5} />
        <Text style={{ color: cfg.color, fontWeight: "700", fontSize: 13 }}>
          {cfg.label}
        </Text>
      </View>
      {readinessScore != null && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Text style={{ color: isDark ? "#475569" : "#9CA3AF", fontSize: 10 }}>
            Disp.
          </Text>
          <Text
            style={{ color: readinessColor, fontWeight: "800", fontSize: 14 }}
          >
            {readinessScore}
          </Text>
          <Text style={{ color: isDark ? "#475569" : "#9CA3AF", fontSize: 10 }}>
            /100
          </Text>
        </View>
      )}
    </View>
  );
}

// ── ObjetivoSesionCard ────────────────────────────────────────────────────────

function ObjetivoSesionCard({
  objetivo,
  isDark,
  medidaPeso,
}: {
  objetivo: ObjetivoSesion;
  isDark: boolean;
  medidaPeso: string;
}) {
  const { series, repeticiones, pesoKg, volumenObjetivo, rir } = objetivo;

  const pesoStr =
    pesoKg != null
      ? medidaPeso === "KG"
        ? `${pesoKg} kg`
        : kgToLb(pesoKg)
      : null;

  const volStr =
    volumenObjetivo != null
      ? medidaPeso === "KG"
        ? `${volumenObjetivo} kg vol.`
        : `${kgToLb(volumenObjetivo)} vol.`
      : null;

  const rirLabel =
    rir <= 1
      ? "cerca del fallo"
      : rir === 2
      ? "2 reps en reserva"
      : rir === 3
      ? "3 reps en reserva"
      : `${rir} reps en reserva`;

  return (
    <View
      style={[
        styles.objetivoCard,
        {
          backgroundColor: isDark
            ? "rgba(99,102,241,0.07)"
            : "rgba(99,102,241,0.04)",
          borderColor: isDark
            ? "rgba(99,102,241,0.30)"
            : "rgba(99,102,241,0.20)",
        },
      ]}
    >
      <View style={styles.objetivoHeader}>
        <Text
          style={{
            color: isDark ? "#A5B4FC" : "#4338CA",
            fontWeight: "700",
            fontSize: 11,
            letterSpacing: 0.3,
            textTransform: "uppercase",
          }}
        >
          Objetivo de hoy
        </Text>
        <Target size={13} color={isDark ? "#818CF8" : "#6366F1"} strokeWidth={2} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 5 }}>
        <Text
          style={{
            color: isDark ? "#F1F5F9" : "#0F172A",
            fontWeight: "800",
            fontSize: 26,
            letterSpacing: -0.5,
          }}
        >
          {series}×{repeticiones}
        </Text>
        {pesoStr && (
          <Text
            style={{
              color: isDark ? "#94A3B8" : "#475569",
              fontWeight: "600",
              fontSize: 15,
            }}
          >
            @ {pesoStr}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
        {volStr && (
          <View style={[styles.chip, { backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.09)" }]}>
            <Text style={{ color: isDark ? "#A5B4FC" : "#4338CA", fontSize: 11, fontWeight: "600" }}>
              {volStr}
            </Text>
          </View>
        )}
        <View style={[styles.chip, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.09)" }]}>
          <Zap size={10} color={isDark ? "#34D399" : "#059669"} strokeWidth={2.5} />
          <Text style={{ color: isDark ? "#34D399" : "#059669", fontSize: 11, fontWeight: "600" }}>
            RIR {rir} · {rirLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── MetricConTendencia ────────────────────────────────────────────────────────

function MetricConTendencia({
  label,
  value,
  tendencia,
  isDark,
}: {
  label: string;
  value: string;
  tendencia: string;
  isDark: boolean;
}) {
  const colorTendencia =
    tendencia === "SUBIENDO"
      ? tokens.color.subiendo
      : tendencia === "BAJANDO"
      ? tokens.color.bajando
      : tokens.color.estable;

  const IconTendencia =
    tendencia === "SUBIENDO"
      ? TrendingUp
      : tendencia === "BAJANDO"
      ? TrendingDown
      : Minus;

  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
          flex: 1,
        },
      ]}
    >
      <Text style={{ fontSize: 9, color: isDark ? "#64748B" : "#6B7280", marginBottom: 2 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 15, fontWeight: "800", color: isDark ? "#F1F5F9" : "#0F172A" }}>
        {value}
      </Text>
      {tendencia !== "SIN_DATOS" && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 }}>
          <IconTendencia size={10} color={colorTendencia} strokeWidth={2.5} />
          <Text style={{ fontSize: 9, color: colorTendencia, fontWeight: "600" }}>
            {tendencia === "SUBIENDO"
              ? "Subiendo"
              : tendencia === "BAJANDO"
              ? "Bajando"
              : "Estable"}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Metric ────────────────────────────────────────────────────────────────────

function Metric({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
          flex: 1,
        },
      ]}
    >
      <Text style={{ fontSize: 9, color: isDark ? "#64748B" : "#6B7280", marginBottom: 2 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 15, fontWeight: "800", color: isDark ? "#F1F5F9" : "#0F172A" }}>
        {value}
      </Text>
    </View>
  );
}

// ── SugerenciaCard ────────────────────────────────────────────────────────────

function SugerenciaCard({
  sug,
  isDark,
  textPrimary,
  textSecondary,
}: {
  sug: CoachSuggestion;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
}) {
  const cat = sug.categoria as CoachSuggestion["categoria"];
  const color = categoriaColor[cat] ?? "#6B7280";
  const label = categoriaLabel[cat] ?? cat;

  // Icono especial para categorías nuevas
  const CatIcon =
    cat === "objetivo" ? Target
    : cat === "rir" || cat === "calentamiento" ? Zap
    : cat === "periodizacion" ? Flame
    : null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
          {CatIcon && (
            <CatIcon size={13} color={color} strokeWidth={2.5} />
          )}
          <Text style={{ color: textPrimary, fontWeight: "700", fontSize: 14, flex: 1 }}>
            {sug.titulo}
          </Text>
        </View>
        <View style={[styles.badge, { borderColor: `${color}55` }]}>
          <Text style={{ color, fontSize: 9, fontWeight: "700" }}>
            {label}
          </Text>
        </View>
      </View>
      <Text style={{ color: textSecondary, fontSize: 12, lineHeight: 18 }}>
        {sug.mensaje}
      </Text>
    </View>
  );
}

// ── ContenidoUpsell ───────────────────────────────────────────────────────────

function ContenidoUpsell({
  primeraSugerencia,
  isDark,
  textPrimary,
  textSecondary,
  textMuted,
  onGoPremium,
}: any) {
  return (
    <View style={{ gap: 16 }}>
      <LinearGradient
        colors={tokens.color.frameGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.upsellFrame}
      >
        <View
          style={[
            styles.upsellCard,
            { backgroundColor: isDark ? "#0b1220" : "#ffffff" },
          ]}
        >
          <Text
            style={{
              color: textPrimary,
              fontWeight: "800",
              fontSize: 15,
              marginBottom: 4,
            }}
          >
            {primeraSugerencia?.titulo ?? "Coach Premium"}
          </Text>
          <Text style={{ color: textSecondary, fontSize: 13 }}>
            {primeraSugerencia?.mensaje ??
              "Análisis inteligente de tu progreso."}
          </Text>
        </View>
      </LinearGradient>
      <Text
        style={{
          color: textMuted,
          fontSize: 11,
          textAlign: "center",
          paddingHorizontal: 10,
        }}
      >
        El Coach analiza volumen, carga, 1RM estimado y estrés para darte un objetivo concreto cada sesión.
      </Text>
      <TouchableOpacity
        onPress={onGoPremium}
        activeOpacity={0.8}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaText}>Ver beneficios de Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modalZIndex: {
    zIndex: 1000,
    ...(Platform.OS === "android" ? { elevation: 1000 } : null),
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  togglePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  toggleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moodBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  metric: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  rmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 4,
  },
  objetivoCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  objetivoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  programacionBanner: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  upsellFrame: {
    padding: 1.5,
    borderRadius: 16,
  },
  upsellCard: {
    padding: 16,
    borderRadius: 14.5,
  },
  ctaButton: {
    backgroundColor: tokens.color.ctaBg,
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
  },
});
