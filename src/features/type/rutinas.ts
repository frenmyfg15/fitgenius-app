// ─────────────────────────────────────────────────────────
// Enums útiles (opcional, pero recomendado)
export type DiaSemana =
  | 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES'
  | 'VIERNES' | 'SABADO' | 'DOMINGO';

export type TipoCompuesto = 'DROPSET' | 'SUPERSET' | 'CIRCUITO';

// ─────────────────────────────────────────────────────────
// Respuesta raíz
export interface RutinasResponse {
  rutinas: Rutina[];
}

// Rutina y Día
export interface Rutina {
  id: number;
  nombre: string;
  descripcion: string | null;
  usuarioId: number;
  fechaCreacion: string; // ISO
  dias: DiaRutina[];
}

export interface DiaRutina {
  id: number;
  rutinaId: number;
  diaSemana: DiaSemana | string; // si aún te llega string crudo, mantenemos compat
  ejercicios: EjercicioAsignado[]; // unión discriminada
}

// ─────────────────────────────────────────────────────────
// Unión discriminada para ejercicios asignados
export type EjercicioAsignado = EjercicioAsignadoSimple | EjercicioAsignadoCompuesto;

// Campos comunes a cualquier asignado
interface EjercicioAsignadoBase {
  id: number;
  diaRutinaId: number;
  orden: number;

  descansoSeg?: number | null;
  notaIA?: string | null;

  // Sugerencias a nivel asignado (pueden ser null si usas valores por componente)
  seriesSugeridas?: number | null;
  repeticionesSugeridas?: number | null;
  pesoSugerido?: number | null;
}

// Simple: tiene `ejercicio`
export interface EjercicioAsignadoSimple extends EjercicioAsignadoBase {
  tipo: 'simple';
  ejercicioId: number;
  ejercicio: Ejercicio; // siempre presente en el include
  ejercicioCompuestoId?: null;
  ejercicioCompuesto?: null;
}

// Compuesto: tiene `ejercicioCompuesto` con sus componentes
export interface EjercicioAsignadoCompuesto extends EjercicioAsignadoBase {
  tipo: 'compuesto';
  ejercicioId?: null;
  ejercicio?: null;

  ejercicioCompuestoId: number;
  ejercicioCompuesto: EjercicioCompuesto; // con componentes
}

// ─────────────────────────────────────────────────────────
// Modelos hoja
export interface Ejercicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  idGif: string;
  tipoEjercicio: string;
  grupoMuscular: string;      // si quieres, tipa con tu enum `Grupo`
  musculoPrincipal: string;   // idem `Musculo`
  nivelDificultad: string;
  equipamientoNecesario: string[]; // viene de JSON
  lugaresEntrenamiento: string[];  // viene de JSON
  requiereTiempoPorSerie: boolean;
  fechaCreacion: string; // ISO
  ultimaActualizacion: string; // ISO
}

export interface EjercicioCompuesto {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipoCompuesto: TipoCompuesto;
  ejerciciosComponentes: ComponenteEjercicioCompuesto[];
}

export interface ComponenteEjercicioCompuesto {
  id: number;
  orden: number;
  series?: number | null;
  repeticiones?: number | null;
  pesoSugerido?: number | null;
  descansoSugeridoSeg?: number | null;
  ejercicio: Pick<Ejercicio, 'id' | 'nombre' | 'grupoMuscular' | 'musculoPrincipal'> & Partial<Ejercicio>;
  // ↑ puedes dejar solo los campos que uses en la UI
}
