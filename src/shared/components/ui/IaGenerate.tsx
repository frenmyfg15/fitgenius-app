// IaGenerate.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Asterisk, Sparkles, Lock } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import CargaRutina from "./CargaRutina";
import { useIaGenerate } from "@/shared/hooks/useIaGenerate";

/* ---------------- Paleta y glass compartida (igual que en otras cards) ---------------- */
const marcoGradient = [
  "rgb(0,255,64)",
  "rgb(94,230,157)",
  "rgb(178,0,255)",
] as const;
const cardBgDarkA = "rgba(20,28,44,0.85)";
const cardBgDarkB = "rgba(9,14,24,0.9)";
const cardBorderDark = "rgba(255,255,255,0.08)";
const textPrimaryDark = "#e5e7eb";
const textSecondaryDark = "#94a3b8";

/* ---------------- Tipos ---------------- */
type Props = { onCreate?: () => void };

/* ---------------- Componente ---------------- */
export default function IaGenerate({ onCreate }: Props) {
  const navigation = useNavigation<any>();

  const {
    loading,
    showModal,
    nombre,
    instruccion,
    maxNombre,
    maxInstr,
    nombreLen,
    instrLen,
    suggestionChips,
    isDark,
    lockedByPlan,
    abrirModal,
    cerrarModal,
    crear,
    handleChangeNombre,
    handleChangeInstruccion,
    setInstruccion,
  } = useIaGenerate(onCreate);

  const handlePressMain = () => {
    if (lockedByPlan) {
      // Ir al tab Perfil → pantalla de pago
      (navigation as any).navigate("Perfil", {
        screen: "PremiumPayment",
      });
      return;
    }
    abrirModal();
  };

  return (
    <>
      {/* Botón principal */}
      <View className="relative inline-block self-center items-center">
        <LinearGradient
          colors={marcoGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-[1px] shadow-xl"
          style={{ borderRadius: 15 }}
        >
          {isDark ? (
            <LinearGradient
              colors={[cardBgDarkA, cardBgDarkB, cardBgDarkA]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 15,
                borderWidth: 1,
                borderColor: cardBorderDark,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={handlePressMain}
                disabled={loading}
                accessibilityRole="button"
                accessibilityState={{ disabled: loading }}
                className="px-4 py-2 rounded-2xl flex-row items-center gap-2 active:opacity-90"
              >
                {lockedByPlan && (
                  <Lock
                    size={16}
                    color="#facc15"
                    strokeWidth={2.2}
                    style={{ marginRight: 2 }}
                  />
                )}
                <Sparkles size={16} color={"#fff"} />
                <Text
                  style={{
                    color: textPrimaryDark,
                    fontWeight: "600",
                  }}
                >
                  {lockedByPlan ? "Desbloquear IA" : "Generar con IA"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <View
              className="rounded-2xl"
              style={{
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={handlePressMain}
                disabled={loading}
                accessibilityRole="button"
                accessibilityState={{ disabled: loading }}
                className="px-4 py-2 rounded-2xl flex-row items-center gap-2 active:opacity-90"
              >
                {lockedByPlan && (
                  <Lock
                    size={16}
                    color="#d97706"
                    strokeWidth={2.2}
                    style={{ marginRight: 2 }}
                  />
                )}
                <Sparkles size={16} color="#0f172a" />
                <Text
                  style={{
                    color: "#0f172a",
                    fontWeight: "600",
                  }}
                >
                  {lockedByPlan ? "Desbloquear IA" : "Generar con IA"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Modal configuración IA */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={cerrarModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={cerrarModal}
            className="flex-1 items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            {/* Contenido del modal */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              className="w-full max-w-[640px]"
            >
              <LinearGradient
                colors={marcoGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-3xl p-[1px] shadow-2xl"
                style={{ borderRadius: 15 }}
              >
                {isDark ? (
                  <LinearGradient
                    colors={[cardBgDarkA, cardBgDarkB, cardBgDarkA]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 15,
                      borderWidth: 1,
                      borderColor: cardBorderDark,
                      overflow: "hidden",
                    }}
                  >
                    <ModalInner
                      isDark
                      nombre={nombre}
                      nombreLen={nombreLen}
                      maxNombre={maxNombre}
                      instruccion={instruccion}
                      instrLen={instrLen}
                      maxInstr={maxInstr}
                      suggestionChips={suggestionChips}
                      crear={crear}
                      cerrarModal={cerrarModal}
                      loading={loading}
                      onChangeNombre={handleChangeNombre}
                      onChangeInstruccion={handleChangeInstruccion}
                      setInstruccion={setInstruccion}
                    />
                  </LinearGradient>
                ) : (
                  <View
                    className="rounded-3xl"
                    style={{
                      backgroundColor: "#ffffff",
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <ModalInner
                      isDark={false}
                      nombre={nombre}
                      nombreLen={nombreLen}
                      maxNombre={maxNombre}
                      instruccion={instruccion}
                      instrLen={instrLen}
                      maxInstr={maxInstr}
                      suggestionChips={suggestionChips}
                      crear={crear}
                      cerrarModal={cerrarModal}
                      loading={loading}
                      onChangeNombre={handleChangeNombre}
                      onChangeInstruccion={handleChangeInstruccion}
                      setInstruccion={setInstruccion}
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Spinner de generación */}
      {loading && (
        <Modal visible={loading} transparent animationType="fade">
          <CargaRutina />
        </Modal>
      )}
    </>
  );
}

/* ---------------- Sub-componentes ---------------- */
function ModalInner({
  isDark,
  nombre,
  nombreLen,
  maxNombre,
  instruccion,
  instrLen,
  maxInstr,
  suggestionChips,
  crear,
  cerrarModal,
  loading,
  onChangeNombre,
  onChangeInstruccion,
  setInstruccion,
}: {
  isDark: boolean;
  nombre: string;
  nombreLen: number;
  maxNombre: number;
  instruccion: string;
  instrLen: number;
  maxInstr: number;
  suggestionChips: string[];
  crear: () => Promise<void> | void;
  cerrarModal: () => void;
  loading: boolean;
  onChangeNombre: (t: string) => void;
  onChangeInstruccion: (t: string) => void;
  setInstruccion: (updater: string | ((prev: string) => string)) => void;
}) {
  return (
    <View className="rounded-3xl overflow-hidden">
      {/* Header */}
      <View
        className="px-6 pt-6 pb-4 border-b"
        style={{
          borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              className="text-xl font-semibold"
              style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
              accessibilityRole="header"
            >
              Configura tu rutina con IA
            </Text>
            <Text
              className="text-xs mt-1"
              style={{
                color: isDark ? textSecondaryDark : "#64748b",
              }}
            >
              Dale un nombre y añade instrucciones para personalizarla.
            </Text>
          </View>
          <TouchableOpacity
            onPress={cerrarModal}
            accessibilityLabel="Cerrar"
            className="h-9 w-9 items-center justify-center rounded-xl"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "#ffffff",
              borderWidth: 1,
              borderColor: isDark
                ? cardBorderDark
                : "rgba(0,0,0,0.06)",
            }}
          >
            <Text
              style={{
                color: isDark ? textPrimaryDark : "#0f172a",
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      <ScrollView
        className="px-6 py-5"
        keyboardShouldPersistTaps="handled"
      >
        {/* Nombre */}
        <View>
          <View className="flex-row items-center mb-1">
            <Text
              className="text-sm font-medium mr-1"
              style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
            >
              Nombre de la rutina
            </Text>
            <Asterisk
              size={12}
              color={isDark ? "#ef4444" : "#dc2626"}
              strokeWidth={2.5}
              style={{ marginTop: 1 }}
              accessibilityLabel="Campo obligatorio"
            />
          </View>

          <View className="mb-2">
            <TextInput
              value={nombre}
              onChangeText={onChangeNombre}
              placeholder="Ej: Push/Pull/Legs 8 semanas"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              editable={!loading}
              className="w-full px-3.5 py-2.5 rounded-xl text-[15px]"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "#ffffff",
                borderWidth: 1,
                borderColor: isDark
                  ? cardBorderDark
                  : "rgba(0,0,0,0.06)",
                color: isDark ? textPrimaryDark : "#0f172a",
              }}
              maxLength={maxNombre}
            />

            <View className="mt-1.5 flex-row items-center justify-between">
              <Text
                className="text-[11px] flex-1 pr-2"
                style={{
                  color: isDark ? textSecondaryDark : "#64748b",
                }}
              >
                Tu rutina se llamará{" "}
                <Text
                  style={{
                    color: isDark ? textPrimaryDark : "#0f172a",
                    fontWeight: "600",
                  }}
                >
                  {nombre || "—"}
                </Text>
              </Text>
              <Text
                className="text-[11px]"
                style={{
                  color: isDark ? textSecondaryDark : "#64748b",
                }}
              >
                {nombreLen}/{maxNombre}
              </Text>
            </View>
          </View>
        </View>

        {/* Instrucciones */}
        <Text
          className="text-sm font-medium mt-3 mb-1"
          style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
        >
          Instrucciones para la IA (opcional)
        </Text>
        <View>
          <TextInput
            value={instruccion}
            onChangeText={onChangeInstruccion}
            placeholder="Cuéntanos días, material, objetivos…"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            multiline
            textAlignVertical="top"
            editable={!loading}
            className="w-full min-h-[130px] px-3.5 py-2.5 rounded-xl text-[14px] leading-6"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "#ffffff",
              borderWidth: 1,
              borderColor: isDark
                ? cardBorderDark
                : "rgba(0,0,0,0.06)",
              color: isDark ? textPrimaryDark : "#0f172a",
            }}
            maxLength={maxInstr}
          />
          <View className="mt-1.5 flex-row items-center justify-between">
            <Text
              className="text-[11px]"
              style={{
                color: isDark ? textSecondaryDark : "#64748b",
              }}
            >
              Cuanta más info des (días, material, objetivos), mejor.
            </Text>
            <Text
              className="text-[11px]"
              style={{
                color: isDark ? textSecondaryDark : "#64748b",
              }}
            >
              {instrLen}/{maxInstr}
            </Text>
          </View>
        </View>

        {/* Sugerencias rápidas */}
        <View className="mt-4 flex-row flex-wrap gap-2">
          {suggestionChips.map((s) => (
            <TouchableOpacity
              key={s}
              //@ts-ignore
              onPress={() =>
                setInstruccion((prev) =>
                  prev
                    ? `${prev}${prev.endsWith("\n") ? "" : "\n"}${s}`
                    : s
                )
              }
              className="px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "#f8fafc",
                borderWidth: 1,
                borderColor: isDark
                  ? cardBorderDark
                  : "rgba(0,0,0,0.06)",
              }}
            >
              <Text
                className="text-xs"
                style={{
                  color: isDark ? textPrimaryDark : "#0f172a",
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-6 pt-1 flex-row items-center justify-end gap-3">
        <TouchableOpacity
          onPress={cerrarModal}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl"
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "#ffffff",
            borderWidth: 1,
            borderColor: isDark
              ? cardBorderDark
              : "rgba(0,0,0,0.06)",
          }}
        >
          <Text
            className="text-sm font-medium"
            style={{
              color: isDark ? textPrimaryDark : "#0f172a",
            }}
          >
            Cancelar
          </Text>
        </TouchableOpacity>

        <LinearGradient
          colors={
            !nombre.trim()
              ? [
                  "rgba(20,28,44,0.55)",
                  "rgba(9,14,24,0.55)",
                  "rgba(20,28,44,0.55)",
                ]
              : (marcoGradient as any)
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-xl p-[1px]"
          style={{ borderRadius: 15 }}
        >
          {isDark ? (
            <LinearGradient
              colors={
                !nombre.trim()
                  ? [
                      "rgba(20,28,44,0.55)",
                      "rgba(9,14,24,0.55)",
                      "rgba(20,28,44,0.55)",
                    ]
                  : [cardBgDarkA, cardBgDarkB, cardBgDarkA]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 15,
                borderWidth: 1,
                borderColor: cardBorderDark,
                overflow: "hidden",
                opacity: !nombre.trim() ? 0.6 : 1,
              }}
            >
              <TouchableOpacity
                onPress={crear}
                disabled={loading || !nombre.trim()}
                accessibilityState={{
                  disabled: loading || !nombre.trim(),
                }}
                className="px-4 py-2.5 rounded-[11px] items-center justify-center"
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: !nombre.trim()
                      ? "rgba(229,231,235,0.6)"
                      : textPrimaryDark,
                  }}
                >
                  {loading ? "Generando…" : "Confirmar y generar"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <View
              className="rounded-xl"
              style={{
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={crear}
                disabled={loading || !nombre.trim()}
                accessibilityState={{
                  disabled: loading || !nombre.trim(),
                }}
                className="px-4 py-2.5 rounded-[11px] items-center justify-center"
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: "#0f172a" }}
                >
                  {loading ? "Generando…" : "Confirmar y generar"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );
}
