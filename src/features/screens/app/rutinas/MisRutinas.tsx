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
} from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PenLine, Dumbbell } from "lucide-react-native";

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

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: surface, borderColor: border },
          ]}
        >
          <View style={styles.summaryTop}>
            <View
              style={[styles.summaryIcon, { backgroundColor: primarySoft }]}
            >
              <Dumbbell size={18} color={tokens.color.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryTitle, { color: titleColor }]}>
                {rutinasCount === 0
                  ? "Empieza tu biblioteca de rutinas"
                  : `${rutinasCount} ${rutinasCount === 1 ? "rutina guardada" : "rutinas guardadas"
                  }`}
              </Text>

              <Text style={[styles.summaryText, { color: textColor }]}>
                {rutinaActiva
                  ? `Rutina activa: ${rutinaActiva.nombre}`
                  : "Todavía no tienes una rutina activa seleccionada."}
              </Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate("CrearRutina")}
              style={[
                styles.primaryAction,
                { backgroundColor: tokens.color.primary },
              ]}
            >
              <PenLine size={16} color="#081117" />
              <Text style={styles.primaryActionText}>Crear rutina</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActionWrap}>
              <IaGenerate
                onCreate={() => {
                  reloadRutinas();
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: titleColor }]}>
              Biblioteca de rutinas
            </Text>
            <Text style={[styles.sectionText, { color: textColor }]}>
              Toca una rutina para verla, editarla o utilizarla.
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {loading ? (
            <MisRutinasSkeleton />
          ) : rutinas.length > 0 ? (
            <MisRutinas rutinas={rutinas as Rutina[]} mostrar={mostrar} />
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
    paddingBottom: tokens.spacing.tabBarSafe,
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

  quickActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#081117",
  },
  secondaryActionWrap: {
    flexShrink: 1,
  },

  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },

  content: {
    width: "100%",
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