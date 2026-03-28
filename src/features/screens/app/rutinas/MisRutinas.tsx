// src/features/fit/screens/app/rutinas/MisRutinas.tsx

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  Easing,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PenLine,
  Dumbbell,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react-native";

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
    primarySoftDark: "rgba(0,232,90,0.10)",
    primarySoftLight: "rgba(0,232,90,0.08)",
    textPrimaryDark: "#F1F5F9",
    textSecondaryDark: "#64748B",
    textPrimaryLight: "#0F172A",
    textSecondaryLight: "#475569",
    borderDark: "rgba(255,255,255,0.07)",
    borderLight: "rgba(15,23,42,0.08)",
    overlay: "rgba(0,0,0,0.55)",
    dangerDark: "#FF4D4D",
    dangerLight: "#E53E3E",
    dangerSurfaceDark: "rgba(255,77,77,0.08)",
    dangerSurfaceLight: "rgba(229,62,62,0.06)",
  },
  radius: { full: 999, lg: 16, xl: 22 },
  spacing: {
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    tabBarSafe: Platform.OS === "ios" ? 110 : 96,
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
    removeRutina,
  } = useMisRutinas();

  const rutinaActivaId = useUsuarioStore((s) => s.usuario?.rutinaActivaId);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [mostrarContinuarModal, setMostrarContinuarModal] = useState(false);
  const [continuarTipo, setContinuarTipo] = useState<"edit" | "crear" | null>(null);

  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fabAnim, {
      toValue: fabOpen ? 1 : 0,
      duration: fabOpen ? 220 : 180,
      easing: fabOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fabOpen, fabAnim]);

  const getItemAnimStyle = (index: number) => {
    const delayFactor = index * 0.08;

    const t = fabAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const opacity = t.interpolate({
      inputRange: [0 + delayFactor, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    const translateY = t.interpolate({
      inputRange: [0 + delayFactor, 1],
      outputRange: [12, 0],
      extrapolate: "clamp",
    });

    const scale = t.interpolate({
      inputRange: [0 + delayFactor, 1],
      outputRange: [0.92, 1],
      extrapolate: "clamp",
    });

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  };

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

  const handleCrearRutina = useCallback(() => {
    setFabOpen(false);
    navigation.navigate("CrearRutina");
  }, [navigation]);

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

  const bg = isDark ? tokens.color.bgDark : tokens.color.bgLight;
  const surface = isDark ? tokens.color.surfaceDark : tokens.color.surfaceLight;
  const border = isDark ? tokens.color.borderDark : tokens.color.borderLight;
  const titleColor = isDark
    ? tokens.color.textPrimaryDark
    : tokens.color.textPrimaryLight;
  const textColor = isDark
    ? tokens.color.textSecondaryDark
    : tokens.color.textSecondaryLight;
  const dangerColor = isDark ? tokens.color.dangerDark : tokens.color.dangerLight;
  const dangerSurface = isDark
    ? tokens.color.dangerSurfaceDark
    : tokens.color.dangerSurfaceLight;
  const primarySoft = isDark
    ? tokens.color.primarySoftDark
    : tokens.color.primarySoftLight;

  const rutinasCount = rutinas.length;
  const rutinaActiva = useMemo(
    () => rutinas.find((r: any) => String(r.id) === String(rutinaActivaId)),
    [rutinas, rutinaActivaId]
  );

  const rutinasSorted = useMemo(
    () =>
      [...rutinas].sort((a: any, b: any) => {
        const aActiva = String(a.id) === String(rutinaActivaId) ? -1 : 0;
        const bActiva = String(b.id) === String(rutinaActivaId) ? -1 : 0;
        return aActiva - bActiva;
      }),
    [rutinas, rutinaActivaId]
  );

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: textColor }]}>
            PLANIFICACIÓN
          </Text>

          <Text style={[styles.title, { color: titleColor }]}>
            Tus rutinas
          </Text>

          <Text style={[styles.subtitle, { color: textColor }]}>
            Crea, edita y activa tus entrenamientos desde un solo lugar.
          </Text>
        </View>

        <View style={styles.content}>
          {loading ? (
            <MisRutinasSkeleton />
          ) : rutinas.length > 0 ? (
            <MisRutinas rutinas={rutinasSorted as Rutina[]} mostrar={mostrar} />
          ) : (
            <MensajeVacio
              titulo="Aún no tienes una rutina"
              descripcion="Crea una rutina manual o genera una con IA para empezar a organizar tus entrenamientos."
              textoBoton="Crear mi rutina"
              rutaDestino="/crear-rutina"
              nombreImagen="rutinas"
              mostrarBoton={false}
            />
          )}
        </View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[
          styles.fabWrap,
          { bottom: Platform.OS === "ios" ? 118 : 132 },
        ]}
      >
        <View style={styles.fabInner}>
          <Animated.View
            pointerEvents={fabOpen ? "auto" : "none"}
            style={{
              marginBottom: 12,
              alignItems: "flex-end",
              opacity: fabAnim,
              transform: [
                {
                  translateY: fabAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                  }),
                },
              ],
            }}
          >
            <View style={styles.fabOptions}>
              <Animated.View style={getItemAnimStyle(1)}>
                <TouchableOpacity
                  onPress={handleCrearRutina}
                  activeOpacity={0.88}
                  style={[
                    styles.fabAction,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.10)"
                        : "rgba(0,0,0,0.08)",
                    },
                  ]}
                >
                  <PenLine size={22} color={isDark ? "#e5e7eb" : "#111827"} />
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={getItemAnimStyle(0)}>
                <View
                  style={[
                    styles.iaFabSlot,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.10)"
                        : "rgba(0,0,0,0.08)",
                    },
                  ]}
                >
                  <IaGenerate
                    onCreate={() => {
                      setFabOpen(false);
                      reloadRutinas();
                    }}
                  />
                </View>
              </Animated.View>
            </View>
          </Animated.View>

          <TouchableOpacity
            onPress={() => setFabOpen((v) => !v)}
            activeOpacity={0.9}
            style={[
              styles.fabMain,
              {
                backgroundColor: isDark ? "#1a2538" : "#111827",
              },
            ]}
          >
            {fabOpen ? (
              <ChevronDown size={22} color="#e5e7eb" />
            ) : (
              <ChevronUp size={22} color="#e5e7eb" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        style={[styles.visorOverlay, { transform: [{ translateY: slideY }] }]}
      >
        <View style={styles.visorContent}>
          {rutinaSeleccionada && (
            <MostrarRutina
              rutinas={rutinaSeleccionada}
              setVer={(v: boolean) => !v && cerrarVisor()}
              onDelete={async () => {
                removeRutina(rutinaSeleccionada.id);
                await reloadRutinas();
                cerrarVisor();
              }}
            />
          )}
        </View>
      </Animated.View>

      <Modal
        visible={mostrarContinuarModal}
        transparent
        animationType="fade"
        onRequestClose={handleMasTarde}
      >
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: tokens.color.overlay },
          ]}
          onPress={handleMasTarde}
        />

        <View style={styles.continuarModalWrap}>
          <View
            style={[
              styles.continuarModalCard,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            <View
              style={[
                styles.continuarIconWrap,
                { backgroundColor: modalInfo.iconBg },
              ]}
            >
              <Ionicons
                name={modalInfo.icon}
                size={22}
                color={modalInfo.iconColor}
              />
            </View>

            <Text style={[styles.continuarTitle, { color: titleColor }]}>
              {modalInfo.title}
            </Text>

            <Text style={[styles.continuarDesc, { color: textColor }]}>
              {modalInfo.description}
            </Text>

            <TouchableOpacity
              onPress={handleContinuarEdicion}
              style={[
                styles.btnContinuar,
                { backgroundColor: tokens.color.primary },
              ]}
              activeOpacity={0.88}
            >
              <Ionicons name="arrow-forward" size={16} color="#080D17" />
              <Text style={styles.btnContinuarText}>
                {modalInfo.continuarLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleMasTarde}
              style={[styles.btnMasTarde, { borderColor: border }]}
              activeOpacity={0.88}
            >
              <Ionicons name="time-outline" size={15} color={textColor} />
              <Text style={[styles.btnMasTardeText, { color: textColor }]}>
                Más tarde
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: border }]} />

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
    paddingBottom: 150,
  },

  header: {
    marginBottom: 18,
    alignItems: "flex-start",
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
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    maxWidth: "92%",
  },

  summaryCard: {
    borderWidth: 1,
    borderRadius: tokens.radius.xl,
    padding: 16,
    marginBottom: 20,
    gap: 16,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },

  content: {
    width: "100%",
  },

  fabWrap: {
    position: "absolute",
    right: 20,
    zIndex: 30
  },
  fabInner: {
    alignItems: "flex-end",
  },
  fabOptions: {
    gap: 14,
    alignItems: "flex-end",
  },
  fabAction: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  iaFabSlot: {
    borderRadius: 999,
    overflow: "hidden",
  },
  fabMain: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
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
  visorContent: {
    flex: 1,
    paddingTop: 50,
  },

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