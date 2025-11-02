// src/shared/components/rutina/FormularioCompuesto.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { X } from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";

export type TipoCompuesto = "SUPERSET" | "DROPSET" | "CIRCUITO";

type Props = {
  onCancel: () => void;
  onConfirm: (nombre: string, tipo: TipoCompuesto, descansoSeg: number) => void;
  editar?: boolean;
  nombreInicial?: string;
  tipoInicial?: TipoCompuesto;
  descansoInicial?: number;
};

const TIPOS: TipoCompuesto[] = ["SUPERSET", "DROPSET", "CIRCUITO"];

export default function FormularioCompuesto({
  onCancel,
  onConfirm,
  editar = false,
  nombreInicial = "",
  tipoInicial = "SUPERSET",
  descansoInicial = 60,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [nombre, setNombre] = useState(nombreInicial);
  const [tipo, setTipo] = useState<TipoCompuesto>(tipoInicial);
  const [descanso, setDescanso] = useState<number>(descansoInicial);

  useEffect(() => {
    setNombre(nombreInicial);
    setTipo(tipoInicial);
    setDescanso(descansoInicial);
  }, [nombreInicial, tipoInicial, descansoInicial]);

  const frameGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBg = isDark ? "rgba(20,28,44,0.85)" : "rgba(255,255,255,0.95)";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const inputBorder = isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb";

  const canSubmit = nombre.trim().length > 0;

  return (
    <View
      style={{
        position: "absolute",
        inset: 0 as any,
        backgroundColor: "rgba(0,0,0,0.40)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        zIndex: 40
      }}
      accessibilityViewIsModal
      accessibilityLabel="Formulario de ejercicio compuesto"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ width: "100%", maxWidth: 420 }}
      >
        {/* Marco degradado */}
        <LinearGradient
          colors={frameGradient as any}
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
              onPress={onCancel}
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
                fontSize: 18,
                fontWeight: "700",
                color: textPrimary,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              {editar ? "Editar compuesto" : "Nuevo compuesto"}
            </Text>

            {/* Campos */}
            <View style={{ marginTop: 14, gap: 12 }}>
              {/* Nombre */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Nombre del compuesto
                </Text>
                <TextInput
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: Superset Pecho y Tríceps"
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  style={{
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: inputBg,
                    color: textPrimary,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    fontSize: 14,
                  }}
                  accessibilityLabel="Nombre del compuesto"
                />
              </View>

              {/* Tipo */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Tipo de compuesto
                </Text>
                <View
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    backgroundColor: inputBg,
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

              {/* Descanso */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: textSecondary,
                    marginBottom: 6,
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
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  style={{
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: inputBg,
                    color: textPrimary,
                    borderWidth: 1,
                    borderColor: inputBorder,
                    fontSize: 14,
                  }}
                  accessibilityLabel="Descanso en segundos"
                />
              </View>
            </View>

            {/* CTA */}
            <View style={{ marginTop: 16 }}>
              <LinearGradient
                colors={frameGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 999, padding: 1 }}
              >
                <Pressable
                  onPress={() => {
                    if (!canSubmit) return;
                    onConfirm(nombre.trim(), tipo, descanso);
                  }}
                  disabled={!canSubmit}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canSubmit }}
                  style={{
                    borderRadius: 999,
                    paddingVertical: 12,
                    alignItems: "center",
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    opacity: canSubmit ? 1 : 0.6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: textPrimary,
                    }}
                  >
                    Confirmar y {editar ? "guardar cambios" : "añadir"}
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
