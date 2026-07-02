import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

type Cursor = { year: number; month: number };

type Props = {
  visible: boolean;
  fechasDisponibles: string[];
  fechaSeleccionada: string | null;
  onSelectFecha: (ymd: string) => void;
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS_LABEL = ["L", "M", "X", "J", "V", "S", "D"];

const pad2 = (n: number) => String(n).padStart(2, "0");
const toYMD = (year: number, month: number, day: number) =>
  `${year}-${pad2(month + 1)}-${pad2(day)}`;

const cursorFromFecha = (
  fecha: string | null,
  fechasDisponibles: string[]
): Cursor => {
  const ref = fecha ?? fechasDisponibles[0];
  if (ref) {
    const [year, month] = ref.split("-").map(Number);
    return { year, month: month - 1 };
  }
  const hoy = new Date();
  return { year: hoy.getFullYear(), month: hoy.getMonth() };
};

export default function CalendarioSesiones({
  visible,
  fechasDisponibles,
  fechaSeleccionada,
  onSelectFecha,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);

  const fechasSet = useMemo(() => new Set(fechasDisponibles), [fechasDisponibles]);

  const [cursor, setCursor] = useState<Cursor>(() =>
    cursorFromFecha(fechaSeleccionada, fechasDisponibles)
  );
  const wasVisible = useRef(false);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setCursor(cursorFromFecha(fechaSeleccionada, fechasDisponibles));
    }
    wasVisible.current = visible;
  }, [visible, fechaSeleccionada, fechasDisponibles]);

  const semanas = useMemo(() => {
    const { year, month } = cursor;
    const primerDia = new Date(year, month, 1);
    const offset = (primerDia.getDay() + 6) % 7; // lunes=0 ... domingo=6
    const diasEnMes = new Date(year, month + 1, 0).getDate();

    const celdas: (number | null)[] = [
      ...Array(offset).fill(null),
      ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
    ];
    while (celdas.length % 7 !== 0) celdas.push(null);

    const filas: (number | null)[][] = [];
    for (let i = 0; i < celdas.length; i += 7) filas.push(celdas.slice(i, i + 7));
    return filas;
  }, [cursor]);

  const cambiarMes = (delta: number) => {
    setCursor((prev) => {
      let month = prev.month + delta;
      let year = prev.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.header}>
        <Pressable onPress={() => cambiarMes(-1)} hitSlop={10} style={styles.navBtn}>
          <ChevronLeft size={18} color={t.textPrimary} />
        </Pressable>
        <Text style={{ fontFamily: Font.body.bold, fontSize: 14, color: t.textPrimary }}>
          {MESES[cursor.month]} {cursor.year}
        </Text>
        <Pressable onPress={() => cambiarMes(1)} hitSlop={10} style={styles.navBtn}>
          <ChevronRight size={18} color={t.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.semanaRow}>
        {DIAS_LABEL.map((d) => (
          <Text key={d} style={[styles.diaLabel, { color: t.textTertiary }]}>
            {d}
          </Text>
        ))}
      </View>

      {semanas.map((fila, i) => (
        <View key={i} style={styles.semanaRow}>
          {fila.map((dia, j) => {
            if (dia == null) return <View key={j} style={styles.celda} />;

            const ymd = toYMD(cursor.year, cursor.month, dia);
            const disponible = fechasSet.has(ymd);
            const seleccionado = fechaSeleccionada === ymd;

            return (
              <Pressable
                key={j}
                disabled={!disponible}
                onPress={() => onSelectFecha(ymd)}
                style={[
                  styles.celda,
                  styles.celdaBoton,
                  {
                    backgroundColor: seleccionado
                      ? Colors.accent
                      : disponible
                        ? isDark
                          ? t.border
                          : t.surface
                        : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: disponible ? Font.body.bold : Font.body.regular,
                    fontSize: 13,
                    color: seleccionado
                      ? "#0F172A"
                      : disponible
                        ? t.textPrimary
                        : t.textTertiary,
                  }}
                >
                  {dia}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  navBtn: {
    padding: 6,
  },
  semanaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  diaLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
  },
  celda: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  celdaBoton: {
    borderRadius: 10,
    margin: 2,
  },
});
