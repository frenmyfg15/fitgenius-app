import React, { memo } from "react";
import { View, Text, Pressable, Image, AccessibilityState } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import Svg, { Path, Circle } from "react-native-svg";

import pesa from "../../../../assets/mensajeVacio/pesa.webp";

import { Rutina } from "@/features/type/rutinas";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { ScrollView } from "react-native";

/* ---------------- Iconos ---------------- */
const BadgeCheckIcon = memo(({ size = 14, color = "#0f172a" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessible accessibilityLabel="Icono de verificado">
    <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={2} />
    <Path d="M8 12.5l2.5 2.5L16 9.5" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
));

/* ---------------- Paleta y tema (igual que la card anterior) ---------------- */
const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;
const cardBgDarkA = "rgba(20,28,44,0.85)";
const cardBgDarkB = "rgba(9,14,24,0.9)";
const cardBorderDark = "rgba(255,255,255,0.08)";
const textPrimaryDark = "#e5e7eb";
const textSecondaryDark = "#94a3b8";

/* ---------------- Componentes ---------------- */

type Props = {
  rutinas: Rutina[];
  mostrar: (id: number) => void;
};

export default function MisRutinas({ rutinas, mostrar }: Props) {
  const { usuario } = useUsuarioStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!rutinas?.length) return null;

  return (
    <View className="w-full">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View className="flex-row flex-wrap gap-4 justify-center">
          {rutinas.map((r) => (
            <CardRutina
              key={r.id}
              rutina={r}
              activa={usuario?.rutinaActivaId === r.id}
              onPress={() => mostrar(r.id)}
              isDark={isDark}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function CardRutina({ rutina, activa, onPress, isDark }: { rutina: Rutina; activa: boolean; onPress: () => void; isDark: boolean }) {
  const dias = rutina.dias?.map((d) => d.diaSemana?.[0]?.toUpperCase() ?? "?") ?? [];
  const accessibilityState: AccessibilityState = { selected: !!activa };

  const Inner = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir rutina ${rutina.nombre}${activa ? ", actualmente activa" : ""}`}
      accessibilityState={accessibilityState}
      className={["rounded-2xl", "shadow", "flex-row items-center gap-4 px-4 py-4", "min-w-[320px] max-w-[360px] w-full"].join(" ")}
      style={{
        borderWidth: 1,
        borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
        backgroundColor: isDark ? undefined : "#ffffff",
      }}
    >
      <View className="shrink-0">
        <View
          className="h-[72px] w-[72px] rounded-2xl items-center justify-center"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            borderWidth: 1,
            borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
          }}
        >
          <Image source={pesa} accessibilityIgnoresInvertColors resizeMode="contain" style={{ width: 48, height: 48 }} />
        </View>
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-3">
          <Text className="text-[15px] font-extrabold flex-1 min-w-0" numberOfLines={1} style={{ color: isDark ? textPrimaryDark : "#0f172a" }}>
            {rutina.nombre}
          </Text>

          {activa && (
            <View
              className="flex-row items-center gap-1 rounded-full px-2 py-1"
              accessibilityLabel="Rutina activa"
              style={{
                backgroundColor: isDark ? "rgba(34,197,94,0.10)" : "rgba(57,255,20,0.10)",
                borderWidth: 1,
                borderColor: isDark ? "rgba(34,197,94,0.35)" : "rgba(57,255,20,0.35)",
              }}
            >
              <BadgeCheckIcon size={14} color={isDark ? textPrimaryDark : "#0f172a"} />
              <Text className="text-[11px] font-semibold" style={{ color: isDark ? textPrimaryDark : "#0f172a" }}>
                Activa
              </Text>
            </View>
          )}
        </View>

        {rutina.descripcion ? (
          <Text className="mt-1 text-xs leading-[17px]" numberOfLines={2} style={{ color: isDark ? textSecondaryDark : "#64748b" }}>
            {rutina.descripcion}
          </Text>
        ) : (
          <Text className="mt-1 text-xs leading-[17px]" style={{ color: isDark ? "#475569" : "#94a3b8" }}>
            Sin descripción
          </Text>
        )}

        <View className="mt-3 flex-row items-center justify-between gap-3">
          <View className="flex-row flex-wrap items-center gap-1.5 flex-1">
            {dias.map((abbr, i) => (
              <View
                key={`${rutina.id}-dia-${i}`}
                className="h-6 w-6 rounded-md items-center justify-center"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                  borderWidth: 1,
                  borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
                }}
                accessibilityLabel={`Día ${rutina.dias?.[i]?.diaSemana ?? ""}`}
              >
                <Text className="text-[11px] font-extrabold" style={{ color: isDark ? textPrimaryDark : "#0f172a" }}>
                  {abbr}
                </Text>
              </View>
            ))}
          </View>

          {!!rutina.dias?.length && (
            <Text className="text-[11px]" style={{ color: isDark ? textSecondaryDark : "#64748b" }}>
              {rutina.dias.length} día{rutina.dias.length === 1 ? "" : "s"}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  if (activa) {
    return (
      <View className="flex justify-center w-full max-w-[360px]">
        <LinearGradient colors={marcoGradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, padding: 1, overflow: "hidden" }}>
          {isDark ? (
            <LinearGradient
              colors={[cardBgDarkA, cardBgDarkB, cardBgDarkA]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, borderWidth: 1, borderColor: cardBorderDark, overflow: "hidden" }}
            >
              {Inner}
            </LinearGradient>
          ) : (
            <View className="rounded-2xl" style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {Inner}
            </View>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="flex justify-center w-full max-w-[360px]" style={{ borderRadius: 16, overflow: "hidden" }}>
      {isDark ? (
        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: cardBorderDark, overflow: "hidden" }}>
          {Inner}
        </View>
      ) : (
        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", backgroundColor: "#ffffff", overflow: "hidden" }}>
          {Inner}
        </View>
      )}
    </View>
  );
}
