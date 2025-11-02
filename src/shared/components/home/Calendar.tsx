import React, { useMemo, useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";

/* ---------------- Props ---------------- */
interface Props {
  devolverDato?: (data: string, dia: string, mes: string, año: string) => void;
  activar?: boolean;
  completadas?: Record<string, boolean> | string[];
}

/* ---------------- Constantes ---------------- */
const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];

/* ---------------- Utils ---------------- */
const toMadridYMD = (() => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (d: Date) => fmt.format(d);
})();

const isTodayMadrid = (d: Date) => {
  const hoy = toMadridYMD(new Date());
  return toMadridYMD(d) === hoy;
};

/* ---------------- Componente ---------------- */
export default function Calendar({ devolverDato, activar = true, completadas = {} }: Props) {
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const completadasSet = useMemo(() => {
    if (Array.isArray(completadas)) return new Set(completadas);
    return new Set(Object.keys(completadas).filter(Boolean));
  }, [completadas]);

  const fechaBase = useMemo(() => new Date(), []);

  const obtenerInicioSemana = useCallback((fecha: Date) => {
    const diaSemana = (fecha.getDay() + 6) % 7; // lunes=0
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - diaSemana);
    inicioSemana.setHours(0, 0, 0, 0);
    return inicioSemana;
  }, []);

  const diasConFechas = useMemo(() => {
    const inicioSemana = obtenerInicioSemana(fechaBase);
    return dias.map((nombreDia, index) => {
      const fechaDia = new Date(inicioSemana);
      fechaDia.setDate(inicioSemana.getDate() + index);
      const ymd = toMadridYMD(fechaDia);
      return {
        nombre: nombreDia,
        fecha: fechaDia,
        ymd,
        dia: String(fechaDia.getDate()).padStart(2, "0"),
        mes: String(fechaDia.getMonth() + 1).padStart(2, "0"),
        año: String(fechaDia.getFullYear()),
      };
    });
  }, [fechaBase, obtenerInicioSemana]);

  const handleSelect = (dia: number, nombre: string, mes: string, año: string) => {
    setDiaSeleccionado((prev) => (prev === dia ? null : dia));
    devolverDato?.(String(dia), nombre, mes, año);
  };

  return (
    <View
      className={
        "rounded-2xl shadow-sm p-4 flex-row justify-around items-center w-full max-w-lg mx-auto " +
        (isDark ? "bg-[#0b1220] border border-white/10" : "bg-white border border-gray-100")
      }
    >
      {diasConFechas.map(({ nombre, dia, mes, año, fecha, ymd }) => {
        const diaNum = parseInt(dia, 10);
        const esHoy = isTodayMadrid(fecha);
        const esSeleccionado = diaSeleccionado === diaNum;
        const completado = completadasSet.has(ymd);

        const baseClasses =
          "flex-1 mx-1 h-16 rounded-lg items-center justify-center transition-all duration-200";
        const disabledStyle = activar ? "" : "opacity-70";

        // Fondo base cuando NO es hoy y NO es seleccionado
        const fondoNormal = isDark
          ? "bg-white/5 border border-white/10"
          : "bg-gray-50 border border-gray-100";

        // Si es seleccionado: fondo NEGRO, texto BLANCO (sin borde de selección)
        const fondoSeleccionado = "bg-black border border-black";

        // Si es hoy (y no está seleccionado): fondo degradado; el contenedor se queda transparente
        const fondoHoyNoSeleccionado = "bg-transparent border-transparent";

        // Borde verde adicional solo para completado cuando no es seleccionado (seleccionado ya usa fondo negro)
        const bordeVerde =
          completado && !esSeleccionado ? (isDark ? "border-[#22c55e]/50" : "border-[#22c55e]") : "";

        // Clases finales del contenedor
        const contenedorClasses =
          esSeleccionado
            ? `${baseClasses} ${fondoSeleccionado} ${disabledStyle}`
            : esHoy
            ? `${baseClasses} ${fondoHoyNoSeleccionado} ${bordeVerde} ${disabledStyle}`
            : `${baseClasses} ${fondoNormal} ${bordeVerde} ${disabledStyle}`;

        // Colores de texto
        const colorTextoNumero =
          esSeleccionado ? "#ffffff" : esHoy ? "#ffffff" : completado ? "#22c55e" : isDark ? "#ffffff" : "#111111";

        const colorTextoEtiqueta =
          esSeleccionado ? "#ffffff" : esHoy ? "#ffffff" : completado ? "#22c55e" : isDark ? "#94a3b8" : "#6b7280";

        // Borde del punto para garantizar contraste
        const bordePunto =
          esSeleccionado ? "#ffffff" : esHoy ? "#ffffff" : isDark ? "#0b1220" : "#ffffff";

        return (
          <TouchableOpacity
            key={`${ymd}-${nombre}`}
            onPress={() => activar && handleSelect(diaNum, nombre, mes, año)}
            disabled={!activar}
            accessibilityRole="button"
            accessibilityState={{ selected: esSeleccionado, disabled: !activar }}
            className={contenedorClasses}
            activeOpacity={0.9}
          >
            {/* Fondo degradado SOLO si es HOY y NO está seleccionado */}
            {esHoy && !esSeleccionado && (
              <LinearGradient
                colors={marcoGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  borderRadius: 8, // coincide con rounded-lg
                }}
                pointerEvents="none"
              />
            )}

            {/* Punto de completado: SIEMPRE visible */}
            {completado && (
              <View
                className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-[#22c55e]"
                style={{ borderWidth: 1.5, borderColor: bordePunto, zIndex: 2 }}
                accessibilityLabel="Completado"
              />
            )}

            <Text
              className="text-lg font-semibold mb-1"
              style={{ color: colorTextoNumero }}
            >
              {dia}
            </Text>

            <Text
              className="text-xs font-medium uppercase"
              style={{ color: colorTextoEtiqueta }}
            >
              {nombre.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
