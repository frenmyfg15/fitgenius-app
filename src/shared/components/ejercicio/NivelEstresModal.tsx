import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";

type Props = {
  visible: boolean;
  nivelEstres: number | null;
  onChangeNivelEstres: (valor: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
};

const getLabelForLevel = (n: number | null) => {
  if (!n) return "Selecciona un nivel";
  if (n <= 3) return "Muy fácil";
  if (n <= 5) return "Cómodo";
  if (n <= 7) return "Exigente";
  if (n <= 9) return "Muy duro";
  return "Extremadamente duro";
};

const getColor = (n: number | null) => {
  if (!n) return "#6b7280";
  if (n <= 3) return "#22C55E";
  if (n <= 6) return "#A3E635";
  if (n <= 8) return "#F97316";
  return "#EF4444";
};

const bordeGradient = [
  "rgb(0,255,64)",
  "rgb(94,230,157)",
  "rgb(178,0,255)",
];

const NivelEstresModal: React.FC<Props> = ({
  visible,
  nivelEstres,
  onChangeNivelEstres,
  onConfirm,
  onClose,
  loading = false,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const accent = getColor(nivelEstres);
  const label = getLabelForLevel(nivelEstres);

  const bg = isDark ? "rgba(17,25,40,0.92)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const text = isDark ? "#e5e7eb" : "#0f172a";
  const muted = isDark ? "#9ca3af" : "#6b7280";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* Bloquea cierre interno */}
        <Pressable onPress={() => {}} style={{ width: "100%", maxWidth: 420 }}>
          <LinearGradient
            colors={bordeGradient as any}
            style={{ padding: 1.5, borderRadius: 20 }}
          >
            <View
              style={{
                backgroundColor: bg,
                borderRadius: 18,
                padding: 18,
                borderWidth: 1,
                borderColor: border,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: text,
                    }}
                  >
                    Nivel de esfuerzo percibido
                  </Text>
                  <Text style={{ fontSize: 12, marginTop: 2, color: muted }}>
                    ¿Qué tan duro ha sido este ejercicio?
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={10}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.05)",
                  }}
                >
                  <X size={18} color={muted} />
                </TouchableOpacity>
              </View>

              {/* Valor */}
              <View style={{ alignItems: "center", marginBottom: 18 }}>
                <Text
                  style={{
                    fontSize: 42,
                    fontWeight: "800",
                    color: accent,
                    letterSpacing: -1,
                  }}
                >
                  {nivelEstres ?? "--"}
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 6,
                    color: muted,
                    fontWeight: "600",
                  }}
                >
                  {label}
                </Text>
              </View>

              {/* Escala */}
              <View
                style={{
                  marginBottom: 20,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
                  borderRadius: 999,
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  {Array.from({ length: 10 }).map((_, i) => {
                    const v = i + 1;
                    const selected = v === nivelEstres;

                    return (
                      <TouchableOpacity
                        key={v}
                        onPress={() => onChangeNivelEstres(v)}
                        style={{
                          flex: 1,
                          alignItems: "center",
                        }}
                        activeOpacity={0.8}
                      >
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 999,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: selected ? accent : "transparent",
                            borderWidth: selected ? 0 : 1,
                            borderColor: isDark
                              ? "rgba(255,255,255,0.15)"
                              : "rgba(0,0,0,0.15)",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "700",
                              color: selected
                                ? "#0f172a"
                                : isDark
                                ? "#e5e7eb"
                                : "#374151",
                            }}
                          >
                            {v}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* CTA */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Text style={{ flex: 1, fontSize: 11, color: muted }}>
                  Esta información nos ayudará a adaptar tus cargas en futuros
                  entrenos.
                </Text>

                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={loading || !nivelEstres}
                  style={{
                    backgroundColor: accent,
                    borderRadius: 999,
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    opacity: loading || !nivelEstres ? 0.5 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                  activeOpacity={0.9}
                >
                  {loading && <ActivityIndicator size="small" color="#0f172a" />}
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default NivelEstresModal;
