// src/features/cuenta/components/Experiencia.tsx
import React, { useMemo } from "react";
import { View, Text, Image, ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { CheckCircle2 } from "lucide-react-native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

// Asegúrate de tener estas imágenes en: src/assets/fit/cuenta/
type Nivel = { nombre: string; experiencia: number; icono: ImageSourcePropType };

const NIVELES: Nivel[] = [
  { nombre: "Bronce",  experiencia: 0,     icono: require("../../../../assets/fit/cuenta/bronce.png") },
  { nombre: "Plata",   experiencia: 500,   icono: require("../../../../assets/fit/cuenta/plata.png") },
  { nombre: "Oro",     experiencia: 1500,  icono: require("../../../../assets/fit/cuenta/oro.png") },
  { nombre: "Platino", experiencia: 3000,  icono: require("../../../../assets/fit/cuenta/platino.png") },
  { nombre: "Diamante",experiencia: 5000,  icono: require("../../../../assets/fit/cuenta/diamante.png") },
  { nombre: "Maestro", experiencia: 8000,  icono: require("../../../../assets/fit/cuenta/maestro.png") },
  { nombre: "Élite",   experiencia: 12000, icono: require("../../../../assets/fit/cuenta/elite.png") },
];

export default function Experiencia() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario } = useUsuarioStore();
  const experiencia = usuario?.experiencia ?? 0;

  // Cálculo robusto y memoizado
  const { nivelActual, siguienteNivel, pct } = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < NIVELES.length; i++) {
      if (experiencia >= NIVELES[i].experiencia) idx = i;
    }
    const actual = NIVELES[idx];
    const siguiente = NIVELES[idx + 1] ?? NIVELES[idx];
    const span = Math.max(1, siguiente.experiencia - actual.experiencia);
    const prog =
      actual.nombre === siguiente.nombre
        ? 1
        : (experiencia - actual.experiencia) / span;

    const clamped = Math.min(Math.max(prog, 0), 1);
    return {
      nivelActual: actual,
      siguienteNivel: siguiente,
      pct: Math.round(clamped * 100),
    };
  }, [experiencia]);

  const maxLevel = nivelActual.nombre === siguienteNivel.nombre;

  // 🎛️ Paleta glass para dark
  const frameGradient = isDark
    ? ["#111a2b", "#0b1220", "#111a2b"] // marco sutil
    : ["#39ff14", "#14ff80", "#22c55e"];

  const cardBgDark = "rgba(20, 28, 44, 0.6)";       // un poco más claro que #0b1220
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const chipBgDark = "rgba(30, 40, 60, 0.6)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";
  const trackBgDark = "rgba(148, 163, 184, 0.18)";  // barra base translúcida

  return (
    <View style={{ width: "100%", maxWidth: 600, alignSelf: "center" }}>
      {/* Card con borde degradado (más discreto en dark) */}
      <LinearGradient
        colors={frameGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 1 }}
      >
        <View
          style={{
            borderRadius: 15,
            backgroundColor: isDark ? cardBgDark : "rgba(255,255,255,0.9)", // glass en dark
            borderWidth: 1,
            borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            // Nota: solo RN web respeta backdropFilter
            backdropFilter: "blur(12px)" as any,
          }}
        >
          {/* Insignia del nivel */}
          <View style={{ position: "relative" }}>
            <LinearGradient
              colors={isDark ? ["#0e1729", "#0b1220", "#0e1729"] : ["#39ff14", "#14ff80", "#22c55e"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 12, padding: 2 }}
            >
              <View
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "transparent",
                }}
              >
                <Image
                  source={nivelActual.icono}
                  resizeMode="contain"
                  style={{ height: 72, width: 72 }}
                />
              </View>
            </LinearGradient>

            <View
              style={{
                position: "absolute",
                right: -6,
                bottom: -6,
                backgroundColor: isDark ? "rgba(20,28,44,0.75)" : "#fff",
                borderRadius: 999,
                paddingHorizontal: 6,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: isDark ? textPrimaryDark : "#0f172a",
                }}
              >
                {nivelActual.nombre}
              </Text>
            </View>
          </View>

          {/* Info y barra */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isDark ? textPrimaryDark : "#0f172a",
                }}
              >
                Progreso de experiencia
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: isDark ? "#cbd5e1" : "#334155",
                }}
              >
                {pct}%
              </Text>
            </View>

            {/* Barra de progreso con degradado y “dot” */}
            <View
              style={{
                marginTop: 8,
                height: 12,
                width: "100%",
                borderRadius: 999,
                overflow: "hidden",
                backgroundColor: isDark ? trackBgDark : "#e5e7eb",
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "transparent",
              }}
            >
              <View style={{ height: "100%", width: `${pct}%` }}>
                <LinearGradient
                  colors={["#8bff62", "#39ff14", "#a855f7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: "100%" }}
                />
                {/* Dot */}
                <View
                  style={{
                    position: "absolute",
                    right: -6,
                    top: "50%",
                    marginTop: -6,
                    height: 12,
                    width: 12,
                    borderRadius: 999,
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.15)",
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                  }}
                />
              </View>
            </View>

            {/* Texto auxiliar */}
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: isDark ? textSecondaryDark : "#475569",
              }}
            >
              {maxLevel ? (
                <Text style={{ color: isDark ? textPrimaryDark : "#0f172a", fontWeight: "600" }}>
                  Nivel máximo alcanzado{" "}
                  <CheckCircle2 size={14} color="#39ff14" />
                </Text>
              ) : (
                <>
                  {experiencia}
                  <Text style={{ color: isDark ? "#64748b" : "#94a3b8" }}> / </Text>
                  {siguienteNivel.experiencia} exp para{" "}
                  <Text style={{ color: isDark ? textPrimaryDark : "#0f172a", fontWeight: "600" }}>
                    {siguienteNivel.nombre}
                  </Text>
                </>
              )}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
