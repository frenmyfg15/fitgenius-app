import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import * as Clipboard from "expo-clipboard";

/* ---------- Tipos ---------- */

type GlobalErrorContextValue = {
  showError: (message: string, errorCode?: string) => void;
};

type Props = {
  children: ReactNode;
};

/* ---------- Contexto ---------- */

const GlobalErrorContext = createContext<GlobalErrorContextValue | null>(null);

// función imperativa que se rellena cuando el provider se monta
let externalShowError: (message: string, errorCode?: string) => void = () => {};

/**
 * Hook para usar el modal global desde componentes React
 */
export function useGlobalError() {
  const ctx = useContext(GlobalErrorContext);
  if (!ctx) {
    throw new Error("useGlobalError debe usarse dentro de GlobalErrorModalProvider");
  }
  return ctx;
}

/**
 * Función para mostrar el error desde cualquier sitio (libs, etc.)
 * Ej: showGlobalError("Mensaje", "CODIGO_ERROR");
 */
export function showGlobalError(message: string, errorCode?: string) {
  externalShowError(message, errorCode);
}

/* ---------- Provider ---------- */

export function GlobalErrorModalProvider({ children }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const showError = useCallback((msg: string, code?: string) => {
    setMessage(msg);
    setErrorCode(code);
    setCopied(false);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    // registramos la función para uso global
    externalShowError = showError;
  }, [showError]);

  // 🎨 estilos inspirados en IMCVisual
  const cardBgDark = "rgba(20, 28, 44, 0.9)";
  const cardBorderDark = "rgba(255,255,255,0.12)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];

  const overlayBg = "rgba(15,23,42,0.85)";

  const handleCopy = async () => {
    if (!errorCode) return;
    await Clipboard.setStringAsync(errorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlobalErrorContext.Provider value={{ showError }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hide}
      >
        <TouchableWithoutFeedback onPress={hide}>
          <View
            style={{
              flex: 1,
              backgroundColor: overlayBg,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <LinearGradient
                colors={marcoGradient as any}
                style={{
                  width: "100%",
                  borderRadius: 18,
                  padding: 1,
                  maxWidth: 480,
                }}
              >
                <View
                  style={{
                    borderRadius: 16,
                    padding: 20,
                    backgroundColor: isDark ? cardBgDark : "#ffffff",
                    borderWidth: 1,
                    borderColor: isDark
                      ? cardBorderDark
                      : "rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Título */}
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color: isDark ? textPrimaryDark : "#0f172a",
                      marginBottom: 8,
                    }}
                  >
                    Problema detectado
                  </Text>

                  {/* Mensaje principal */}
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? textPrimaryDark : "#111827",
                      marginBottom: 14,
                    }}
                  >
                    {message}
                  </Text>

                  {/* Texto auxiliar */}
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDark ? textSecondaryDark : "#6b7280",
                      marginBottom: errorCode ? 12 : 16,
                    }}
                  >
                    Si el problema persiste, contacta con soporte y copia este
                    código de error.
                  </Text>

                  {/* Bloque copiable con el código */}
                  {errorCode && (
                    <Pressable
                      onPress={handleCopy}
                      style={{
                        backgroundColor: isDark
                          ? "rgba(148,163,184,0.15)"
                          : "#f3f4f6",
                        borderWidth: 1,
                        borderColor: isDark
                          ? "rgba(255,255,255,0.10)"
                          : "#e5e7eb",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "monospace",
                          letterSpacing: 0.5,
                          fontSize: 13,
                          color: isDark ? "#e5e7eb" : "#111827",
                          marginBottom: 4,
                        }}
                      >
                        {errorCode}
                      </Text>

                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: isDark ? "#94a3b8" : "#6b7280",
                        }}
                      >
                        {copied ? "Copiado ✓" : "Tocar para copiar"}
                      </Text>
                    </Pressable>
                  )}

                  {/* Botón Aceptar */}
                  <View style={{ alignItems: "flex-end" }}>
                    <Pressable
                      onPress={hide}
                      style={({ pressed }) => ({
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 999,
                        backgroundColor: isDark ? "#22C55E" : "#16a34a",
                        opacity: pressed ? 0.85 : 1,
                        shadowColor: "#000",
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 2 },
                      })}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 14,
                          fontWeight: "700",
                        }}
                      >
                        Aceptar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </LinearGradient>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </GlobalErrorContext.Provider>
  );
}
