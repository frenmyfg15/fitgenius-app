// src/utils/normalizarRutina.ts
import {
  DiaRutinaInput,
  EjercicioVisualInfo,
  EjercicioAsignadoInput,
} from '@/features/type/crearRutina';

/** Convierte un objeto "ejercicio" del backend en EjercicioVisualInfo */
const toVisualInfo = (e: any): EjercicioVisualInfo => ({
  idGif: e?.idGif ?? '',
  nombre: e?.nombre ?? '',
  grupoMuscular: e?.grupoMuscular ?? '',
  tipoEjercicio: e?.tipoEjercicio ?? '',
  nivelDificultad: e?.nivelDificultad ?? undefined,
});

/** Normaliza un ejercicio simple al shape de EjercicioAsignadoInput */
const normalizeSimple = (it: any): EjercicioAsignadoInput => ({
  orden: it?.orden ?? 1,
  ejercicioId: it?.ejercicioId ?? it?.ejercicio?.id,
  ejercicioInfo:
    it?.ejercicioInfo ??
    (it?.ejercicio ? toVisualInfo(it.ejercicio) : undefined),
  descansoSeg: it?.descansoSeg ?? 0,
  notaIA: it?.notaIA ?? '',
  seriesSugeridas: it?.seriesSugeridas ?? 3,
  repeticionesSugeridas: it?.repeticionesSugeridas ?? 10,
  pesoSugerido: it?.pesoSugerido ?? 0,
});

/** Normaliza un día completo */
export const normalizeDia = (dia: any): DiaRutinaInput => {
  const raw: any[] = Array.isArray(dia?.ejercicios) ? dia.ejercicios : [];
  const ejercicios: EjercicioAsignadoInput[] = [];

  for (const it of raw) {
    // por ahora solo manejamos simples; compuestos se pueden extender luego
    ejercicios.push(normalizeSimple(it));
  }

  // reasignar orden secuencial
  const reordenados = ejercicios.map((e, i) => ({ ...e, orden: i + 1 }));

  return { diaSemana: dia?.diaSemana, ejercicios: reordenados };
};
