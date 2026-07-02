// src/features/screens/EstadisticasScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { Lock } from "lucide-react-native";

import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";
import EstadisticasContent from "./EstadisticasContent";
import CoachHistorialSection from "@/shared/components/home/CoachHistorialSection";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type Tab = "estadisticas" | "coach";

export default function EstadisticasScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState<Tab>("estadisticas");
  const navigation = useNavigation<any>();
  const planActual = useUsuarioStore((s) => s.usuario?.planActual);

  const isPremium = planActual === "PREMIUM";
  const t = scheme(isDark);
  const bg = isDark ? Colors.primary : Colors.secondary;

  return (
    <SafeAreaView edges={["top"]} style={[styles.root, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bg }]}>
        <Text style={[styles.eyebrow, { color: t.textSecondary }]}>
          PROGRESO
        </Text>
        <Text style={[styles.title, { color: t.textPrimary }]}>
          Estadísticas
        </Text>

        {/* Tab switcher */}
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              borderColor: t.border,
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
                  isActive && { backgroundColor: Colors.accentSubtle },
                ]}
              >
                <View style={styles.tabContent}>
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isActive ? Colors.accent : t.textSecondary,
                        fontWeight: isActive ? "700" : "500",
                      },
                    ]}
                  >
                    {tab === "estadisticas" ? "Estadísticas" : "Coach"}
                  </Text>
                  {isLocked && (
                    <Lock size={11} color={t.textSecondary} strokeWidth={2.5} />
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
            <View style={[styles.paywallIconWrapper, { backgroundColor: Colors.accentSubtle }]}>
              <Lock size={32} color={Colors.accent} strokeWidth={2} />
            </View>
            <Text style={[styles.paywallTitle, { color: t.textPrimary }]}>
              Función Premium
            </Text>
            <Text style={[styles.paywallSubtitle, { color: t.textSecondary }]}>
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
    </SafeAreaView>
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
    fontFamily: Font.body.bold,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: Font.title.bold,
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
    fontFamily: Font.body.medium,
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
    fontFamily: Font.title.bold,
    textAlign: "center",
  },
  paywallSubtitle: {
    fontSize: 14,
    fontFamily: Font.body.regular,
    lineHeight: 22,
    textAlign: "center",
  },
  paywallBtn: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  paywallBtnText: {
    color: "#000",
    fontWeight: "700",
    fontFamily: Font.body.bold,
    fontSize: 15,
  },
});
