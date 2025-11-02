// src/shared/components/auth/EnterCodeVerify.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

interface EnterCodeVerifyProps {
  onComplete: (codigo: string) => void;
  onResend: () => void;
  setComponentCode: (componentCode: boolean) => void;
}

export default function EnterCodeVerify({
  onComplete,
  onResend,
  setComponentCode,
}: EnterCodeVerifyProps) {
  const [codigo, setCodigo] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos = 600s
  const [canResend, setCanResend] = useState(false);

  const handleChange = (t: string) => {
    const value = (t || "").replace(/\D/g, "");
    if (value.length <= 6) {
      setCodigo(value);
      if (value.length === 6) {
        onComplete(value);
      }
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <View className="w-80 min-h-48 bg-white dark:bg-[#0b1220] shadow-lg rounded-2xl items-center justify-center p-4 space-y-4 relative">
      {/* Cerrar */}
      <Pressable
        onPress={() => setComponentCode(false)}
        className="absolute top-2 right-2 bg-black/90 dark:bg-white/10 px-2 py-1 rounded-full"
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      >
        <Text className="text-white dark:text-white text-base font-semibold">×</Text>
      </Pressable>

      <Text className="text-slate-700 dark:text-slate-200 text-sm font-medium">
        Ingresa el código de 6 dígitos
      </Text>

      <TextInput
        value={codigo}
        onChangeText={handleChange}
        maxLength={6}
        keyboardType="number-pad"
        placeholder="______"
        placeholderTextColor="#94A3B8"
        className="text-center border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 w-full text-lg bg-white dark:bg-[#0b1220] text-slate-900 dark:text-white"
        // tracking-widest aproximado:
        style={{ letterSpacing: 6 }}
      />

      {!canResend ? (
        <Text className="text-xs text-slate-500 dark:text-slate-400">
          Puedes reenviar en {formatTime(timeLeft)}
        </Text>
      ) : (
        <Pressable onPress={onResend}>
          <Text className="text-sm text-blue-600 dark:text-blue-400 font-medium underline">
            Reenviar código
          </Text>
        </Pressable>
      )}
    </View>
  );
}
