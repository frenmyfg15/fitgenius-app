// src/features/premium/Extra.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { Flame, Medal, Dumbbell, Lock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { useNavigation } from "@react-navigation/native";
import CaloriasModal from "./CaloriasModal";
import ExperienciaModal from "./ExperienciaModal";
import EjerciciosModal from "./EjerciciosModal";

/* ---------------- Tipos ---------------- */
type Props = { ejercicios: number };

export default function Extra({ ejercicios }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigation = useNavigation<any>();

  const planActual = useUsuarioStore((s) => s.usuario?.planActual);
  const haPagado = useUsuarioStore((s) => s.usuario?.haPagado ?? false);
  const calorias = useUsuarioStore((s) => s.usuario?.caloriasMes ?? 0);
  const experiencia = useUsuarioStore((s) => s.usuario?.experiencia ?? 0);

  const nf = useMemo(() => new Intl.NumberFormat("es-ES"), []);
  const isPremiumActive = planActual === "PREMIUM" && haPagado;

  // Estados de modales
  const [showCal, setShowCal] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showEj, setShowEj] = useState(false);

  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];

  const items = [
    {
      key: "calorias" as const,
      icon: <Flame size={20} color={isDark ? "#e5e7eb" : "#4b5563"} />,
      value: calorias,
      label: "Calorías quemadas",
      dotColor: "#22c55e",
      locked: !isPremiumActive,
      onPress: () => {
        if (!isPremiumActive) {
           navigation.navigate("Perfil", {
  screen: "PremiumPayment",
}); 
        } else {
          setShowCal(true);
        }
      },
    },
    {
      key: "experiencia" as const,
      icon: <Medal size={20} color={isDark ? "#e5e7eb" : "#4b5563"} />,
      value: experiencia,
      label: "Puntos de experiencia",
      dotColor: "#a855f7",
      locked: false,
      onPress: () => setShowXP(true),
    },
    {
      key: "ejercicios" as const,
      icon: <Dumbbell size={20} color={isDark ? "#e5e7eb" : "#4b5563"} />,
      value: ejercicios,
      label: "Ejercicios totales hoy",
      dotColor: "#10b981",
      locked: false,
      onPress: () => setShowEj(true),
    },
  ] as const;

  return (
    <>
      <View className="flex-row justify-center items-center gap-4">
        {items.map((it) => (
          <LinearGradient
            key={it.key}
            colors={marcoGradient as any}
            className="rounded-2xl p-[1px]"
            style={{ borderRadius: 15, overflow: "hidden" }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              accessibilityLabel={it.label}
              onPress={it.onPress}
              className={
                "relative w-[110px] h-[130px] rounded-2xl items-center justify-center shadow-md " +
                (isDark
                  ? "bg-[#0b1220] border border-white/10"
                  : "bg-white border border-neutral-200")
              }
              style={{
                borderRadius: 16,
              }}
            >
              {/* Si es calorías bloqueado → esqueleto con candado */}
              {it.key === "calorias" && it.locked ? (
                <View className="flex-1 items-center justify-center px-3 py-3">
                  <View
                    className={
                      "mb-2 h-9 w-9 rounded-xl items-center justify-center " +
                      (isDark
                        ? "bg-white/5 border border-white/10"
                        : "bg-neutral-50 border border-neutral-200")
                    }
                  >
                    <Lock
                      size={22}
                      color={isDark ? "#e5e7eb" : "#0f172a"}
                      strokeWidth={2}
                    />
                  </View>

                  <Text
                    className={
                      (isDark ? "text-white" : "text-slate-900") +
                      " text-[14px] font-semibold text-center"
                    }
                  >
                    Calorias
                  </Text>
                  <Text
                    className={
                      (isDark ? "text-[#94a3b8]" : "text-neutral-600") +
                      " text-[11px] text-center mt-1 tracking-tight"
                    }
                  >
                    Calorias
                    {"\n"}
                    quemadas este mes.
                  </Text>
                </View>
              ) : (
                // Contenido normal (experiencia, ejercicios o calorías si es premium)
                <>
                  <View className="flex-1 items-center justify-center px-3 py-3">
                    <View
                      className={
                        "mb-2 h-9 w-9 rounded-xl items-center justify-center " +
                        (isDark
                          ? "bg-white/5 border border-white/10"
                          : "bg-white border border-neutral-200")
                      }
                    >
                      {it.icon}
                    </View>

                    <Text
                      className={
                        (isDark ? "text-white" : "text-slate-900") +
                        " text-[28px] font-extrabold leading-none"
                      }
                    >
                      {nf.format(it.value)}
                    </Text>

                    <Text
                      className={
                        (isDark ? "text-[#94a3b8]" : "text-neutral-600") +
                        " text-[11px] text-center mt-1 tracking-tight"
                      }
                    >
                      {it.label}
                    </Text>
                  </View>

                  <View
                    className="absolute right-2 top-2 h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: it.dotColor,
                      borderWidth: 2,
                      borderColor: isDark ? "#0b1220" : "#ffffff",
                    }}
                  />
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </View>

      {/* Modales */}
      <CaloriasModal
        visible={showCal}
        onClose={() => setShowCal(false)}
        value={calorias}
      />
      <ExperienciaModal
        visible={showXP}
        onClose={() => setShowXP(false)}
        value={experiencia}
      />
      <EjerciciosModal
        visible={showEj}
        onClose={() => setShowEj(false)}
        value={ejercicios}
      />
    </>
  );
}
