// src/features/fit/components/PesoObjetivoProgreso.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

type PesoObjetivoProgresoProps = {
  peso?: number | string | null;
  objetivo?: number | string | null;
};

export default function PesoObjetivoProgreso({
  peso,
  objetivo,
}: PesoObjetivoProgresoProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { usuario } = useUsuarioStore();
  const navigation = useNavigation<any>();

  const pesoNum = Number(peso ?? 0);
  const objetivoNum = Number(objetivo ?? 0);

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const isPremiumActive = planActual === "PREMIUM" && haPagado;
  const locked = !isPremiumActive;

  // 🎨 Paleta visual (igual que PesoIdeal / TMB)
  const marcoGradient = [
    "rgb(0,255,64)",
    "rgb(94,230,157)",
    "rgb(178,0,255)",
  ];
  const cardBg = isDark ? "rgba(20, 28, 44, 0.6)" : "#fff";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";
  const ringBase = isDark ? "rgba(148,163,184,0.22)" : "#e5e7eb";

  const handleGoPremium = () => {
    navigation.navigate("Perfil", {
      screen: "PremiumPayment",
    });
  };

  // 🔒 Basado en plan actual: mismo patrón que PesoIdeal/TMB
  if (locked) {
    return (
      <View className="w-full max-w-[520px]">
        <LinearGradient
          colors={marcoGradient as any}
          className="rounded-2xl p-[1px]"
          style={{ borderRadius: 15, overflow: "hidden" }}
        >
          <View
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: cardBg,
              borderWidth: 0,
              padding: 20,
            }}
          >
            {/* Skeleton estático */}
            <PesoObjetivoSkeleton isDark={isDark} />

            {/* Bloque Premium clicable debajo del skeleton */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleGoPremium}
              style={{
                marginTop: 16,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(255,255,255,0.16)"
                  : "rgba(15,118,110,0.18)",
                backgroundColor: isDark
                  ? "rgba(15,23,42,0.8)"
                  : "rgba(240,253,250,0.95)",
              }}
            >
              <View
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                  backgroundColor: isDark ? "rgba(15,23,42,1)" : "#ffffff",
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(148,163,184,0.5)"
                    : "rgba(16,185,129,0.35)",
                }}
              >
                <Lock
                  size={18}
                  color={isDark ? "#a7f3d0" : "#047857"}
                  strokeWidth={2}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: isDark ? "#e5e7eb" : "#065f46",
                  }}
                >
                  Progreso hacia tu peso objetivo Premium
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    color: isDark ? "#9ca3af" : "#047857",
                  }}
                >
                  Hazte Premium para seguir tu avance hacia el peso objetivo con
                  anillos y métricas detalladas.
                </Text>
              </View>

              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  fontWeight: "600",
                  color: isDark ? "#a7f3d0" : "#047857",
                }}
              >
                Ver más
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // 🧮 Lógica cuando está desbloqueado
  const rumbo: "bajar" | "subir" | "igual" = useMemo(() => {
    if (!pesoNum || !objetivoNum) return "igual";
    return objetivoNum === pesoNum
      ? "igual"
      : objetivoNum < pesoNum
      ? "bajar"
      : "subir";
  }, [objetivoNum, pesoNum]);

  // % de progreso hacia el objetivo (mantenemos tu lógica original)
  const pct = useMemo(() => {
    if (!pesoNum || !objetivoNum) return 0;
    if (rumbo === "igual") return 1;
    const total = Math.abs(objetivoNum - pesoNum);
    if (total === 0) return 1;
    return objetivoNum > pesoNum
      ? Math.min(pesoNum / objetivoNum, 1)
      : Math.min(objetivoNum / pesoNum, 1);
  }, [rumbo, objetivoNum, pesoNum]);

  const deltaKg = objetivoNum - pesoNum;
  const alcanzado = rumbo === "igual";
  const dash = C * (1 - pct);

  const estado = alcanzado
    ? "¡Has alcanzado tu objetivo!"
    : deltaKg < 0
    ? `Te sobran ${Math.abs(deltaKg).toFixed(1)} kg`
    : `Te faltan ${Math.abs(deltaKg).toFixed(1)} kg`;

  // Si no hay datos válidos, no mostramos nada
  if (!pesoNum || !objetivoNum) return null;

  return (
    <View className="w-full max-w-[520px]">
      <LinearGradient
        colors={marcoGradient as any}
        className="rounded-2xl p-[1px]"
        style={{ borderRadius: 15, overflow: "hidden" }}
      >
        <View
          style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: cardBg,
            borderWidth: 0,
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: textPrimary,
              }}
            >
              Progreso hacia tu peso objetivo
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: isDark
                  ? "rgba(148,163,184,0.16)"
                  : "#f5f5f5",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: textSecondary,
                }}
              >
                {alcanzado
                  ? "Objetivo logrado"
                  : objetivoNum < pesoNum
                  ? "Objetivo: bajar"
                  : "Objetivo: subir"}
              </Text>
            </View>
          </View>

          {/* Métricas rápidas (chips) */}
          <View className="mt-3 grid grid-cols-3 gap-3">
            <Chip
              label="Actual"
              value={`${round1(pesoNum)} kg`}
              isDark={isDark}
            />
            <Chip
              label="Objetivo"
              value={`${round1(objetivoNum)} kg`}
              isDark={isDark}
            />
            <Chip
              label="Diferencia"
              value={`${
                objetivoNum - pesoNum > 0 ? "+" : ""
              }${round1(objetivoNum - pesoNum)} kg`}
              isDark={isDark}
            />
          </View>

          {/* Anillo + porcentaje */}
          <View className="mt-5 items-center justify-center">
            <View className="relative w-44 h-44">
              <Svg
                className="absolute inset-0 -rotate-90"
                width="100%"
                height="100%"
                viewBox="0 0 180 180"
                accessibilityRole="image"
                accessibilityLabel="Progreso hacia el peso objetivo"
              >
                <Defs>
                  <SvgLinearGradient id="kGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="rgb(0,255,64)" />
                    <Stop offset="50%" stopColor="rgb(94,230,157)" />
                    <Stop offset="100%" stopColor="rgb(178,0,255)" />
                  </SvgLinearGradient>
                  <SvgLinearGradient
                    id="kGradMuted"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <Stop offset="0%" stopColor="rgba(0,255,64,0.5)" />
                    <Stop offset="50%" stopColor="rgba(94,230,157,0.5)" />
                    <Stop
                      offset="100%"
                      stopColor="rgba(178,0,255,0.5)"
                    />
                  </SvgLinearGradient>
                </Defs>

                {/* Base */}
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={ringBase}
                  strokeWidth={12}
                  fill="transparent"
                />

                {/* Progreso */}
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={alcanzado ? "url(#kGrad)" : "url(#kGradMuted)"}
                  strokeWidth={12}
                  fill="transparent"
                  strokeDasharray={C}
                  strokeDashoffset={dash}
                  strokeLinecap="round"
                />
              </Svg>

              {/* Centro del anillo */}
              <View className="absolute inset-0 items-center justify-center">
                <View className="items-center">
                  <Text
                    style={{
                      fontSize: 11,
                      color: textSecondary,
                    }}
                  >
                    Progreso
                  </Text>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: textPrimary,
                      lineHeight: 26,
                    }}
                  >
                    {Math.round(pct * 100)}%
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: textSecondary,
                      marginTop: 2,
                      textAlign: "center",
                    }}
                  >
                    {estado}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Barra lineal de apoyo */}
          <View
            className="mt-4 h-2.5 w-full rounded-full overflow-hidden"
            style={{
              backgroundColor: isDark
                ? "rgba(148,163,184,0.18)"
                : "#e5e7eb",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(255,255,255,0.10)"
                : "#e5e7eb",
            }}
          >
            <LinearGradient
              colors={["#8bff62", "#39ff14", "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${pct * 100}%`, height: "100%" }}
            />
          </View>

          {/* Nota inferior */}
          <Text
            style={{
              marginTop: 12,
              fontSize: 12,
              color: textSecondary,
            }}
          >
            Mantén hábitos sostenibles: el progreso lento y constante suele ser
            más efectivo y fácil de mantener a largo plazo.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ---------- Skeleton estático (bajo candado) ---------- */
function PesoObjetivoSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(148,163,184,0.16)" : "#e5e7eb";
  const border = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";

  return (
    <View pointerEvents="none">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View
          style={{
            width: 180,
            height: 16,
            borderRadius: 6,
            backgroundColor: base,
          }}
        />
        <View
          style={{
            width: 90,
            height: 14,
            borderRadius: 6,
            backgroundColor: base,
          }}
        />
      </View>

      {/* Chips */}
      <View className="mt-3 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "#ffffff",
              padding: 12,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 70,
                height: 10,
                borderRadius: 6,
                backgroundColor: base,
              }}
            />
            <View
              style={{
                width: 90,
                height: 14,
                borderRadius: 6,
                backgroundColor: base,
              }}
            />
          </View>
        ))}
      </View>

      {/* Anillo */}
      <View className="mt-5 items-center justify-center">
        <View
          className="w-44 h-44 items-center justify-center rounded-full border-[12px]"
          style={{ borderColor: base }}
        >
          <View
            style={{
              width: 80,
              height: 12,
              borderRadius: 6,
              backgroundColor: base,
            }}
          />
          <View
            style={{
              marginTop: 8,
              width: 140,
              height: 10,
              borderRadius: 6,
              backgroundColor: base,
            }}
          />
        </View>
      </View>

      {/* Barra + texto */}
      <View style={{ marginTop: 16 }}>
        <View
          style={{
            height: 10,
            width: "100%",
            borderRadius: 999,
            backgroundColor: base,
          }}
        />
        <View
          style={{
            marginTop: 12,
            height: 12,
            width: "100%",
            borderRadius: 6,
            backgroundColor: base,
          }}
        />
      </View>
    </View>
  );
}

/* ---------- Chip reutilizable (igual patrón que PesoIdeal/TMB) ---------- */
function Chip({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
        backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "#ffffff",
        padding: 12,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          color: isDark ? "#94a3b8" : "#6b7280",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          marginTop: 2,
          fontSize: 14,
          fontWeight: "700",
          color: isDark ? "#e5e7eb" : "#0f172a",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/* ---------- Utils ---------- */
function round1(n: number) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}
