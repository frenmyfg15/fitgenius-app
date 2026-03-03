// src/features/fit/screens/app/rutinas/MisRutinas.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    dangerDark: "#FF4D4D",
    dangerLight: "#E53E3E",
    dangerSurfaceDark: "rgba(255,77,77,0.08)",
    dangerSurfaceLight: "rgba(229,62,62,0.06)",
  },
  radius: { full: 999, lg: 16 },
  spacing: {
    md: 16,
    lg: 24,
    xl: 32,
    tabBarSafe: Platform.OS === "ios" ? 140 : 130,
  },
} as const;

const hasPendingRutina = (raw: string | null) => {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    const nombre = String(parsed?.nombre ?? "").trim();
    const dias = Array.isArray(parsed?.dias) ? parsed.dias : [];
    const hasEj = dias.some(
      (d: any) => Array.isArray(d?.ejercicios) && d.ejercicios.length > 0
    );
    return Boolean(hasEj || nombre.length > 0);
  } catch {
    return false;
  }
};

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

  const [mostrarContinuarModal, setMostrarContinuarModal] = useState(false);
  const [continuarTipo, setContinuarTipo] = useState<"edit" | "crear" | null>(null);

  // Aparece siempre al hacer focus si hay borrador pendiente
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      (async () => {
        const editId = await AsyncStorage.getItem("rutinaEditId");
        if (!mounted) return;

        if (editId) {
          setContinuarTipo("edit");
          setMostrarContinuarModal(true);
          return;
        }

        const draft = await AsyncStorage.getItem("crearRutinaState");
        if (!mounted) return;

        if (hasPendingRutina(draft)) {
          setContinuarTipo("crear");
          setMostrarContinuarModal(true);
        }
      })();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const handleMasTarde = useCallback(() => {
    setMostrarContinuarModal(false);
  }, []);

  const handleDescartarBorrador = useCallback(async () => {
    setMostrarContinuarModal(false);
    if (continuarTipo === "edit") {
      await AsyncStorage.removeItem("rutinaEditId");
    } else {
      await AsyncStorage.removeItem("crearRutinaState");
    }
  }, [continuarTipo]);

  const handleContinuarEdicion = useCallback(() => {
    setMostrarContinuarModal(false);
    navigation.navigate("CrearRutina");
  }, [navigation]);

  // --- ANIMACIÓN FAB ---
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

  // --- VISOR + REFRESH ---
  const screenH = Dimensions.get("window").height;
  const slideY = useRef(new Animated.Value(screenH)).current;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    Animated.timing(slideY, {
      toValue: ver && rutinaSeleccionada ? 0 : screenH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [ver, rutinaSeleccionada, screenH, slideY]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadRutinas();
    } finally {
      setRefreshing(false);
    }
  }, [reloadRutinas]);

  // --- COLORES ---
  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;
  const modalSurface = isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight;
  const modalBorder = isDark ? tokens.color.borderDark : tokens.color.borderLight;
  const modalTitle = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const modalText = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const dangerColor = isDark ? tokens.color.dangerDark : tokens.color.dangerLight;
  const dangerSurface = isDark ? tokens.color.dangerSurfaceDark : tokens.color.dangerSurfaceLight;

  const modalInfo =
    continuarTipo === "edit"
      ? {
        icon: "pencil" as const,
        iconColor: "#A78BFA",
        iconBg: isDark ? "rgba(167,139,250,0.12)" : "rgba(167,139,250,0.10)",
        title: "Tienes una edición sin guardar",
        description:
          "Estabas modificando una rutina existente. Puedes continuar ahora o retomarlo más tarde.",
        continuarLabel: "Seguir editando",
        descartarLabel: "Descartar cambios",
      }
      : {
        icon: "document-text" as const,
        iconColor: tokens.color.primary,
        iconBg: isDark ? "rgba(0,232,90,0.10)" : "rgba(0,232,90,0.08)",
        title: "Tienes una rutina sin terminar",
        description:
          "Empezaste a crear una rutina nueva pero no la guardaste. Puedes terminarla ahora o retomarlo más tarde.",
        continuarLabel: "Terminar rutina",
        descartarLabel: "Descartar borrador",
      };

  return (
    <View style={[styles.flex1, { backgroundColor: bg }]}>
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
          <Text
            style={[
              styles.title,
              {
                color: isDark
                  ? tokens.color.textPrimaryDark
                  : tokens.color.textPrimaryLight,
              },
            ]}
          >
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

      {!loading && (
        <View style={styles.fabContainer}>
          <Animated.View
            style={[styles.optionsMenu, { opacity, transform: [{ translateY }] }]}
          >
            <IaGenerate
              onCreate={() => {
                reloadRutinas();
                closeMenu();
              }}
            />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("CrearRutina");
                closeMenu();
              }}
              style={[
                styles.manualBtn,
                { backgroundColor: isDark ? tokens.color.surfaceDark : "#fff" },
              ]}
            >
              <Ionicons name="create-outline" size={20} color={tokens.color.primary} />
              <Text style={[styles.manualText, { color: isDark ? "#fff" : "#000" }]}>
                Manual
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity activeOpacity={0.9} onPress={toggleMenu}>
            <LinearGradient
              colors={[
                tokens.color.gradientStart,
                tokens.color.gradientMid,
                tokens.color.gradientEnd,
              ]}
              style={styles.fabCircle}
            >
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Ionicons name="add" size={32} color="#fff" />
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <Animated.View
        style={[styles.visorOverlay, { transform: [{ translateY: slideY }] }]}
      >
        <View style={styles.visorContent}>
          {rutinaSeleccionada && (
            <MostrarRutina
              rutinas={rutinaSeleccionada}
              setVer={(v: boolean) => !v && cerrarVisor()}
              onDelete={async () => {
                await reloadRutinas();
                cerrarVisor();
              }}
            />
          )}
        </View>
      </Animated.View>

      {/* ─── Modal: borrador pendiente ─── */}
      <Modal
        visible={mostrarContinuarModal}
        transparent
        animationType="fade"
        onRequestClose={handleMasTarde}
      >
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: tokens.color.overlay }]}
          onPress={handleMasTarde}
        />

        <View style={styles.continuarModalWrap}>
          <View
            style={[
              styles.continuarModalCard,
              { backgroundColor: modalSurface, borderColor: modalBorder },
            ]}
          >
            {/* Icono contextual */}
            <View style={[styles.continuarIconWrap, { backgroundColor: modalInfo.iconBg }]}>
              <Ionicons name={modalInfo.icon} size={22} color={modalInfo.iconColor} />
            </View>

            <Text style={[styles.continuarTitle, { color: modalTitle }]}>
              {modalInfo.title}
            </Text>
            <Text style={[styles.continuarDesc, { color: modalText }]}>
              {modalInfo.description}
            </Text>

            {/* Botón primario: continuar */}
            <TouchableOpacity
              onPress={handleContinuarEdicion}
              style={[styles.btnContinuar, { backgroundColor: tokens.color.primary }]}
              activeOpacity={0.88}
            >
              <Ionicons name="arrow-forward" size={16} color="#080D17" />
              <Text style={styles.btnContinuarText}>{modalInfo.continuarLabel}</Text>
            </TouchableOpacity>

            {/* Botón secundario: más tarde */}
            <TouchableOpacity
              onPress={handleMasTarde}
              style={[
                styles.btnMasTarde,
                { borderColor: modalBorder },
              ]}
              activeOpacity={0.88}
            >
              <Ionicons name="time-outline" size={15} color={modalText} />
              <Text style={[styles.btnMasTardeText, { color: modalText }]}>
                Más tarde
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: modalBorder }]} />

            {/* Botón terciario: descartar */}
            <TouchableOpacity
              onPress={handleDescartarBorrador}
              style={[styles.btnDescartar, { backgroundColor: dangerSurface }]}
              activeOpacity={0.88}
            >
              <Ionicons name="trash-outline" size={15} color={dangerColor} />
              <Text style={[styles.btnDescartarText, { color: dangerColor }]}>
                {modalInfo.descartarLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  fabContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 130,
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
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.color.overlay,
    zIndex: 100,
  },
  visorContent: { flex: 1, paddingTop: 50 },

  // Modal borrador
  continuarModalWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  continuarModalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  continuarIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  continuarTitle: {
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
    marginBottom: 8,
  },
  continuarDesc: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    marginBottom: 20,
  },
  btnContinuar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  btnContinuarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#080D17",
  },
  btnMasTarde: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  btnMasTardeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginBottom: 10,
  },
  btnDescartar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 16,
  },
  btnDescartarText: {
    fontSize: 14,
    fontWeight: "700",
  },
});