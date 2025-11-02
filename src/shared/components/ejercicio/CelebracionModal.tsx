import React, { useEffect, useState, memo } from "react";
import { View, Text, Image, useWindowDimensions } from "react-native";
import { useColorScheme } from "nativewind";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";

/* Assets locales (ajusta rutas si difieren en tu proyecto) */
const iconKcal = require("../../../../assets/fit/ejercicio/calorias.png");
const iconExp = require("../../../../assets/fit/ejercicio/experiencia.png");
const confettiAnim = require("../../../../assets/lootie/feliticitaciones.json");

type Props = {
  visible: boolean;
  experiencia: number;
  calorias: number;
  dwellMs?: number;
  onFinish?: () => void;
};

/* Tarjeta animada: entra → espera → sale hacia ARRIBA */
const AnimatedCard = memo(function AnimatedCard({
  icon,
  text,
  bgStyle,
  screenHeight,
  dwellMs,
  onFinish,
}: {
  icon: any;
  text: string;
  bgStyle: any;
  screenHeight: number;
  dwellMs: number;
  onFinish: () => void;
}) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    const translateY = -screenHeight * (1 - progress.value);
    return { transform: [{ translateY }], opacity: opacity.value };
  });

  useEffect(() => {
    progress.value = 0;
    opacity.value = 0;
    progress.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }, () => {
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 260, easing: Easing.in(Easing.cubic) });
        progress.value = withTiming(
          0,
          { duration: 560, easing: Easing.in(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(onFinish)();
          }
        );
      }, dwellMs);
    });
  }, [dwellMs, onFinish, opacity, progress]);

  return (
    <Animated.View style={[{ alignItems: "center", justifyContent: "center" }, style]}>
      <View
        className="rounded-2xl px-6 py-3 flex-row items-center gap-3"
        style={bgStyle}
      >
        <Image source={icon} accessibilityIgnoresInvertColors style={{ width: 60, height: 60 }} />
        <Text className="font-black" style={{ fontSize: 24, color: bgStyle._textColor }}>
          {text}
        </Text>
      </View>
    </Animated.View>
  );
});

export default function CelebracionModal({
  visible,
  experiencia,
  calorias,
  dwellMs = 900,
  onFinish,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { height: screenHeight } = useWindowDimensions();
  const [phase, setPhase] = useState<"idle" | "kcal" | "exp" | "done">("idle");

  // Controla que el Lottie solo se ejecute UNA VEZ por apertura
  const [confettiPlayed, setConfettiPlayed] = useState(false);

  useEffect(() => {
    if (visible) {
      setPhase("kcal");
      setConfettiPlayed(false); // resetea para una nueva apertura del modal
    } else {
      setPhase("idle");
    }
  }, [visible]);

  if (!visible) return null;

  const cardBaseStyle = {
    borderWidth: 1,
    borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    backgroundColor: isDark ? "rgba(20,20,20,0.80)" : "rgba(255,255,255,0.90)",
    _textColor: isDark ? "#ffffff" : "#111111",
  } as const;

  return (
    <View
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 50,
        alignItems: "center",
        justifyContent: "center",
      }}
      pointerEvents="box-none"
      accessibilityLabel="Celebración de sesión completada"
    >
      {/* Confeti: autoPlay una sola vez, sin loop. Se desmonta al terminar */}
      {!confettiPlayed && (
        <LottieView
          source={confettiAnim}
          autoPlay
          loop={false}
          onAnimationFinish={() => setConfettiPlayed(true)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}

      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {phase === "kcal" && (
          <AnimatedCard
            icon={iconKcal}
            text={`+ ${Number(calorias).toFixed(0)} kcal`}
            bgStyle={cardBaseStyle}
            screenHeight={screenHeight}
            dwellMs={dwellMs}
            onFinish={() => setPhase("exp")}
          />
        )}

        {phase === "exp" && (
          <AnimatedCard
            icon={iconExp}
            text={`+ ${Number(experiencia).toFixed(0)} EXP`}
            bgStyle={cardBaseStyle}
            screenHeight={screenHeight}
            dwellMs={dwellMs}
            onFinish={() => {
              setPhase("done");
              onFinish?.();
            }}
          />
        )}
      </View>
    </View>
  );
}
