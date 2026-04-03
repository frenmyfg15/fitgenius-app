export function getSemanaISO(): string {
  const now = new Date();
  const diaSemana = now.getUTCDay();
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(now);
  lunes.setUTCDate(now.getUTCDate() + diffLunes);
  lunes.setUTCHours(0, 0, 0, 0);
  const año = lunes.getUTCFullYear();
  const inicioAño = new Date(Date.UTC(año, 0, 1));
  const semana = Math.ceil(
    ((lunes.getTime() - inicioAño.getTime()) / 86400000 + inicioAño.getUTCDay() + 1) / 7
  );
  return `${año}-W${String(semana).padStart(2, "0")}`;
}
