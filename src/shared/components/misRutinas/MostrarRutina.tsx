// src/shared/components/misRutinas/MostrarRutina.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import {
  X,
  EllipsisVertical,
  Trash2,
  Pencil,
  Dumbbell,
  Loader2,
} from "lucide-react-native";

import type { Rutina } from "@/features/type/rutinas";
import Ejercicios from "../ui/Ejercicios";
import Dias from "../ui/Dias";
import { OptionsMenu } from "./OptionsMenu";
import { useRutinaViewer } from "@/shared/hooks/useRutinaViewer";
import { HeaderBar } from "./HeaderBar";
import { ConfirmDialog } from "./ConfirmDialog";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  rutinas: Rutina;
  setVer: (v: boolean) => void;
  onDelete: () => void;
};

type ActionLoading = "edit" | "use" | null;

export default function MostrarRutina({ rutinas, setVer, onDelete }: Props) {
  const {
    // tema
    bg,
    border,
    textTitle,
    textMuted,
    surface,
    // estado
    dias,
    day,
    option,
    confirmDelete,
    loading,
    // acciones
    setDay,
    setOption,
    setConfirmDelete,
    handleEditarRutina,
    handleUsarRutina,
    handleEliminarRutina,
  } = useRutinaViewer({ rutinas, setVer, onDelete });

  // loading específico de acciones del menú (editar / usar)
  const [actionLoading, setActionLoading] = useState<ActionLoading>(null);

  const isBusy = loading || actionLoading !== null;

  const subtitle =
    actionLoading === "edit"
      ? "Abriendo editor…"
      : actionLoading === "use"
        ? "Preparando entrenamiento…"
        : "Vista de rutina";

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle={
        Platform.OS === "ios" ? "fullScreen" : "fullScreen"
      }
      onRequestClose={() => !isBusy && setVer(false)}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: bg,
          paddingVertical: 20,
          position: "relative",
        }}
      >
        {/* Header */}
        <HeaderBar
          borderColor={border}
          surface={surface}
          left={
            <Pressable
              onPress={() => !isBusy && setVer(false)}
              accessibilityLabel="Cerrar"
              hitSlop={12}
              disabled={isBusy}
              style={({ pressed }) => [
                {
                  height: 36,
                  width: 36,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: surface,
                  opacity: isBusy ? 0.4 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <X size={16} color={textTitle} />
            </Pressable>
          }
          center={
            <View
              style={{
                minWidth: 0,
                alignItems: "center",
                paddingHorizontal: 8,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: textTitle,
                }}
              >
                {rutinas.nombre}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: textMuted,
                  marginTop: 2,
                }}
              >
                {subtitle}
              </Text>
            </View>
          }
          right={
            <View
              style={{
                position: "relative",
                zIndex: 100,
                elevation: 12,
                minWidth: 0,
              }}
            >
              <Pressable
                onPress={() => !isBusy && setOption((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel="Opciones"
                hitSlop={12}
                disabled={isBusy}
                style={({ pressed }) => [
                  {
                    height: 36,
                    width: 36,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: surface,
                    opacity: isBusy ? 0.4 : pressed ? 0.85 : 1,
                  },
                ]}
              >
                {actionLoading ? (
                  <Loader2 size={16} color={textTitle} />
                ) : (
                  <EllipsisVertical size={18} color={textTitle} />
                )}
              </Pressable>

              <OptionsMenu
                open={option}
                onClose={() => setOption(false)}
                top={44}
                right={8}
                items={[
                  {
                    key: "edit",
                    label: "Editar",
                    icon: <Pencil size={16} color={textTitle} />,
                    onPress: async () => {
                      if (isBusy) return;
                      setOption(false);
                      setActionLoading("edit");
                      try {
                        await Promise.resolve(handleEditarRutina());
                      } finally {
                        setActionLoading(null);
                      }
                    },
                    disabled: isBusy,
                  },
                  {
                    key: "use",
                    label: "Utilizar",
                    icon: <Dumbbell size={16} color={textTitle} />,
                    onPress: async () => {
                      if (isBusy) return;
                      setOption(false);
                      setActionLoading("use");
                      try {
                        await Promise.resolve(handleUsarRutina());
                      } finally {
                        setActionLoading(null);
                      }
                    },
                    disabled: isBusy,
                  },
                  {
                    key: "delete",
                    label: "Eliminar",
                    icon: <Trash2 size={16} color="#ef4444" />,
                    onPress: () => {
                      setOption(false);
                      setConfirmDelete(true);
                    },
                    danger: true,
                  },
                ]}
              />
            </View>
          }
        />

        {/* Tabs / Días */}
        <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
          <Dias dias={dias as any} day={day} setDay={setDay} />
        </View>

        {/* Contenido scrollable */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingBottom: 16,
          }}
        >
          <Ejercicios dias={dias as any} day={day as any} />
        </ScrollView>

        {/* Confirmación eliminar (overlay dentro de este mismo modal) */}
        <ConfirmDialog
          visible={confirmDelete}
          title="¿Estás seguro?"
          message={`Esta acción eliminará la rutina "${rutinas.nombre}" de forma permanente.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={loading}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleEliminarRutina}
          isDark={surface !== "#f3f4f6"}
        />
      </SafeAreaView>
    </Modal>
  );
}
