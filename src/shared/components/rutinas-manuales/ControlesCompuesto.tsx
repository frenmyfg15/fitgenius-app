// src/shared/components/rutinas-manuales/ControlesCompuesto.tsx
import React, { useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useColorScheme } from "nativewind";
import { Plus, CheckCircle2, X } from "lucide-react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { EjercicioVisualInfo } from "@/features/type/crearRutina";

type Props = {
  compuesto: { id: number; info: EjercicioVisualInfo }[];
  onCancelar: () => void;
  onConfirmar: () => void;
  onAnadir?: () => void;
  disabled?: boolean;
  confirmado?: boolean;
  onDismissed?: () => void;
};

const ControlesCompuesto: React.FC<Props> = ({
  compuesto,
  onCancelar,
  onConfirmar,
  onAnadir,
  disabled = false,
  confirmado = false,
  onDismissed,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["85%"], []);

  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#10b981" : "#059669";

  const shouldCancelRef = useRef(false);

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

  useEffect(() => {
    if (compuesto && compuesto.length > 0) {
      const id = requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
      });
      return () => cancelAnimationFrame(id);
    } else {
      shouldCancelRef.current = false;
      bottomSheetModalRef.current?.dismiss();
    }
  }, [compuesto?.length]);

  // ✅ Cuando el padre confirma → dismiss sin marcar shouldCancelRef
  useEffect(() => {
    if (!confirmado) return;
    shouldCancelRef.current = false;
    bottomSheetModalRef.current?.dismiss();
  }, [confirmado]);

  const close = useCallback(() => {
    shouldCancelRef.current = true;
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // ✅ confirmado es la fuente de verdad para distinguir
  // cierre por confirmación vs cierre por usuario
  const handleDismiss = useCallback(() => {
    if (confirmado) {
      // fue confirmación programática — nunca cancelar
      onDismissed?.();
      return;
    }
    if (shouldCancelRef.current) {
      shouldCancelRef.current = false;
      onCancelar();
      return;
    }
    // dismiss programático sin confirmación (ej: lista vaciada)
    onDismissed?.();
  }, [onCancelar, onDismissed, confirmado]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={handleDismiss}
      // ✅ onChange eliminado — era la fuente del bug
      // se marcaba shouldCancelRef=true con cualquier index=-1
      // incluyendo dismisses programáticos
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
      <BottomSheetView
        style={[
          styles.contentContainer,
          { paddingBottom: 24 + insets.bottom },
        ]}
      >
        <View style={styles.menuHeader}>
          <View>
            <Text style={[styles.menuTitle, { color: textPrimary }]}>
              Ejercicio Compuesto
            </Text>
            <Text style={styles.sectionLabel}>EJECUCIÓN CONSECUTIVA</Text>
          </View>

          <Pressable onPress={close} style={styles.closeBtn} hitSlop={10}>
            <X size={20} color={textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {compuesto.map((ej) => {
            const uri = `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${ej.info.idGif}.gif`;
            return (
              <View
                key={ej.id}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                    borderColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <Image
                  source={{ uri }}
                  style={styles.exerciseGif}
                  resizeMode="cover"
                />
                <View
                  style={[
                    styles.exerciseFooter,
                    {
                      backgroundColor: isDark
                        ? "rgba(15,23,42,0.8)"
                        : "rgba(255,255,255,0.8)",
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.exerciseName, { color: textPrimary }]}
                  >
                    {ej.info.nombre}
                  </Text>
                </View>
              </View>
            );
          })}

          {onAnadir && (
            <Pressable
              onPress={onAnadir}
              disabled={disabled}
              style={[
                styles.addCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "#f8fafc",
                },
              ]}
            >
              <Plus size={24} color={accentColor} />
              <Text style={[styles.addText, { color: accentColor }]}>
                Añadir
              </Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={{ marginTop: 16 }}>
          <Pressable
            onPress={onConfirmar}
            disabled={disabled}
            accessibilityRole="button"
            style={{
              borderRadius: 999,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              backgroundColor: accentColor,
            }}
          >
            <CheckCircle2 size={20} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#ffffff" }}>
              Confirmar
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 1,
    marginTop: 4,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  exerciseCard: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  exerciseGif: {
    width: "100%",
    height: "100%",
  },
  exerciseFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
  },
  exerciseName: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
  addCard: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addText: {
    fontSize: 10,
    fontWeight: "700",
  },
});

export default ControlesCompuesto;