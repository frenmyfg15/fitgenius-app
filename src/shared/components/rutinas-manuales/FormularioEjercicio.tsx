// src/shared/components/rutina/FormularioEjercicio.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { X } from "lucide-react-native";
import { z } from "zod";

/* -------------------- Tipos -------------------- */
export type EjercicioAsignadoInput = {
  ejercicioId: number;
  orden: number;
  seriesSugeridas: number;
  repeticionesSugeridas: number;
  pesoSugerido: number;
  descansoSeg: number;
  notaIA: string;
};

type Props = {
  ejercicioId: number;
  orden?: number; // para edición
  onConfirm: (data: EjercicioAsignadoInput) => void;
  onClose: () => void; // (renombrado desde onClick)
  esParteDeCompuesto?: boolean;
};

type FormErrors = Partial<
  Record<
    "seriesSugeridas" | "repeticionesSugeridas" | "pesoSugerido" | "descansoSeg",
    string
  >
>;

/* -------------------- Componente -------------------- */
export default function FormularioEjercicio({
  ejercicioId,
  orden,
  onConfirm,
  onClose,
  esParteDeCompuesto,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [seriesSugeridas, setSeries] = useState<string>("");
  const [repeticionesSugeridas, setReps] = useState<string>("");
  const [pesoSugerido, setPeso] = useState<string>("");
  const [descansoSeg, setDescanso] = useState<string>("");
  const [notaIA, setNota] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});

  // 🎛️ Paleta y “glass”
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBg = isDark ? "rgba(20,28,44,0.85)" : "rgba(255,255,255,0.95)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const inputBorder = isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb";

  // Esquema (descanso opcional cuando es compuesto)
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
    const n = Number(s);
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

    onConfirm({
      ejercicioId,
      orden: orden ?? 0,
      seriesSugeridas: Number(seriesSugeridas),
      repeticionesSugeridas: Number(repeticionesSugeridas),
      pesoSugerido: Number(pesoSugerido),
      descansoSeg: esParteDeCompuesto ? 0 : Number(descansoSeg),
      notaIA,
    });
  };

  return (
    <View
      style={{
        position: "absolute",
        inset: 0 as any,
        backgroundColor: "rgba(0,0,0,0.40)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        zIndex: 100
      }}
      accessibilityViewIsModal
      accessibilityLabel="Formulario de ejercicio"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ width: "100%", maxWidth: 520 }}
      >
        {/* Marco degradado */}
        <LinearGradient
          colors={marcoGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 1 }}
        >
          {/* Panel interior */}
          <View
            style={{
              borderRadius: 16,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: cardBorder,
              padding: 16,
              position: "relative",
            }}
          >
            {/* Cerrar */}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                height: 32,
                width: 32,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "rgba(148,163,184,0.18)" : "#f1f5f9",
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
              }}
            >
              <X size={18} color={textSecondary} />
            </Pressable>

            {/* Título */}
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: "700",
                color: textPrimary,
                marginBottom: 8,
              }}
            >
              Completa detalles
            </Text>

            {/* Grid inputs */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {/* Series */}
              <Field
                label="Series"
                value={seriesSugeridas}
                onChangeText={(t) => {
                  setSeries(t.replace(/[^\d]/g, ""));
                  if (t !== "") clearError("seriesSugeridas");
                }}
                placeholder="Ej: 3"
                error={errors.seriesSugeridas}
                inputBg={inputBg}
                inputBorder={inputBorder}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                keyboardType="numeric"
                isDark={isDark}
              />
              {/* Repeticiones */}
              <Field
                label="Repeticiones"
                value={repeticionesSugeridas}
                onChangeText={(t) => {
                  setReps(t.replace(/[^\d]/g, ""));
                  if (t !== "") clearError("repeticionesSugeridas");
                }}
                placeholder="Ej: 10"
                error={errors.repeticionesSugeridas}
                inputBg={inputBg}
                inputBorder={inputBorder}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                keyboardType="numeric"
                isDark={isDark}
              />
              {/* Peso */}
              <Field
                label="Peso (kg)"
                value={pesoSugerido}
                onChangeText={(t) => {
                  setPeso(t.replace(/[^\d.]/g, ""));
                  if (t !== "") clearError("pesoSugerido");
                }}
                placeholder="Ej: 50"
                error={errors.pesoSugerido}
                inputBg={inputBg}
                inputBorder={inputBorder}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                keyboardType="decimal-pad"
                isDark={isDark}
              />
              {/* Descanso (si NO es compuesto) */}
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
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  keyboardType="numeric"
                  isDark={isDark}
                />
              )}
            </View>

            {/* Notas */}
            <View style={{ marginTop: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: textSecondary,
                  marginBottom: 6,
                }}
              >
                Notas (opcional)
              </Text>
              <TextInput
                value={notaIA}
                onChangeText={setNota}
                placeholder="Añade detalles o consideraciones especiales..."
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                multiline
                numberOfLines={3}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: inputBg,
                  color: textPrimary,
                  borderWidth: 1,
                  borderColor: inputBorder,
                  fontSize: 14,
                  minHeight: 90,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* CTA */}
            <View style={{ marginTop: 16 }}>
              <LinearGradient
                colors={marcoGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 999, padding: 1 }}
              >
                <Pressable
                  onPress={handleConfirm}
                  accessibilityRole="button"
                  style={{
                    borderRadius: 999,
                    paddingVertical: 12,
                    alignItems: "center",
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: textPrimary,
                    }}
                  >
                    Confirmar y {orden ? "guardar cambios" : "añadir"}
                  </Text>
                </Pressable>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </View>
  );
}

/* -------------------- Subcomponente Field -------------------- */
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  inputBg,
  inputBorder,
  textPrimary,
  textSecondary,
  keyboardType,
  isDark,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
  inputBg: string;
  inputBorder: string;
  textPrimary: string;
  textSecondary: string;
  keyboardType?: "numeric" | "decimal-pad" | "default";
  isDark: boolean;
}) {
  return (
    <View style={{ flexBasis: "48%", flexGrow: 1 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: textSecondary,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        keyboardType={keyboardType}
        style={{
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: inputBg,
          color: textPrimary,
          borderWidth: 1,
          borderColor: error ? "#ef4444" : inputBorder,
          fontSize: 14,
        }}
      />
      {error ? (
        <Text style={{ marginTop: 4, fontSize: 11, color: "#ef4444" }}>{error}</Text>
      ) : null}
    </View>
  );
}
