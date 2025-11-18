import { DatosActualizables, DatosConGoogle, Usuario } from "../type/register";
import { api } from "./axios"

export const enviarVerifiacionCorreo = async (correo: Usuario['correo']) => {
  try {
    const res = await api.post('/usuario/enviarVerificacion/', { correo });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response.data.error);
  }
};

export const registrarUsuario = async (usuario: Usuario, codigo: string) => {
  try {
    const res = await api.post('/usuario/', {
      usuario,
      codigo
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response.data.error);
  }
}
export const registrarUsuarioConGoogle = async (idToken: string, datos: DatosConGoogle) => {
  try {
    const res = await api.post('/usuario/register-google/', {
      idToken,
      datos
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response.data.error);
  }
}

export const loginUsuario = async (correo: Usuario['correo'], contrasena: Usuario['contrasena']) => {
  try {
    const res = await api.post('/usuario/login/', {
      correo,
      contrasena
    });
    return res.data;
  } catch (error: any) {
    throw new Error (error.response.data.error);
  }
}

export const loginUsuarioGoogle = async (idToken: string) => {
  try {
    const res = await api.post('/usuario/login-google/', {idToken});
    return res.data;
  } catch (error: any) {
    throw new Error (error.response.data.error)
  }
}

export const logoutToken = async () => {
  try {
    const res = await api.post('/usuario/logout/');
    return res.data;
  } catch (error: any) {
    throw new Error (error.response.data.error)
  }
}

export const validarSesion = async () => {
  try {
    const res = await api.post('/usuario/validar-sesion/');
    return res.data;
  } catch (error: any) {
    throw new Error (error.response.data.error)
  }
}

export const actualizarPerfil = async (datos: DatosActualizables) => {
  try {
    const res = await api.post('/usuario/actualizar-usuario/', datos);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al actualizar perfil');
  }
};

export const cambiarContrasena = async (
  contrasenaActual: string,
  nuevaContrasena: string
) => {
  try {
    const res = await api.post("/usuario/cambiar-contrasena/", {
      contrasenaActual,
      nuevaContrasena,
    });

    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "No se pudo cambiar la contraseña");
  }
};

export const eliminarCuentaUsuario = async () => {
  try {
    const res = await api.delete('/usuario/borrar-cuenta/');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al eliminar la cuenta');
  }
};

// ⭐ NUEVA API: Obtener datos del usuario autenticado
export const getMe = async () => {
  try {
    const res = await api.get('/usuario/me/');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener usuario');
  }
};
