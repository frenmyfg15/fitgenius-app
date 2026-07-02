// File: src/features/cuenta/components/Perfil.tsx
import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { cmToFt } from "@/shared/utils/cmToFt";
import { kgToLb } from "@/shared/utils/kgToLb";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

export default function Perfil() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { usuario } = useUsuarioStore();

  const t = scheme(isDark);

  const iniciales = useMemo(() => {
    const n = (usuario?.nombre?.[0] ?? "").toUpperCase();
    const a = (usuario?.apellido?.[0] ?? "").toUpperCase();
    return (n + a) || "U";
  }, [usuario?.nombre, usuario?.apellido]);

  if (!usuario) return null;

  const alturaCm = Number(usuario.altura);

  const alturaDisplay =
    usuario.medidaAltura?.toUpperCase() === "FT"
      ? cmToFt(alturaCm)
      : `${alturaCm} cm`;

  const pesoDisplay =
    usuario.medidaPeso?.toUpperCase() === "KG"
      ? `${usuario.peso} kg`
      : kgToLb(Number(usuario.peso)) || 0;

  const pesoObjetivoDisplay =
    usuario.medidaPeso?.toUpperCase() === "KG"
      ? `${usuario.pesoObjetivo} kg`
      : kgToLb(Number(usuario.pesoObjetivo));

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary },
        ]}
      >
        <View style={styles.row}>
          {/* Avatar */}
          <View style={styles.avatarRing}>
            <View
              style={[
                styles.avatarInner,
                { backgroundColor: isDark ? Colors.dark.surfaceAlt : "#F5F5F5" },
              ]}
            >
              {usuario.imagenPerfil ? (
                <Image
                  source={{ uri: usuario.imagenPerfil }}
                  resizeMode="cover"
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={[styles.avatarInitials, { color: t.textSecondary }]}>
                  {iniciales}
                </Text>
              )}
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoCol}>
            <Text numberOfLines={1} style={[styles.name, { color: t.textPrimary }]}>
              {usuario.nombre} {usuario.apellido}
            </Text>

            <Text numberOfLines={1} style={[styles.email, { color: t.textSecondary }]}>
              {usuario.correo}
            </Text>

            {/* Métricas */}
            <View style={styles.metricsRow}>
              <Chip isDark={isDark}>{usuario.edad} años</Chip>
              <Chip isDark={isDark}>{pesoDisplay}</Chip>
              <Chip isDark={isDark}>{alturaDisplay}</Chip>
            </View>

            {/* Objetivos */}
            <View style={styles.goalsRow}>
              <ChipSoft isDark={isDark}>
                Meta: {pesoObjetivoDisplay}
              </ChipSoft>

              {"lugarEntrenamiento" in usuario && (
                <ChipSoft isDark={isDark}>
                  Lugar: {(usuario as any).lugarEntrenamiento}
                </ChipSoft>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Chip({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  const t = scheme(isDark);
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isDark ? t.border : t.surface,
          borderColor: t.border,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: t.textSecondary }]}>
        {children}
      </Text>
    </View>
  );
}

function ChipSoft({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  const t = scheme(isDark);
  return (
    <View
      style={[
        styles.chipSoft,
        {
          backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
          borderColor: t.border,
        },
      ]}
    >
      <Text style={[styles.chipSoftText, { color: t.textPrimary }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarRing: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.accentBorder,
    padding: 2,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "800",
    fontFamily: Font.title.bold,
  },
  infoCol: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
  },
  email: {
    fontSize: 12,
    fontFamily: Font.body.regular,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: Font.body.semiBold,
  },
  goalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  chipSoft: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipSoftText: {
    fontSize: 11,
    fontWeight: "500",
    fontFamily: Font.body.medium,
  },
});
