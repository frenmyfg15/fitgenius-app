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
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { kgToLb } from "@/shared/utils/kgToLb";
import { lbToKg } from "@/shared/utils/lbToKg";

export type EjercicioAsignadoInput = {
  ejercicioId: number;
  orden: number;
  seriesSugeridas: number;
  repeticionesSugeridas: number;
  pesoSugerido: number;
  descansoSeg: number;
  notaIA: string;
};

type InitialValues = Partial<
  Pick<
    EjercicioAsignadoInput,
    | "seriesSugeridas"
    | "repeticionesSugeridas"
    | "pesoSugerido"
    | "descansoSeg"
    | "notaIA"
    | "orden"
  >
>;

type Props = {
  visible: boolean;
  ejercicioId: number;
  orden?: number;
  initialValues?: InitialValues;
  onConfirm: (data: EjercicioAsignadoInput) => void;
  onClose: () => void;
  esParteDeCompuesto?: boolean;
  esCardio?: boolean;
};

type FormErrors = Partial<
  Record<
    "seriesSugeridas" | "repeticionesSugeridas" | "pesoSugerido" | "descansoSeg",
    string
  >
>;

export default function FormularioEjercicio({
  visible,
  ejercicioId,
  orden,
  initialValues,
  onConfirm,
  onClose,
  esParteDeCompuesto,
  esCardio,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const usuario = useUsuarioStore((s) => s.usuario);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const weightUnit = (usuario?.medidaPeso ?? "KG").toUpperCase();
  const isLbUnit = weightUnit === "LB";

  const snapPoints = useMemo(() => ["100%"], []);
  const topInset = Math.max(insets.top, 12);

  useEffect(() => {
    if (visible) {
      const id = requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
      });
      return () => cancelAnimationFrame(id);
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const [seriesSugeridas, setSeries] = useState<string>("");
  const [repeticionesSugeridas, setReps] = useState<string>("");
  const [pesoSugerido, setPeso] = useState<string>("");
  const [descansoSeg, setDescanso] = useState<string>("");
  const [notaIA, setNota] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!visible) return;

    const v = initialValues ?? {};
    setSeries(
      typeof v.seriesSugeridas === "number" ? String(v.seriesSugeridas) : ""
    );
    setReps(
      typeof v.repeticionesSugeridas === "number"
        ? String(v.repeticionesSugeridas)
        : ""
    );
    setPeso(
      typeof v.pesoSugerido === "number"
        ? isLbUnit
          ? String(kgToLb(v.pesoSugerido).replace(/\s*lb$/i, ""))
          : String(v.pesoSugerido)
        : ""
    );
    setDescanso(
      typeof v.descansoSeg === "number" ? String(v.descansoSeg) : ""
    );
    setNota(typeof v.notaIA === "string" ? v.notaIA : "");
    setErrors({});
  }, [visible, ejercicioId, initialValues, isLbUnit]);

  const isCardioLocal = Boolean(esCardio);

  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const accentColor = isDark ? "#10b981" : "#059669";
  const surface = isDark ? "#1e293b" : "#f1f5f9";
  const placeholderColor = isDark ? "#64748b" : "#94a3b8";

  const schema = z.object({
    seriesSugeridas: z
      .number({ required_error: "Ingresa el número de series" })
      .min(1, "Debe ser al menos 1"),
    repeticionesSugeridas: z
      .number({ required_error: "Ingresa las repeticiones" })
      .min(1, "Debe ser al menos 1"),
    pesoSugerido: z
      .number({ required_error: "Ingresa el peso" })
      .min(0, "No puede ser negativo"),
    descansoSeg: esParteDeCompuesto
      ? z.number().optional()
      : z
        .number({ required_error: "Ingresa el descanso" })
        .min(0, "No puede ser negativo"),
  });

  const clearError = (k: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [k]: undefined }));

  const toNumber = (s: string): number | undefined => {
    if (s.trim() === "") return undefined;
    const normalized = s.replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleConfirm = () => {
    const parsed = schema.safeParse({
      seriesSugeridas: toNumber(seriesSugeridas),
      repeticionesSugeridas: toNumber(repeticionesSugeridas),
      pesoSugerido: toNumber(pesoSugerido),
      descansoSeg: esParteDeCompuesto ? undefined : toNumber(descansoSeg),
    });

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const pesoSugeridoKg = isLbUnit
      ? lbToKg(parsed.data.pesoSugerido)
      : parsed.data.pesoSugerido;

    onConfirm({
      ejercicioId,
      orden: orden ?? initialValues?.orden ?? 0,
      seriesSugeridas: parsed.data.seriesSugeridas,
      repeticionesSugeridas: parsed.data.repeticionesSugeridas,
      pesoSugerido: pesoSugeridoKg,
      descansoSeg: esParteDeCompuesto ? 0 : (parsed.data.descansoSeg ?? 0),
      notaIA,
    });

    bottomSheetModalRef.current?.dismiss();
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
      onDismiss={onClose}
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
                Completa detalles
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

            <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
              <Field
                label="Series"
                value={seriesSugeridas}
                onChangeText={(t) => {
                  setSeries(t.replace(/[^\d]/g, ""));
                  if (t !== "") clearError("seriesSugeridas");
                }}
                placeholder="Ej: 3"
                error={errors.seriesSugeridas}
                surface={surface}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                placeholderColor={placeholderColor}
                keyboardType="numeric"
              />

              <Field
                label={isCardioLocal ? "Tiempo (seg)" : "Repeticiones"}
                value={repeticionesSugeridas}
                onChangeText={(t) => {
                  setReps(t.replace(/[^\d]/g, ""));
                  if (t !== "") clearError("repeticionesSugeridas");
                }}
                placeholder={isCardioLocal ? "Ej: 30" : "Ej: 10"}
                error={errors.repeticionesSugeridas}
                surface={surface}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                placeholderColor={placeholderColor}
                keyboardType="numeric"
              />

              <Field
                label={`Peso (${isLbUnit ? "lb" : "kg"})`}
                value={pesoSugerido}
                onChangeText={(t) => {
                  setPeso(t.replace(/[^\d.,]/g, "").replace(",", "."));
                  if (t !== "") clearError("pesoSugerido");
                }}
                placeholder={isLbUnit ? "Ej: 110" : "Ej: 50"}
                error={errors.pesoSugerido}
                surface={surface}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                placeholderColor={placeholderColor}
                keyboardType="decimal-pad"
              />

              {!esParteDeCompuesto && (
                <Field
                  label="Descanso (seg)"
                  value={descansoSeg}
                  onChangeText={(t) => {
                    setDescanso(t.replace(/[^\d]/g, ""));
                    if (t !== "") clearError("descansoSeg");
                  }}
                  placeholder="Ej: 60"
                  error={errors.descansoSeg}
                  surface={surface}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  placeholderColor={placeholderColor}
                  keyboardType="numeric"
                />
              )}
            </View>

            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: textSecondary,
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                NOTAS
              </Text>

              <TextInput
                value={notaIA}
                onChangeText={setNota}
                placeholder="Añade detalles o consideraciones especiales..."
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

            <View style={{ marginTop: 16 }}>
              <Pressable
                onPress={handleConfirm}
                accessibilityRole="button"
                style={{
                  borderRadius: 999,
                  paddingVertical: 12,
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
                  Confirmar y {orden ?? initialValues?.orden ? "guardar cambios" : "añadir"}
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  surface,
  textPrimary,
  textSecondary,
  placeholderColor,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  placeholderColor: string;
  keyboardType?: "numeric" | "decimal-pad" | "default";
}) {
  return (
    <View style={{ flexBasis: "48%", flexGrow: 1 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: textSecondary,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        keyboardType={keyboardType}
        style={{
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: surface,
          color: textPrimary,
          fontSize: 14,
        }}
      />
      {error ? (
        <Text style={{ marginTop: 6, fontSize: 11, color: "#ef4444" }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}