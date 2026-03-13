// File: src/shared/components/ejercicio/CoachFeedbackModal.tsx
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, Platform, TouchableOpacity, Pressable, StyleSheet, Switch } from "react-native";
import { X, Loader2, Sparkles } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import type { CoachResponse, CoachSuggestion } from "@/features/api/coach.api";

const tokens = {
  color: {
    frameGradient: ["#00E85A", "#A855F7"] as string[],
    ctaBg: "#22C55E",
    ctaText: "#FFFFFF",
    checkBg: "rgba(34,197,94,0.90)",
  },
  radius: { lg: 18, md: 12, sm: 6, full: 999 },
  spacing: { xs: 2, sm: 6, md: 12, lg: 16 },
} as const;

const categoriaLabel: Record<CoachSuggestion["categoria"], string> = {
  carga: "Carga", volumen: "Volumen", tecnica: "Técnica", estres: "Estrés",
  progresion: "Progresión", consistencia: "Consistencia", riesgo: "Riesgo", general: "General",
};

const categoriaColor: Record<CoachSuggestion["categoria"], string> = {
  carga: "#38BDF8", volumen: "#A855F7", tecnica: "#22C55E", estres: "#F97316",
  progresion: "#3B82F6", consistencia: "#0EA5E9", riesgo: "#EF4444", general: "#6B7280",
};

const formatNumber = (val: number | null | undefined, suffix = "") => {
  if (val == null) return "--";
  return `${Number(val).toFixed(1)}${suffix}`;
};

type Props = {
  visible: boolean;
  loading: boolean;
  coach: CoachResponse | null;
  onClose: () => void;
  onGoPremium?: () => void;
  autoDisabled?: boolean;
  onToggleAutoDisabled?: (next: boolean) => void;
};

export default function CoachFeedbackModal({
  visible, loading, coach, onClose, onGoPremium, autoDisabled, onToggleAutoDisabled,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const wasVisible = useRef(false);

  const snapPoints = useMemo(() => ["50%", "85%"], []);
  const topInset = Math.max(insets.top, 12);

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

  // El toggle muestra "Mostrar al entrar" cuando autoDisabled=false (es decir, SÍ se muestra)
  // y "No mostrar" cuando autoDisabled=true
  const toggleActivo = !autoDisabled; // true = se muestra al entrar

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
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-2 mb-4">
        <View className="flex-row items-center gap-3">
          <View style={[styles.headerIcon, { backgroundColor: isDark ? "rgba(34,197,94,0.12)" : "rgba(22,163,74,0.08)" }]}>
            <Sparkles size={16} color={isDark ? "#BBF7D0" : "#16A34A"} strokeWidth={2.5} />
          </View>
          <View>
            <Text className={isDark ? "text-white font-bold text-base" : "text-neutral-900 font-bold text-base"}>
              Coach Premium
            </Text>
            <Text style={{ fontSize: 10, color: textSecondary }}>Feedback personalizado</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Toggle elegante — solo visible para usuarios premium */}
          {typeof autoDisabled === "boolean" && (
            <Pressable
              onPress={() => onToggleAutoDisabled?.(!autoDisabled)}
              style={[
                styles.togglePill,
                {
                  backgroundColor: toggleActivo
                    ? isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.10)"
                    : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                  borderColor: toggleActivo
                    ? "rgba(34,197,94,0.35)"
                    : isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
                },
              ]}
            >
              {/* Dot indicador */}
              <View
                style={[
                  styles.toggleDot,
                  {
                    backgroundColor: toggleActivo ? "#22C55E" : isDark ? "#475569" : "#CBD5E1",
                  },
                ]}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: toggleActivo
                    ? "#22C55E"
                    : isDark ? "#64748B" : "#94A3B8",
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
            className={"p-2 rounded-full " + (isDark ? "bg-white/10" : "bg-neutral-200")}
          >
            <X size={20} color={isDark ? "#e5e7eb" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 180,
        }}
      >
        {loading ? (
          <View className="items-center justify-center py-10">
            <Loader2 size={28} color={textPrimary} />
            <Text style={{ marginTop: 12, color: textSecondary, fontSize: 12 }}>Analizando sesión...</Text>
          </View>
        ) : esPremium ? (
          <ContenidoPremium
            coach={coach}
            isDark={isDark}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
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

// ── Sub-componentes ──────────────────────────────────────────────────────────

function ContenidoPremium({
  coach, isDark, textPrimary, textSecondary,
}: any) {
  const data = coach?.data;
  const sugerencias = data?.sugerencias ?? [];

  return (
    <View className="flex-col gap-4">
      <View className="flex-row gap-3">
        <Metric label="Estrés" value={formatNumber(data?.estresPromedio, "/10")} isDark={isDark} />
        <Metric label="Volumen" value={formatNumber(data?.volumenPromedio)} isDark={isDark} />
        <Metric label="Carga" value={formatNumber(data?.cargaPromedio, " kg")} isDark={isDark} />
      </View>

      {sugerencias.map((sug: any, idx: number) => (
        <View
          key={idx}
          style={[styles.card, {
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
          }]}
        >
          <View className="flex-row justify-between items-start mb-2 gap-2">
            <Text style={{ color: textPrimary, fontWeight: "700", fontSize: 14, flex: 1 }}>{sug.titulo}</Text>
            <View style={[styles.badge, { borderColor: `${categoriaColor[sug.categoria as keyof typeof categoriaColor]}55` }]}>
              <Text style={{ color: categoriaColor[sug.categoria as keyof typeof categoriaColor], fontSize: 9, fontWeight: "700" }}>
                {categoriaLabel[sug.categoria as keyof typeof categoriaLabel]}
              </Text>
            </View>
          </View>
          <Text style={{ color: textSecondary, fontSize: 12, lineHeight: 18 }}>{sug.mensaje}</Text>
        </View>
      ))}
    </View>
  );
}

function Metric({ label, value, isDark }: any) {
  return (
    <View style={[styles.metric, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }]}>
      <Text style={{ fontSize: 9, color: isDark ? "#64748B" : "#6B7280", marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: "800", color: isDark ? "#F1F5F9" : "#0F172A" }}>{value}</Text>
    </View>
  );
}

function ContenidoUpsell({ primeraSugerencia, isDark, textPrimary, textSecondary, textMuted, onGoPremium }: any) {
  return (
    <View className="gap-4">
      <LinearGradient
        colors={tokens.color.frameGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.upsellFrame}
      >
        <View style={[styles.upsellCard, { backgroundColor: isDark ? "#0b1220" : "#ffffff" }]}>
          <Text style={{ color: textPrimary, fontWeight: "800", fontSize: 15, marginBottom: 4 }}>
            {primeraSugerencia?.titulo ?? "Coach Premium"}
          </Text>
          <Text style={{ color: textSecondary, fontSize: 13 }}>
            {primeraSugerencia?.mensaje ?? "Análisis inteligente de tu progreso."}
          </Text>
        </View>
      </LinearGradient>
      <Text style={{ color: textMuted, fontSize: 11, textAlign: "center", paddingHorizontal: 10 }}>
        El Coach analiza volumen, carga y estrés para darte recomendaciones precisas.
      </Text>
      <TouchableOpacity onPress={onGoPremium} activeOpacity={0.8} style={styles.ctaButton}>
        <Text style={styles.ctaText}>Ver beneficios de Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  modalZIndex: {
    zIndex: 1000,
    ...(Platform.OS === "android" ? { elevation: 1000 } : null),
  },
  headerIcon: {
    width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center",
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
    flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(148,163,184,0.1)",
  },
  card: {
    padding: 16, borderRadius: 16, borderWidth: 1,
  },
  badge: {
    borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  upsellFrame: {
    padding: 1.5, borderRadius: 16,
  },
  upsellCard: {
    padding: 16, borderRadius: 14.5,
  },
  ctaButton: {
    backgroundColor: tokens.color.ctaBg, paddingVertical: 14, borderRadius: 99, alignItems: "center",
  },
  ctaText: {
    color: "#FFF", fontWeight: "800", fontSize: 14,
  },
});