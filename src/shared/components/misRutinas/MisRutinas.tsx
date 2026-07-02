import React, { memo } from "react";
import { View, Text, Pressable, Image, AccessibilityState, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import Svg, { Path, Circle } from "react-native-svg";

import pesa from "../../../../assets/mensajeVacio/pesa.webp";

import { Rutina } from "@/features/type/rutinas";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const BadgeCheckIcon = memo(({ size = 14, color = "#0f172a" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessible accessibilityLabel="Icono de verificado">
    <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth={2} />
    <Path d="M8 12.5l2.5 2.5L16 9.5" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
));

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
  const t = scheme(isDark);
  const dias = rutina.dias?.map((d) => d.diaSemana?.[0]?.toUpperCase() ?? "?") ?? [];
  const accessibilityState: AccessibilityState = { selected: !!activa };

  const cardBg = isDark ? Colors.dark.surface : Colors.secondary;
  const borderColor = activa ? Colors.accentBorder : t.border;
  const borderWidth = activa ? 1.5 : 1;

  const Inner = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir rutina ${rutina.nombre}${activa ? ", actualmente activa" : ""}`}
      accessibilityState={accessibilityState}
      className="flex-row items-center gap-4 px-4 py-4 min-w-[320px] max-w-[360px] w-full rounded-2xl"
      style={{ backgroundColor: cardBg }}
    >
      <View className="shrink-0">
        <View
          className="h-[72px] w-[72px] rounded-2xl items-center justify-center"
          style={{
            backgroundColor: isDark ? t.border : t.surface,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Image source={pesa} accessibilityIgnoresInvertColors resizeMode="contain" style={{ width: 48, height: 48 }} />
        </View>
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-3">
          <Text
            className="text-[15px] font-extrabold flex-1 min-w-0"
            numberOfLines={1}
            style={{ color: t.textPrimary, fontFamily: Font.body.bold }}
          >
            {rutina.nombre}
          </Text>

          {activa && (
            <View
              className="flex-row items-center gap-1 rounded-full px-2 py-1"
              accessibilityLabel="Rutina activa"
              style={{
                backgroundColor: Colors.accentSubtle,
                borderWidth: 1,
                borderColor: Colors.accentBorder,
              }}
            >
              <BadgeCheckIcon size={14} color={t.textPrimary} />
              <Text
                className="text-[11px] font-semibold"
                style={{ color: t.textPrimary, fontFamily: Font.body.semiBold }}
              >
                Activa
              </Text>
            </View>
          )}
        </View>

        {rutina.descripcion ? (
          <Text
            className="mt-1 text-xs leading-[17px]"
            numberOfLines={2}
            style={{ color: t.textSecondary, fontFamily: Font.body.regular }}
          >
            {rutina.descripcion}
          </Text>
        ) : (
          <Text
            className="mt-1 text-xs leading-[17px]"
            style={{ color: t.textTertiary, fontFamily: Font.body.regular }}
          >
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
                  backgroundColor: isDark ? t.border : Colors.secondary,
                  borderWidth: 1,
                  borderColor: t.border,
                }}
                accessibilityLabel={`Día ${rutina.dias?.[i]?.diaSemana ?? ""}`}
              >
                <Text
                  className="text-[11px] font-extrabold"
                  style={{ color: t.textPrimary, fontFamily: Font.body.bold }}
                >
                  {abbr}
                </Text>
              </View>
            ))}
          </View>

          {!!rutina.dias?.length && (
            <Text
              className="text-[11px]"
              style={{ color: t.textSecondary, fontFamily: Font.body.regular }}
            >
              {rutina.dias.length} día{rutina.dias.length === 1 ? "" : "s"}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View
      className="flex justify-center w-full max-w-[360px]"
      style={{ borderRadius: 16, borderWidth, borderColor, overflow: "hidden" }}
    >
      {Inner}
    </View>
  );
}
