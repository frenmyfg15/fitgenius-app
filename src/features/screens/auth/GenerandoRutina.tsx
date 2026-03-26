import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useOnboardingStore } from "@/features/store/useOnboardingStore";
import IaGenerateAuto from "@/shared/components/ui/IaGenerateAuto";

const tokens = {
    color: {
        bgDark: "#080D17",
        bgLight: "#F8FAFC",
    },
} as const;

export default function GenerandoRutina() {
    const navigation = useNavigation<any>();
    const onboardingCompletado = useOnboardingStore((s) => s.completado);
    const marcarPendiente = useOnboardingStore((s) => s.marcarPendiente);

    const handleFinish = () => {
        // Si el onboarding no está listo, marcamos para mostrar modal en Home
        if (!onboardingCompletado) {
            marcarPendiente();
        }
        // Navegamos al stack principal (Home)
        navigation.navigate("Sesion");
    };

    const handleError = () => {
        // En caso de error, enviamos al Home igualmente para no bloquear al usuario
        navigation.navigate("Sesion");
    };

    return (
        <View style={styles.container}>
            <IaGenerateAuto
                onDone={handleFinish}
                onError={handleError}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: tokens.color.bgDark, // Opcional: manejar dinámico si es necesario
    },
});