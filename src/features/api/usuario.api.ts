import { DatosActualizables, DatosConGoogle, Usuario } from "../type/register";
import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid"; // ✅ NUEVO

const log = (...args: any[]) => {
  if (__DEV__) console.log("[API usuario]", ...args);
};

export const enviarVerifiacionCorreo = async (correo: Usuario["correo"]) => {
  try {
    log("enviarVerifiacionCorreo → /usuario/enviarVerificacion/");
    const res = await api.post("/usuario/enviarVerificacion/", { correo });
    log("enviarVerifiacionCorreo ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(
      error,
      "No se pudo enviar el correo de verificación"
    );
    throw apiError;
  }
};

export const registrarUsuario = async (usuario: Usuario, codigo: string) => {
  try {
    log("registrarUsuario → /usuario/");
    const res = await api.post("/usuario/", { usuario, codigo });
    log("registrarUsuario ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo completar el registro");
    throw apiError;
  }
};

export const registrarUsuarioConGoogle = async (
  idToken: string,
  datos: DatosConGoogle
) => {
  try {
    log("registrarUsuarioConGoogle → /usuario/register-google/");
    const res = await api.post("/usuario/register-google/", { idToken, datos });
    log("registrarUsuarioConGoogle ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo registrar con Google");
    throw apiError;
  }
};

export const loginUsuario = async (
  correo: Usuario["correo"],
  contrasena: Usuario["contrasena"]
) => {
  try {
    log("loginUsuario → /usuario/login/");
    const res = await api.post("/usuario/login/", { correo, contrasena });
    log("loginUsuario ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo iniciar sesión");
    throw apiError;
  }
};

export const loginUsuarioGoogle = async (idToken: string) => {
  try {
    log("loginUsuarioGoogle → /usuario/login-google/");
    const res = await api.post("/usuario/login-google/", { idToken });
    log("loginUsuarioGoogle ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo iniciar sesión con Google");
    throw apiError;
  }
};

export const logoutToken = async () => {
  try {
    log("logoutToken → /usuario/logout/");
    const res = await api.post("/usuario/logout/");
    log("logoutToken ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo cerrar sesión");
    throw apiError;
  }
};

export const validarSesion = async () => {
  try {
    log("validarSesion → /usuario/validar-sesion/");
    const res = await api.post("/usuario/validar-sesion/");
    log("validarSesion ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo validar la sesión");
    throw apiError;
  }
};

export const actualizarPerfil = async (datos: DatosActualizables) => {
  try {
    log("actualizarPerfil → /usuario/actualizar-usuario/");
    const res = await api.post("/usuario/actualizar-usuario/", datos);
    log("actualizarPerfil ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "Error al actualizar el perfil");
    throw apiError;
  }
};

export const cambiarContrasena = async (
  contrasenaActual: string,
  nuevaContrasena: string
) => {
  try {
    log("cambiarContrasena → /usuario/cambiar-contrasena/");
    const res = await api.post("/usuario/cambiar-contrasena/", {
      contrasenaActual,
      nuevaContrasena,
    });
    log("cambiarContrasena ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo cambiar la contraseña");
    throw apiError;
  }
};

export const eliminarCuentaUsuario = async () => {
  try {
    log("eliminarCuentaUsuario → /usuario/borrar-cuenta/");
    const res = await api.delete("/usuario/borrar-cuenta/");
    log("eliminarCuentaUsuario ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo eliminar la cuenta");
    throw apiError;
  }
};

// ⭐ Actualizar peso y/o altura del usuario
export const actualizarMedidas = async (datos: { peso?: number; altura?: number }) => {
  try {
    log("actualizarMedidas → /usuario/actualizar-usuario/");
    const res = await api.post("/usuario/actualizar-usuario/", datos);
    log("actualizarMedidas ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error);
    const apiError = handleApiError(error, "Error al actualizar medidas");
    throw apiError;
  }
};

// ⭐ Mediciones de peso (valor siempre en KG)
export const registrarPeso = async (kg: number) => {
  try {
    log("registrarPeso → /usuario/medicion/peso/");
    const res = await api.post("/usuario/medicion/peso/", { valor: kg });
    log("registrarPeso ←", { status: res.status });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error);
    const apiError = handleApiError(error, "No se pudo registrar el peso");
    throw apiError;
  }
};

export const obtenerHistorialPeso = async () => {
  try {
    log("obtenerHistorialPeso → /usuario/medicion/peso/");
    const res = await api.get("/usuario/medicion/peso/");
    log("obtenerHistorialPeso ←", { status: res.status });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error);
    const apiError = handleApiError(error, "No se pudo obtener el historial de peso");
    throw apiError;
  }
};

// ⭐ Mediciones de altura (valor siempre en CM)
export const registrarAltura = async (cm: number) => {
  try {
    log("registrarAltura → /usuario/medicion/altura/");
    const res = await api.post("/usuario/medicion/altura/", { valor: cm });
    log("registrarAltura ←", { status: res.status });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error);
    const apiError = handleApiError(error, "No se pudo registrar la altura");
    throw apiError;
  }
};

export const obtenerHistorialAltura = async () => {
  try {
    log("obtenerHistorialAltura → /usuario/medicion/altura/");
    const res = await api.get("/usuario/medicion/altura/");
    log("obtenerHistorialAltura ←", { status: res.status });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error);
    const apiError = handleApiError(error, "No se pudo obtener el historial de altura");
    throw apiError;
  }
};

// ⭐ Obtener datos del usuario autenticado
export const getMe = async () => {
  try {
    log("getMe → /usuario/me/");
    const res = await api.get("/usuario/me/");
    log("getMe ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "Error al obtener los datos del usuario");
    throw apiError;
  }
};

// ⭐ Marcar onboarding como visto
export const marcarOnboardingVisto = async () => {
  try {
    log("marcarOnboardingVisto → /usuario/onboarding/visto/");
    const res = await api.post("/usuario/onboarding/visto/");
    log("marcarOnboardingVisto ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo marcar el tutorial como visto");
    throw apiError;
  }
};

// 🔐 Recuperar contraseña (v1)

// 1) Solicitar código
export const solicitarRecuperacionContrasena = async (correo: Usuario["correo"]) => {
  try {
    log("solicitarRecuperacionContrasena → /usuario/recuperar-contrasena");
    const res = await api.post("/usuario/recuperar-contrasena", { correo });
    log("solicitarRecuperacionContrasena ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });

    const payload = res.data?.data ?? res.data;

    // ✅ Caso especial: usuario Google-only (backend responde 200 con errorCode)
    if (payload?.errorCode === "GOOGLE_ACCOUNT") {
      return payload; // { ok:true, errorCode:"GOOGLE_ACCOUNT", message:"..." }
    }

    return payload;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(
      error,
      "No se pudo iniciar la recuperación de contraseña"
    );
    throw apiError;
  }
};

// 2) Verificar código (devuelve resetId)
export const verificarCodigoRecuperacion = async (
  correo: Usuario["correo"],
  codigo: string
) => {
  try {
    log("verificarCodigoRecuperacion → /usuario/recuperar-contrasena/verificar");
    const res = await api.post("/usuario/recuperar-contrasena/verificar", {
      correo,
      codigo,
    });
    log("verificarCodigoRecuperacion ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data; // { resetId }
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "Código inválido o expirado");
    throw apiError;
  }
};

// 3) Confirmar nueva contraseña (usa resetId)
export const confirmarRecuperacionContrasena = async (
  resetId: number,
  nuevaContrasena: string
) => {
  try {
    log("confirmarRecuperacionContrasena → /usuario/recuperar-contrasena/confirmar");
    const res = await api.post("/usuario/recuperar-contrasena/confirmar", {
      resetId,
      nuevaContrasena,
    });
    log("confirmarRecuperacionContrasena ←", {
      status: res.status,
      keys: Object.keys(res.data || {}),
    });
    return res.data?.data ?? res.data;
  } catch (error) {
    checkAuthTokenInvalid(error); // ✅
    const apiError = handleApiError(error, "No se pudo actualizar la contraseña");
    throw apiError;
  }
};