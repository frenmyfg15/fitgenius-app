// src/features/cuenta/components/Perfil.tsx
import React, { useMemo } from "react";
import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

export default function Perfil() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario } = useUsuarioStore();
  if (!usuario) return null;

  const iniciales = useMemo(() => {
    const n = (usuario.nombre?.[0] ?? "").toUpperCase();
    const a = (usuario.apellido?.[0] ?? "").toUpperCase();
    return (n + a) || "U";
  }, [usuario?.nombre, usuario?.apellido]);

  // 🎛️ Paleta “glass” para dark
  const frameGradient = isDark
    ? ["#111a2b", "#0b1220", "#111a2b"] // marco sutil en dark
    : ["#39ff14", "#14ff80", "#22c55e"];

  const cardBgDark = "rgba(20, 28, 44, 0.6)"; // un poco más claro que #0b1220
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  return (
    <View style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>
      {/* Marco degradado */}
      <LinearGradient
        colors={frameGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 1 }}
      >
        {/* Card */}
        <View
          style={{
            borderRadius: 15,
            backgroundColor: isDark ? cardBgDark : "#ffffff",
            borderWidth: 1,
            borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
            padding: 20,
            // Nota: solo RN web respeta backdropFilter
            backdropFilter: "blur(12px)" as any,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", columnGap: 16 }}>
            {/* Avatar con aro degradado */}
            <View style={{ position: "relative" }}>
              <LinearGradient
                colors={
                  isDark
                    ? ["#0e1729", "#0b1220", "#0e1729"]
                    : ["#39ff14", "#14ff80", "#22c55e"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 999, padding: 2 }}
              >
                <View
                  style={{
                    height: 80,
                    width: 80,
                    borderRadius: 999,
                    overflow: "hidden",
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#f5f5f5",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: isDark ? 1 : 0,
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "transparent",
                  }}
                >
                  {usuario.imagenPerfil ? (
                    <Image
                      source={{ uri: usuario.imagenPerfil }}
                      resizeMode="cover"
                      style={{ width: "100%", height: "100%" }}
                      accessibilityLabel={`Foto de ${usuario.nombre ?? "usuario"}`}
                    />
                  ) : (
                    <Text
                      accessibilityLabel="Avatar por defecto"
                      style={{ fontSize: 22, fontWeight: "800", color: isDark ? "#cbd5e1" : "#6b7280" }}
                    >
                      {iniciales}
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Info principal */}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 14, fontWeight: "700", color: isDark ? textPrimaryDark : "#0f172a" }}
              >
                {usuario.nombre} {usuario.apellido}
              </Text>
              <Text
                numberOfLines={1}
                style={{ marginTop: 2, fontSize: 12, color: isDark ? textSecondaryDark : "#475569" }}
              >
                {usuario.correo}
              </Text>

              {/* Chips métricas rápidas */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                <Chip>{usuario.edad} años</Chip>
                <Chip>
                  {usuario.peso} {usuario.medidaPeso}
                </Chip>
                <Chip>
                  {usuario.altura} {usuario.medidaAltura}
                </Chip>
              </View>

              {/* Objetivo y contexto */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                <ChipSoft>
                  Meta: {usuario.pesoObjetivo} {usuario.medidaPeso}
                </ChipSoft>
                {"lugarEntrenamiento" in usuario && (
                  <ChipSoft>Lugar: {(usuario as any).lugarEntrenamiento}</ChipSoft>
                )}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ---------- Subcomponentes ---------- */

function Chip({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: isDark ? "rgba(148,163,184,0.16)" : "#f3f4f6", // glassy en dark
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
      }}
    >
      <Text style={{ fontSize: 11, color: isDark ? "#e5e7eb" : "#374151" }}>
        {children}
      </Text>
    </View>
  );
}

function ChipSoft({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "#ffffff",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
      }}
    >
      <Text style={{ fontSize: 11, color: isDark ? "#e5e7eb" : "#0f172a" }}>
        {children}
      </Text>
    </View>
  );
}
