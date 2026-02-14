// lib/coachEntrenador.ts
import {
  computeMetrics,
  generateSuggestions,
  type Serie,
  type Metrics,
} from "./sugerencias";

export type CoachMood = "PROGRESAR" | "MANTENER" | "DESCARGAR";

export type CoachInput = {
  ejercicioNombre: string;
  // Última sesión de este ejercicio (puede venir del backend directamente)
  ultimaSesion?: {
    fecha?: string | Date | null;
    nivelEstres?: number | null; // 1–10
    detallesSeries?: Serie[] | null;
  } | null;
  // Historial opcional de estrés de este ejercicio (últimos días)
  stressHistory?: { fecha: string | Date; nivelEstres: number | null }[];
};

export type CoachAdvice = {
  mood: CoachMood;
  titulo: string;
  resumen: string;
  bullets: string[];
};

/* Utilidades internas */
function toDate(d: string | Date | null | undefined): Date | null {
  if (!d) return null;
  return d instanceof Date ? d : new Date(d);
}

function safeAvg(nums: number[]): number {
  const arr = nums.filter((n) => Number.isFinite(n));
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Helper principal: genera un feedback tipo "entrenador personal"
 * para antes de empezar el ejercicio.
 */
export function generarFeedbackEntrenador(input: CoachInput): CoachAdvice {
  const { ejercicioNombre, ultimaSesion, stressHistory } = input;

  // 1) Métricas de la última sesión (si hay)
  let metrics: Metrics | null = null;
  if (ultimaSesion?.detallesSeries && ultimaSesion.detallesSeries.length > 0) {
    metrics = computeMetrics(ultimaSesion.detallesSeries);
  }

  const lastStress = ultimaSesion?.nivelEstres ?? null;

  // 2) Estrés medio reciente (últimos 5 registros como máximo)
  const recentStressValues =
    stressHistory?.slice(-5).map((s) => s.nivelEstres ?? 0) ?? [];
  const avgStress = recentStressValues.length
    ? safeAvg(recentStressValues)
    : lastStress ?? 0;

  // 3) Determinar "color del día" / mood
  let mood: CoachMood = "MANTENER";

  const fatigueDrop = metrics?.fatigueDrop ?? 0;
  const zone = metrics?.zone ?? "hipertrofia";

  if ((avgStress <= 4 && fatigueDrop < 0.35) || !ultimaSesion) {
    mood = "PROGRESAR";
  } else if (avgStress >= 7 || fatigueDrop > 0.4) {
    mood = "DESCARGAR";
  } else {
    mood = "MANTENER";
  }

  // 4) Base de textos según mood
  let titulo: string;
  let resumen: string;
  const bullets: string[] = [];

  const sets = metrics?.n ?? 0;
  const avgReps = metrics?.avgReps ?? 0;
  const totalVol = metrics?.totalVol ?? 0;
  const lastStressText =
    lastStress != null ? `${lastStress.toFixed(1)}/10` : "sin dato";

  const zoneLabel =
    zone === "fuerza"
      ? "zona de fuerza (3–6 reps)"
      : zone === "hipertrofia"
      ? "zona de hipertrofia (6–12 reps)"
      : "zona de resistencia (>12 reps)";

  if (mood === "PROGRESAR") {
    titulo = `Buen día para progresar en ${ejercicioNombre}`;
    resumen =
      "Tus sesiones recientes se ven controladas y con un nivel de esfuerzo razonable. Puedes permitirte empujar un poco más hoy.";

    bullets.push(
      `Mantén la carga de la última sesión o súbela ~2.5% si te notas sólido.`,
      `Apunta a igualar el número de sets (${sets || 3}) y añadir +1–2 repeticiones totales.`,
      `Sigue en ${zoneLabel} y evita llegar al fallo en los primeros sets.`,
    );
  } else if (mood === "DESCARGAR") {
    titulo = `Toca sesión más controlada en ${ejercicioNombre}`;
    resumen =
      "Las últimas sesiones han sido bastante exigentes a nivel de esfuerzo o fatiga. Hoy compensa priorizar técnica y recuperación.";

    bullets.push(
      `Reduce la carga un 5–10% respecto a la última sesión y mantén el número de sets.`,
      `Mantén un rango de repeticiones parecido (${avgReps ? avgReps.toFixed(0) : "8–10"}) pero con margen (RIR 2–3).`,
      `Si notas fatiga acumulada, recorta 1 set y enfócate en repeticiones limpias.`,
    );
  } else {
    // MANTENER
    titulo = `Sesión de consolidación en ${ejercicioNombre}`;
    resumen =
      "Has estado trabajando este ejercicio con una carga y esfuerzo moderados. Hoy el objetivo es consolidar lo que ya tienes.";

    bullets.push(
      `Replica la estructura de la última sesión: similar carga, sets y rango de repeticiones.`,
      `Si te ves bien en el último set, añade 1–2 repeticiones o una micro-carga (~2.5%).`,
      `Mantén descansos consistentes y técnica estable para seguir construyendo base.`,
    );
  }

  // 5) Bonus: integrar una sugerencia específica de generateSuggestions (si hay métricas)
  if (metrics) {
    const sugs = generateSuggestions(metrics);
    // Priorizamos algunas categorías
    const prioridad = ["Volumen", "Carga", "Progresión", "Recuperación"] as const;
    for (const cat of prioridad) {
      const sug = sugs.find((s) => s.cat === cat);
      if (sug) {
        bullets.push(sug.text);
        break;
      }
    }
  }

  // 6) Ajuste final: si no hay última sesión (usuario nuevo en ese ejercicio)
  if (!ultimaSesion) {
    titulo = `Primera toma de contacto con ${ejercicioNombre}`;
    resumen =
      "Como es de las primeras veces que haces este ejercicio, hoy el foco es aprender la técnica y encontrar una carga cómoda.";

    bullets.length = 0;
    bullets.push(
      `Empieza con una carga que sientas muy manejable y quédate lejos del fallo (RIR 3–4).`,
      `Quédate en un rango de 8–12 repeticiones y 3–4 sets para familiarizarte con el movimiento.`,
      `Registra cómo te sientes (nivel de esfuerzo) al final para ajustar mejor las próximas sesiones.`,
    );
  }

  // 7) Detalle informativo extra con estrés histórico (si existe)
  if (avgStress > 0 && ultimaSesion) {
    const fecha = toDate(ultimaSesion.fecha);
    const fechaStr = fecha?.toLocaleDateString?.("es-ES") ?? "última sesión";

    bullets.push(
      `En ${fechaStr} reportaste un estrés de ${lastStressText}. Intenta que hoy se sienta en un rango parecido o ligeramente más bajo si vienes cargado.`,
    );
  }

  return { mood, titulo, resumen, bullets };
}
