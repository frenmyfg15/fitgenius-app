import React, { memo } from "react";
import { View, Text, Pressable, Image, AccessibilityState } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import Svg, { Path, Circle } from "react-native-svg";

// ⚠️ Asegúrate de tener la imagen en esta ruta (o ajusta el import):
import pesa from "../../../../assets/mensajeVacio/pesa.png";

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
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
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

  // Contenido reutilizable de la tarjeta (cuerpo)
  const Inner = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir rutina ${rutina.nombre}${activa ? ", actualmente activa" : ""}`}
      accessibilityState={accessibilityState}
      className={["rounded-2xl", "transition", "shadow", "flex-row items-center gap-4 px-4 py-4", "min-w-[320px] max-w-[320px]"].join(" ")}
      style={{
        // El fondo real se define por el envoltorio (gradiente + glass). Aquí solo mantenemos el borde interior en ambos temas.
        borderWidth: 1,
        borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
        backgroundColor: isDark ? undefined : "#ffffff",
      }}
    >
      {/* Imagen */}
      <View className="relative shrink-0">
        <View
          className="rounded-xl">
          <Image source={pesa} accessibilityIgnoresInvertColors resizeMode="contain" style={{ width: 64, height: 64 }} />
        </View>
      </View>

      {/* Info */}
      <View className="min-w-0 flex-1">
        <View className="flex-row items-start gap-2">
          <Text className="text-sm font-semibold" numberOfLines={1} style={{ color: isDark ? textPrimaryDark : "#0f172a" }}>
            {rutina.nombre}
          </Text>

          {activa && (
            <View
              className="flex-row items-center gap-1 rounded-md px-2 py-0.5"
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
          <Text className="mt-1 text-xs" numberOfLines={2} style={{ color: isDark ? textSecondaryDark : "#64748b" }}>
            {rutina.descripcion}
          </Text>
        ) : (
          <Text className="mt-1 text-xs" style={{ color: isDark ? "#475569" : "#94a3b8" }}>
            Sin descripción
          </Text>
        )}

        {/* Días */}
        <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
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
              <Text className="text-[11px] font-semibold" style={{ color: isDark ? textPrimaryDark : "#0f172a" }}>
                {abbr}
              </Text>
            </View>
          ))}
          {!!rutina.dias?.length && (
            <Text className="ml-1 text-[11px]" style={{ color: isDark ? textSecondaryDark : "#64748b" }}>
              {rutina.dias.length} día{rutina.dias.length === 1 ? "" : "s"}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  // Envoltura con el mismo "marco degradado + glass" del componente anterior
  return (
    <View className="flex justify-center">
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
          <View
            className="rounded-2xl"
            style={{ backgroundColor: "#ffffff", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", overflow: "hidden" }}
          >
            {Inner}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
