import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ImageSourcePropType,
} from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { MessageCircle, Send, Loader2 } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { preguntarRutinaManualIA, ChatTurn } from "@/features/api/rutinas.api";

type Message = {
  id: string;
  from: "user" | "assistant";
  text: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  rutinaJson: any; // el JSON de la rutina manual
};

const MAX_USER_QUESTIONS = 10;
const LOGO_SOURCE: ImageSourcePropType = require("../../../../assets/logo.png");

const RutinaQuestionModal: React.FC<Props> = ({
  visible,
  onClose,
  rutinaJson,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const logoScale = useRef(new Animated.Value(1)).current;

  // ✅ ref scroll para auto-scroll
  const scrollRef = useRef<ScrollView | null>(null);

  const scrollToBottom = useCallback((animated = true) => {
    // pequeño delay para que RN haya hecho layout
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.08,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    loopAnimation.start();
    return () => loopAnimation.stop();
  }, [logoScale]);

  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBgDark = "rgba(20, 28, 44, 0.9)";
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  const pastelUserLight = "#bfdbfe";
  const pastelUserDark = "#38bdf8";
  const pastelAssistantLight = "#e5e7eb";
  const pastelAssistantDark = "rgba(39,39,42,0.9)";

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!visible) {
      setMessages([]);
      setQuestion("");
      setLoading(false);
    } else {
      // ✅ al abrir, baja al final (por si hay contenido inicial)
      setTimeout(() => scrollToBottom(false), 0);
    }
  }, [visible, scrollToBottom]);

  // ✅ auto-scroll cuando cambia chat / loading
  useEffect(() => {
    if (!visible) return;
    scrollToBottom(true);
  }, [messages.length, loading, visible, scrollToBottom]);

  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;

    if (!rutinaJson || typeof rutinaJson !== "object") {
      Toast.show({
        type: "error",
        text1: "Rutina no disponible",
        text2: "Crea al menos 1 día con ejercicios antes de preguntar.",
      });
      return;
    }

    const userMessagesCount = messages.filter((m) => m.from === "user").length;
    if (userMessagesCount >= MAX_USER_QUESTIONS) {
      Toast.show({
        type: "info",
        text1: "Límite alcanzado",
        text2: `Puedes hacer hasta ${MAX_USER_QUESTIONS} preguntas por sesión.`,
      });
      return;
    }

    if (q.length > 200) {
      Toast.show({
        type: "info",
        text1: "Pregunta muy larga",
        text2: "Haz una pregunta más corta (máx. 200 caracteres).",
      });
      return;
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      from: "user",
      text: q,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    scrollToBottom(true);

    try {
      const historial: ChatTurn[] = messages.map((m) => ({
        role: m.from,
        content: m.text,
      }));

      const respuesta = await preguntarRutinaManualIA(rutinaJson, q, historial);
      if (!respuesta) return;

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        from: "assistant",
        text: respuesta,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error al preguntar sobre rutina:", err?.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "No he podido responder ahora mismo. Inténtalo de nuevo en unos minutos.",
      });
    } finally {
      setLoading(false);
      scrollToBottom(true);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <Pressable
          onPress={onClose}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.70)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 18,
            paddingVertical: 18,
          }}
        >
          <Pressable
            onPress={() => {}}
            // ✅ más altura: 86% (antes 70%)
            style={{ width: "100%", maxWidth: 520, height: "86%" }}
          >
            <LinearGradient
              colors={marcoGradient as any}
              style={{
                borderRadius: 18,
                overflow: "hidden",
                flex: 1,
                padding: 1,
              }}
            >
              <View
                style={{
                  backgroundColor: isDark ? cardBgDark : "#ffffff",
                  borderWidth: 1,
                  borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
                  borderRadius: 16,
                  flex: 1,
                  padding: 18,
                }}
              >
                {/* Header */}
                <View
                  style={{
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isDark
                        ? "rgba(15,23,42,0.9)"
                        : "#f3f4f6",
                      borderWidth: 1,
                      borderColor: isDark
                        ? "rgba(148,163,184,0.5)"
                        : "#e5e7eb",
                    }}
                  >
                    <MessageCircle
                      size={18}
                      color={isDark ? textPrimaryDark : "#111827"}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: isDark ? textPrimaryDark : "#0f172a",
                      }}
                    >
                      Coach IA · Rutina manual
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        marginTop: 2,
                        color: isDark ? textSecondaryDark : "#6b7280",
                      }}
                      numberOfLines={2}
                    >
                      Preguntas cortas sobre tu rutina (volumen, balance,
                      descansos, orden…).
                    </Text>
                  </View>
                </View>

                {/* Chat */}
                <ScrollView
                  ref={(r) => (scrollRef.current = r)}
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  onContentSizeChange={() => {
                    if (visible) scrollToBottom(true);
                  }}
                  contentContainerStyle={{
                    paddingVertical: 4,
                    // ✅ espacio extra para que el último mensaje no quede pegado al input
                    paddingBottom: 22,
                  }}
                >
                  {messages.map((m) => {
                    const isUser = m.from === "user";
                    const bubbleBg = isUser
                      ? isDark
                        ? pastelUserDark
                        : pastelUserLight
                      : isDark
                      ? pastelAssistantDark
                      : pastelAssistantLight;

                    const textColor = isUser
                      ? "#0f172a"
                      : isDark
                      ? textPrimaryDark
                      : "#111827";

                    return (
                      <View
                        key={m.id}
                        style={{
                          alignSelf: isUser ? "flex-end" : "flex-start",
                          maxWidth: "90%",
                          borderRadius: 18,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          marginBottom: 8,
                          backgroundColor: bubbleBg,
                          borderWidth: 1,
                          borderColor: isUser
                            ? isDark
                              ? "rgba(125,211,252,0.6)"
                              : "rgba(147,197,253,0.8)"
                            : isDark
                            ? "rgba(148,163,184,0.25)"
                            : "rgba(209,213,219,0.8)",
                        }}
                      >
                        <Text style={{ fontSize: 14, color: textColor }}>
                          {m.text}
                        </Text>
                      </View>
                    );
                  })}

                  {messages.length === 0 && !loading && (
                    <View style={{ marginTop: 4 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          lineHeight: 16,
                          color: isDark ? textSecondaryDark : "#6b7280",
                        }}
                      >
                        Ejemplos:
                        {"\n"}• ¿Es buena esta rutina para hipertrofia?
                        {"\n"}• ¿Hay demasiado volumen para hombro?
                        {"\n"}• ¿Cambio el orden o el descanso?
                      </Text>
                    </View>
                  )}

                  {loading && (
                    <View
                      style={{
                        marginTop: 8,
                        alignSelf: "flex-start",
                        maxWidth: "75%",
                        borderRadius: 18,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: isDark
                          ? pastelAssistantDark
                          : pastelAssistantLight,
                        borderWidth: 1,
                        borderColor: isDark
                          ? "rgba(148,163,184,0.25)"
                          : "rgba(209,213,219,0.8)",
                      }}
                    >
                      <Animated.Image
                        source={LOGO_SOURCE}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          transform: [{ scale: logoScale }],
                        }}
                        resizeMode="contain"
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          marginLeft: 8,
                          color: isDark ? textSecondaryDark : "#4b5563",
                        }}
                      >
                        Pensando la mejor respuesta...
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Input */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark
                        ? "rgba(15,23,42,0.9)"
                        : "#f3f4f6",
                      borderWidth: 1,
                      borderColor: isDark
                        ? "rgba(148,163,184,0.5)"
                        : "#e5e7eb",
                    }}
                  >
                    <TextInput
                      value={question}
                      onChangeText={setQuestion}
                      placeholder="Escribe una pregunta corta..."
                      placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                      style={{
                        flex: 1,
                        fontSize: 14,
                        color: isDark ? "#f4f4f5" : "#111827",
                      }}
                      editable={!loading}
                      maxLength={220}
                      returnKeyType="send"
                      onSubmitEditing={handleSend}
                      onFocus={() => {
                        // ✅ cuando el usuario toca input, bajamos
                        setTimeout(() => scrollToBottom(true), 120);
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={loading || !question.trim()}
                    activeOpacity={0.9}
                    style={{
                      borderRadius: 999,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: "#2563eb",
                      opacity: loading || !question.trim() ? 0.45 : 1,
                    }}
                  >
                    {loading ? (
                      <Loader2 size={16} color="#ffffff" />
                    ) : (
                      <Send size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={{ marginTop: 8 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      textAlign: "right",
                      color: isDark ? textSecondaryDark : "#9ca3af",
                    }}
                  >
                    Máx. {MAX_USER_QUESTIONS} preguntas por sesión.
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      textAlign: "right",
                      marginTop: 4,
                      color: isDark ? textSecondaryDark : "#9ca3af",
                    }}
                  >
                    Este chat{" "}
                    <Text style={{ fontWeight: "700" }}>no se guarda</Text>: al
                    cerrar se borra el historial.
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RutinaQuestionModal;
