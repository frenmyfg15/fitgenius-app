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
import { useColorScheme } from "nativewind";

/* ---------- Tipos ---------- */

type GlobalErrorContextValue = {
  showError: (message: string, errorCode?: string) => void;
};

type Props = {
  children: ReactNode;
};

/* ---------- Contexto ---------- */

const GlobalErrorContext = createContext<GlobalErrorContextValue | null>(null);

let externalShowError: (message: string, errorCode?: string) => void = () => { };

export function useGlobalError() {
  const ctx = useContext(GlobalErrorContext);
  if (!ctx) {
    throw new Error("useGlobalError debe usarse dentro de GlobalErrorModalProvider");
  }
  return ctx;
}

export function showGlobalError(message: string, errorCode?: string) {
  externalShowError(message, errorCode);
}

/* ---------- Provider ---------- */

export function GlobalErrorModalProvider({ children }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>("");

  const showError = useCallback((msg: string, _code?: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  useEffect(() => {
    externalShowError = showError;
  }, [showError]);

  const bg = isDark ? "#141c2c" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#64748b" : "#94a3b8";
  const overlay = "rgba(0,0,0,0.5)";

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
              backgroundColor: overlay,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 28,
            }}
          >
            <TouchableWithoutFeedback onPress={() => { }}>
              <View
                style={{
                  width: "100%",
                  maxWidth: 400,
                  backgroundColor: bg,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: border,
                  paddingHorizontal: 24,
                  paddingTop: 28,
                  paddingBottom: 20,
                }}
              >
                {/* Icono de alerta */}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isDark
                      ? "rgba(239,68,68,0.12)"
                      : "rgba(239,68,68,0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: isDark ? "#f87171" : "#dc2626",
                    }}
                  >
                    !
                  </Text>
                </View>

                {/* Título */}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: textPrimary,
                    marginBottom: 8,
                  }}
                >
                  Algo ha ido mal
                </Text>

                {/* Mensaje */}
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 22,
                    color: textSecondary,
                    marginBottom: 24,
                  }}
                >
                  {message}
                </Text>

                {/* Botón */}
                <Pressable
                  onPress={hide}
                  style={({ pressed }) => ({
                    alignSelf: "flex-end",
                    paddingHorizontal: 20,
                    paddingVertical: 9,
                    borderRadius: 8,
                    backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                    borderWidth: 1,
                    borderColor: border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: textPrimary,
                    }}
                  >
                    Entendido
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </GlobalErrorContext.Provider>
  );
}