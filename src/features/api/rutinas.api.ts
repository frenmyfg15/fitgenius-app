import { api } from "./axios";

export const crearRutina = async (payload: { nombre: string; instruccion?: string }) => {
  try {
    const res = await api.post('/rutinas/', payload);
    return res;
  } catch (error: any) {
    throw new Error(error?.message || 'Error al crear rutina');
  }
};

export const obtenerRutina = async (idRutina: number) => {
    try {
        const res = await api.get(`/rutinas/${idRutina}`);
        return res;
    } catch (error: any) {
        throw new Error(error);
    }
}

export const obtenerRutinas = async () => {
    try {
        const res = await api.get(`/rutinas/todas/`);
        return res;
    } catch (error: any) {
        throw new Error(error);
    }
}

export const eliminarRutinaPorId = async (rutinaId: number) => {
  try {
    const res = await api.delete(`/rutinas/${rutinaId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al eliminar rutina');
  }
};

export const actualizarRutinaActiva = async (rutinaId: number) => {
  try {
    const res = await api.post('/rutinas/rutina-activa', { rutinaId });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al actualizar rutina activa');
  }
};

export const crearRutinaPersonalizada = async (
  data: any,
  id?: number
) => {
  try {
    if (typeof id === 'number') {
      // UPDATE
      const res = await api.put('/rutinas/crear', data, { params: { id } })
      return res.data
    } else {
      // CREATE
      const res = await api.post('/rutinas/crear', data)
      return res.data
    }
  } catch (error: any) {
    const msgCreate = 'Error al crear la rutina'
    const msgUpdate = 'Error al actualizar la rutina'
    const fallback = typeof id === 'number' ? msgUpdate : msgCreate
    throw new Error(error?.response?.data?.error || fallback)
  }
}
