// src/features/fit/hooks/useEditarPerfil.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import Toast from "react-native-toast-message";
import {
  useUsuarioStore,
  type PerfilFormData,
} from "@/features/store/useUsuarioStore";
import { actualizarPerfil } from "@/features/api/usuario.api";

function isEqualArray(a: string[], b: string[]) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

export function useEditarPerfil() {
  const { usuario, updatePerfil } = useUsuarioStore();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<PerfilFormData>(() => ({
    pesoObjetivo: usuario?.pesoObjetivo || 0,
    sexo: usuario?.sexo || "",
    nivel: usuario?.nivelExperiencia || "",
    actividad: usuario?.actividadDiaria || "",
    objetivo: usuario?.objetivoPrincipal || "",
    duracion: usuario?.duracionSesion || "",
    lugar: usuario?.lugarEntrenamiento || "",
    enfoque: usuario?.enfoquesMusculares || [],
    limitaciones: usuario?.limitaciones || [],
    dias: usuario?.dias || [],
    equipamiento: usuario?.equipamiento || [],
  }));

  useEffect(() => {
    console.log("[EditarPerfil] Usuario cargado:", usuario);
  }, [usuario]);

  useEffect(() => {
    if (!usuario) {
      console.log("[EditarPerfil] No hay usuario, no se sincroniza formData");
      return;
    }
    const next: PerfilFormData = {
      pesoObjetivo: usuario.pesoObjetivo || 0,
      sexo: usuario.sexo || "",
      nivel: usuario.nivelExperiencia || "",
      actividad: usuario.actividadDiaria || "",
      objetivo: usuario.objetivoPrincipal || "",
      duracion: usuario.duracionSesion || "",
      lugar: usuario.lugarEntrenamiento || "",
      enfoque: usuario.enfoquesMusculares || [],
      limitaciones: usuario.limitaciones || [],
      dias: usuario.dias || [],
      equipamiento: usuario.equipamiento || [],
    };
    console.log("[EditarPerfil] Sincronizando formData desde usuario:", next);
    setFormData(next);
  }, [usuario]);

  const handleText = (name: keyof PerfilFormData, value: any) => {
    console.log("[EditarPerfil] handleText:", name, "->", value);
    setFormData((prev) => ({ ...prev, [name]: value } as PerfilFormData));
  };

  const toggleArrayValue = (
    field: "enfoque" | "limitaciones" | "dias" | "equipamiento",
    value: string
  ) => {
    console.log("[EditarPerfil] toggleArrayValue:", field, "value:", value);
    setFormData((prev) => {
      const arr = (prev[field] as string[]) || [];
      const next = arr.includes(value)
        ? arr.filter((i) => i !== value)
        : [...arr, value];
      console.log("[EditarPerfil] Nuevo valor para", field, ":", next);
      return { ...prev, [field]: next } as PerfilFormData;
    });
  };

  const hayCambios = useMemo(() => {
    if (!usuario) return false;

    const changed =
      formData.pesoObjetivo !== usuario.pesoObjetivo ||
      formData.sexo !== usuario.sexo ||
      formData.nivel !== usuario.nivelExperiencia ||
      formData.actividad !== usuario.actividadDiaria ||
      formData.objetivo !== usuario.objetivoPrincipal ||
      formData.duracion !== usuario.duracionSesion ||
      formData.lugar !== usuario.lugarEntrenamiento ||
      !isEqualArray(formData.enfoque, usuario.enfoquesMusculares || []) ||
      !isEqualArray(formData.dias, usuario.dias || []) ||
      !isEqualArray(formData.equipamiento, usuario.equipamiento || []) ||
      !isEqualArray(formData.limitaciones, usuario.limitaciones || []);

    console.log("[EditarPerfil] hayCambios:", changed, {
      formData,
      usuarioOriginal: {
        actividad: usuario.actividadDiaria,
        dias: usuario.dias,
        duracion: usuario.duracionSesion,
        enfoque: usuario.enfoquesMusculares,
        equipamiento: usuario.equipamiento,
        limitaciones: usuario.limitaciones,
        lugar: usuario.lugarEntrenamiento,
        nivel: usuario.nivelExperiencia,
        objetivo: usuario.objetivoPrincipal,
        pesoObjetivo: usuario.pesoObjetivo,
        sexo: usuario.sexo,
      },
    });

    return changed;
  }, [formData, usuario]);

  const handleSubmit = useCallback(async () => {
    if (!hayCambios) {
      console.log("[EditarPerfil] handleSubmit sin cambios, no se envía");
      return;
    }

    // ✅ MAPEAMOS al contrato ACTUAL del backend (service destruye: nivel, actividad, objetivo, duracion, lugar, enfoque...)
    const payload = {
      pesoObjetivo: Number((formData as any).pesoObjetivo) || 0,
      sexo: formData.sexo,

      nivel: formData.nivel,
      actividad: formData.actividad,
      objetivo: formData.objetivo,
      duracion: formData.duracion,
      lugar: formData.lugar,

      enfoque: formData.enfoque ?? [],
      limitaciones: formData.limitaciones ?? [],
      dias: formData.dias ?? [],
      equipamiento: formData.equipamiento ?? [],
    };

    console.log("[EditarPerfil] Payload a enviar a actualizarPerfil:", {
      payload,
      tipos: {
        pesoObjetivo: typeof payload.pesoObjetivo,
        sexo: typeof payload.sexo,
        nivel: typeof payload.nivel,
        actividad: typeof payload.actividad,
        objetivo: typeof payload.objetivo,
        duracion: typeof payload.duracion,
        lugar: typeof payload.lugar,
        enfoque: Array.isArray(payload.enfoque) ? "array" : typeof payload.enfoque,
        limitaciones: Array.isArray(payload.limitaciones)
          ? "array"
          : typeof payload.limitaciones,
        dias: Array.isArray(payload.dias) ? "array" : typeof payload.dias,
        equipamiento: Array.isArray(payload.equipamiento)
          ? "array"
          : typeof payload.equipamiento,
      },
    });

    try {
      setSaving(true);

      const res = await actualizarPerfil(payload as any);
      console.log("[EditarPerfil] Respuesta actualizarPerfil OK:", res);

      // ✅ Actualizamos el store en el formato que usa "usuario" (evita que queden keys sueltas: nivel/lugar/etc)
      useUsuarioStore.setState((prev) => ({
        ...prev,
        usuario: prev.usuario
          ? {
              ...prev.usuario,
              pesoObjetivo: payload.pesoObjetivo,
              sexo: payload.sexo,
              nivelExperiencia: payload.nivel,
              actividadDiaria: payload.actividad,
              objetivoPrincipal: payload.objetivo,
              duracionSesion: payload.duracion,
              lugarEntrenamiento: payload.lugar,
              enfoquesMusculares: payload.enfoque,
              limitaciones: payload.limitaciones,
              dias: payload.dias,
              equipamiento: payload.equipamiento,
            }
          : prev.usuario,
      }));

      Toast.show({
        type: "success",
        text1: "¡Perfil actualizado con éxito!",
      });
    } catch (err: any) {
      console.error("[EditarPerfil] Error al actualizar perfil:", err);

      if (err?.response?.data) {
        console.log(
          "[EditarPerfil] Error response.data:",
          JSON.stringify(err.response.data, null, 2)
        );
      }
      // Errores mostrados por handleApiError en la capa API
    } finally {
      setSaving(false);
    }
  }, [formData, hayCambios]);

  return {
    formData,
    handleText,
    toggleArrayValue,
    hayCambios,
    saving,
    handleSubmit,
  };
}
