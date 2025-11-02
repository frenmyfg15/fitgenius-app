// src/shared/components/rutina/ControlesCompuesto.tsx
import React from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import type { EjercicioVisualInfo } from "@/features/type/crearRutina";

type Props = {
  compuesto: { id: number; info: EjercicioVisualInfo }[];
  onCancelar: () => void;
  onConfirmar: () => void;
  onAnadir?: () => void; // ⬅️ nuevo prop
};

const ControlesCompuesto: React.FC<Props> = ({ compuesto, onCancelar, onConfirmar, onAnadir }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!compuesto || compuesto.length === 0) return null;

  const frameGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBg = isDark ? "rgba(20,28,44,0.92)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";

  return (
    <View
      style={{
        position: "absolute",
        inset: 0 as any,
        backgroundColor: "rgba(0,0,0,0.40)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        zIndex: 40
      }}
      accessibilityLabel="Ejercicio compuesto"
    >
      <LinearGradient
        colors={frameGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 1, width: "100%", maxWidth: 680 }}
      >
        <View
          style={{
            borderRadius: 24,
            overflow: "hidden",
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: cardBorder,
          }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: "800",
                color: textPrimary,
              }}
            >
              Ejercicio compuesto
            </Text>
            <Text
              style={{
                marginTop: 6,
                textAlign: "center",
                fontSize: 12,
                color: textSecondary,
              }}
            >
              Agrupa ejercicios para ejecutarlos de forma consecutiva (superseries, dropsets o circuitos).
            </Text>
          </View>

          {/* Grid ejercicios */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {compuesto.map((ej) => {
              const uri = `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${ej.info.idGif}.gif`;
              return (
                <View
                  key={ej.id}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f6f7f9",
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
                  }}
                  accessibilityLabel={ej.info.nombre}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                  {/* caption */}
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: isDark ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.85)",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 10, color: isDark ? "#cbd5e1" : "#334155", fontWeight: "600" }}
                    >
                      {ej.info.nombre}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer acciones */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 20,
              flexDirection: "row",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {/* ⬅️ NUEVO: botón añadir (icono plus) con el MISMO estilo que el de confirmar */}
            <LinearGradient
              colors={frameGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 1, borderRadius: 12 }}
            >
              <Pressable
                onPress={onAnadir}
                accessibilityRole="button"
                accessibilityLabel="Añadir ejercicio al compuesto"
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 11,
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                }}
              >
                <Text style={{ color: textPrimary, fontWeight: "800", fontSize: 14 }}>＋</Text>
              </Pressable>
            </LinearGradient>

            {/* Cancelar (ghost) */}
            <Pressable
              onPress={onCancelar}
              accessibilityRole="button"
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb",
              }}
            >
              <Text style={{ color: textPrimary, fontWeight: "700", fontSize: 14 }}>Cancelar</Text>
            </Pressable>

            {/* Confirmar con borde degradado (SIN CAMBIOS) */}
            <LinearGradient
              colors={frameGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 1, borderRadius: 12 }}
            >
              <Pressable
                onPress={onConfirmar}
                accessibilityRole="button"
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 11,
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                }}
              >
                <Text style={{ color: textPrimary, fontWeight: "800", fontSize: 14 }}>Confirmar</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default ControlesCompuesto;
