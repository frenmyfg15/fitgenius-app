import { api } from "./axios";

// === EJERCICIO SIMPLE ===
export const obtenerEjercicio = async (nombreEjercicio: string) => {
  try {
    const res = await api.get(`/ejercicios/${encodeURIComponent(nombreEjercicio)}`);
    return res;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || "Error al obtener el ejercicio");
  }
};

export const guardarSesionEjercicio = async (payload: {
  usuarioId: number;
  ejercicioId: number;
  series: { peso: number; reps: number }[];
  ejercicioAsignado : number
}) => {
  try {
    const res = await api.post('/ejercicios/sesion-ejercicio', payload);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'Error al guardar la sesión del ejercicio');
  }
};

export const completarSesionEjercicio = async (payload: {
  usuarioId: number;
  ejercicioId: number;
}) => {
  try {
    const res = await api.patch('/ejercicios/sesion-ejercicio/completar', payload);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'Error al marcar como completado');
  }
};

export type EjercicioDTO = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  idGif: string;
  tipoEjercicio: string;
  grupoMuscular: string;
};

export type BuscarEjerciciosResponse = {
  items: EjercicioDTO[];
  nextCursor: number | null;
  hasMore: boolean;
};

export type BuscarEjerciciosParams = {
  search?: string;
  grupoMuscular?: string;   // 'PECHOS' | 'ESPALDA' | ...
  tipoEjercicio?: string;   // en tu schema es string
  take?: number;            // tamaño de página (default 30)
  cursor?: number | null;   // id del último elemento recibido
};

export const buscarEjercicios = async ({
  search,
  grupoMuscular,
  tipoEjercicio,
  take = 30,
  cursor = null,
}: BuscarEjerciciosParams): Promise<BuscarEjerciciosResponse> => {
  try {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (grupoMuscular) params.set('grupoMuscular', grupoMuscular);
    if (tipoEjercicio) params.set('tipoEjercicio', tipoEjercicio);

    // paginación
    if (take) params.set('take', String(take));
    if (cursor != null) params.set('cursor', String(cursor));

    const { data } = await api.get<BuscarEjerciciosResponse>(`/ejercicios?${params.toString()}`);
    // data: { items, nextCursor, hasMore }
    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'Error al buscar ejercicios');
  }
};



// === EJERCICIO COMPUESTO ===
export const obtenerEjercicioCompuesto = async (id: number) => {
  try {
    const res = await api.get(`/ejercicios/compuestos/${id}`);
    return res.data; // { compuesto, ultimaSesion }
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || "Error al obtener el ejercicio compuesto");
  }
};

export const guardarSesionCompuesta = async (payload: {
  usuarioId: number;
  ejercicioCompuestoId: number;
  series: {
    ejercicioId: number;
    pesoKg?: number;
    repeticiones?: number;
    duracionSegundos?: number;
  }[][];
}) => {
  try {
    const res = await api.post('/ejercicios/sesiones/compuesta', payload);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'Error al guardar la sesión compuesta');
  }
};
