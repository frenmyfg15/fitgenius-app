// src/shared/components/rutina/RutinaControls.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "nativewind";
import {
  Plus,
  Layers,
  FileText,
  Copy,
  ClipboardPaste,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Cog,
  CheckCircle2,
  Sparkles,
  Dumbbell,
} from "lucide-react-native";
import type { Item } from "@/features/type/crearRutina";

type Props = {
  onPreguntarRutina?: () => void;

  onCrear: () => void;
  creando?: boolean;
  puedeCrear?: boolean;

  onAgregarEjercicio: () => void;
  onAgregarCompuesto: () => void;

  onCopiarDia: () => void;
  onPegarAppend: () => void;
  onPegarReplace: () => void;
  puedePegar?: boolean;

  onVaciar: () => void;
  puedeVaciar?: boolean;
  onEliminarSeleccion?: () => void;

  haySeleccion?: boolean;
  onEditarSeleccion?: () => void;
  onSubirSeleccion?: () => void;
  onBajarSeleccion?: () => void;
  puedeSubir?: boolean;
  puedeBajar?: boolean;

  selectedItem?: Item | null;
  modoEdicion?: boolean;
};

type OpenKind = null | "add" | "opts" | "delete";

export default function RutinaControls({
  onPreguntarRutina,
  onCrear,
  creando = false,
  puedeCrear = true,
  onAgregarEjercicio,
  onAgregarCompuesto,
  onCopiarDia,
  onPegarAppend,
  onPegarReplace,
  puedePegar = true,
  onVaciar,
  puedeVaciar = false,
  onEliminarSeleccion,
  haySeleccion = false,
  onEditarSeleccion,
  onSubirSeleccion,
  onBajarSeleccion,
  puedeSubir = false,
  puedeBajar = false,
  modoEdicion = false,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [open, setOpen] = useState<OpenKind>(null);

  const fabBase =
    "p-4 rounded-full shadow items-center justify-center " +
    (isDark
      ? "bg-black border border-white/25"
      : "bg-white border border-neutral-200");

  const iconColor = isDark ? "#e5e7eb" : "#3f3f46";

  const withClose = (fn?: () => void) => () => {
    fn?.();
    setOpen(null);
  };

  return (
    <>
      {/* ---------- FABs laterales (MISMO DISEÑO) ---------- */}
      <View style={{ position: "absolute", right: 20, bottom: 100, zIndex: 30 }}>
        <View style={{ gap: 16 }}>
          {/* ⭐ Preguntar IA */}
          {onPreguntarRutina && (
            <TouchableOpacity
              onPress={onPreguntarRutina}
              className={fabBase}
              accessibilityLabel="Preguntar a la IA"
            >
              <Sparkles size={22} color={iconColor} />
            </TouchableOpacity>
          )}

          {/* 💪 Agregar */}
          <TouchableOpacity
            onPress={() => setOpen("add")}
            className={fabBase}
            accessibilityLabel="Agregar"
          >
            <Plus size={22} color={iconColor} />
          </TouchableOpacity>

          {/* ⚙️ Opciones */}
          <TouchableOpacity
            onPress={() => setOpen("opts")}
            className={fabBase}
            accessibilityLabel="Opciones"
          >
            <Cog size={22} color={iconColor} />
          </TouchableOpacity>

          {/* 🗑 Eliminar */}
          <TouchableOpacity
            onPress={() => setOpen("delete")}
            className={fabBase}
            accessibilityLabel="Eliminar"
            style={{ opacity: haySeleccion || puedeVaciar ? 1 : 0.5 }}
          >
            <Trash2 size={22} color={haySeleccion || puedeVaciar ? "#ef4444" : iconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- FAB principal (crear / guardar) ---------- */}
      <Pressable
        onPress={onCrear}
        disabled={creando || !puedeCrear}
        style={{
          position: "absolute",
          right: 16,
          bottom: 35,
          height: 56,
          width: 56,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "#0b1220" : "#ffffff",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb",
          opacity: creando ? 0.7 : 1,
        }}
      >
        {creando ? (
          <ActivityIndicator color={iconColor} />
        ) : modoEdicion ? (
          <Pencil size={22} color={iconColor} />
        ) : (
          <CheckCircle2 size={24} color={iconColor} />
        )}
      </Pressable>

      {/* ---------- Modales ---------- */}
      <CenteredModal open={!!open} onClose={() => setOpen(null)} isDark={isDark}>
        {open === "add" && (
          <>
            <ModalItem onPress={withClose(onAgregarEjercicio)} isDark={isDark}>
              Agregar ejercicio
            </ModalItem>
            <ModalItem onPress={withClose(onAgregarCompuesto)} isDark={isDark}>
              Agregar compuesto
            </ModalItem>
          </>
        )}

        {open === "opts" && (
          <>
            <ModalItem disabled={!haySeleccion} onPress={withClose(onEditarSeleccion)} isDark={isDark}>
              Editar
            </ModalItem>
            <ModalItem disabled={!puedeSubir} onPress={withClose(onSubirSeleccion)} isDark={isDark}>
              Subir
            </ModalItem>
            <ModalItem disabled={!puedeBajar} onPress={withClose(onBajarSeleccion)} isDark={isDark}>
              Bajar
            </ModalItem>
            <ModalItem onPress={withClose(onCopiarDia)} isDark={isDark}>
              Copiar día
            </ModalItem>
            <ModalItem disabled={!puedePegar} onPress={withClose(onPegarAppend)} isDark={isDark}>
              Pegar (agregar)
            </ModalItem>
            <ModalItem disabled={!puedePegar} onPress={withClose(onPegarReplace)} isDark={isDark}>
              Pegar (reemplazar)
            </ModalItem>
          </>
        )}

        {open === "delete" && (
          <>
            <ModalItem disabled={!haySeleccion} onPress={withClose(onEliminarSeleccion)} isDark={isDark}>
              Eliminar selección
            </ModalItem>
            <ModalItem disabled={!puedeVaciar} onPress={withClose(onVaciar)} isDark={isDark}>
              Vaciar rutina
            </ModalItem>
          </>
        )}
      </CenteredModal>
    </>
  );
}

/* ---------------- UI helpers ---------------- */

function CenteredModal({
  open,
  onClose,
  children,
  isDark,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View
          style={{
            backgroundColor: isDark ? "#0b1220" : "#ffffff",
            borderRadius: 14,
            padding: 16,
            width: "90%",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb",
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

function ModalItem({
  children,
  onPress,
  disabled,
  isDark,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        paddingVertical: 12,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ color: isDark ? "#e5e7eb" : "#0f172a", fontSize: 14 }}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
