// src/shared/components/ejercicio/CoachFeedbackModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { X, Loader2, Sparkles } from "lucide-react-native";

import type {
  CoachResponse,
  CoachSuggestion,
} from "@/features/api/coach.api";

type Props = {
  visible: boolean;
  loading: boolean;
  coach: CoachResponse | null;
  onClose: () => void;
  onGoPremium?: () => void;
};

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
  carga: "#38bdf8",
  volumen: "#a855f7",
  tecnica: "#22c55e",
  estres: "#f97316",
  progresion: "#3b82f6",
  consistencia: "#0ea5e9",
  riesgo: "#ef4444",
  general: "#6b7280",
};

const formatNumber = (val: number | null | undefined, suffix = "") => {
  if (val == null) return "--";
  return `${Number(val).toFixed(1)}${suffix}`;
};

const CoachFeedbackModal: React.FC<Props> = ({
  visible,
  loading,
  coach,
  onClose,
  onGoPremium,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const marcoGradient = [
    "rgb(0,255,64)",
    "rgb(94,230,157)",
    "rgb(178,0,255)",
  ];

  const cardBgDark = "rgba(20, 28, 44, 0.9)";
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  const esPremium = coach?.ok === true;
  const esUpsell = coach && coach.ok === false;
  const primeraSugerencia = coach?.data?.sugerencias?.[0];

  const renderContenidoPremium = () => {
    const hasSessions =
      (coach?.data?.ultimasSesiones?.length ?? 0) > 0;
    const hasSuggestions =
      (coach?.data?.sugerencias?.length ?? 0) > 0;
    const hasMetrics =
      coach &&
      (coach.data.estresPromedio != null ||
        coach.data.volumenPromedio != null ||
        coach.data.cargaPromedio != null);

    // 💡 Estado "sin datos suficientes" (404 o todavía muy pocas sesiones)
    if (!coach || (!hasSessions && !hasSuggestions && !hasMetrics)) {
      return (
        <View className="items-center py-7 px-2">
          <Text
            className="text-sm font-semibold text-center mb-1"
            style={{ color: isDark ? textPrimaryDark : "#111827" }}
          >
            Aún no hay análisis para este ejercicio
          </Text>
          <Text
            className="text-[11px] text-center leading-4 max-w-xs"
            style={{ color: isDark ? textSecondaryDark : "#6b7280" }}
          >
            Guarda un par de sesiones de este ejercicio y el Coach
            empezará a darte feedback sobre carga, estrés y progresión.
          </Text>
        </View>
      );
    }

    const { data } = coach;

    return (
      <>
        {/* Métricas */}
        <View className="flex-row gap-3 mb-3">
          <View
            className="flex-1 rounded-xl px-3 py-2"
            style={{
              backgroundColor: isDark
                ? "rgba(15,23,42,0.9)"
                : "rgba(248,250,252,1)",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(148,163,184,0.4)"
                : "rgba(226,232,240,1)",
            }}
          >
            <Text
              className="text-[11px] mb-1"
              style={{
                color: isDark ? textSecondaryDark : "#6b7280",
              }}
            >
              Estrés promedio
            </Text>
            <Text
              className="text-lg font-semibold"
              style={{
                color: isDark ? textPrimaryDark : "#0f172a",
              }}
            >
              {formatNumber(data.estresPromedio, "/10")}
            </Text>
          </View>

          <View
            className="flex-1 rounded-xl px-3 py-2"
            style={{
              backgroundColor: isDark
                ? "rgba(15,23,42,0.9)"
                : "rgba(248,250,252,1)",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(148,163,184,0.4)"
                : "rgba(226,232,240,1)",
            }}
          >
            <Text
              className="text-[11px] mb-1"
              style={{
                color: isDark ? textSecondaryDark : "#6b7280",
              }}
            >
              Volumen medio
            </Text>
            <Text
              className="text-lg font-semibold"
              style={{
                color: isDark ? textPrimaryDark : "#0f172a",
              }}
            >
              {formatNumber(data.volumenPromedio)}
            </Text>
          </View>

          <View
            className="flex-1 rounded-xl px-3 py-2"
            style={{
              backgroundColor: isDark
                ? "rgba(15,23,42,0.9)"
                : "rgba(248,250,252,1)",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(148,163,184,0.4)"
                : "rgba(226,232,240,1)",
            }}
          >
            <Text
              className="text-[11px] mb-1"
              style={{
                color: isDark ? textSecondaryDark : "#6b7280",
              }}
            >
              Carga media
            </Text>
            <Text
              className="text-lg font-semibold"
              style={{
                color: isDark ? textPrimaryDark : "#0f172a",
              }}
            >
              {formatNumber(data.cargaPromedio, " kg")}
            </Text>
          </View>
        </View>

        {/* Sugerencias */}
        <ScrollView
          style={{ maxHeight: 260 }}
          showsVerticalScrollIndicator={false}
        >
          {data.sugerencias?.map((sug, idx) => (
            <View
              key={`${sug.categoria}-${idx}`}
              className="mb-3 rounded-xl p-3"
              style={{
                backgroundColor: isDark
                  ? "rgba(15,23,42,0.9)"
                  : "rgba(248,250,252,1)",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(148,163,184,0.5)"
                  : "rgba(226,232,240,1)",
              }}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <Text
                  className="text-sm font-semibold flex-1 mr-2"
                  style={{
                    color: isDark ? textPrimaryDark : "#111827",
                  }}
                >
                  {sug.titulo}
                </Text>

                <View
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    backgroundColor: `${categoriaColor[sug.categoria]}22`,
                    borderWidth: 1,
                    borderColor: `${categoriaColor[sug.categoria]}55`,
                  }}
                >
                  <Text
                    className="text-[10px] font-semibold"
                    style={{ color: categoriaColor[sug.categoria] }}
                  >
                    {categoriaLabel[sug.categoria]}
                  </Text>
                </View>
              </View>

              <Text
                className="text-[12px] leading-4"
                style={{
                  color: isDark ? textSecondaryDark : "#4b5563",
                }}
              >
                {sug.mensaje}
              </Text>
            </View>
          ))}

          {(!data.sugerencias || data.sugerencias.length === 0) && (
            <Text
              className="text-xs"
              style={{
                color: isDark ? textSecondaryDark : "#6b7280",
              }}
            >
              No hay sugerencias específicas todavía, pero seguiremos
              analizando tus próximas sesiones.
            </Text>
          )}
        </ScrollView>
      </>
    );
  };

  const renderContenidoUpsell = () => {
    const titulo = primeraSugerencia?.titulo ?? "Activa Coach Premium";
    const mensaje =
      primeraSugerencia?.mensaje ??
      "Desbloquea el análisis avanzado de tus últimas sesiones, estrés y carga de entrenamiento.";

    return (
      <View className="py-3">
        <View
          className="rounded-xl px-3 py-3 mb-3"
          style={{
            backgroundColor: isDark
              ? "rgba(15,23,42,0.9)"
              : "rgba(248,250,252,1)",
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(148,163,184,0.5)"
              : "rgba(226,232,240,1)",
          }}
        >
          <Text
            className="text-[13px] font-semibold mb-1.5"
            style={{
              color: isDark ? textPrimaryDark : "#111827",
            }}
          >
            {titulo}
          </Text>
          <Text
            className="text-[12px] leading-4"
            style={{
              color: isDark ? textSecondaryDark : "#4b5563",
            }}
          >
            {mensaje}
          </Text>
        </View>

        <Text
          className="text-[11px] mb-3"
          style={{
            color: isDark ? textSecondaryDark : "#6b7280",
          }}
        >
          Coach Premium analiza tus últimas sesiones (volumen, carga,
          estrés y progresión) para darte recomendaciones como un
          entrenador personal de verdad.
        </Text>

        <TouchableOpacity
          onPress={onGoPremium}
          activeOpacity={0.9}
          style={{
            backgroundColor: "#22c55e",
            borderRadius: 999,
            paddingVertical: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-white font-semibold text-xs">
            Ver beneficios de Premium
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* Evitar cerrar al tocar dentro de la card */}
        <Pressable
          onPress={() => {}}
          style={{ width: "100%", maxWidth: 460 }}
        >
          <LinearGradient
            colors={marcoGradient as any}
            className="rounded-2xl p-[1px]"
            style={{ borderRadius: 18, overflow: "hidden" }}
          >
            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: isDark ? cardBgDark : "#ffffff",
                borderWidth: 1,
                borderColor: isDark
                  ? cardBorderDark
                  : "rgba(0,0,0,0.06)",
                borderRadius: 16,
              }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isDark
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(22,163,74,0.1)",
                    }}
                  >
                    <Sparkles
                      size={16}
                      color={isDark ? "#bbf7d0" : "#16a34a"}
                    />
                  </View>
                  <View>
                    <Text
                      className="text-sm font-semibold"
                      style={{
                        color: isDark ? textPrimaryDark : "#0f172a",
                      }}
                    >
                      Coach Premium
                    </Text>
                    <Text
                      className="text-[11px] mt-[2px]"
                      style={{
                        color: isDark ? textSecondaryDark : "#6b7280",
                      }}
                    >
                      Feedback personalizado para este ejercicio.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <X
                    size={20}
                    color={isDark ? "#e5e7eb" : "#374151"}
                  />
                </TouchableOpacity>
              </View>

              {/* Estado loading */}
              {loading && (
                <View className="items-center justify-center py-6">
                  <Loader2
                    size={24}
                    color={isDark ? "#e5e7eb" : "#111827"}
                  />
                  <Text
                    className="text-xs mt-3"
                    style={{
                      color: isDark ? textSecondaryDark : "#6b7280",
                    }}
                  >
                    Analizando tus últimas sesiones...
                  </Text>
                </View>
              )}

              {!loading && esPremium && renderContenidoPremium()}

              {!loading && esUpsell && renderContenidoUpsell()}
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CoachFeedbackModal;
