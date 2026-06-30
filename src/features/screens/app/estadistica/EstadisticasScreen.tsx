// src/features/screens/EstadisticasScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { Lock } from "lucide-react-native";

import EstadisticasContent from "./EstadisticasContent";
import CoachHistorialSection from "@/shared/components/home/CoachHistorialSection";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type Tab = "estadisticas" | "coach";

const tokens = {
  color: {
    bgDark: "#111111",
    bgLight: "#F8FAFC",
    textPrimaryDark: "#F1F5F9",
    textSecondaryDark: "#94A3B8",
    textPrimaryLight: "#0F172A",
    textSecondaryLight: "#475569",
    accent: "#39FF14",
    tabActiveBgDark: "rgba(0,232,90,0.12)",
    tabActiveBgLight: "rgba(0,180,70,0.08)",
    tabBorderDark: "rgba(255,255,255,0.06)",
    tabBorderLight: "rgba(0,0,0,0.06)",
  },
} as const;

export default function EstadisticasScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState<Tab>("estadisticas");
  const navigation = useNavigation<any>();
  const planActual = useUsuarioStore((s) => s.usuario?.planActual);

  const isPremium = planActual === "PREMIUM";
  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bg }]}>
        <Text
          style={[
            styles.eyebrow,
            { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight },
          ]}
        >
          PROGRESO
        </Text>
        <Text
          style={[
            styles.title,
            { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight },
          ]}
        >
          Estadísticas
        </Text>

        {/* Tab switcher */}
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              borderColor: isDark ? tokens.color.tabBorderDark : tokens.color.tabBorderLight,
            },
          ]}
        >
          {(["estadisticas", "coach"] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            const isLocked = tab === "coach" && !isPremium;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.75}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabItem,
                  isActive && {
                    backgroundColor: isDark
                      ? tokens.color.tabActiveBgDark
                      : tokens.color.tabActiveBgLight,
                  },
                ]}
              >
                <View style={styles.tabContent}>
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isActive
                          ? tokens.color.accent
                          : isDark
                          ? tokens.color.textSecondaryDark
                          : tokens.color.textSecondaryLight,
                        fontWeight: isActive ? "700" : "500",
                      },
                    ]}
                  >
                    {tab === "estadisticas" ? "Estadísticas" : "Coach"}
                  </Text>
                  {isLocked && (
                    <Lock
                      size={11}
                      color={isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight}
                      strokeWidth={2.5}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content — EstadisticasContent stays mounted to avoid re-fetching on tab switch */}
      <View style={{ flex: 1, display: activeTab === "estadisticas" ? "flex" : "none" }}>
        <EstadisticasContent />
      </View>

      {activeTab === "coach" && (
        isPremium ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.coachScroll, { backgroundColor: bg }]}
            showsVerticalScrollIndicator={false}
          >
            <CoachHistorialSection
              onGoPremium={() =>
                navigation.navigate("Perfil", { screen: "PremiumPayment" })
              }
            />
          </ScrollView>
        ) : (
          <View style={[styles.paywallContainer, { backgroundColor: bg }]}>
            <View
              style={[
                styles.paywallIconWrapper,
                { backgroundColor: isDark ? "rgba(0,232,90,0.08)" : "rgba(0,180,70,0.06)" },
              ]}
            >
              <Lock size={32} color={tokens.color.accent} strokeWidth={2} />
            </View>
            <Text
              style={[
                styles.paywallTitle,
                { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight },
              ]}
            >
              Función Premium
            </Text>
            <Text
              style={[
                styles.paywallSubtitle,
                { color: isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight },
              ]}
            >
              El Coach con IA está disponible exclusivamente para usuarios Premium. Obtén análisis personalizados y recomendaciones inteligentes.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.paywallBtn}
              onPress={() => navigation.navigate("Perfil", { screen: "PremiumPayment" })}
            >
              <Text style={styles.paywallBtnText}>Ver planes Premium</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    gap: 6,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 2,
    alignSelf: "flex-start",
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 9,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tabLabel: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  coachScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 130,
  },
  paywallContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 16,
  },
  paywallIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  paywallTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  paywallSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  paywallBtn: {
    marginTop: 8,
    backgroundColor: "#39FF14",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  paywallBtnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
  },
});
