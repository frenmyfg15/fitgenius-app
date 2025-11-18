// src/features/premium/CandadoPremium.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, {
  Path,
  Rect,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { BlurView } from "expo-blur";

type Props = {
  size?: number;
  showTitle?: boolean;
  titleFontSize?: number;
  blurLevel?: "backdrop-blur-sm" | "backdrop-blur-md" | "backdrop-blur-xl";
  /** Opacidad del velo blanco (0 = sin velo, 1 = blanco sólido) */
  whiteOpacity?: number;
  position?: "center" | "bottom-right";
  isDark?: boolean;
};

export default function CandadoPremium({
  size = 40,
  showTitle = false,
  titleFontSize = 12,
  blurLevel = "backdrop-blur-xl",
  whiteOpacity = 0.35,
  position = "center",
  isDark,
}: Props) {
  const navigation = useNavigation<any>();

  const blurIntensity = useMemo(() => {
    switch (blurLevel) {
      case "backdrop-blur-sm":
        return 20;
      case "backdrop-blur-md":
        return 40;
      case "backdrop-blur-xl":
      default:
        return 80; // 👈 a tope para que se note
    }
  }, [blurLevel]);

  // clamp 0–1
  const alpha =
    whiteOpacity < 0 ? 0 : whiteOpacity > 1 ? 1 : whiteOpacity;

  const overlayWhite = `rgba(255,255,255,${alpha})`;

  const contentPosStyle =
    position === "center"
      ? {
          flex: 1,
          alignItems: "center" as const,
          justifyContent: "center" as const,
        }
      : {
          position: "absolute" as const,
          bottom: 8,
          right: 8,
          alignItems: "center" as const,
        };

  const handleGoToPayment = () => {
     navigation.navigate("Perfil", {
  screen: "PremiumPayment",
}); 
  };

  return (
    <Pressable
      onPress={handleGoToPayment}
      style={{
        flex: 1,
        backgroundColor: "transparent", // 👈 muy importante
      }}
    >
      {/* 1) BLUR REAL SOBRE TODO LO DEBAJO (contenido de la card) */}
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? "dark" : "light"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* 2) VELO BLANCO POR ENCIMA DEL BLUR */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: overlayWhite,
        }}
      />

      {/* 3) CANDADO + TEXTO */}
      <View style={contentPosStyle}>
        <Svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          stroke="url(#lockGradient)"
          strokeWidth={2.2}
          accessibilityRole="image"
        >
          <Defs>
            <SvgLinearGradient
              id="lockGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#00ff40" />
              <Stop offset="50%" stopColor="#5ee69d" />
              <Stop offset="100%" stopColor="#b200ff" />
            </SvgLinearGradient>
          </Defs>

          <Path
            d="M8 10V7a4 4 0 1 1 8 0v3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Rect x={5} y={10} width={14} height={10} rx={2} />
        </Svg>

        {showTitle && (
          <Text
            style={{
              marginTop: 4,
              fontSize: titleFontSize,
              fontWeight: "600",
              color: "#0f172a",
              opacity: 0.9,
            }}
          >
            Premium
          </Text>
        )}
      </View>
    </Pressable>
  );
}
