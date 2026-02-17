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
  Pencil,
  Trash2,
  Cog,
  CheckCircle2,
  Sparkles,
  X,
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
  modoEdicion?: boolean;
};

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
  const [menuOpen, setMenuOpen] = useState(false);

  const fabBase =
    "p-4 rounded-full shadow-lg items-center justify-center " +
    (isDark
      ? "bg-slate-900 border border-white/20"
      : "bg-white border border-neutral-200");

  const iconColor = isDark ? "#f8fafc" : "#1e293b";

  const executeAction = (fn?: () => void) => {
    fn?.();
    setMenuOpen(false);
  };

  return (
    <>
      {/* ---------- BOTONES FLOTANTES (MÁS ESPACIO INFERIOR) ---------- */}
      <View style={styles.floatingContainer}>

        {/* BOTÓN SECUNDARIO: OPCIONES (Abre el menú) */}
        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          className={fabBase}
          activeOpacity={0.7}
          style={styles.secondaryFab}
        >
          <Cog size={24} color={iconColor} />
        </TouchableOpacity>

        {/* BOTÓN PRINCIPAL: GUARDAR / EDITAR */}
        <TouchableOpacity
          onPress={onCrear}
          disabled={creando || !puedeCrear}
          activeOpacity={0.8}
          style={[
            styles.mainFab,
            {
              backgroundColor: isDark ? "#10b981" : "#059669", // Verde para denotar éxito/guardado
              opacity: creando || !puedeCrear ? 0.6 : 1,
            },
          ]}
        >
          {creando ? (
            <ActivityIndicator color="#fff" />
          ) : modoEdicion ? (
            <Pencil size={24} color="#fff" />
          ) : (
            <CheckCircle2 size={26} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* ---------- MODAL DE ACCIONES (EL "MENÚ DELICADO") ---------- */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuOpen(false)}
        >
          <View
            style={[
              styles.menuContent,
              { backgroundColor: isDark ? "#0f172a" : "#ffffff" }
            ]}
          >
            {/* Cabecera del Menú */}
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>
                Acciones de Rutina
              </Text>
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <X size={20} color={isDark ? "#94a3b8" : "#64748b"} />
              </TouchableOpacity>
            </View>

            {/* Grupo: Añadir */}
            <Text style={styles.sectionLabel}>AÑADIR</Text>
            <View style={styles.row}>
              <MenuOption
                icon={<Plus size={20} color={iconColor} />}
                label="Ejercicio"
                onPress={() => executeAction(onAgregarEjercicio)}
                isDark={isDark}
              />
              <MenuOption
                icon={<Plus size={20} color={iconColor} />}
                label="Compuesto"
                onPress={() => executeAction(onAgregarCompuesto)}
                isDark={isDark}
              />
              <MenuOption
                icon={<Sparkles size={20} color="#a855f7" />}
                label="IA Chat"
                onPress={() => executeAction(onPreguntarRutina)}
                isDark={isDark}
              />
            </View>

            {/* Grupo: Gestión de Selección */}
            {haySeleccion && (
              <>
                <Text style={styles.sectionLabel}>SELECCIÓN</Text>
                <View style={styles.row}>
                  <MenuOption icon={<Pencil size={18} color={iconColor} />} label="Editar" onPress={() => executeAction(onEditarSeleccion)} isDark={isDark} />
                  <MenuOption disabled={!puedeSubir} icon={<Plus size={18} color={iconColor} style={{ transform: [{ rotate: '180deg' }] }} />} label="Subir" onPress={onSubirSeleccion} isDark={isDark} />
                  <MenuOption disabled={!puedeBajar} icon={<Plus size={18} color={iconColor} />} label="Bajar" onPress={onBajarSeleccion} isDark={isDark} />
                  <MenuOption icon={<Trash2 size={18} color="#ef4444" />} label="Borrar" onPress={() => executeAction(onEliminarSeleccion)} isDark={isDark} />
                </View>
              </>
            )}

            {/* Grupo: Día y Herramientas */}
            <Text style={styles.sectionLabel}>HERRAMIENTAS</Text>
            <View style={styles.row}>
              <MenuOption icon={<Cog size={18} color={iconColor} />} label="Copiar Día" onPress={() => executeAction(onCopiarDia)} isDark={isDark} />
              <MenuOption disabled={!puedePegar} icon={<Cog size={18} color={iconColor} />} label="Pegar" onPress={() => executeAction(onPegarAppend)} isDark={isDark} />
              <MenuOption icon={<Trash2 size={18} color="#ef4444" />} label="Vaciar" onPress={() => executeAction(onVaciar)} isDark={isDark} />
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

/* ---------------- Componentes Internos ---------------- */

function MenuOption({ icon, label, onPress, isDark, disabled }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.optionBtn, { opacity: disabled ? 0.4 : 1 }]}
    >
      <View style={[styles.optionIcon, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" }]}>
        {icon}
      </View>
      <Text style={[styles.optionLabel, { color: isDark ? "#cbd5e1" : "#475569" }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 90, // Elevado para dar espacio inferior (estaba en 35/100)
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 50,
  },
  mainFab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  secondaryFab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  menuContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40, // Más espacio abajo dentro del modal
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  optionBtn: {
    width: "22%",
    alignItems: "center",
    gap: 6,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});