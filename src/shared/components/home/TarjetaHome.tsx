import React, { useMemo, memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

import MensajeVacio from "../ui/MensajeVacio";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { Lock } from "lucide-react-native";

/* ---------------- Tipos ---------------- */
type GrupoMuscular =
  | "BRAZOS"
  | "CARDIO"
  | "CORE"
  | "ESPALDA"
  | "GLUTEO"
  | "HOMBROS"
  | "PECHOS"
  | "PIERNAS";

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
  ejercicio?: EjercicioSimple;
  ejercicioCompuesto?: EjercicioCompuesto | null;
  seriesSugeridas?: number;
  repeticionesSugeridas?: number | string;
  pesoSugerido?: number | string;
  descansoSeg?: number;
}
interface DiaRutina {
  diaSemana: string;
  ejercicios: EjercicioDia[];
}
interface Rutina {
  dias?: DiaRutina[];
}
type Props = { rutina?: Rutina | null; dia?: string };

/* ---------------- Utils de imagen ---------------- */
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
  BRAZOS: brazos,
  CARDIO: cardio,
  CORE: core,
  ESPALDA: espalda,
  GLUTEO: gluteo,
  HOMBROS: hombros,
  PECHOS: pechos,
  PIERNAS: piernas,
};

const isGrupoMuscular = (v: string): v is keyof typeof IMAGENES_GRUPO =>
  v in IMAGENES_GRUPO;

const imagenPorGrupo = (grupo?: string) => {
  if (!grupo) return undefined;
  const key = grupo.toUpperCase();
  return isGrupoMuscular(key) ? IMAGENES_GRUPO[key] : undefined;
};

const formateaDetalles = (
  i: EjercicioDia,
  medidaPeso: MedidaPeso = "kg"
): string => {
  if (i.ejercicioCompuesto) {
    const descanso = i.descansoSeg ?? 0;
    return `${descanso} s descanso`;
  }
  const sets = i.seriesSugeridas ?? "—";
  const reps = i.repeticionesSugeridas ?? "—";
  const peso = i.pesoSugerido ?? "—";
  return `${sets} series · ${reps} reps · ${peso} ${medidaPeso}`;
};

/** Devuelve el routeName y params para React Navigation */
const routeForEjercicio = (e: EjercicioDia): {
  routeName: string;
  params: Record<string, any>;
} => {
  const asignadoId = e.id != null ? String(e.id) : undefined;
  const nombre =
    e.ejercicioCompuesto?.nombre ?? e.ejercicio?.nombre ?? "ejercicio";

  if (e.ejercicioCompuesto?.id) {
    return {
      routeName: "VistaEjercicio",
      params: {
        id: String(e.ejercicioCompuesto.id),
        ...(asignadoId && { asignadoId }),
        nombre,
        ejercicio: e,
      },
    };
  }

  return {
    routeName: "VistaEjercicio",
    params: {
      slug: encodeURIComponent(nombre),
      ...(asignadoId && { asignadoId }),
      nombre,
      ejercicio: e,
    },
  };
};

/* ---------------- Tarjeta ---------------- */
const TarjetaEjercicio = memo(function TarjetaEjercicio({
  ejercicio,
  medidaPeso = "kg",
  locked = false,
  onLockedClick,
  onPressNavegar,
}: {
  ejercicio: EjercicioDia;
  medidaPeso?: MedidaPeso;
  locked?: boolean;
  onLockedClick?: () => void;
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

  const img = isCompuesto
    ? circuito
    : imagenPorGrupo(ejercicio.ejercicio?.grupoMuscular);

  const detalles = formateaDetalles(ejercicio, medidaPeso);
  const completado = Boolean(ejercicio.completadoHoy);
  const { routeName, params } = routeForEjercicio(ejercicio);

  const marcoGradient =
    completado && !locked
      ? (["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as any)
      : null;

  const CardInner = (
    <ContenidoTarjeta
      img={img}
      nombre={nombre}
      tagSuperior={tagSuperior}
      detalles={detalles}
      completado={completado}
      locked={locked}
    />
  );

  const Card = (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        locked
          ? onLockedClick?.()
          : onPressNavegar?.(routeName, params)
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: false }}
      accessibilityLabel={`${locked ? "Bloqueado — ejercicio extra Premium" : ""
        } ${isCompuesto ? "compuesto" : "ejercicio"} ${nombre}`}
      className="w-full"
    >
      {CardInner}
    </TouchableOpacity>
  );

  return (
    <View className="list-none">
      {marcoGradient ? (
        <LinearGradient
          colors={marcoGradient}
          className="rounded-2xl p-[1px]"
          style={{ borderRadius: 15, overflow: "hidden" }}
        >
          <View
            className={
              "rounded-2xl shadow-md p-4 relative " +
              (isDark
                ? "bg-[#0b1220] border border-white/10"
                : "bg-white border border-neutral-200")
            }
          >
            {Card}
          </View>
        </LinearGradient>
      ) : (
        <View
          className={
            "rounded-2xl shadow-md p-4 relative " +
            (isDark
              ? "bg-[#0b1220] border border-white/10"
              : "bg-white border border-neutral-200")
          }
        >
          {Card}
        </View>
      )}
    </View>
  );
});

function ContenidoTarjeta({
  img,
  nombre,
  tagSuperior,
  detalles,
  completado,
  locked,
}: {
  img?: any;
  nombre: string;
  tagSuperior: string;
  detalles: string;
  completado: boolean;
  locked: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (locked) {
    return (
      <View className="flex-row items-center gap-4">
        <View
          className={
            "h-16 w-16 rounded-xl border items-center justify-center " +
            (isDark
              ? "border-white/20 bg-white/5"
              : "border-neutral-200 bg-neutral-50")
          }
        >
          <Lock
            size={24}
            color={isDark ? "#e5e7eb" : "#0f172a"}
            strokeWidth={2}
          />
        </View>

        <View className="min-w-0 flex-1">
          <View className="mb-1">
            <View
              className={
                "self-start rounded-md px-2 py-0.5 ring-1 " +
                (isDark
                  ? "bg-white/5 ring-white/15"
                  : "bg-neutral-100 ring-neutral-200")
              }
            >
              <Text
                className={
                  "text-[11px] font-medium " +
                  (isDark ? "text-[#94a3b8]" : "text-neutral-700")
                }
                numberOfLines={1}
              >
                Ejercicio extra Premium
              </Text>
            </View>
          </View>

          <Text
            className={
              (isDark ? "text-white" : "text-slate-900") +
              " font-semibold"
            }
            numberOfLines={2}
          >
            Desbloquea el último ejercicio de la sesión
          </Text>

          <Text
            className={
              (isDark ? "text-[#94a3b8]" : "text-neutral-600") +
              " text-[12px]"
            }
            numberOfLines={2}
          >
            Hazte Premium para completar la rutina al 100% y acceder a todos
            los ejercicios del día.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-4">
      <View
        className={
          "h-16 w-16 rounded-xl border grid place-items-center overflow-hidden " +
          (isDark
            ? "border-white/60 bg-white/10"
            : "border-neutral-200 bg-white")
        }
      >
        {img ? (
          <Image source={img} className="h-16 w-16" resizeMode="contain" />
        ) : (
          <Text className="text-[11px] text-neutral-400">Sin imagen</Text>
        )}
      </View>

      <View className="min-w-0 flex-1">
        <View className="mb-1">
          <View
            className={
              "self-start rounded-md px-2 py-0.5 ring-1 " +
              (isDark
                ? "bg-white/5 ring-white/15"
                : "bg-neutral-100 ring-neutral-200")
            }
          >
            <Text
              className={
                "text-[11px] font-medium " +
                (isDark ? "text-[#94a3b8]" : "text-neutral-700")
              }
              numberOfLines={1}
            >
              {`Grupo · ${tagSuperior || "—"}`}
            </Text>
          </View>
        </View>

        <Text
          className={
            (isDark ? "text-white" : "text-slate-900") + " font-semibold"
          }
          numberOfLines={1}
        >
          {nombre}
        </Text>

        <Text
          className={
            (isDark ? "text-[#94a3b8]" : "text-neutral-600") +
            " text-[12px]"
          }
          numberOfLines={2}
        >
          {detalles}
        </Text>
      </View>

      {completado && (
        <View
          className={
            "ml-auto h-6 w-6 rounded-full items-center justify-center " +
            (isDark
              ? "bg-white/10 ring-1 ring-white/15"
              : "bg-white ring-1 ring-neutral-200")
          }
          accessibilityLabel="Completado hoy"
        >
          <Text className="text-[12px]">✓</Text>
        </View>
      )}
    </View>
  );
}

/* ---------------- Principal ---------------- */
export default function TarjetaHome({ rutina, dia }: Props) {
  const navigation = useNavigation();
  const planActual = useUsuarioStore((s) => s.usuario?.planActual);
  const haPagado = useUsuarioStore((s) => s.usuario?.haPagado ?? false);
  const rutinaActivaId = useUsuarioStore((s) => s.usuario?.rutinaActivaId);
  const medidaPeso = useUsuarioStore(
    (s) => s.usuario?.medidaPeso ?? "kg"
  );

  const hasRutinaActiva = Boolean(rutinaActivaId);

  const rutinaDia = useMemo(() => {
    if (!rutina?.dias || !dia) return undefined;
    return rutina.dias.find((d) => d.diaSemana === dia);
  }, [rutina, dia]);

  const ejercicios = useMemo<EjercicioDia[]>(
    () => rutinaDia?.ejercicios ?? [],
    [rutinaDia]
  );

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

  const isPremiumActive = planActual === "PREMIUM" && haPagado;

  return (
    <View className="w-full px-2">
      <View style={{ gap: 12 }}>
        {ejercicios.map((item, index) => {
          const key = String(
            (item.id as any) ??
              item.ejercicioCompuesto?.id ??
              `${item.ejercicio?.nombre}-${item.orden ?? "x"}-${index}`
          );

          const locked =
            !isPremiumActive && index === ejercicios.length - 1;

          return (
            <View key={key}>
              <TarjetaEjercicio
                ejercicio={item}
                medidaPeso={medidaPeso}
                locked={locked}
                onLockedClick={() => {
                  // @ts-ignore
                  navigation.navigate("Perfil", {
                    screen: "PremiumPayment",
                  });
                }}
                onPressNavegar={(routeName, params) =>
                  // @ts-ignore
                  (navigation as any).navigate(routeName, params)
                }
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
