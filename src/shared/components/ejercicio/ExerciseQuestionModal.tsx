import React, { useEffect, useRef, useState } from "react";
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

import {
  preguntarEjercicioIA,
  preguntarEjercicioCompuestoIA,
  ChatTurn,
} from "@/features/api/ejercicios.api";

type Message = {
  id: string;
  from: "user" | "assistant";
  text: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  ejercicioId?: number;
  ejercicioCompuestoId?: number;
  esCompuesto?: boolean;
};

const MAX_USER_QUESTIONS = 10;

const LOGO_SOURCE: ImageSourcePropType = require("../../../../assets/logo.png");

const ExerciseQuestionModal: React.FC<Props> = ({
  visible,
  onClose,
  ejercicioId,
  ejercicioCompuestoId,
  esCompuesto,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const logoScale = useRef(new Animated.Value(1)).current;
  // 🔹 Ref para el ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

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

  // 🔹 Scroll al último mensaje cada vez que cambian los mensajes o el estado de carga
  useEffect(() => {
    if (messages.length > 0 || loading) {
      // Pequeño timeout para que el layout se complete antes de hacer scroll
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, loading]);

  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBgDark = "rgba(20, 28, 44, 0.9)";
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";

  const pastelUserLight = "#bfdbfe";
  const pastelUserDark = "#38bdf8";
  const pastelAssistantLight = "#e5e7eb";
  const pastelAssistantDark = "rgba(39,39,42,0.9)";

  useEffect(() => {
    if (!visible) {
      setMessages([]);
      setQuestion("");
      setLoading(false);
    }
  }, [visible]);

  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;

    const targetId = esCompuesto ? ejercicioCompuestoId : ejercicioId;

    if (!targetId) {
      Toast.show({
        type: "error",
        text1: "Ejercicio no disponible",
        text2: "No se ha podido identificar el ejercicio.",
      });
      return;
    }

    const userMessagesCount = messages.filter((m) => m.from === "user").length;

    if (userMessagesCount >= MAX_USER_QUESTIONS) {
      Toast.show({
        type: "info",
        text1: "Límite alcanzado",
        text2: "Puedes hacer hasta 10 preguntas por sesión de chat.",
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

    try {
      const historial: ChatTurn[] = messages.map((m) => ({
        role: m.from,
        content: m.text,
      }));

      const respuesta = esCompuesto
        ? await preguntarEjercicioCompuestoIA(targetId, q, historial)
        : await preguntarEjercicioIA(targetId, q, historial);

      if (!respuesta) return;

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        from: "assistant",
        text: respuesta,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error al preguntar sobre ejercicio:", err?.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No he podido responder ahora mismo. Inténtalo de nuevo en unos minutos.",
      });
    } finally {
      setLoading(false);
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
            paddingHorizontal: 24,
          }}
        >
          <Pressable
            onPress={() => { }}
            style={{
              width: "100%",
              maxWidth: 480,
              height: "70%",
            }}
          >
            <LinearGradient
              colors={marcoGradient as any}
              className="rounded-2xl p-[1px]"
              style={{ borderRadius: 18, overflow: "hidden", flex: 1 }}
            >
              <View
                className="rounded-2xl shadow p-5"
                style={{
                  backgroundColor: isDark ? cardBgDark : "#ffffff",
                  borderWidth: 1,
                  borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
                  borderRadius: 16,
                  flex: 1,
                }}
              >
                {/* Header */}
                <View className="mb-3 flex-row items-center justify-between gap-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isDark ? "rgba(15,23,42,0.9)" : "#f3f4f6",
                        borderWidth: 1,
                        borderColor: isDark ? "rgba(148,163,184,0.5)" : "#e5e7eb",
                      }}
                    >
                      <MessageCircle
                        size={18}
                        color={isDark ? textPrimaryDark : "#111827"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
                        numberOfLines={1}
                      >
                        {esCompuesto ? "Coach IA · Ejercicio compuesto" : "Coach IA · Ejercicio"}
                      </Text>
                      <Text
                        className="text-[11px] mt-[2px]"
                        style={{ color: isDark ? textSecondaryDark : "#6b7280" }}
                        numberOfLines={2}
                      >
                        {esCompuesto
                          ? "Dudas rápidas sobre la combinación."
                          : "Preguntas cortas, respuestas claras."}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 🔹 ScrollView con ref y onContentSizeChange para scroll automático */}
                <ScrollView
                  ref={scrollViewRef}
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 4, flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                  onContentSizeChange={() =>
                    scrollViewRef.current?.scrollToEnd({ animated: true })
                  }
                >
                  {messages.map((m) => {
                    const isUser = m.from === "user";
                    const bubbleBg = isUser
                      ? isDark ? pastelUserDark : pastelUserLight
                      : isDark ? pastelAssistantDark : pastelAssistantLight;
                    const textColor = isUser
                      ? "#0f172a"
                      : isDark ? textPrimaryDark : "#111827";

                    return (
                      <View
                        key={m.id}
                        className={
                          "mb-2 max-w-[90%] rounded-2xl px-3 py-2 " +
                          (isUser ? "self-end" : "self-start")
                        }
                        style={{
                          backgroundColor: bubbleBg,
                          borderWidth: 1,
                          borderColor: isUser
                            ? isDark ? "rgba(125,211,252,0.6)" : "rgba(147,197,253,0.8)"
                            : isDark ? "rgba(148,163,184,0.25)" : "rgba(209,213,219,0.8)",
                        }}
                      >
                        <Text className="text-sm" style={{ color: textColor }}>
                          {m.text}
                        </Text>
                      </View>
                    );
                  })}

                  {messages.length === 0 && !loading && (
                    <View className="mt-1">
                      <Text
                        className="text-[11px] leading-4"
                        style={{ color: isDark ? textSecondaryDark : "#6b7280" }}
                      >
                        Ejemplos:
                        {"\n"}• ¿Es buena combinación para mi objetivo?
                        {"\n"}• ¿Cambio el orden de los ejercicios?
                        {"\n"}• ¿Es adecuado el descanso?
                      </Text>
                    </View>
                  )}

                  {loading && (
                    <View
                      className="mt-2 max-w-[70%] rounded-2xl px-3 py-2 self-start flex-row items-center"
                      style={{
                        backgroundColor: isDark ? pastelAssistantDark : pastelAssistantLight,
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
                        className="text-[11px] ml-2"
                        style={{ color: isDark ? textSecondaryDark : "#4b5563" }}
                      >
                        Pensando la mejor respuesta...
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Input + botón enviar */}
                <View className="flex-row items-center gap-2 mt-3">
                  <View
                    className="flex-1 rounded-full px-3 py-[2px] flex-row items-center"
                    style={{
                      backgroundColor: isDark ? "rgba(15,23,42,0.9)" : "#f3f4f6",
                      borderWidth: 1,
                      borderColor: isDark ? "rgba(148,163,184,0.5)" : "#e5e7eb",
                    }}
                  >
                    <TextInput
                      value={question}
                      onChangeText={setQuestion}
                      placeholder="Escribe una pregunta corta..."
                      placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                      className={
                        "flex-1 text-sm py-1 " +
                        (isDark ? "text-zinc-100" : "text-zinc-900")
                      }
                      editable={!loading}
                      maxLength={220}
                      returnKeyType="send"
                      onSubmitEditing={handleSend}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={loading || !question.trim()}
                    activeOpacity={0.9}
                    style={{
                      borderRadius: 999,
                      paddingVertical: 9,
                      paddingHorizontal: 12,
                      backgroundColor: "#2563eb",
                      opacity: loading || !question.trim() ? 0.45 : 1,
                      shadowColor: "#000",
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 2 },
                    }}
                  >
                    {loading ? (
                      <Loader2 size={16} color="#ffffff" />
                    ) : (
                      <Send size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Avisos inferiores */}
                <View className="mt-2">
                  <Text
                    className="text-[10px] text-right"
                    style={{ color: isDark ? textSecondaryDark : "#9ca3af" }}
                  >
                    Máx. {MAX_USER_QUESTIONS} preguntas por sesión.
                  </Text>
                  <Text
                    className="text-[10px] mt-1 text-right"
                    style={{ color: isDark ? textSecondaryDark : "#9ca3af" }}
                  >
                    Este chat{" "}
                    <Text style={{ fontWeight: "700" }}>no se guarda</Text>: al cerrar se borra el historial.
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

export default ExerciseQuestionModal;