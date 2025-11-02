export function calcularCalorias(series: { peso: number; reps: number }[]) {
  return series.reduce((total, s) => {
    const reps = s.reps || 0;
    const peso = s.peso || 0;
    return total + (peso * reps * 0.1);
  }, 0);
}