// src/features/fit/hooks/useEditarPerfil.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { Toast } from "@/shared/components/ui/Toast";
import {
  useUsuarioStore,
  type PerfilFormData,
} from "@/features/store/useUsuarioStore";
import { actualizarPerfil } from "@/features/api/usuario.api";

function isEqualArray(a: string[], b: string[]) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

export function useEditarPerfil() {
  const { usuario } = useUsuarioStore();
  const [saving, setSaving] = useState(false);

  const buildForm = (u: typeof usuario): PerfilFormData => ({
    pesoObjetivo: u?.pesoObjetivo || 0,
    sexo: u?.sexo || "",
    nivel: u?.nivelExperiencia || "",
    actividad: u?.actividadDiaria || "",
    objetivo: u?.objetivoPrincipal || "",
    duracion: u?.duracionSesion || "",
    lugar: u?.lugarEntrenamiento || "",
    enfoque: u?.enfoquesMusculares || [],
    limitaciones: u?.limitaciones || [],
    dias: u?.dias || [],
    equipamiento: u?.equipamiento || [],
  });

  const [formData, setFormData] = useState<PerfilFormData>(() => buildForm(usuario));

  useEffect(() => {
    if (!usuario) return;
    setFormData(buildForm(usuario));
  }, [usuario]);

  const handleText = (name: keyof PerfilFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value } as PerfilFormData));
  };

  const toggleArrayValue = (
    field: "enfoque" | "limitaciones" | "dias" | "equipamiento",
    value: string
  ) => {
    setFormData((prev) => {
      const arr = (prev[field] as string[]) || [];
      const next = arr.includes(value)
        ? arr.filter((i) => i !== value)
        : [...arr, value];
      return { ...prev, [field]: next } as PerfilFormData;
    });
  };

  const hayCambios = useMemo(() => {
    if (!usuario) return false;
    return (
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
      !isEqualArray(formData.limitaciones, usuario.limitaciones || [])
    );
  }, [formData, usuario]);

  const handleSubmit = useCallback(async () => {
    if (!hayCambios) return;

    const payload = {
      pesoObjetivo: Number(formData.pesoObjetivo) || 0,
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

    try {
      setSaving(true);
      await actualizarPerfil(payload as any);

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
        text1: "Perfil actualizado",
        text2: "Tus cambios se han guardado correctamente.",
      });
    } catch {
      // Errores gestionados por handleApiError en la capa API
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