// src/features/cuenta/components/PremiumMiniCTACard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, Sparkles } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import PremiumUpsell from "./PremiumUpsell";

export default function PremiumMiniCTACard() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [openUpsell, setOpenUpsell] = useState(false);
  const [loading, setLoading] = useState(false);

  // Gradiente del marco (más suave en dark)
  const frameGradient = isDark
    ? ["#111a2b", "#0b1220", "#111a2b"]
    : ["#39ff14", "#14ff80", "#22c55e"];

  // Efecto “cristal” en dark
  const cardBgDark = "rgba(20, 28, 44, 0.6)"; // un poco más claro que #0b1220
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const chipBgDark = "rgba(30, 40, 60, 0.6)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  return (
    <>
      <LinearGradient
        colors={frameGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: "100%",
          alignSelf: "center",
          borderRadius: 16,
          padding: 1,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 12 },
          elevation: 8,
          maxWidth: 760,
        }}
      >
        <View
          style={{
            borderRadius: 15,
            backgroundColor: isDark ? cardBgDark : "rgba(255,255,255,0.9)",
            borderWidth: 1,
            borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backdropFilter: "blur(12px)" as any, // solo efecto visual en web
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {/* Izquierda: icono + textos */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
              <View
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 10,
                  backgroundColor: isDark ? chipBgDark : "#111827",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Crown size={16} color="#fff" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: isDark ? textPrimaryDark : "#111827",
                  }}
                >
                  Hazte Premium
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    color: isDark ? textSecondaryDark : "#475569",
                  }}
                >
                  IA avanzada y todo el catálogo
                </Text>
              </View>
            </View>

            {/* Precio compacto */}
            <View style={{ alignItems: "flex-end", marginRight: 4 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: isDark ? textPrimaryDark : "#111827",
                  lineHeight: 18,
                }}
              >
                €4,99
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: isDark ? textSecondaryDark : "#64748b",
                  lineHeight: 14,
                }}
              >
                /mes
              </Text>
            </View>

            {/* CTA */}
            {isDark ? (
              <View
                style={{
                  borderRadius: 12,
                  padding: 1,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      setOpenUpsell(true);
                    }, 350);
                  }}
                  activeOpacity={0.9}
                  style={{
                    borderRadius: 11,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={textPrimaryDark} />
                  ) : (
                    <Sparkles size={16} color={textPrimaryDark} />
                  )}
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: textPrimaryDark,
                    }}
                  >
                    {loading ? "Abriendo…" : "Obtener"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <LinearGradient
                colors={["#39ff14", "#14ff80", "#22c55e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 12, padding: 1 }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      setOpenUpsell(true);
                    }, 350);
                  }}
                  activeOpacity={0.9}
                  style={{
                    borderRadius: 11,
                    backgroundColor: "#ffffff",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#111827" />
                  ) : (
                    <Sparkles size={16} color="#111827" />
                  )}
                  <Text
                    style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}
                  >
                    {loading ? "Abriendo…" : "Obtener"}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Modal Premium */}
      <PremiumUpsell
        isOpen={openUpsell}
        onClose={() => setOpenUpsell(false)}
        mode="modal"
        price="€4,99/mes"
        billingHint="Cancela cuando quieras"
        ctaLabel="Obtener Premium"
        benefits={[
          { title: "Estadísticas completas de calorías" },
          { title: "Ejercicios premium desbloqueados" },
          { title: "IA avanzada para tus rutinas" },
          { title: "Historial y progreso detallado" },
        ]}
      />
    </>
  );
}
