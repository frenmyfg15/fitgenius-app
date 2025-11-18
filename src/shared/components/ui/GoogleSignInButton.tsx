// src/shared/components/auth/GoogleSignInButton.tsx
import React, { useState } from "react";
import { Pressable, Text, View, ActivityIndicator, Image } from "react-native";
import clsx from "clsx";
import { loginConGoogleNativo } from "@/firebase/loginConGoogleNative";

type GoogleResult = {
  token: string;
  user: {
    nombre: string | null;
    email: string | null;
    foto: string | null;
    uid: string;
  };
};

type Props = {
  text?: string;
  onSuccess?: (result: GoogleResult) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
};

export default function GoogleSignInButton({
  text = "Continuar con Google",
  onSuccess,
  onError,
  disabled,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    try {
      if (disabled || loading) return;
      setLoading(true);

      const result = await loginConGoogleNativo();
      console.log("[GoogleSignInButton] OK:", {
        token: result.token.slice(0, 24) + "...",
        user: result.user,
      });
      //@ts-ignore
      onSuccess?.(result);
    } catch (e: any) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[GoogleSignInButton] Error:", err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      className={clsx("rounded-xl overflow-hidden", className)}
      style={{
        shadowColor: "#0f172a",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        className={clsx(
          "flex-row items-center justify-center gap-3 px-4 py-3 rounded-xl border",
          "bg-white border-neutral-300",
          disabled
        )}
        accessibilityRole="button"
        accessibilityLabel={text}
      >
        {/* 🟢 Logo oficial desde assets */}
        <Image
          source={require("../../../../assets/google.webp")}
          style={{ width: 22, height: 22 }}
          resizeMode="contain"
        />

        {loading ? (
          <ActivityIndicator size="small" color="#4285F4" />
        ) : (
          <Text className="font-medium text-slate-900">{text}</Text>
        )}
      </Pressable>
    </View>
  );
}
