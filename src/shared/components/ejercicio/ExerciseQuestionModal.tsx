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
import { MessageCircle, Send, Loader2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

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
  const t = scheme(isDark);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const logoScale = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, { toValue: 1.08, duration: 650, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );
    loopAnimation.start();
    return () => loopAnimation.stop();
  }, [logoScale]);

  useEffect(() => {
    if (!visible) {
      setMessages([]);
      setQuestion("");
      setLoading(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (messages.length === 0 && !loading) return;
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [messages.length, loading, visible]);

  const pastelUserDark = "#38bdf8";
  const pastelUserLight = "#bfdbfe";

  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;

    const targetId = esCompuesto ? ejercicioCompuestoId : ejercicioId;

    if (!targetId) {
      Toast.show({ type: "error", text1: "Ejercicio no disponible", text2: "No se ha podido identificar el ejercicio." });
      return;
    }

    const userMessagesCount = messages.filter((m) => m.from === "user").length;
    if (userMessagesCount >= MAX_USER_QUESTIONS) {
      Toast.show({ type: "info", text1: "Límite alcanzado", text2: "Puedes hacer hasta 10 preguntas por sesión de chat." });
      return;
    }

    if (q.length > 200) {
      Toast.show({ type: "info", text1: "Pregunta muy larga", text2: "Haz una pregunta más corta (máx. 200 caracteres)." });
      return;
    }

    const userMessage: Message = { id: `${Date.now()}-user`, from: "user", text: q };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const historial: ChatTurn[] = messages.map((m) => ({ role: m.from, content: m.text }));
      const respuesta = esCompuesto
        ? await preguntarEjercicioCompuestoIA(targetId, q, historial)
        : await preguntarEjercicioIA(targetId, q, historial);

      if (!respuesta) return;
      const assistantMessage: Message = { id: `${Date.now()}-assistant`, from: "assistant", text: respuesta };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "No he podido responder ahora mismo. Inténtalo de nuevo en unos minutos." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.70)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <Pressable
            onPress={onClose}
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
          />

          <View style={{ width: "100%", maxWidth: 480, height: "70%" }}>
            {/* Card without LinearGradient — accent border instead */}
            <View
              style={{
                flex: 1,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: Colors.accentBorder,
                backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
                padding: 20,
                minHeight: 0,
              }}
            >
              {/* Header */}
              <View style={{ marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isDark ? Colors.dark.surface : t.surface,
                      borderWidth: 1,
                      borderColor: isDark ? t.borderStrong : t.border,
                    }}
                  >
                    <MessageCircle size={18} color={t.textPrimary} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ ...TextStyle.bodySm, fontFamily: Font.body.semiBold, color: t.textPrimary }}
                      numberOfLines={1}
                    >
                      {esCompuesto ? "Coach IA · Ejercicio compuesto" : "Coach IA · Ejercicio"}
                    </Text>
                    <Text
                      style={{ ...TextStyle.caption, fontFamily: Font.body.regular, color: t.textSecondary, marginTop: 2 }}
                      numberOfLines={2}
                    >
                      {esCompuesto ? "Dudas rápidas sobre la combinación." : "Preguntas cortas, respuestas claras."}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Messages */}
              <View style={{ flex: 1, minHeight: 0 }}>
                <ScrollView
                  ref={scrollViewRef}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingVertical: 4, paddingBottom: 4 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {messages.map((m) => {
                    const isUser = m.from === "user";
                    const bubbleBg = isUser
                      ? isDark ? pastelUserDark : pastelUserLight
                      : isDark ? Colors.dark.surfaceAlt : t.surface;

                    return (
                      <View
                        key={m.id}
                        style={{
                          marginBottom: 8,
                          maxWidth: "90%",
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          alignSelf: isUser ? "flex-end" : "flex-start",
                          backgroundColor: bubbleBg,
                          borderWidth: 1,
                          borderColor: isUser
                            ? isDark ? "rgba(125,211,252,0.6)" : "rgba(147,197,253,0.8)"
                            : t.border,
                        }}
                      >
                        <Text
                          style={{ ...TextStyle.bodySm, fontFamily: Font.body.regular, color: isUser ? Colors.primary : t.textPrimary }}
                        >
                          {m.text}
                        </Text>
                      </View>
                    );
                  })}

                  {messages.length === 0 && !loading && (
                    <View style={{ marginTop: 4 }}>
                      <Text style={{ ...TextStyle.caption, fontFamily: Font.body.regular, color: t.textSecondary, lineHeight: 16 }}>
                        Ejemplos:{"\n"}• ¿Es buena combinación para mi objetivo?{"\n"}• ¿Cambio el orden de los ejercicios?{"\n"}• ¿Es adecuado el descanso?
                      </Text>
                    </View>
                  )}

                  {loading && (
                    <View
                      style={{
                        marginTop: 8,
                        maxWidth: "70%",
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        alignSelf: "flex-start",
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: isDark ? Colors.dark.surfaceAlt : t.surface,
                        borderWidth: 1,
                        borderColor: t.border,
                      }}
                    >
                      <Animated.Image
                        source={LOGO_SOURCE}
                        style={{ width: 22, height: 22, borderRadius: 999, transform: [{ scale: logoScale }] }}
                        resizeMode="contain"
                      />
                      <Text style={{ ...TextStyle.caption, fontFamily: Font.body.regular, color: t.textSecondary, marginLeft: 8 }}>
                        Pensando la mejor respuesta...
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* Input row */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 2,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isDark ? Colors.dark.surface : t.surface,
                    borderWidth: 1,
                    borderColor: isDark ? t.borderStrong : t.border,
                  }}
                >
                  <TextInput
                    value={question}
                    onChangeText={setQuestion}
                    placeholder="Escribe una pregunta corta..."
                    placeholderTextColor={t.textTertiary}
                    style={{ flex: 1, ...TextStyle.bodySm, fontFamily: Font.body.regular, color: t.textPrimary, paddingVertical: 4 }}
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
                    backgroundColor: Colors.accent,
                    opacity: loading || !question.trim() ? 0.45 : 1,
                  }}
                >
                  {loading ? (
                    <Loader2 size={16} color={Colors.primary} />
                  ) : (
                    <Send size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Footer notes */}
              <View style={{ marginTop: 8 }}>
                <Text style={{ ...TextStyle.caption, fontFamily: Font.body.regular, color: t.textSecondary, textAlign: "right" }}>
                  Máx. {MAX_USER_QUESTIONS} preguntas por sesión.
                </Text>
                <Text style={{ ...TextStyle.caption, fontFamily: Font.body.regular, color: t.textSecondary, textAlign: "right", marginTop: 4 }}>
                  Este chat <Text style={{ fontFamily: Font.body.bold }}>no se guarda</Text>: al cerrar se borra el historial.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ExerciseQuestionModal;
