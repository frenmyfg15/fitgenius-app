// src/shared/components/rutinas-manuales/FormularioCompuesto.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useColorScheme } from "nativewind";
import { X } from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

export type TipoCompuesto = "SUPERSET" | "DROPSET" | "CIRCUITO";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (nombre: string, tipo: TipoCompuesto, descansoSeg: number) => void;
  editar?: boolean;
  nombreInicial?: string;
  tipoInicial?: TipoCompuesto;
  descansoInicial?: number;
};

const TIPOS: TipoCompuesto[] = ["SUPERSET", "DROPSET", "CIRCUITO"];

export default function FormularioCompuesto({
  visible,
  onCancel,
  onConfirm,
  editar = false,
  nombreInicial = "",
  tipoInicial = "SUPERSET",
  descansoInicial = 60,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  // ✅ Distingue cierre por confirmación vs cancelación
  const confirmedRef = useRef(false);

  const snapPoints = useMemo(() => ["100%"], []);
  const topInset = Math.max(insets.top, 12);

  useEffect(() => {
    if (visible) {
      confirmedRef.current = false;
      const id = requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
      });
      return () => cancelAnimationFrame(id);
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const [nombre, setNombre] = useState(nombreInicial);
  const [tipo, setTipo] = useState<TipoCompuesto>(tipoInicial);
  const [descanso, setDescanso] = useState<number>(descansoInicial);

  useEffect(() => {
    if (!visible) return;
    setNombre(nombreInicial);
    setTipo(tipoInicial);
    setDescanso(descansoInicial);
  }, [visible, nombreInicial, tipoInicial, descansoInicial]);

  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#10b981" : "#059669";
  const surface = isDark ? "#1e293b" : "#f1f5f9";
  const placeholderColor = isDark ? "#64748b" : "#94a3b8";

  const canSubmit = nombre.trim().length > 0;

  // ✅ X cancela explícitamente
  const closeSheet = useCallback(() => {
    confirmedRef.current = false;
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // ✅ onDismiss distingue confirmación vs cancelación
  const handleDismiss = useCallback(() => {
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return; // fue confirmación — el padre ya cerró con visible=false
    }
    onCancel();
  }, [onCancel]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableOverDrag={false}
      overDragResistanceFactor={0}
      topInset={topInset}
      style={{
        zIndex: 9999,
        ...(Platform.OS === "android" ? { elevation: 9999 } : null),
      }}
      containerStyle={{
        zIndex: 9999,
        ...(Platform.OS === "android" ? { elevation: 9999 } : null),
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#334155" : "#e2e8f0",
        width: 40,
      }}
      backgroundStyle={{
        backgroundColor: cardBg,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 20 + insets.bottom,
            paddingTop: 8,
          }}
        >
          <View style={{ paddingTop: 6 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: textPrimary,
                }}
              >
                {editar ? "Editar compuesto" : "Nuevo compuesto"}
              </Text>
              <Pressable onPress={closeSheet} hitSlop={10}>
                <X size={20} color={textSecondary} />
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: textSecondary,
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              CONFIGURACIÓN
            </Text>

            <View style={{ gap: 14 }}>
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Nombre del compuesto
                </Text>
                <TextInput
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: Superset Pecho y Tríceps"
                  placeholderTextColor={placeholderColor}
                  style={{
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: surface,
                    color: textPrimary,
                    fontSize: 14,
                  }}
                  accessibilityLabel="Nombre del compuesto"
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Tipo de compuesto
                </Text>
                <View
                  style={{
                    borderRadius: 16,
                    backgroundColor: surface,
                    overflow: "hidden",
                  }}
                >
                  <Picker
                    selectedValue={tipo}
                    onValueChange={(v) => setTipo(v as TipoCompuesto)}
                    dropdownIconColor={textSecondary}
                    style={{
                      height: 54,
                      color: textPrimary,
                    }}
                  >
                    {TIPOS.map((t) => (
                      <Picker.Item
                        key={t}
                        label={t}
                        value={t}
                        color={textPrimary}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Descanso entre bloques (segundos)
                </Text>
                <TextInput
                  value={String(descanso)}
                  onChangeText={(t) => {
                    const n = Number(t.replace(/[^\d]/g, ""));
                    setDescanso(Number.isFinite(n) ? n : 0);
                  }}
                  placeholder="60"
                  keyboardType="numeric"
                  placeholderTextColor={placeholderColor}
                  style={{
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: surface,
                    color: textPrimary,
                    fontSize: 14,
                  }}
                  accessibilityLabel="Descanso en segundos"
                />
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <Pressable
                onPress={() => {
                  if (!canSubmit) return;
                  // ✅ Marca confirmación ANTES de dismiss
                  confirmedRef.current = true;
                  onConfirm(nombre.trim(), tipo, descanso);
                  bottomSheetModalRef.current?.dismiss();
                }}
                disabled={!canSubmit}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmit }}
                style={{
                  borderRadius: 999,
                  paddingVertical: 12,
                  alignItems: "center",
                  backgroundColor: accentColor,
                  opacity: canSubmit ? 1 : 0.6,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: "#ffffff",
                  }}
                >
                  Confirmar y {editar ? "guardar cambios" : "añadir"}
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}