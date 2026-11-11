import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import TextField from "../../components/TextField";
import { solicitarCodigo } from "../../services/auth";
import { RecuperarForm, recuperarSchema } from "../../schemas/auth";
import { colors, radius, spacing } from "../../theme";
import type { RootStackParamList } from "../../navigation/types";

export default function ForgotPasswordScreen({
    navigation,
}: NativeStackScreenProps<RootStackParamList, "RecuperarClave">) {
    const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
    const {
        control, handleSubmit, formState: { errors, isSubmitting },
    } = useForm<RecuperarForm>({ resolver: zodResolver(recuperarSchema), defaultValues: { email: "" } });

    const enviar = async (v: RecuperarForm) => {
        setErrorGeneral(null);
        try {
            await solicitarCodigo(v.email.trim());
            navigation.navigate("RestablecerClave", { email: v.email.trim() });
        } catch (e: any) {
            setErrorGeneral(
                e?.response?.status === 429
                    ? "Demasiados intentos. Espera un rato y vuelve a intentarlo."
                    : "No pudimos conectar con el servidor. Intenta de nuevo."
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: spacing.lg }}>
                    <Text style={styles.volver}>← Volver</Text>
                </Pressable>

                <View style={styles.icono}>
                    <Ionicons name="key-outline" size={28} color="#fff" />
                </View>
                <Text style={styles.titulo}>Recupera tu contraseña</Text>
                <Text style={styles.sub}>
                    Escribe el correo de tu cuenta y te enviaremos un código de 6 dígitos para crear una contraseña nueva.
                </Text>

                <View style={{ marginTop: spacing.xl }}>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                label="Correo electrónico" icono="mail-outline" placeholder="tu@correo.com"
                                keyboardType="email-address" value={value} onChangeText={onChange}
                                error={errors.email?.message}
                            />
                        )}
                    />
                </View>

                {!!errorGeneral && <Text style={styles.errorGeneral}>{errorGeneral}</Text>}

                <Pressable style={styles.boton} onPress={handleSubmit(enviar)} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Enviar código</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.xl },
    volver: { color: colors.textMuted, fontWeight: "600" },
    icono: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    titulo: { fontSize: 26, fontWeight: "800", color: colors.text, marginTop: spacing.lg },
    sub: { fontSize: 14, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
    errorGeneral: { color: "#B3261E", fontSize: 13, marginTop: spacing.md },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center", marginTop: spacing.xl },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});