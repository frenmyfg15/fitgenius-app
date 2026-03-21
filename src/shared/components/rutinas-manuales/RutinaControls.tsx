// src/shared/components/rutina/RutinaControls.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { useColorScheme } from "nativewind";
import {
  Plus,
  Pencil,
  Trash2,
  Cog,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { Item } from "@/features/type/crearRutina";

// Mínimo de ejercicios necesarios para poder preguntar a la IA
const MIN_EJERCICIOS_PARA_IA = 2;

type Props = {
  onPreguntarRutina?: () => void;
  onCrear: () => void;
  creando?: boolean;
  puedeCrear?: boolean;
  onAgregarEjercicio: () => void;
  onAgregarCompuesto: () => void;
  onCopiarDia: () => void;
  onPegarAppend: () => void;
  onPegarReplace: () => void;
  puedePegar?: boolean;
  onVaciar: () => void;
  puedeVaciar?: boolean;
  onEliminarSeleccion?: () => void;
  haySeleccion?: boolean;
  onEditarSeleccion?: () => void;
  onSubirSeleccion?: () => void;
  onBajarSeleccion?: () => void;
  puedeSubir?: boolean;
  puedeBajar?: boolean;
  modoEdicion?: boolean;
  /** Número total de ejercicios en la rutina (todos los días) */
  totalEjercicios?: number;
};

export default function RutinaControls({
  onPreguntarRutina,
  onCrear,
  creando = false,
  puedeCrear = true,
  onAgregarEjercicio,
  onAgregarCompuesto,
  onCopiarDia,
  onPegarAppend,
  onPegarReplace,
  puedePegar = true,
  onVaciar,
  puedeVaciar = false,
  onEliminarSeleccion,
  haySeleccion = false,
  onEditarSeleccion,
  onSubirSeleccion,
  onBajarSeleccion,
  puedeSubir = false,
  puedeBajar = false,
  modoEdicion = false,
  totalEjercicios = 0,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [menuOpen, setMenuOpen] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["45%", "70%"], []);

  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#10b981" : "#059669";

  const fabBase =
    "p-4 rounded-full shadow-lg items-center justify-center " +
    (isDark
      ? "bg-slate-900 border border-white/20"
      : "bg-white border border-neutral-200");

  const iconColor = isDark ? "#f8fafc" : "#1e293b";

  // La IA solo está disponible cuando hay suficientes ejercicios
  const puedeUsarIA = totalEjercicios >= MIN_EJERCICIOS_PARA_IA;

  useEffect(() => {
    if (menuOpen) {
      const id = requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
      });
      return () => cancelAnimationFrame(id);
    }
    bottomSheetModalRef.current?.dismiss();
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const executeAction = (fn?: () => void) => {
    fn?.();
    closeMenu();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <>
      <View style={styles.floatingContainer}>
        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          className={fabBase}
          activeOpacity={0.7}
          style={styles.secondaryFab}
        >
          <Cog size={24} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCrear}
          disabled={creando || !puedeCrear}
          activeOpacity={0.8}
          style={[
            styles.mainFab,
            {
              backgroundColor: isDark ? "#10b981" : "#059669",
              opacity: creando || !puedeCrear ? 0.6 : 1,
            },
          ]}
        >
          {creando ? (
            <ActivityIndicator color="#fff" />
          ) : modoEdicion ? (
            <Pencil size={24} color="#fff" />
          ) : (
            <CheckCircle2 size={26} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={() => setMenuOpen(false)}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: cardBg }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#334155" : "#e2e8f0",
          width: 40,
        }}
        style={{
          zIndex: 999999,
          ...(Platform.OS === "android" ? { elevation: 999999 } : null),
        }}
        containerStyle={{
          zIndex: 999999,
          ...(Platform.OS === "android" ? { elevation: 999999 } : null),
        }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.menuHeader}>
            <Text style={[styles.menuTitle, { color: textPrimary }]}>
              Acciones de Rutina
            </Text>
            <Pressable onPress={closeMenu} hitSlop={10}>
              <X size={20} color={textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.sectionLabel}>AÑADIR</Text>
            <View style={styles.row}>
              <MenuOption
                icon={<Plus size={20} color={iconColor} />}
                label="Ejercicio"
                onPress={() => executeAction(onAgregarEjercicio)}
                isDark={isDark}
              />
              <MenuOption
                icon={<Plus size={20} color={iconColor} />}
                label="Compuesto"
                onPress={() => executeAction(onAgregarCompuesto)}
                isDark={isDark}
              />
              <MenuOption
                icon={
                  <Sparkles
                    size={20}
                    color={puedeUsarIA ? "#a855f7" : (isDark ? "#475569" : "#cbd5e1")}
                  />
                }
                label="IA Chat"
                onPress={() => puedeUsarIA && executeAction(onPreguntarRutina)}
                isDark={isDark}
                disabled={!puedeUsarIA}
                tooltip={
                  !puedeUsarIA
                    ? `Añade al menos ${MIN_EJERCICIOS_PARA_IA} ejercicios`
                    : undefined
                }
              />
            </View>

            {haySeleccion && (
              <>
                <Text style={styles.sectionLabel}>SELECCIÓN</Text>
                <View style={styles.row}>
                  <MenuOption
                    icon={<Pencil size={18} color={iconColor} />}
                    label="Editar"
                    onPress={() => executeAction(onEditarSeleccion)}
                    isDark={isDark}
                  />
                  <MenuOption
                    disabled={!puedeSubir}
                    icon={
                      <Plus
                        size={18}
                        color={iconColor}
                        style={{ transform: [{ rotate: "180deg" }] }}
                      />
                    }
                    label="Subir"
                    onPress={() => executeAction(onSubirSeleccion)}
                    isDark={isDark}
                  />
                  <MenuOption
                    disabled={!puedeBajar}
                    icon={<Plus size={18} color={iconColor} />}
                    label="Bajar"
                    onPress={() => executeAction(onBajarSeleccion)}
                    isDark={isDark}
                  />
                  <MenuOption
                    icon={<Trash2 size={18} color="#ef4444" />}
                    label="Borrar"
                    onPress={() => executeAction(onEliminarSeleccion)}
                    isDark={isDark}
                  />
                </View>
              </>
            )}

            <Text style={styles.sectionLabel}>HERRAMIENTAS</Text>
            <View style={styles.row}>
              <MenuOption
                icon={<Cog size={18} color={iconColor} />}
                label="Copiar Día"
                onPress={() => executeAction(onCopiarDia)}
                isDark={isDark}
              />
              <MenuOption
                disabled={!puedePegar}
                icon={<Cog size={18} color={iconColor} />}
                label="Pegar"
                onPress={() => executeAction(onPegarAppend)}
                isDark={isDark}
              />
              <MenuOption
                icon={<Trash2 size={18} color="#ef4444" />}
                label="Vaciar"
                onPress={() => executeAction(onVaciar)}
                isDark={isDark}
              />
            </View>

            {/* Hint visible cuando la IA está bloqueada */}
            {!puedeUsarIA && (
              <Text style={[styles.iaHint, { color: textSecondary }]}>
                💡 Añade al menos {MIN_EJERCICIOS_PARA_IA} ejercicios a la rutina para activar el chat con IA.
              </Text>
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

function MenuOption({
  icon,
  label,
  onPress,
  isDark,
  disabled,
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isDark: boolean;
  disabled?: boolean;
  tooltip?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.optionBtn, { opacity: disabled ? 0.4 : 1 }]}
    >
      <View
        style={[
          styles.optionIcon,
          { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[styles.optionLabel, { color: isDark ? "#cbd5e1" : "#475569" }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 70,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 50,
  },
  mainFab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  secondaryFab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 26,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  optionBtn: {
    width: "22%",
    alignItems: "center",
    gap: 6,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  iaHint: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
});