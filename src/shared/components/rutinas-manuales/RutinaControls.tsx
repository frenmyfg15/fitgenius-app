// src/shared/components/rutina/RutinaControls.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet, ActivityIndicator } from "react-native";
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
} from "lucide-react-native";
import type { Item } from "@/features/type/crearRutina";

type Props = {
  // Acción principal (crear/guardar)
  onCrear: () => void;
  creando?: boolean;
  puedeCrear?: boolean;

  // Agregar
  onAgregarEjercicio: () => void;
  onAgregarCompuesto: () => void;

  // Día
  onCopiarDia: () => void;
  onPegarAppend: () => void;
  onPegarReplace: () => void;
  puedePegar?: boolean;

  // Eliminar / Vaciar
  onVaciar: () => void;
  puedeVaciar?: boolean;
  onEliminarSeleccion?: () => void;

  // Acciones sobre selección
  haySeleccion?: boolean;
  onEditarSeleccion?: () => void;
  onSubirSeleccion?: () => void;
  onBajarSeleccion?: () => void;
  puedeSubir?: boolean;
  puedeBajar?: boolean;

  // Opcional
  selectedItem?: Item | null;

  /** Si estás en modo edición de rutina, el FAB principal muestra un lápiz en lugar de check */
  modoEdicion?: boolean;
};

type OpenKind = null | "add" | "opts" | "delete";

export default function RutinaControls({
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

  // Tokens minimal
  const bgFab = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";
  const line = isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";

  const withClose = (fn?: () => void) => () => {
    fn?.();
    setOpen(null);
  };

  return (
    <>
      {/* ------- FABs laterales (minimal) ------- */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          right: 20,
          bottom: 100,
          zIndex: 30,
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <IconFab
          title="Agregar…"
          onPress={() => setOpen("add")}
          isDark={isDark}
          icon={<Plus size={18} color={textPrimary} />}
          line={line}
          bg={bgFab}
        />
        <IconFab
          title="Opciones…"
          onPress={() => setOpen("opts")}
          isDark={isDark}
          icon={<Cog size={18} color={textPrimary} />}
          line={line}
          bg={bgFab}
        />
        <IconFab
          title="Eliminar…"
          onPress={() => setOpen("delete")}
          isDark={isDark}
          icon={<Trash2 size={18} color={(haySeleccion || puedeVaciar) ? "#ef4444" : textMuted} />}
          line={line}
          bg={bgFab}
        />
      </View>

      {/* ------- FAB principal (crear/guardar) ------- */}
      <Pressable
        onPress={onCrear}
        disabled={creando || !puedeCrear}
        accessibilityRole="button"
        accessibilityLabel={modoEdicion ? "Guardar cambios de rutina" : "Crear rutina"}
        style={{
          position: "absolute",
          right: 16,
          bottom: 35,
          height: 56,
          width: 56,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: puedeCrear ? (isDark ? "#0b1220" : "#ffffff") : (isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"),
          borderWidth: 1,
          borderColor: line,
          opacity: creando ? 0.7 : 1,
        }}
      >
        {creando ? (
          <ActivityIndicator color={textPrimary} />
        ) : modoEdicion ? (
          <Pencil size={20} color={textPrimary} />
        ) : (
          <CheckCircle2 size={22} color={textPrimary} />
        )}
      </Pressable>

      {/* ------- Modal minimal ------- */}
      <CenteredModal open={!!open} onClose={() => setOpen(null)} isDark={isDark}>
        {open === "add" && (
          <View style={{ gap: 8 }}>
            <ModalTitle isDark={isDark} icon={<Plus size={16} color={textPrimary} />}>
              Agregar
            </ModalTitle>
            <ModalItem onPress={withClose(onAgregarEjercicio)} isDark={isDark} icon={<Plus size={16} color={textMuted} />}>
              Agregar ejercicio
            </ModalItem>
            <ModalItem onPress={withClose(onAgregarCompuesto)} isDark={isDark} icon={<Layers size={16} color={textMuted} />}>
              Agregar compuesto
            </ModalItem>
          </View>
        )}

        {open === "opts" && (
          <View style={{ gap: 8 }}>
            <ModalTitle isDark={isDark} icon={<Cog size={16} color={textPrimary} />}>
              Opciones
            </ModalTitle>

            <ModalSection isDark={isDark}>Selección</ModalSection>
            <ModalItem
              disabled={!haySeleccion}
              onPress={withClose(onEditarSeleccion)}
              isDark={isDark}
              icon={<Pencil size={16} color={haySeleccion ? textMuted : "#cbd5e1"} />}
            >
              Editar
            </ModalItem>
            <ModalItem
              disabled={!haySeleccion || !puedeSubir}
              onPress={withClose(onSubirSeleccion)}
              isDark={isDark}
              icon={<ArrowUp size={16} color={haySeleccion && puedeSubir ? textMuted : "#cbd5e1"} />}
            >
              Subir
            </ModalItem>
            <ModalItem
              disabled={!haySeleccion || !puedeBajar}
              onPress={withClose(onBajarSeleccion)}
              isDark={isDark}
              icon={<ArrowDown size={16} color={haySeleccion && puedeBajar ? textMuted : "#cbd5e1"} />}
            >
              Bajar
            </ModalItem>

            <View style={{ height: 1, backgroundColor: line, marginVertical: 6 }} />

            <ModalSection isDark={isDark}>Día</ModalSection>
            <ModalItem onPress={withClose(onCopiarDia)} isDark={isDark} icon={<Copy size={16} color={textMuted} />}>
              Copiar
            </ModalItem>
            <ModalItem
              disabled={!puedePegar}
              onPress={withClose(onPegarAppend)}
              isDark={isDark}
              icon={<ClipboardPaste size={16} color={puedePegar ? textMuted : "#cbd5e1"} />}
            >
              Pegar (agregar)
            </ModalItem>
            <ModalItem
              disabled={!puedePegar}
              onPress={withClose(onPegarReplace)}
              isDark={isDark}
              icon={<FileText size={16} color={puedePegar ? textMuted : "#cbd5e1"} />}
            >
              Pegar (reemplazar)
            </ModalItem>
          </View>
        )}

        {open === "delete" && (
          <View style={{ gap: 8 }}>
            <ModalTitle isDark={isDark} icon={<Trash2 size={16} color={textPrimary} />}>
              Eliminar
            </ModalTitle>
            <ModalItem
              disabled={!haySeleccion}
              onPress={withClose(onEliminarSeleccion)}
              isDark={isDark}
              icon={<Trash2 size={16} color={haySeleccion ? "#ef4444" : "#cbd5e1"} />}
            >
              Eliminar ejercicio seleccionado
            </ModalItem>
            <ModalItem
              disabled={!puedeVaciar}
              onPress={withClose(onVaciar)}
              isDark={isDark}
              icon={<Trash2 size={16} color={puedeVaciar ? "#ef4444" : "#cbd5e1"} />}
            >
              Vaciar todos los días
            </ModalItem>
          </View>
        )}
      </CenteredModal>
    </>
  );
}

/* ------------------- UI helpers (minimal) ------------------- */

function IconFab({
  title,
  onPress,
  icon,
  isDark,
  disabled,
  line,
  bg,
}: {
  title: string;
  onPress?: () => void;
  icon: React.ReactNode;
  isDark: boolean;
  disabled?: boolean;
  line: string;
  bg: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{
        height: 44,
        width: 44,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: line,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
    </Pressable>
  );
}

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
  const bg = isDark ? "#0b1220" : "#ffffff";
  const line = isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb";

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={styles.modalRoot}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFillObject} />
        <View
          style={{
            width: "92%",
            maxWidth: 520,
            borderRadius: 14,
            backgroundColor: bg,
            borderWidth: 1,
            borderColor: line,
            padding: 12,
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

function ModalTitle({
  children,
  icon,
  isDark,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
      {icon}
      <Text style={{ fontSize: 13, fontWeight: "800", color: isDark ? "#e5e7eb" : "#0f172a" }}>
        {children}
      </Text>
    </View>
  );
}

function ModalSection({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <Text
      style={{
        marginTop: 6,
        marginBottom: 2,
        fontSize: 10,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color: isDark ? "#94a3b8" : "#64748b",
      }}
    >
      {children}
    </Text>
  );
}

function ModalItem({
  icon,
  children,
  onPress,
  disabled,
  isDark,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  isDark: boolean;
}) {
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        borderRadius: 10,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
      <Text style={{ color: textPrimary, fontSize: 14 }}>{children}</Text>
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
