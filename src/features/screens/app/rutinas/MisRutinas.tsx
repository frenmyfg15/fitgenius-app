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
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PenLine, ChevronUp, ChevronDown } from "lucide-react-native";

import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import IaGenerate from "@/shared/components/ui/IaGenerate";
import { Rutina } from "@/features/type/rutinas";
import { useMisRutinas } from "@/shared/hooks/useMisRutinas";
import MisRutinas from "@/shared/components/misRutinas/MisRutinas";
import MostrarRutina from "@/shared/components/misRutinas/MostrarRutina";
import MisRutinasSkeleton from "@/shared/components/skeleton/MisRutinasSkeleton";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const DANGER = {
  colorDark: "#FF4D4D",
  colorLight: "#E53E3E",
  surfaceDark: "rgba(255,77,77,0.08)",
  surfaceLight: "rgba(229,62,62,0.06)",
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
  const t = scheme(isDark);

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
    const delay = index * 0.08;
    const opacity = fabAnim.interpolate({
      inputRange: [0 + delay, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });
    const translateY = fabAnim.interpolate({
      inputRange: [0 + delay, 1],
      outputRange: [12, 0],
      extrapolate: "clamp",
    });
    const scale = fabAnim.interpolate({
      inputRange: [0 + delay, 1],
      outputRange: [0.92, 1],
      extrapolate: "clamp",
    });
    return { opacity, transform: [{ translateY }, { scale }] };
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
      return () => { mounted = false; };
    }, [])
  );

  const handleMasTarde = useCallback(() => setMostrarContinuarModal(false), []);

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
    try { await reloadRutinas(); } finally { setRefreshing(false); }
  }, [reloadRutinas]);

  const dangerColor = isDark ? DANGER.colorDark : DANGER.colorLight;
  const dangerSurface = isDark ? DANGER.surfaceDark : DANGER.surfaceLight;

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
          description: "Estabas modificando una rutina existente. Puedes continuar ahora o retomarlo más tarde.",
          continuarLabel: "Seguir editando",
          descartarLabel: "Descartar cambios",
        }
      : {
          icon: "document-text" as const,
          iconColor: Colors.accent,
          iconBg: Colors.accentSubtle,
          title: "Tienes una rutina sin terminar",
          description: "Empezaste a crear una rutina nueva pero no la guardaste. Puedes terminarla ahora o retomarlo más tarde.",
          continuarLabel: "Terminar rutina",
          descartarLabel: "Descartar borrador",
        };

  return (
    <SafeAreaView edges={["top"]} style={[styles.flex1, { backgroundColor: isDark ? Colors.primary : "#F8FAFC" }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: t.textSecondary }]}>PLANIFICACIÓN</Text>
          <Text style={[styles.title, { color: t.textPrimary }]}>Tus rutinas</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
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
        style={[styles.fabWrap, { bottom: Platform.OS === "ios" ? 118 : 132 }]}
      >
        <View style={styles.fabInner}>
          <Animated.View
            pointerEvents={fabOpen ? "auto" : "none"}
            style={{
              marginBottom: 12,
              alignItems: "flex-end",
              opacity: fabAnim,
              transform: [{ translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
            }}
          >
            <View style={styles.fabOptions}>
              <Animated.View style={getItemAnimStyle(1)}>
                <TouchableOpacity
                  onPress={handleCrearRutina}
                  activeOpacity={0.88}
                  style={[
                    styles.fabAction,
                    { backgroundColor: isDark ? t.border : t.surface },
                  ]}
                >
                  <PenLine size={22} color={t.textPrimary} />
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={getItemAnimStyle(0)}>
                <View style={[styles.iaFabSlot, { backgroundColor: isDark ? t.border : t.surface }]}>
                  <IaGenerate onCreate={() => { setFabOpen(false); reloadRutinas(); }} />
                </View>
              </Animated.View>
            </View>
          </Animated.View>

          <TouchableOpacity
            onPress={() => setFabOpen((v) => !v)}
            activeOpacity={0.9}
            style={[
              styles.fabMain,
              { backgroundColor: isDark ? Colors.dark.surface : Colors.primary },
            ]}
          >
            {fabOpen ? (
              <ChevronDown size={22} color={Colors.secondary} />
            ) : (
              <ChevronUp size={22} color={Colors.secondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        style={[
          styles.visorOverlay,
          { backgroundColor: t.overlay, transform: [{ translateY: slideY }] },
        ]}
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
          style={[StyleSheet.absoluteFill, { backgroundColor: t.overlay }]}
          onPress={handleMasTarde}
        />

        <View style={styles.continuarModalWrap}>
          <View
            style={[
              styles.continuarModalCard,
              {
                backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
                borderColor: t.border,
              },
            ]}
          >
            <View style={[styles.continuarIconWrap, { backgroundColor: modalInfo.iconBg }]}>
              <Ionicons name={modalInfo.icon} size={22} color={modalInfo.iconColor} />
            </View>

            <Text style={[styles.continuarTitle, { color: t.textPrimary }]}>
              {modalInfo.title}
            </Text>

            <Text style={[styles.continuarDesc, { color: t.textSecondary }]}>
              {modalInfo.description}
            </Text>

            <TouchableOpacity
              onPress={handleContinuarEdicion}
              style={[styles.btnContinuar, { backgroundColor: Colors.accent }]}
              activeOpacity={0.88}
            >
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              <Text style={styles.btnContinuarText}>{modalInfo.continuarLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleMasTarde}
              style={[styles.btnMasTarde, { borderColor: t.border }]}
              activeOpacity={0.88}
            >
              <Ionicons name="time-outline" size={15} color={t.textSecondary} />
              <Text style={[styles.btnMasTardeText, { color: t.textSecondary }]}>Más tarde</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: t.border }]} />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 150,
  },

  header: { marginBottom: 18, alignItems: "flex-start", gap: 6 },
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
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Font.body.medium,
    lineHeight: 21,
    maxWidth: "92%",
  },

  content: { width: "100%" },

  fabWrap: { position: "absolute", right: 20, zIndex: 30 },
  fabInner: { alignItems: "flex-end" },
  fabOptions: { gap: 14, alignItems: "flex-end" },
  fabAction: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  iaFabSlot: { borderRadius: 999, overflow: "hidden" },
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
    zIndex: 100,
  },
  visorContent: { flex: 1, paddingTop: 50 },

  continuarModalWrap: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  continuarModalCard: { borderRadius: 24, borderWidth: 1, padding: 20 },
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
    fontFamily: Font.body.bold,
    lineHeight: 22,
    marginBottom: 8,
  },
  continuarDesc: {
    fontSize: 13,
    fontFamily: Font.body.medium,
    lineHeight: 19,
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
    fontFamily: Font.body.bold,
    color: Colors.primary,
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
    fontFamily: Font.body.semiBold,
  },
  divider: { height: 1, marginBottom: 10 },
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
    fontFamily: Font.body.bold,
  },
});
