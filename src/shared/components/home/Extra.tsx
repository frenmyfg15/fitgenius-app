// File: src/features/premium/Extra.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { Flame, Medal } from "lucide-react-native";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";

const tokens = {
  color: {
    bgDark: "rgba(15,24,41,0.65)",
    bgLight: "rgba(255,255,255,0.9)",

    borderDark: "rgba(255,255,255,0.08)",
    borderLight: "rgba(15,23,42,0.08)",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",

    textSecondaryDark: "rgba(226,232,240,0.65)",
    textSecondaryLight: "rgba(15,23,42,0.55)",

    cal: "#22C55E",
    xp: "#A855F7",
  },
  radius: {
    full: 999,
  },
} as const;

// compact formatter
function formatCompact(n: number) {
  if (!n) return "0";
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
}

export default function Extra() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const calorias = useUsuarioStore((s) => s.usuario?.caloriasMes ?? 0);
  const experiencia = useUsuarioStore((s) => s.usuario?.experiencia ?? 0);

  return (
    <View style={styles.wrapper}>
      {/* 🔥 Calorías */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark
              ? tokens.color.bgDark
              : tokens.color.bgLight,
            borderColor: isDark
              ? tokens.color.borderDark
              : tokens.color.borderLight,
          },
        ]}
      >
        <Flame size={14} color={tokens.color.cal} strokeWidth={2.3} />

        <Text
          style={[
            styles.value,
            {
              color: isDark
                ? tokens.color.textPrimaryDark
                : tokens.color.textPrimaryLight,
            },
          ]}
        >
          {formatCompact(calorias)}
        </Text>

        <Text
          style={[
            styles.label,
            {
              color: isDark
                ? tokens.color.textSecondaryDark
                : tokens.color.textSecondaryLight,
            },
          ]}
        >
          kcal
        </Text>
      </View>

      {/* 🏅 XP */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark
              ? tokens.color.bgDark
              : tokens.color.bgLight,
            borderColor: isDark
              ? tokens.color.borderDark
              : tokens.color.borderLight,
          },
        ]}
      >
        <Medal size={14} color={tokens.color.xp} strokeWidth={2.3} />

        <Text
          style={[
            styles.value,
            {
              color: isDark
                ? tokens.color.textPrimaryDark
                : tokens.color.textPrimaryLight,
            },
          ]}
        >
          {formatCompact(experiencia)}
        </Text>

        <Text
          style={[
            styles.label,
            {
              color: isDark
                ? tokens.color.textSecondaryDark
                : tokens.color.textSecondaryLight,
            },
          ]}
        >
          XP
        </Text>
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },

  value: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
  },
});