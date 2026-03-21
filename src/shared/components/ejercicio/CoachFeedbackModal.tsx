// File: src/shared/components/ejercicio/CoachFeedbackModal.tsx
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, Platform, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { X, Loader2, Sparkles, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import type { CoachResponse, CoachSuggestion } from "@/features/api/coach.api";
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

  const snapPoints = useMemo(() => ["50%", "85%"], []);
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
            <Sparkles
              size={16}
              color={isDark ? "#BBF7D0" : "#16A34A"}
              strokeWidth={2.5}
            />
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
  const tendencia = data?.tendenciaVolumen ?? "SIN_DATOS";
  const grupoEstancado = data?.grupoEstancado ?? false;
  const programacion = data?.programacion ?? null;

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Metric
          label="Estrés"
          value={formatNumber(data?.estresPromedio, "/10")}
          isDark={isDark}
        />
        <MetricConTendencia
          label="Volumen"
          value={formatNumber(data?.volumenPromedio)}
          tendencia={tendencia}
          isDark={isDark}
        />
        <Metric
          label="Carga"
          value={
            data?.cargaPromedio == null
              ? "--"
              : medidaPeso === "KG"
                ? `${Number(data.cargaPromedio).toFixed(1)} kg`
                : kgToLb(Number(data.cargaPromedio))
          }
          isDark={isDark}
        />
      </View>

      {grupoEstancado && (
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
            Este grupo muscular está estancado según tu seguimiento semanal
          </Text>
        </View>
      )}

      {programacion?.seriesSugeridas && (
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
          <Text
            style={{
              color: isDark ? "#BFDBFE" : "#3B82F6",
              fontSize: 12,
            }}
          >
            {programacion.seriesSugeridas} series ×{" "}
            {programacion.repeticionesSugeridas} reps
            {programacion.pesoSugerido != null
              ? ` · ${medidaPeso === "KG"
                ? `${Number(programacion.pesoSugerido).toFixed(1)} kg`
                : kgToLb(Number(programacion.pesoSugerido))
              }`
              : ""}
          </Text>
        </View>
      )}

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

// ── MetricConTendencia ────────────────────────────────────────────────────────

function MetricConTendencia({ label, value, tendencia, isDark }: any) {
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
      <Text
        style={{
          fontSize: 9,
          color: isDark ? "#64748B" : "#6B7280",
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "800",
          color: isDark ? "#F1F5F9" : "#0F172A",
        }}
      >
        {value}
      </Text>
      {tendencia !== "SIN_DATOS" && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            marginTop: 3,
          }}
        >
          <IconTendencia size={10} color={colorTendencia} strokeWidth={2.5} />
          <Text
            style={{
              fontSize: 9,
              color: colorTendencia,
              fontWeight: "600",
            }}
          >
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

function Metric({ label, value, isDark }: any) {
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
      <Text
        style={{
          fontSize: 9,
          color: isDark ? "#64748B" : "#6B7280",
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "800",
          color: isDark ? "#F1F5F9" : "#0F172A",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// ── SugerenciaCard ────────────────────────────────────────────────────────────

function SugerenciaCard({ sug, isDark, textPrimary, textSecondary }: any) {
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
          gap: 8,
        }}
      >
        <Text
          style={{
            color: textPrimary,
            fontWeight: "700",
            fontSize: 14,
            flex: 1,
          }}
        >
          {sug.titulo}
        </Text>
        <View
          style={[
            styles.badge,
            {
              borderColor: `${categoriaColor[sug.categoria as keyof typeof categoriaColor]
                }55`,
            },
          ]}
        >
          <Text
            style={{
              color: categoriaColor[sug.categoria as keyof typeof categoriaColor],
              fontSize: 9,
              fontWeight: "700",
            }}
          >
            {categoriaLabel[sug.categoria as keyof typeof categoriaLabel]}
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
        El Coach analiza volumen, carga y estrés para darte recomendaciones
        precisas.
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
  metric: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
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