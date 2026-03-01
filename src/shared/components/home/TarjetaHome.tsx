// File: src/shared/components/home/TarjetaHome.tsx
import React, { useMemo, memo } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import Swipeable from "react-native-gesture-handler/Swipeable";

import MensajeVacio from "../ui/MensajeVacio";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import ReplaceEjercicioAsignadoFlow from "@/shared/components/rutina/ReplaceEjercicioAsignadoFlow";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    // Card
    cardBgDark: "#0F1829",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.07)",
    cardBorderLight: "rgba(0,0,0,0.08)",

    // Thumbnail
    thumbBgDark: "rgba(255,255,255,0.06)",
    thumbBgLight: "#F8FAFC",
    thumbBorderDark: "rgba(255,255,255,0.10)",
    thumbBorderLight: "rgba(0,0,0,0.07)",

    // Tag grupo muscular
    tagBgDark: "rgba(255,255,255,0.05)",
    tagBgLight: "#F1F5F9",
    tagBorderDark: "rgba(255,255,255,0.10)",
    tagBorderLight: "rgba(0,0,0,0.07)",
    tagTextDark: "#64748B",
    tagTextLight: "#64748B",

    // Texto
    nameDark: "#F1F5F9",
    nameLight: "#0F172A",
    detailsDark: "#64748B",
    detailsLight: "#64748B",

    // Check completado
    checkBgDark: "rgba(0,232,90,0.12)",
    checkBgLight: "rgba(0,196,77,0.10)",
    checkBorderDark: "rgba(0,232,90,0.30)",
    checkBorderLight: "rgba(0,196,77,0.25)",
    checkColor: "#22C55E",
  },
  radius: { lg: 16, md: 10, sm: 6, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// ── Tipos ───────────────────────────────────────────────────────────────────
type GrupoMuscular =
  | "BRAZOS" | "CARDIO" | "CORE" | "ESPALDA"
  | "GLUTEO" | "HOMBROS" | "PECHOS" | "PIERNAS";
type MedidaPeso = "kg" | "lb" | string;

interface EjercicioSimple {
  id?: string | number;
  nombre: string;
  grupoMuscular: GrupoMuscular;
}
interface EjercicioCompuesto {
  id: number;
  nombre: string;
  tipoCompuesto: string;
}
interface EjercicioDia {
  id?: string | number;
  orden?: number;
  completadoHoy?: boolean;
  fechasCompletadasAsignacion?: string[];
  ultimaFechaCompletado?: string | null;
  ejercicio?: EjercicioSimple;
  ejercicioCompuesto?: EjercicioCompuesto | null;
  seriesSugeridas?: number;
  repeticionesSugeridas?: number | string;
  pesoSugerido?: number | string;
  descansoSeg?: number;
}
interface DiaRutina {
  id?: number;
  diaSemana: string;
  ejercicios: EjercicioDia[];
}
interface Rutina {
  id?: number;
  dias?: DiaRutina[];
}
type Props = { rutina?: Rutina | null; dia?: string; selectedYMD?: string };

// ── Assets ───────────────────────────────────────────────────────────────────
const brazos = require("../../../../assets/fit/rutina/brazos.png");
const cardio = require("../../../../assets/fit/rutina/cardio.png");
const core = require("../../../../assets/fit/rutina/core.png");
const espalda = require("../../../../assets/fit/rutina/espalda.png");
const gluteo = require("../../../../assets/fit/rutina/gluteo.png");
const hombros = require("../../../../assets/fit/rutina/hombros.png");
const pechos = require("../../../../assets/fit/rutina/pechos.png");
const piernas = require("../../../../assets/fit/rutina/piernas.png");
const circuito = require("../../../../assets/fit/rutina/circuito.png");

const IMAGENES_GRUPO: Record<GrupoMuscular, any> = {
  BRAZOS: brazos, CARDIO: cardio, CORE: core, ESPALDA: espalda,
  GLUTEO: gluteo, HOMBROS: hombros, PECHOS: pechos, PIERNAS: piernas,
};

const isGrupoMuscular = (v: string): v is keyof typeof IMAGENES_GRUPO =>
  v in IMAGENES_GRUPO;

const imagenPorGrupo = (grupo?: string) => {
  if (!grupo) return undefined;
  const key = grupo.toUpperCase();
  return isGrupoMuscular(key) ? IMAGENES_GRUPO[key] : undefined;
};

// ── Utils ────────────────────────────────────────────────────────────────────
const formateaDetalles = (i: EjercicioDia, medidaPeso: MedidaPeso = "kg") => {
  if (i.ejercicioCompuesto) return `${i.descansoSeg ?? 0} s descanso`;
  const sets = i.seriesSugeridas ?? "—";
  const reps = i.repeticionesSugeridas ?? "—";
  const peso = i.pesoSugerido ?? "—";
  return `${sets} series · ${reps} reps · ${peso} ${medidaPeso}`;
};

const toMadridYMD = (() => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  return (d: Date) => fmt.format(d);
})();

const isCompletedOnDate = (ej: EjercicioDia, selectedYMD?: string) => {
  if (!selectedYMD) return Boolean(ej.completadoHoy);
  const fechas = ej.fechasCompletadasAsignacion ?? [];
  if (Array.isArray(fechas) && fechas.includes(selectedYMD)) return true;
  const hoy = toMadridYMD(new Date());
  if (selectedYMD === hoy) return Boolean(ej.completadoHoy);
  return false;
};

const routeForEjercicio = (e: EjercicioDia) => {
  const asignadoId = e.id != null ? String(e.id) : undefined;
  const nombre = e.ejercicioCompuesto?.nombre ?? e.ejercicio?.nombre ?? "ejercicio";
  if (e.ejercicioCompuesto?.id) {
    return {
      routeName: "VistaEjercicio",
      params: { id: String(e.ejercicioCompuesto.id), ...(asignadoId && { asignadoId }), nombre, ejercicio: e },
    };
  }
  return {
    routeName: "VistaEjercicio",
    params: { slug: encodeURIComponent(nombre), ...(asignadoId && { asignadoId }), nombre, ejercicio: e },
  };
};

// ── TarjetaEjercicio ──────────────────────────────────────────────────────────
const TarjetaEjercicio = memo(function TarjetaEjercicio({
  ejercicio,
  medidaPeso = "kg",
  selectedYMD,
  onPressNavegar,
}: {
  ejercicio: EjercicioDia;
  medidaPeso?: MedidaPeso;
  selectedYMD?: string;
  onPressNavegar?: (routeName: string, params?: Record<string, any>) => void;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const isCompuesto = Boolean(ejercicio.ejercicioCompuesto);
  const nombre = isCompuesto
    ? ejercicio.ejercicioCompuesto!.nombre
    : ejercicio.ejercicio?.nombre ?? "Ejercicio";
  const tagSuperior = isCompuesto
    ? ejercicio.ejercicioCompuesto!.tipoCompuesto
    : ejercicio.ejercicio?.grupoMuscular ?? "";
  const img = isCompuesto ? circuito : imagenPorGrupo(ejercicio.ejercicio?.grupoMuscular);
  const detalles = formateaDetalles(ejercicio, medidaPeso);
  const completado = isCompletedOnDate(ejercicio, selectedYMD);
  const { routeName, params } = routeForEjercicio(ejercicio);

  const cardStyle = [
    styles.card,
    {
      backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
      borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
    },
  ];

  const inner = (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPressNavegar?.(routeName, params)}
      accessibilityRole="button"
      accessibilityLabel={`${isCompuesto ? "Ejercicio compuesto" : "Ejercicio"}: ${nombre}${completado ? ", completado" : ""}`}
      accessibilityState={{ checked: completado }}
      style={styles.touchable}
    >
      <ContenidoTarjeta
        img={img}
        nombre={nombre}
        tagSuperior={tagSuperior}
        detalles={detalles}
        completado={completado}
        completedLabel={selectedYMD ? `Completado el ${selectedYMD}` : "Completado"}
        isDark={isDark}
      />
    </TouchableOpacity>
  );

  if (completado) {
    return (
      <LinearGradient
        colors={GRADIENT as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={cardStyle}>{inner}</View>
      </LinearGradient>
    );
  }

  return <View style={cardStyle}>{inner}</View>;
});

// ── ContenidoTarjeta ──────────────────────────────────────────────────────────
function ContenidoTarjeta({
  img, nombre, tagSuperior, detalles, completado, completedLabel, isDark,
}: {
  img?: any;
  nombre: string;
  tagSuperior: string;
  detalles: string;
  completado: boolean;
  completedLabel: string;
  isDark: boolean;
}) {
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: isDark ? tokens.color.thumbBgDark : tokens.color.thumbBgLight,
            borderColor: isDark ? tokens.color.thumbBorderDark : tokens.color.thumbBorderLight,
          },
        ]}
      >
        {img ? (
          <Image source={img} style={styles.thumbImage} resizeMode="contain" />
        ) : (
          <Text style={styles.thumbFallback}>—</Text>
        )}
      </View>

      <View style={styles.info}>
        <View
          style={[
            styles.tag,
            {
              backgroundColor: isDark ? tokens.color.tagBgDark : tokens.color.tagBgLight,
              borderColor: isDark ? tokens.color.tagBorderDark : tokens.color.tagBorderLight,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[styles.tagText, { color: isDark ? tokens.color.tagTextDark : tokens.color.tagTextLight }]}
          >
            {tagSuperior || "—"}
          </Text>
        </View>

        <Text
          numberOfLines={1}
          style={[styles.name, { color: isDark ? tokens.color.nameDark : tokens.color.nameLight }]}
        >
          {nombre}
        </Text>

        <Text
          numberOfLines={2}
          style={[styles.details, { color: isDark ? tokens.color.detailsDark : tokens.color.detailsLight }]}
        >
          {detalles}
        </Text>
      </View>

      {completado && (
        <View
          style={[
            styles.checkCircle,
            {
              backgroundColor: isDark ? tokens.color.checkBgDark : tokens.color.checkBgLight,
              borderColor: isDark ? tokens.color.checkBorderDark : tokens.color.checkBorderLight,
            },
          ]}
          accessibilityLabel={completedLabel}
        >
          <Text style={styles.checkMark}>✓</Text>
        </View>
      )}
    </View>
  );
}

// ── TarjetaHome (principal) ───────────────────────────────────────────────────
export default function TarjetaHome({ rutina, dia, selectedYMD }: Props) {
  const navigation = useNavigation();
  const rutinaActivaId = useUsuarioStore((s) => s.usuario?.rutinaActivaId);
  const medidaPeso = useUsuarioStore((s) => s.usuario?.medidaPeso ?? "kg");
  const hasRutinaActiva = Boolean(rutinaActivaId);

  const rutinaDia = useMemo(() => {
    if (!rutina?.dias || !dia) return undefined;
    return rutina.dias.find((d) => d.diaSemana === dia);
  }, [rutina, dia]);

  const ejercicios = useMemo<EjercicioDia[]>(
    () => rutinaDia?.ejercicios ?? [],
    [rutinaDia]
  );

  const rutinaId = (rutina as any)?.id as number | undefined;
  const diaRutinaId = (rutinaDia as any)?.id as number | undefined;

  if (!rutinaDia && hasRutinaActiva) {
    return (
      <MensajeVacio
        titulo="Día de descanso"
        descripcion="Hoy no tienes ejercicios asignados. Aprovecha para recuperarte y volver más fuerte."
        textoBoton="Ver mi rutina"
        rutaDestino="MisRutinas"
        nombreImagen="descanso"
        mostrarBoton
      />
    );
  }

  if (!rutinaDia) return null;

  return (
    <View style={styles.listRoot}>
      <View style={styles.list}>
        {ejercicios.map((item, index) => {
          const key = String(
            (item.id as any) ??
            item.ejercicioCompuesto?.id ??
            `${item.ejercicio?.nombre}-${item.orden ?? "x"}-${index}`
          );

          const asignadoId = item.id != null ? Number(item.id) : undefined;
          const isCompuesto = Boolean(item.ejercicioCompuesto);

          const canReplace =
            !isCompuesto &&
            Number.isFinite(Number(rutinaId)) &&
            Number.isFinite(Number(diaRutinaId)) &&
            Number.isFinite(Number(asignadoId));

          const renderRightActions = () => {
            if (!canReplace) return null;

            return (
              <ReplaceEjercicioAsignadoFlow
                rutinaId={Number(rutinaId)}
                diaRutinaId={Number(diaRutinaId)}
                asignadoId={Number(asignadoId)}
              >
                {({ open, loading }) => (
                  <Pressable
                    onPress={open}
                    disabled={loading}
                    style={{
                      width: 120,
                      marginLeft: 10,
                      borderRadius: tokens.radius.lg,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(34,197,94,0.18)",
                      borderWidth: 1,
                      borderColor: "rgba(34,197,94,0.35)",
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: "#22C55E" }}>
                      {loading ? "..." : "Reemplazar"}
                    </Text>
                  </Pressable>
                )}
              </ReplaceEjercicioAsignadoFlow>
            );
          };

          if (!canReplace) {
            return (
              <TarjetaEjercicio
                key={key}
                ejercicio={item}
                medidaPeso={medidaPeso}
                selectedYMD={selectedYMD}
                onPressNavegar={(routeName, params) =>
                  // @ts-ignore
                  (navigation as any).navigate(routeName, params)
                }
              />
            );
          }

          return (
            <Swipeable
              key={key}
              renderRightActions={renderRightActions}
              overshootRight={false}
            >
              <TarjetaEjercicio
                ejercicio={item}
                medidaPeso={medidaPeso}
                selectedYMD={selectedYMD}
                onPressNavegar={(routeName, params) =>
                  // @ts-ignore
                  (navigation as any).navigate(routeName, params)
                }
              />
            </Swipeable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listRoot: {
    width: "100%",
    paddingHorizontal: tokens.spacing.sm,
  },
  list: {
    gap: tokens.spacing.md,
  },
  gradientBorder: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },
  card: {
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: tokens.spacing.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  touchable: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  thumbImage: {
    width: 52,
    height: 52,
  },
  thumbFallback: {
    fontSize: 12,
    color: "#94A3B8",
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: tokens.spacing.xs,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  details: {
    fontSize: 12,
    lineHeight: 17,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkMark: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.color.checkColor,
  },
});