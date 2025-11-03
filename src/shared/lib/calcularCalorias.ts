export function calcularCalorias(series: { peso: number; reps: number }[]) {
  return series.reduce((total, s) => {
    const reps = s.reps || 0;
    const peso = s.peso || 0;
    return total + (peso * reps * 0.1);
  }, 0);
}


// src/shared/lib/calcularCaloriasCompuesto.ts

export type RegistroCompuesto = {
  ejercicioId: number;
  pesoKg?: number;
  repeticiones?: number;
  duracionSegundos?: number;
};

/**
 * Calcula las calorías estimadas para un ejercicio compuesto.
 * 
 * La fórmula es la misma que en los simples: peso * reps * 0.1,
 * aplicada a cada componente de cada serie.
 */
export function calcularCaloriasCompuesto(series: RegistroCompuesto[][]): number {
  if (!Array.isArray(series) || series.length === 0) return 0;

  return series.reduce((totalSeries, serie) => {
    const totalSerie = serie.reduce((acum, r) => {
      const peso = r.pesoKg ?? 0;
      const reps = r.repeticiones ?? 0;
      return acum + peso * reps * 0.1;
    }, 0);
    return totalSeries + totalSerie;
  }, 0);
}
