// src/features/fit/components/PesoIdeal.tsx
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

/** Geometría del anillo */
const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

type PesoIdealProps = {
  peso?: number | string | null;
  altura?: number | string | null;
  soloGrafica?: boolean
};

export default function PesoIdeal({ peso, altura, soloGrafica = false }: PesoIdealProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { usuario } = useUsuarioStore();
  const navigation = useNavigation<any>();

  // 🎨 Paleta visual
  const marcoGradient = [
    "rgb(0,255,64)",
    "rgb(94,230,157)",
    "rgb(178,0,255)",
  ];
  const cardBg = isDark ? "rgba(20, 28, 44, 0.6)" : "#fff";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";
  const ringBase = isDark ? "rgba(148,163,184,0.22)" : "#e5e7eb";
  const fineStroke = isDark ? "#000000" : "#111827";
  const fineOpacity = isDark ? 0.25 : 0.15;

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const isPremiumActive = planActual === "PREMIUM" && haPagado;
  const locked = !isPremiumActive;

  const handleGoPremium = () => {
    navigation.navigate("Perfil", {
      screen: "PremiumPayment",
    });
  };

  // Basado en plan actual
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
            {/* Skeleton estático (el mismo de antes) */}
            <PesoIdealSkeleton isDark={isDark} />

            {/* Bloque Premium clicable debajo del esqueleto */}
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
                  Peso ideal Premium
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    color: isDark ? "#9ca3af" : "#047857",
                  }}
                >
                  Hazte Premium para ver tu rango de peso ideal calculado a
                  partir de tu altura.
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

  const pesoNum = Number(peso ?? 0);
  const alturaNum = Number(altura ?? 0);

  if (pesoNum <= 0 || alturaNum <= 0) return null;

  const alturaM = alturaNum / 100;

  // Rango ideal por IMC (18.5 - 24.9)
  const minIdeal = 18.5 * alturaM * alturaM;
  const maxIdeal = 24.9 * alturaM * alturaM;

  // Escala visual
  const rangeMin = Math.max(0, minIdeal * 0.85);
  const rangeMax = maxIdeal * 1.15;
  const rangeSpan = Math.max(1, rangeMax - rangeMin);

  // Estado
  const { estado, isGradient } = useMemo(() => {
    if (pesoNum < minIdeal) return { estado: "por debajo", isGradient: false };
    if (pesoNum > maxIdeal) return { estado: "por encima", isGradient: false };
    return { estado: "en rango ideal", isGradient: true };
  }, [pesoNum, minIdeal, maxIdeal]);

  // Porcentajes
  const pStart = Math.max(0, Math.min(1, (minIdeal - rangeMin) / rangeSpan));
  const pEnd = Math.max(0, Math.min(1, (maxIdeal - rangeMin) / rangeSpan));
  const pCurr = Math.max(0, Math.min(1, (pesoNum - rangeMin) / rangeSpan));

  // Trazos
  const arcLen = C * (pEnd - pStart);
  const arcOffset = C * (1 - pEnd);

  // Marcador
  const angleDeg = pCurr * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;

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
                Peso ideal
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
                    fontWeight: "600",
                    color: isGradient ? textPrimary : textSecondary,
                  }}
                >
                  {estado}
                </Text>
              </View>
            </View>
            {!soloGrafica && <>

            {/* Métricas */}
            <View className="mt-3 grid grid-cols-3 gap-3">
              <Chip label="Peso" value={`${round1(pesoNum)} kg`} isDark={isDark} />
              <Chip
                label="Ideal min"
                value={`${round1(minIdeal)} kg`}
                isDark={isDark}
              />
              <Chip
                label="Ideal max"
                value={`${round1(maxIdeal)} kg`}
                isDark={isDark}
              />
            </View>
          </>
          }

          {/* Anillo */}
          <View className="mt-5 items-center justify-center">
            <View className="relative w-44 h-44">
              <Svg
                className="absolute inset-0 -rotate-90"
                width="100%"
                height="100%"
                viewBox="0 0 180 180"
              >
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={ringBase}
                  strokeWidth={12}
                  fill="transparent"
                />
                <Defs>
                  <SvgLinearGradient
                    id="neonLogoGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <Stop offset="0%" stopColor="rgb(0,255,64)" />
                    <Stop offset="50%" stopColor="rgb(94,230,157)" />
                    <Stop offset="100%" stopColor="rgb(178,0,255)" />
                  </SvgLinearGradient>
                </Defs>
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke="url(#neonLogoGradient)"
                  strokeWidth={12}
                  fill="transparent"
                  strokeDasharray={`${arcLen} ${C}`}
                  strokeDashoffset={arcOffset}
                  strokeLinecap="round"
                />
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={fineStroke}
                  strokeOpacity={fineOpacity}
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray={`${2} ${C}`}
                />
                {/* Marcador */}
                <Circle
                  cx={CX + (R + 6) * Math.cos(angleRad)}
                  cy={CY + (R + 6) * Math.sin(angleRad)}
                  r={5.5}
                  fill="#ffffff"
                  stroke={isDark ? "rgba(0,0,0,0.35)" : "#111827"}
                  strokeWidth={1}
                />
              </Svg>

              {/* Centro */}
              <View className="absolute inset-0 items-center justify-center">
                <Text style={{ fontSize: 11, color: textSecondary }}>
                  Rango ideal
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: textPrimary,
                  }}
                >
                  {round1(minIdeal)}–{round1(maxIdeal)} kg
                </Text>
              </View>
            </View>
          </View>

          {/* Nota */}
          <Text
            style={{
              marginTop: 16,
              fontSize: 12,
              color: textSecondary,
            }}
          >
            Basado en IMC saludable (18.5–24.9) para tu altura. Úsalo como
            referencia general, no como diagnóstico.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ---------- Skeleton estático ---------- */
function PesoIdealSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(148,163,184,0.16)" : "#e5e7eb";
  const border = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View
          style={{
            width: 110,
            height: 16,
            borderRadius: 6,
            backgroundColor: base,
          }}
        />
        <View
          style={{
            width: 80,
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
              backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "#fff",
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

      {/* Ring */}
      <View className="mt-5 items-center justify-center">
        <View
          className="w-44 h-44 items-center justify-center rounded-full border-[12px]"
          style={{ borderColor: base }}
        >
          <View
            style={{
              width: 100,
              height: 12,
              borderRadius: 6,
              backgroundColor: base,
            }}
          />
          <View
            style={{
              marginTop: 8,
              width: 80,
              height: 10,
              borderRadius: 6,
              backgroundColor: base,
            }}
          />
        </View>
      </View>

      {/* Texto inferior */}
      <View
        style={{
          marginTop: 16,
          height: 12,
          width: "100%",
          borderRadius: 6,
          backgroundColor: base,
        }}
      />
      <View
        style={{
          marginTop: 8,
          height: 12,
          width: "70%",
          borderRadius: 6,
          backgroundColor: base,
        }}
      />
    </View>
  );
}

/* ---------- Chip normal ---------- */
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

/* ---------- Util ---------- */
function round1(n: number) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}
