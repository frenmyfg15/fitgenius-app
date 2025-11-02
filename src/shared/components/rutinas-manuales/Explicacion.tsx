// src/shared/components/rutina/Explicacion.tsx
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Layers, Trash2, FileText } from "lucide-react-native";

export default function Explicacion() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.80)";
  const cardBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const chipBg = isDark ? "rgba(148,163,184,0.16)" : "#f1f5f9";
  const chipColor = isDark ? "#cbd5e1" : "#334155";

  const frameGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];

  return (
    <View
      accessibilityRole="summary"
      style={{ width: "100%", maxWidth: 720, alignSelf: "center" }}
    >
      {/* Header */}
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: textPrimary,
            textAlign: "center",
          }}
          accessibilityRole="header"
          accessibilityLabel="Acciones rápidas de la rutina"
        >
          Acciones rápidas de la rutina
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: 12,
            color: textSecondary,
            textAlign: "center",
          }}
        >
          Una guía breve de lo que hace cada botón flotante.
        </Text>
      </View>

      {/* Grid (2 cols en pantallas amplias; en móvil se adapta) */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <GridItem
          title="Agregar ejercicio"
          description="Abre el buscador para añadir ejercicios individuales a tu rutina."
          Icon={Plus}
          cardBg={cardBg}
          cardBorder={cardBorder}
          chipBg={chipBg}
          chipColor={chipColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          frameGradient={frameGradient}
        />

        <GridItem
          title="Ejercicio compuesto"
          description="Crea un superconjunto o circuito agrupando varios ejercicios."
          Icon={Layers}
          cardBg={cardBg}
          cardBorder={cardBorder}
          chipBg={chipBg}
          chipColor={chipColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          frameGradient={frameGradient}
        />

        <GridItem
          title="Vaciar rutina"
          description="Elimina todos los ejercicios de este día y comienza desde cero."
          Icon={Trash2}
          cardBg={cardBg}
          cardBorder={cardBorder}
          chipBg={chipBg}
          chipColor={chipColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          frameGradient={frameGradient}
        />

        <GridItem
          title="Guardar rutina"
          description="Asigna un nombre a la rutina y guárdala para continuar después."
          Icon={FileText}
          cardBg={cardBg}
          cardBorder={cardBorder}
          chipBg={chipBg}
          chipColor={chipColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          frameGradient={frameGradient}
        />
      </View>
    </View>
  );
}

/* ---------------- Subcomponentes ---------------- */

function GridItem({
  title,
  description,
  Icon,
  cardBg,
  cardBorder,
  chipBg,
  chipColor,
  textPrimary,
  textSecondary,
  frameGradient,
}: {
  title: string;
  description: string;
  Icon: any;
  cardBg: string;
  cardBorder: string;
  chipBg: string;
  chipColor: string;
  textPrimary: string;
  textSecondary: string;
  frameGradient: string[];
}) {
  return (
    <LinearGradient
      colors={frameGradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 16, padding: 1, flexBasis: "48%", minWidth: "48%" }}
    >
      <View
        style={{
          borderRadius: 16,
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor: cardBorder,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          {/* Chip de icono */}
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 12,
              backgroundColor: chipBg,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: cardBorder,
            }}
          >
            <Icon size={18} color={chipColor} />
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: textPrimary,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                marginTop: 4,
                fontSize: 12,
                color: textSecondary,
              }}
            >
              {description}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
