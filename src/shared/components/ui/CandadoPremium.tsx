// src/features/premium/CandadoPremium.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { BlurView } from "expo-blur";
import Svg, { Path, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import PremiumUpsell from "./PremiumUpsell";

type Props = {
  size?: number | string;
  className?: string;
  showTitle?: boolean;
  titleFontSize?: number | string;
  blurLevel?: "backdrop-blur-sm" | "backdrop-blur-md" | "backdrop-blur-xl";
  opacityLevel?: "bg-white/5" | "bg-white/10" | "bg-white/20";
  position?: "center" | "bottom-right";
  isDark?: boolean; // opcional para matchear tu theme
};

export default function CandadoPremium({
  size = 64,
  className = "",
  showTitle = false,
  titleFontSize = "1rem",
  blurLevel = "backdrop-blur-md",
  opacityLevel = "bg-white/10",
  position = "center",
  isDark,
}: Props) {
  const [openUpsell, setOpenUpsell] = useState(false);

  // Intensidad del blur
  const blurIntensity = useMemo(() => {
    switch (blurLevel) {
      case "backdrop-blur-sm":
        return 12;
      case "backdrop-blur-xl":
        return 44;
      case "backdrop-blur-md":
      default:
        return 24;
    }
  }, [blurLevel]);

  // Opacidad del velo (en lugar de clases, lo hacemos determinista y compatible RN puro)
  const veilBg = useMemo(() => {
    // cristal un poco + claro que #0b1220 en dark; blanco suave en light
    const darkVeil = "rgba(20, 28, 44, 0.35)"; // ~ #0b1220 aclarado + alpha
    const lightVeil = "rgba(255,255,255,0.10)";
    const custom = {
      "bg-white/5": isDark ? "rgba(20, 28, 44, 0.25)" : "rgba(255,255,255,0.05)",
      "bg-white/10": isDark ? darkVeil : lightVeil,
      "bg-white/20": isDark ? "rgba(20, 28, 44, 0.45)" : "rgba(255,255,255,0.20)",
    } as const;
    return custom[opacityLevel] ?? (isDark ? darkVeil : lightVeil);
  }, [opacityLevel, isDark]);

  // Posición del contenido (candado + texto)
  const contentPosStyle =
    position === "center"
      ? { flex: 1, alignItems: "center" as const, justifyContent: "center" as const }
      : { position: "absolute" as const, bottom: 12, right: 12, alignItems: "center" as const };

  // Tints por plataforma/tema
  const iosTint = isDark ? "systemThinMaterialDark" : "systemThinMaterialLight";

  return (
    <>
      {/* Overlay clicable, con clipping para que el blur respete los bordes */}
      <Pressable
        onPress={() => setOpenUpsell(true)}
        style={{
          position: "absolute",
          inset: 0 as any,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >


        {/* 2) Velo semitransparente por encima del blur (para ese look de cristal) */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            inset: 0 as any,
            backgroundColor: veilBg,
            borderWidth: Platform.OS === "android" ? 0 : 1,
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          }}
        />

        {/* 3) Contenido: candado + (opcional) texto */}
        <View style={contentPosStyle}>
          <Svg
            viewBox="0 0 24 24"
            width={Number(size)}
            height={Number(size)}
            fill="none"
            stroke="url(#lockGradient)"
            strokeWidth={2.2}
            accessibilityRole="image"
            className={className}
          >
            <Defs>
              <SvgLinearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#00ff40" />
                <Stop offset="50%" stopColor="#5ee69d" />
                <Stop offset="100%" stopColor="#b200ff" />
              </SvgLinearGradient>
            </Defs>

            <Path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" />
            <Rect x="5" y="10" width="14" height="10" rx="2" />
          </Svg>

          {showTitle && (
            <Text
              style={{
                marginTop: 6,
                fontSize: typeof titleFontSize === "number" ? titleFontSize : undefined,
                fontWeight: "600",
                color: isDark ? "#e5e7eb" : "#0f172a",
                opacity: 0.9,
              }}
            >
              Premium
            </Text>
          )}
        </View>
      </Pressable>

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
