import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useColorScheme } from "nativewind";

import AlertaConfirmacion from "@/shared/components/ui/AlertaConfirmacion";

import {
  solicitarRecuperacionContrasena,
  verificarCodigoRecuperacion,
  confirmarRecuperacionContrasena,
} from "@/features/api/usuario.api";

type Step = "EMAIL" | "CODIGO" | "NUEVA_PASSWORD";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PasswordResetModal({ visible, onClose, onSuccess }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [step, setStep] = useState<Step>("EMAIL");

  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [resetId, setResetId] = useState<number | null>(null);

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [loading, setLoading] = useState(false);

  // ✅ Alertas con tu componente
  const [alertErrorOpen, setAlertErrorOpen] = useState(false);
  const [alertErrorMsg, setAlertErrorMsg] = useState("");

  const [alertSuccessOpen, setAlertSuccessOpen] = useState(false);
  const [alertSuccessTitle, setAlertSuccessTitle] = useState("Listo");
  const [alertSuccessMsg, setAlertSuccessMsg] = useState("");
  const [afterSuccess, setAfterSuccess] = useState<null | (() => void)>(null);

  const openError = (msg: string) => {
    setAlertErrorMsg(msg);
    setAlertErrorOpen(true);
  };

  const openSuccess = (title: string, msg: string, next?: () => void) => {
    setAlertSuccessTitle(title);
    setAlertSuccessMsg(msg);
    setAfterSuccess(() => next ?? null);
    setAlertSuccessOpen(true);
  };

  const title = useMemo(() => {
    if (step === "EMAIL") return "Recuperar contraseña";
    if (step === "CODIGO") return "Introduce el código";
    return "Nueva contraseña";
  }, [step]);

  const subtitle = useMemo(() => {
    if (step === "EMAIL") return "Te enviaremos un código a tu correo.";
    if (step === "CODIGO") return "Revisa tu correo y escribe el código.";
    return "Elige una contraseña nueva para tu cuenta.";
  }, [step]);

  const closeAndReset = () => {
    setStep("EMAIL");
    setCorreo("");
    setCodigo("");
    setResetId(null);
    setNuevaContrasena("");
    setConfirmarContrasena("");
    setLoading(false);

    setAlertErrorOpen(false);
    setAlertSuccessOpen(false);
    setAfterSuccess(null);

    onClose();
  };

  const canSubmitEmail = useMemo(() => {
    const c = correo.trim().toLowerCase();
    return EMAIL_RE.test(c) && !loading;
  }, [correo, loading]);

  const canSubmitCode = useMemo(() => {
    const c = codigo.trim();
    return c.length >= 4 && !loading;
  }, [codigo, loading]);

  const canSubmitPassword = useMemo(() => {
    if (loading) return false;
    if (!resetId) return false;
    if (!nuevaContrasena || nuevaContrasena.length < 8) return false;
    if (nuevaContrasena !== confirmarContrasena) return false;
    return true;
  }, [loading, resetId, nuevaContrasena, confirmarContrasena]);

  const solicitarCodigo = async () => {
    const c = correo.trim().toLowerCase();

    if (!EMAIL_RE.test(c)) {
      openError("Introduce un correo válido.");
      return;
    }

    try {
      setLoading(true);

      const resp = await solicitarRecuperacionContrasena(c);

      // ✅ Caso Google-only: backend responde 200 con errorCode
      if (resp?.errorCode === "GOOGLE_ACCOUNT") {
        openError(
          resp?.message ||
            "Esta cuenta se gestiona con Google. Inicia sesión con Google."
        );
        return;
      }

      openSuccess(
        "Código enviado",
        "Si el correo existe, recibirás un código en breve.",
        () => setStep("CODIGO")
      );
    } catch (e: any) {
      openError(e?.message || "No se pudo enviar el código.");
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigo = async () => {
    const c = correo.trim().toLowerCase();
    const code = codigo.trim();

    if (!EMAIL_RE.test(c)) {
      openError("Introduce un correo válido.");
      return;
    }
    if (!code || code.length < 4) {
      openError("Introduce un código válido.");
      return;
    }

    try {
      setLoading(true);
      const data = await verificarCodigoRecuperacion(c, code);

      const rid = (data as any)?.resetId;
      if (!rid) {
        openError("No se pudo verificar el código.");
        return;
      }

      setResetId(Number(rid));

      openSuccess(
        "Código correcto",
        "Ya puedes crear una nueva contraseña.",
        () => setStep("NUEVA_PASSWORD")
      );
    } catch (e: any) {
      // aquí te llegará message = Google o inválido
      openError(e?.message || "Código inválido o expirado.");
    } finally {
      setLoading(false);
    }
  };

  const confirmarNuevaPassword = async () => {
    if (!resetId) {
      openError("Falta la verificación del código.");
      return;
    }
    if (nuevaContrasena.length < 8) {
      openError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      openError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      await confirmarRecuperacionContrasena(resetId, nuevaContrasena);

      openSuccess(
        "Contraseña actualizada",
        "Ya puedes iniciar sesión con tu nueva contraseña.",
        () => {
          onSuccess?.();
          closeAndReset();
        }
      );
    } catch (e: any) {
      openError(e?.message || "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "CODIGO") {
      setStep("EMAIL");
      setCodigo("");
      setResetId(null);
      return;
    }
    if (step === "NUEVA_PASSWORD") {
      setStep("CODIGO");
      setNuevaContrasena("");
      setConfirmarContrasena("");
      setResetId(null);
      return;
    }
  };

  const cardBg = isDark ? "#020617" : "#ffffff";
  const border = isDark ? "rgba(148,163,184,0.35)" : "#e5e7eb";
  const textMain = isDark ? "#e5e7eb" : "#0f172a";
  const textSub = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0b1220" : "#ffffff";

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeAndReset}
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.55)",
              padding: 16,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: border,
                padding: 16,
              }}
            >
              {/* Header */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: textMain, fontSize: 18, fontWeight: "700" }}>
                  {title}
                </Text>
                <Text style={{ color: textSub, marginTop: 4, fontSize: 12 }}>
                  {subtitle}
                </Text>
              </View>

              {/* Step content */}
              {step === "EMAIL" && (
                <View style={{ gap: 10 }}>
                  <View>
                    <Text style={{ color: textMain, fontSize: 12, marginBottom: 6 }}>
                      Correo
                    </Text>
                    <TextInput
                      value={correo}
                      onChangeText={setCorreo}
                      placeholder="tu@email.com"
                      placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        backgroundColor: inputBg,
                        color: textMain,
                        borderWidth: 1,
                        borderColor: border,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 14,
                      }}
                    />
                  </View>

                  <Pressable
                    onPress={solicitarCodigo}
                    disabled={!canSubmitEmail}
                    style={{
                      marginTop: 4,
                      backgroundColor: canSubmitEmail ? "#22c55e" : "#6b7280",
                      borderRadius: 999,
                      paddingVertical: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                        Enviar código
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}

              {step === "CODIGO" && (
                <View style={{ gap: 10 }}>
                  <View>
                    <Text style={{ color: textMain, fontSize: 12, marginBottom: 6 }}>
                      Código
                    </Text>
                    <TextInput
                      value={codigo}
                      onChangeText={(t) => setCodigo(t.replace(/\s/g, ""))}
                      placeholder="123456"
                      placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                      keyboardType="number-pad"
                      style={{
                        backgroundColor: inputBg,
                        color: textMain,
                        borderWidth: 1,
                        borderColor: border,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 16,
                        letterSpacing: 2,
                      }}
                    />
                    <Text style={{ color: textSub, fontSize: 11, marginTop: 6 }}>
                      Lo enviamos a: {correo.trim().toLowerCase()}
                    </Text>
                  </View>

                  <Pressable
                    onPress={verificarCodigo}
                    disabled={!canSubmitCode}
                    style={{
                      marginTop: 4,
                      backgroundColor: canSubmitCode ? "#22c55e" : "#6b7280",
                      borderRadius: 999,
                      paddingVertical: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                        Verificar código
                      </Text>
                    )}
                  </Pressable>

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
                    <Pressable
                      onPress={goBack}
                      disabled={loading}
                      style={{
                        flex: 1,
                        backgroundColor: isDark ? "#0b1220" : "#f1f5f9",
                        borderRadius: 999,
                        paddingVertical: 10,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: border,
                      }}
                    >
                      <Text style={{ color: textMain, fontWeight: "700", fontSize: 13 }}>
                        Atrás
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={solicitarCodigo}
                      disabled={loading}
                      style={{
                        flex: 1,
                        backgroundColor: isDark ? "#0b1220" : "#f1f5f9",
                        borderRadius: 999,
                        paddingVertical: 10,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: border,
                      }}
                    >
                      <Text style={{ color: textMain, fontWeight: "700", fontSize: 13 }}>
                        Reenviar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {step === "NUEVA_PASSWORD" && (
                <View style={{ gap: 10 }}>
                  <View>
                    <Text style={{ color: textMain, fontSize: 12, marginBottom: 6 }}>
                      Nueva contraseña
                    </Text>
                    <TextInput
                      value={nuevaContrasena}
                      onChangeText={setNuevaContrasena}
                      placeholder="********"
                      placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        backgroundColor: inputBg,
                        color: textMain,
                        borderWidth: 1,
                        borderColor: border,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 14,
                      }}
                    />
                    <Text style={{ color: textSub, fontSize: 11, marginTop: 6 }}>
                      Mínimo 8 caracteres.
                    </Text>
                  </View>

                  <View>
                    <Text style={{ color: textMain, fontSize: 12, marginBottom: 6 }}>
                      Confirmar contraseña
                    </Text>
                    <TextInput
                      value={confirmarContrasena}
                      onChangeText={setConfirmarContrasena}
                      placeholder="********"
                      placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{
                        backgroundColor: inputBg,
                        color: textMain,
                        borderWidth: 1,
                        borderColor: border,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 14,
                      }}
                    />
                  </View>

                  <Pressable
                    onPress={confirmarNuevaPassword}
                    disabled={!canSubmitPassword}
                    style={{
                      marginTop: 4,
                      backgroundColor: canSubmitPassword ? "#22c55e" : "#6b7280",
                      borderRadius: 999,
                      paddingVertical: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                        Guardar contraseña
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={goBack}
                    disabled={loading}
                    style={{
                      marginTop: 6,
                      backgroundColor: isDark ? "#0b1220" : "#f1f5f9",
                      borderRadius: 999,
                      paddingVertical: 10,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: border,
                    }}
                  >
                    <Text style={{ color: textMain, fontWeight: "700", fontSize: 13 }}>
                      Atrás
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Footer */}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <Pressable
                  onPress={closeAndReset}
                  disabled={loading}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    paddingVertical: 10,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: isDark ? "#020617" : "#ffffff",
                  }}
                >
                  <Text style={{ color: textMain, fontWeight: "700", fontSize: 13 }}>
                    Cerrar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ✅ Alert error (tu alerta) */}
      <AlertaConfirmacion
        visible={alertErrorOpen}
        titulo="Atención"
        mensaje={alertErrorMsg}
        onCancelar={() => setAlertErrorOpen(false)}
        onConfirmar={() => setAlertErrorOpen(false)}
        loading={false}
        textoCancelar="Cerrar"
        textoConfirmar="Entendido"
      />

      {/* ✅ Alert success (tu alerta) */}
      <AlertaConfirmacion
        visible={alertSuccessOpen}
        titulo={alertSuccessTitle}
        mensaje={alertSuccessMsg}
        onCancelar={() => setAlertSuccessOpen(false)}
        onConfirmar={() => {
          setAlertSuccessOpen(false);
          afterSuccess?.();
        }}
        loading={false}
        textoCancelar="Cerrar"
        textoConfirmar="Continuar"
      />
    </>
  );
}
