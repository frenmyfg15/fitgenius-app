import { api } from './axios';


export const obtenerActividadReciente = async () => {
  try {
    const res = await api.get('/estadisticas/actividad-reciente');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener actividad reciente');
  }
};


export const obtenerDistribucionMuscular = async () => {
  try {
    const res = await api.get('/estadisticas/distribucion-muscular');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener distribución muscular');
  }
};


export const obtenerEstadisticasCalorias = async () => {
  try {
    const res = await api.get('/estadisticas/calorias');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener calorías quemadas');
  }
};


export const obtenerAdherenciaYConsistencia = async () => {
  try {
    const res = await api.get('/estadisticas/adherencia-consistencia');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener adherencia y consistencia');
  }
};

export const crearProgresoDia = async (diaId: number) => {
  try {
    const res = await api.post('/estadisticas/completar-dia', { diaId });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al registrar el día completado');
  }
};