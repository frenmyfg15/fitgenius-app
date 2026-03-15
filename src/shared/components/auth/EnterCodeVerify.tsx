// src/shared/components/auth/EnterCodeVerify.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";

interface EnterCodeVerifyProps {
  onComplete: (codigo: string) => Promise<void> | void;
  onResend: () => Promise<void> | void;
  setComponentCode: (componentCode: boolean) => void;
}

const CODE_LENGTH = 6;
const EXPIRE_SECONDS = 600; // 10 min
const RESEND_COOLDOWN_SECONDS = 45; // cooldown real del botón reenviar

export default function EnterCodeVerify({
  onComplete,
  onResend,
  setComponentCode,
}: EnterCodeVerifyProps) {
  const [codigo, setCodigo] = useState("");
  const [timeLeft, setTimeLeft] = useState(EXPIRE_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleVerify = async (value: string) => {
    if (value.length !== CODE_LENGTH || verifying) return;

    setVerifying(true);
    try {
      await onComplete(value);
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (t: string) => {
    const value = (t || "").replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCodigo(value);

    if (value.length === CODE_LENGTH) {
      handleVerify(value);
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;

    setResending(true);
    try {
      await onResend();
      setCodigo("");
      setTimeLeft(EXPIRE_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);

      Toast.show({
        type: "success",
        text1: "Código reenviado",
        text2: "Revisa tu correo electrónico.",
        position: "top",
      });

      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } catch {
      Toast.show({
        type: "error",
        text1: "No se pudo reenviar",
        text2: "Inténtalo de nuevo en unos segundos.",
        position: "top",
      });
    } finally {
      setResending(false);
    }
  };

  const codeExpired = timeLeft <= 0;
  const resendEnabled = resendCooldown <= 0 && !resending;

  return (
    <View className="w-80 min-h-52 bg-white dark:bg-[#0b1220] shadow-lg rounded-2xl items-center justify-center p-5 relative">
      <Pressable
        onPress={() => setComponentCode(false)}
        className="absolute top-2 right-2 bg-black/90 dark:bg-white/10 px-2 py-1 rounded-full"
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      >
        <Text className="text-white dark:text-white text-base font-semibold">
          ×
        </Text>
      </Pressable>

      <Text className="text-slate-900 dark:text-slate-100 text-base font-semibold text-center">
        Verifica tu correo
      </Text>

      <Text className="text-slate-500 dark:text-slate-400 text-sm text-center mt-2">
        Ingresa el código de 6 dígitos que te enviamos.
      </Text>

      <TextInput
        ref={inputRef}
        value={codigo}
        onChangeText={handleChange}
        maxLength={CODE_LENGTH}
        keyboardType="number-pad"
        placeholder="______"
        placeholderTextColor="#94A3B8"
        editable={!verifying}
        className="text-center border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-3 w-full text-lg bg-white dark:bg-[#0b1220] text-slate-900 dark:text-white mt-4"
        style={{ letterSpacing: 8 }}
      />

      <View className="mt-4 items-center">
        {!codeExpired ? (
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            El código expira en {formatTime(timeLeft)}
          </Text>
        ) : (
          <Text className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            El código expiró. Solicita uno nuevo.
          </Text>
        )}
      </View>

      <View className="mt-4 items-center">
        {resending ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#22c55e" />
            <Text className="text-sm text-slate-600 dark:text-slate-300">
              Reenviando código...
            </Text>
          </View>
        ) : resendEnabled ? (
          <Pressable onPress={handleResend}>
            <Text className="text-sm text-green-600 dark:text-green-400 font-semibold underline">
              Reenviar código
            </Text>
          </Pressable>
        ) : (
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            Puedes reenviar en {formatTime(resendCooldown)}
          </Text>
        )}
      </View>

      {verifying && (
        <View className="mt-4 flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#22c55e" />
          <Text className="text-sm text-slate-600 dark:text-slate-300">
            Verificando código...
          </Text>
        </View>
      )}
    </View>
  );
}