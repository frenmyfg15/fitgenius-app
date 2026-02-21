import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useColorScheme } from "nativewind";
import { X } from "lucide-react-native";
import { z } from "zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (nombre: string, descripcion?: string) => void;
  nombreInicial?: string;
  descripcionInicial?: string;
  onNombreInput?: (v: string) => void;
  onDescripcionInput?: (v: string) => void;
};

const schema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
});

export default function FormularioNombreRutina({
  visible,
  onCancel,
  onConfirm,
  nombreInicial = "",
  descripcionInicial = "",
  onNombreInput,
  onDescripcionInput,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["45%", "75%"], []);
  const topInset = Math.max(insets.top, 12);

  const [nombre, setNombre] = useState(nombreInicial);
  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [errors, setErrors] = useState<{ nombre?: string; descripcion?: string }>({});

  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#10b981" : "#059669";
  const surface = isDark ? "#1e293b" : "#f1f5f9";
  const placeholderColor = isDark ? "#64748b" : "#94a3b8";

  useEffect(() => {
    if (visible) {
      setNombre(nombreInicial);
      setDescripcion(descripcionInicial);
      setErrors({});
      const id = requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
      });
      return () => cancelAnimationFrame(id);
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, nombreInicial, descripcionInicial]);

  const confirmar = () => {
    const parsed = schema.safeParse({ nombre, descripcion });
    if (!parsed.success) {
      const fieldErrs: { nombre?: string; descripcion?: string } = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as "nombre" | "descripcion";
        if (!fieldErrs[k]) fieldErrs[k] = i.message;
      });
      setErrors(fieldErrs);
      return;
    }
    setErrors({});
    onConfirm(parsed.data.nombre.trim(), parsed.data.descripcion?.trim() || undefined);
  };

  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

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
      onDismiss={onCancel}
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
            paddingBottom: 40 + insets.bottom,
            paddingTop: 8,
          }}
        >
          <View style={{ paddingTop: 6 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: textPrimary,
                }}
              >
                Guardar Rutina
              </Text>
              <Pressable onPress={closeSheet} hitSlop={10}>
                <X size={20} color={textSecondary} />
              </Pressable>
            </View>

            <View style={{ gap: 16 }}>
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: textSecondary,
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  NOMBRE DE LA RUTINA
                </Text>
                <TextInput
                  value={nombre}
                  onChangeText={(v) => {
                    setNombre(v);
                    onNombreInput?.(v);
                    if (errors.nombre) setErrors((p) => ({ ...p, nombre: undefined }));
                  }}
                  placeholder="Ej. Push/Pull Legs"
                  placeholderTextColor={placeholderColor}
                  style={{
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: surface,
                    color: textPrimary,
                    fontSize: 14,
                  }}
                />
                {errors.nombre && (
                  <Text style={{ marginTop: 6, fontSize: 11, color: "#ef4444" }}>
                    {errors.nombre}
                  </Text>
                )}
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: textSecondary,
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  DESCRIPCIÓN (OPCIONAL)
                </Text>
                <TextInput
                  value={descripcion}
                  onChangeText={(v) => {
                    setDescripcion(v);
                    onDescripcionInput?.(v);
                  }}
                  placeholder="Describe el objetivo..."
                  placeholderTextColor={placeholderColor}
                  multiline
                  numberOfLines={3}
                  style={{
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: surface,
                    color: textPrimary,
                    fontSize: 14,
                    minHeight: 96,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              <View style={{ marginTop: 8 }}>
                <Pressable
                  onPress={confirmar}
                  style={{
                    borderRadius: 999,
                    paddingVertical: 14,
                    alignItems: "center",
                    backgroundColor: accentColor,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: "#ffffff",
                    }}
                  >
                    Confirmar y guardar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}