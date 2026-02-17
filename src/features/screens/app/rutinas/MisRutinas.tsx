// src/features/fit/screens/app/rutinas/MisRutinas.tsx

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ... (tus otros imports se mantienen igual)
import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import IaGenerate from "@/shared/components/ui/IaGenerate";
import { Rutina } from "@/features/type/rutinas";
import { useMisRutinas } from "@/shared/hooks/useMisRutinas";
import MisRutinas from "@/shared/components/misRutinas/MisRutinas";
import MostrarRutina from "@/shared/components/misRutinas/MostrarRutina";
import MisRutinasSkeleton from "@/shared/components/skeleton/MisRutinasSkeleton";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

const tokens = {
  color: {
    bgDark: "#080D17",
    bgLight: "#F8FAFC",
    surfaceDark: "#0F1829",
    surfaceLight: "#FFFFFF",
    primary: "#00E85A",
    textPrimaryDark: "#F1F5F9",
    textSecondaryDark: "#64748B",
    textPrimaryLight: "#0F172A",
    textSecondaryLight: "#475569",
    borderDark: "rgba(255,255,255,0.07)",
    borderLight: "rgba(15,23,42,0.08)",
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",
    overlay: "rgba(0,0,0,0.55)",
  },
  radius: { full: 999, lg: 16 },
  spacing: {
    md: 16,
    lg: 24,
    xl: 32,
    tabBarSafe: Platform.OS === "ios" ? 140 : 120,
  },
} as const;

export default function MisRutinasScreen() {
  const navigation = useNavigation<any>();
  const {
    rutinas,
    rutinaSeleccionada,
    ver,
    loading,
    mostrar,
    cerrarVisor,
    reloadRutinas,
    totalIA,
    maxIA,
  } = useMisRutinas();

  const isPremium = useUsuarioStore((s) => s.usuario?.haPagado === true);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // --- LÓGICA DE ANIMACIÓN DEL FAB ---
  const [menuOpen, setMenuOpen] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    Animated.spring(animValue, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    if (menuOpen) toggleMenu();
  };

  // Interpolaciones para los botones que emergen
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const opacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  const rotation = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  // --- RESTO DE LÓGICA (VISOR, REFRESH) ---
  const screenH = Dimensions.get("window").height;
  const slideY = useRef(new Animated.Value(screenH)).current;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    Animated.timing(slideY, {
      toValue: ver && rutinaSeleccionada ? 0 : screenH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [ver, rutinaSeleccionada]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await reloadRutinas(); } finally { setRefreshing(false); }
  }, [reloadRutinas]);

  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;

  return (
    <View style={[styles.flex1, { backgroundColor: bg }]}>
      {/* Overlay para cerrar al tocar fuera */}
      {menuOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight }]}>
            Tus rutinas
          </Text>
        </View>

        <View style={styles.content}>
          {loading ? (
            <MisRutinasSkeleton />
          ) : rutinas.length > 0 ? (
            <MisRutinas rutinas={rutinas as Rutina[]} mostrar={mostrar} />
          ) : (
            <MensajeVacio
              titulo="Aún no tienes una rutina"
              descripcion="Crea tu primera rutina manual o genera una con IA según tus objetivos."
              textoBoton="Crear mi rutina"
              rutaDestino="/crear-rutina"
              nombreImagen="rutinas"
              mostrarBoton={false}
            />
          )}
        </View>
      </ScrollView>

      {/* --- MENU FLOTANTE ACCIONABLE --- */}
      {!loading && (
        <View style={styles.fabContainer}>
          {/* Botones que aparecen */}
          <Animated.View style={[styles.optionsMenu, { opacity, transform: [{ translateY }] }]}>
            <IaGenerate onCreate={() => { reloadRutinas(); closeMenu(); }} />
            {/* Opción Manual */}
            <TouchableOpacity
              onPress={() => { navigation.navigate("CrearRutina"); closeMenu(); }}
              style={[styles.manualBtn, { backgroundColor: isDark ? tokens.color.surfaceDark : "#fff" }]}
            >
              <Ionicons name="create-outline" size={20} color={tokens.color.primary} />
              <Text style={[styles.manualText, { color: isDark ? "#fff" : "#000" }]}>Manual</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Botón Gatillo (FAB) */}
          <TouchableOpacity activeOpacity={0.9} onPress={toggleMenu}>
            <LinearGradient
              colors={[tokens.color.gradientStart, tokens.color.gradientMid, tokens.color.gradientEnd]}
              style={styles.fabCircle}
            >
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Ionicons name="add" size={32} color="#fff" />
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* --- VISOR --- */}
      <Animated.View style={[styles.visorOverlay, { transform: [{ translateY: slideY }] }]}>
        <View style={styles.visorContent}>
          {rutinaSeleccionada && (
            <MostrarRutina
              rutinas={rutinaSeleccionada}
              setVer={(v: boolean) => !v && cerrarVisor()}
              onDelete={async () => { await reloadRutinas(); cerrarVisor(); }}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  scrollContent: {
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.tabBarSafe,
  },
  header: { marginBottom: tokens.spacing.lg, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800" },
  content: { width: "100%" },

  // --- ESTILOS FAB ---
  fabContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 90, // Posicionado sobre tu menú actual
    right: 20,
    alignItems: "flex-end",
  },
  fabCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  optionsMenu: {
    marginBottom: 15,
    gap: 12,
    alignItems: "flex-end",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  manualBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  manualText: { fontSize: 14, fontWeight: "700" },
  iaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  visorOverlay: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: tokens.color.overlay,
    zIndex: 100
  },
  visorContent: { flex: 1, paddingTop: 50 },
});