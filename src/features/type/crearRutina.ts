// src/features/type/crearRutina.ts

export interface EjercicioVisualInfo {
  idGif: string;
  nombre: string;
  grupoMuscular: string;
  tipoEjercicio: string;
  nivelDificultad?: string;
}

export type TipoCompuesto = 'SUPERSET' | 'DROPSET' | 'CIRCUITO';

export interface EjercicioAsignadoInput {
  ejercicioId?: number;
  ejercicioCompuestoId?: number;
  orden: number;
  descansoSeg?: number;
  notaIA?: string;
  seriesSugeridas?: number;
  repeticionesSugeridas?: number;
  pesoSugerido?: number;
  ejercicioInfo?: EjercicioVisualInfo;
  compuesto?: boolean;
  ejerciciosCompuestos?: EjercicioAsignadoInput[];
  nombreCompuesto?: string;
  tipoCompuesto?: TipoCompuesto;
  descansoCompuesto?: number;
}

export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO';

export interface DiaRutinaInput {
  diaSemana: DiaSemana;
  ejercicios: EjercicioAsignadoInput[];
}

export interface CrearRutinaRequest {
  nombre: string;
  descripcion?: string;
  usuarioId: number;
  dias: DiaRutinaInput[];
}

export type EjercicioCompuestoTemporal = {
  id: number;
  info: EjercicioVisualInfo;
  detalles?: {
    seriesSugeridas: number;
    repeticionesSugeridas: number;
    descansoSeg: number;
    notaIA: string;
  };
};

// ✅ Ejercicio individual
export interface EjercicioItem {
  compuesto?: false;
  ejercicioId: number;
  ejercicioInfo: EjercicioVisualInfo;
  orden: number;
  descansoSeg?: number;
  notaIA?: string;
  seriesSugeridas?: number;
  repeticionesSugeridas?: number;
  pesoSugerido?: number;
}

// ✅ Ejercicio compuesto — compuestoId vive SOLO en el padre
export interface CompuestoItem {
  compuesto: true;
  compuestoId: number;
  orden: number;
  nombreCompuesto: string;
  tipoCompuesto: TipoCompuesto;
  descansoCompuesto: number;
  ejerciciosCompuestos: EjercicioItem[];
}

// ✅ Unión discriminada
export type Item = EjercicioItem | CompuestoItem;

export type Action =
  | { type: 'SET_NOMBRE'; payload: string }
  | { type: 'SET_DESCRIPCION'; payload: string }
  | { type: 'SET_USUARIO_ID'; payload: number }
  | {
    type: 'ADD_EJERCICIO';
    payload: { diaSemana: DiaSemana; ejercicio: EjercicioAsignadoInput };
  }
  | {
    type: 'ADD_EJERCICIO_COMPUESTO';
    payload: {
      diaSemana: DiaSemana;
      ejercicios: EjercicioAsignadoInput[];
      descansoSeg: number;
      nombre: string;
      tipo: TipoCompuesto;
      compuestoId: number;
    };
  }
  | {
    type: 'UPDATE_COMPUESTO';
    payload: {
      compuestoId: number;
      nombre: string;
      tipo: TipoCompuesto;
      descansoSeg: number;
    };
  }
  | {
    // ✅ Reemplaza el compuesto completo — hijos, nombre, tipo y descanso
    type: 'UPDATE_COMPUESTO_COMPLETO';
    payload: {
      diaSemana: DiaSemana;
      compuestoId: number;
      nombre: string;
      tipo: TipoCompuesto;
      descansoSeg: number;
      ejercicios: EjercicioAsignadoInput[];
    };
  }
  | {
    type: 'UPDATE_EJERCICIO';
    payload: { diaSemana: DiaSemana; ejercicio: EjercicioAsignadoInput };
  }
  | {
    type: 'REORDER_EJERCICIOS';
    payload: { diaSemana: DiaSemana; ejercicios: EjercicioAsignadoInput[] };
  }
  | {
    type: 'REMOVE_EJERCICIO';
    payload: {
      diaSemana: DiaSemana;
      orden?: number;
      compuestoId?: number;
    };
  }
  | { type: 'CLEAR' };