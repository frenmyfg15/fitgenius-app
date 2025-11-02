// src/shared/components/misRutinas/MostrarRutina.tsx
import React from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import { X, EllipsisVertical, Trash2, Pencil, Dumbbell } from "lucide-react-native";

import type { Rutina } from "@/features/type/rutinas";
import Ejercicios from "../ui/Ejercicios";
import Dias from "../ui/Dias";
import { OptionsMenu } from "./OptionsMenu";
import { useRutinaViewer } from "@/shared/hooks/useRutinaViewer";
import { HeaderBar } from "./HeaderBar";
import { ConfirmDialog } from "./ConfirmDialog";

type Props = {
  rutinas: Rutina;
  setVer: (v: boolean) => void;
  onDelete: () => void;
};

export default function MostrarRutina({ rutinas, setVer, onDelete }: Props) {
  const {
    // tema
    bg, border, textTitle, textMuted, surface,
    // estado
    dias, day, option, confirmDelete, loading,
    // acciones
    setDay, setOption, setConfirmDelete,
    handleEditarRutina, handleUsarRutina, handleEliminarRutina,
  } = useRutinaViewer({ rutinas, setVer, onDelete });

  return (
    <View
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 50,
        backgroundColor: bg,
      }}
    >
      <HeaderBar
        borderColor={border}
        surface={surface}
        left={
          <Pressable
            onPress={() => setVer(false)}
            accessibilityLabel="Cerrar"
            hitSlop={12}
            style={({ pressed }) => [
              {
                height: 36, width: 36, borderRadius: 999,
                alignItems: "center", justifyContent: "center",
                backgroundColor: surface, opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <X size={16} color={textTitle} />
          </Pressable>
        }
        center={
          <View style={{ minWidth: 0, alignItems: "center", paddingHorizontal: 8 }}>
            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "800", color: textTitle }}>
              {rutinas.nombre}
            </Text>
            <Text style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>Vista de rutina</Text>
          </View>
        }
        right={
          <View style={{ position: "relative", zIndex: 100, elevation: 12, minWidth: 0 }}>
            <Pressable
              onPress={() => setOption((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel="Opciones"
              hitSlop={12}
              style={({ pressed }) => [
                {
                  height: 36,
                  width: 36,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: surface,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <EllipsisVertical size={18} color={textTitle} />
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
                  onPress: () => {
                    setOption(false);
                    handleEditarRutina();
                  },
                },
                {
                  key: "use",
                  label: "Utilizar",
                  icon: <Dumbbell size={16} color={textTitle} />,
                  onPress: () => {
                    setOption(false);
                    handleUsarRutina();
                  },
                  disabled: loading,
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

      {/* Contenido */}
      <ScrollView style={{ flex: 1, zIndex: 0 }} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}>
        <Ejercicios dias={dias as any} day={day as any} />
      </ScrollView>

      {/* Confirmación eliminar */}
      <ConfirmDialog
        visible={confirmDelete}
        title="¿Estás seguro?"
        message={`Esta acción eliminará la rutina "${rutinas.nombre}" de forma permanente.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleEliminarRutina}
        isDark={surface !== "#f3f4f6"} // aproximación simple usando tu paleta
      />
    </View>
  );
}
