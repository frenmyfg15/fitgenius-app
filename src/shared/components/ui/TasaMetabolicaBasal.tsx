// src/features/fit/components/TasaMetabolicaBasal.tsx
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

type TasaMetabolicaBasalProps = {
  peso?: number | string | null;
  altura?: number | string | null;
  edad?: number | string | null;
  sexo?: string | null;
  soloGrafica?: boolean;
};

export default function TasaMetabolicaBasal({
  peso,
  altura,
  edad,
  sexo,
  soloGrafica = false,
}: TasaMetabolicaBasalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { usuario } = useUsuarioStore();
  const navigation = useNavigation<any>();

  // 🎨 Paleta visual (igual que PesoIdeal)
  const marcoGradient = [
    "rgb(0,255,64)",
    "rgb(94,230,157)",
    "rgb(178,0,255)",
  ];
  const cardBg = isDark ? "rgba(20, 28, 44, 0.6)" : "#fff";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";
  const ringBase = isDark ? "rgba(148,163,184,0.22)" : "#e5e7eb";

  const planActual = usuario?.planActual;
  const haPagado = usuario?.haPagado ?? false;
  const isPremiumActive = planActual === "PREMIUM" && haPagado;
  const locked = !isPremiumActive;

  const handleGoPremium = () => {
    navigation.navigate("Perfil", {
      screen: "PremiumPayment",
    });
  };

  // 🔒 Basado en plan actual
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
            <TmbSkeleton isDark={isDark} />

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
                  Tasa metabólica basal Premium
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    color: isDark ? "#9ca3af" : "#047857",
                  }}
                >
                  Hazte Premium para ver tu TMB diaria personalizada y entender
                  mejor tus necesidades calóricas en reposo.
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

  // ✅ Lógica de cálculo cuando está desbloqueado
  const pesoNum = Number(peso ?? 0);
  const alturaNum = Number(altura ?? 0);
  const edadNum = Number(edad ?? 0);
  const sexoRaw = String(sexo ?? "");

  if (!pesoNum || !alturaNum || !edadNum || !sexoRaw) return null;

  const sexoNorm = sexoRaw.toLowerCase().startsWith("m") ? "M" : "F";
  const tmb = Math.round(
    sexoNorm === "M"
      ? 10 * pesoNum + 6.25 * alturaNum - 5 * edadNum + 5
      : 10 * pesoNum + 6.25 * alturaNum - 5 * edadNum - 161
  );

  const minTMB = 1000;
  const maxTMB = 3000;
  const pct = Math.max(0, Math.min(1, (tmb - minTMB) / (maxTMB - minTMB)));
  const dash = C * (1 - pct);

  const { estado, isGradient } = useMemo(() => {
    if (tmb < minTMB) return { estado: "por debajo", isGradient: false };
    if (tmb > maxTMB) return { estado: "por encima", isGradient: false };
    return { estado: "en rango estimado", isGradient: true };
  }, [tmb, minTMB, maxTMB]);

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
              Tasa metabólica basal
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

          {!soloGrafica && (
            <>
              {/* Métricas */}
              <View className="mt-3 grid grid-cols-3 gap-3">
                <Chip
                  label="Peso"
                  value={`${round1(pesoNum)} kg`}
                  isDark={isDark}
                />
                <Chip
                  label="Altura"
                  value={`${round1(alturaNum)} cm`}
                  isDark={isDark}
                />
                <Chip
                  label="Edad"
                  value={`${edadNum} años`}
                  isDark={isDark}
                />
              </View>
            </>
          )}

          {/* Anillo central con progreso */}
          <View className="mt-5 items-center justify-center">
            <View className="relative w-44 h-44">
              <Svg
                className="absolute inset-0 -rotate-90"
                width="100%"
                height="100%"
                viewBox="0 0 180 180"
              >
                <Defs>
                  <SvgLinearGradient id="tmbGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="rgb(0,255,64)" />
                    <Stop offset="50%" stopColor="rgb(94,230,157)" />
                    <Stop offset="100%" stopColor="rgb(178,0,255)" />
                  </SvgLinearGradient>
                  <SvgLinearGradient
                    id="tmbGradMuted"
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
                  stroke={isGradient ? "url(#tmbGrad)" : "url(#tmbGradMuted)"}
                  strokeWidth={12}
                  fill="transparent"
                  strokeDasharray={C}
                  strokeDashoffset={dash}
                  strokeLinecap="round"
                />
              </Svg>

              {/* Centro del anillo */}
              <View className="absolute inset-0 items-center justify-center">
                <Text
                  style={{
                    fontSize: 11,
                    color: textSecondary,
                  }}
                >
                  TMB estimada
                </Text>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: textPrimary,
                    lineHeight: 26,
                  }}
                >
                  {tmb}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: textSecondary,
                    marginTop: 2,
                  }}
                >
                  kcal / día
                </Text>
              </View>
            </View>
          </View>

          {/* Barra lineal de rango */}
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                height: 10,
                width: "100%",
                borderRadius: 999,
                overflow: "hidden",
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
            <View
              className="flex-row justify-between"
              style={{ marginTop: 6 }}
            >
              <Text style={{ fontSize: 11, color: textSecondary }}>
                1000 kcal
              </Text>
              <Text style={{ fontSize: 11, color: textSecondary }}>
                3000 kcal
              </Text>
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
            La TMB es una aproximación basada en fórmulas estándar. Factores
            como masa magra, sueño, estrés o medicación pueden modificar tus
            necesidades reales.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ---------- Skeleton estático (bajo candado) ---------- */
function TmbSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(148,163,184,0.16)" : "#e5e7eb";
  const border = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View
          style={{
            width: 150,
            height: 16,
            borderRadius: 6,
            backgroundColor: base,
          }}
        />
        <View
          style={{
            width: 120,
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
              width: 80,
              height: 12,
              borderRadius: 6,
              backgroundColor: base,
            }}
          />
          <View
            style={{
              marginTop: 8,
              width: 70,
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
          width: "75%",
          borderRadius: 6,
          backgroundColor: base,
        }}
      />
    </View>
  );
}

/* ---------- Chip reutilizable (igual que en PesoIdeal) ---------- */
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
