import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import TextField from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import { restablecerClave, solicitarCodigo } from "../../services/auth";
import { RestablecerForm, restablecerSchema } from "../../schemas/auth";
import { colors, radius, spacing } from "../../theme";
import type { RootStackParamList } from "../../navigation/types";

export default function ResetPasswordScreen({
    navigation, route,
}: NativeStackScreenProps<RootStackParamList, "RestablecerClave">) {
    const { email } = route.params;
    const { usuario, logout } = useAuth();
    const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
    const [aviso, setAviso] = useState<string | null>(null);
    const [hecho, setHecho] = useState(false);
    const {
        control, handleSubmit, setError, formState: { errors, isSubmitting },
    } = useForm<RestablecerForm>({
        resolver: zodResolver(restablecerSchema),
        defaultValues: { codigo: "", clave: "", confirmar: "" },
    });

    const enviar = async (v: RestablecerForm) => {
        setErrorGeneral(null);
        setAviso(null);
        try {
            await restablecerClave(email, v.codigo, v.clave);
            setHecho(true);
        } catch (e: any) {
            const d = e?.response?.data;
            if (d?.password?.[0]) setError("clave", { message: d.password[0] });
            else if (e?.response?.status === 429) setErrorGeneral("Demasiados intentos. Espera un rato.");
            else if (d?.detail) setErrorGeneral(d.detail);
            else setErrorGeneral("No pudimos conectar con el servidor. Intenta de nuevo.");
        }
    };

    const reenviar = async () => {
        setErrorGeneral(null);
        try {
            await solicitarCodigo(email);
            setAviso("Te enviamos un código nuevo.");
        } catch {
            setErrorGeneral("No pudimos reenviar el código. Intenta más tarde.");
        }
    };

    if (hecho) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.scroll, { alignItems: "center", marginTop: 60 }]}>
                    <View style={[styles.icono, { backgroundColor: "#2E9E5B" }]}>
                        <Ionicons name="checkmark" size={32} color="#fff" />
                    </View>
                    <Text style={[styles.titulo, { textAlign: "center" }]}>¡Contraseña actualizada!</Text>
                    <Text style={[styles.sub, { textAlign: "center" }]}>
                        Por seguridad cerramos tus otras sesiones. Inicia sesión con tu nueva contraseña.
                    </Text>
                    <Pressable
                        style={[styles.boton, { alignSelf: "stretch" }]}
                        onPress={() => (usuario ? logout() : navigation.navigate("Login"))}
                    >
                        <Text style={styles.botonTxt}>Ir a iniciar sesión</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: spacing.lg }}>
                    <Text style={styles.volver}>← Volver</Text>
                </Pressable>

                <Text style={styles.titulo}>Revisa tu correo</Text>
                <Text style={styles.sub}>
                    Si <Text style={{ fontWeight: "700", color: colors.text }}>{email}</Text> está registrado, te enviamos un
                    código de 6 dígitos. Vence en 15 minutos.
                </Text>

                <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
                    <Controller control={control} name="codigo" render={({ field: { onChange, value } }) => (
                        <TextField label="Código de verificación" icono="shield-checkmark-outline" placeholder="123456"
                            keyboardType="number-pad" maxLength={6} value={value} onChangeText={onChange}
                            error={errors.codigo?.message} />
                    )} />
                    <Controller control={control} name="clave" render={({ field: { onChange, value } }) => (
                        <TextField label="Contraseña nueva" icono="lock-closed-outline" placeholder="Mínimo 8 caracteres" secure
                            value={value} onChangeText={onChange} error={errors.clave?.message} />
                    )} />
                    <Controller control={control} name="confirmar" render={({ field: { onChange, value } }) => (
                        <TextField label="Confirmar contraseña" icono="lock-closed-outline" placeholder="Repite tu contraseña" secure
                            value={value} onChangeText={onChange} error={errors.confirmar?.message} />
                    )} />
                </View>

                {!!errorGeneral && <Text style={styles.errorGeneral}>{errorGeneral}</Text>}
                {!!aviso && <Text style={styles.aviso}>{aviso}</Text>}

                <Pressable style={styles.boton} onPress={handleSubmit(enviar)} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Cambiar contraseña</Text>}
                </Pressable>

                <Pressable onPress={reenviar} style={{ alignItems: "center", marginTop: spacing.lg }}>
                    <Text style={styles.link}>¿No te llegó? Reenviar código</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.xl },
    volver: { color: colors.textMuted, fontWeight: "600" },
    icono: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
    titulo: { fontSize: 26, fontWeight: "800", color: colors.text, marginTop: spacing.lg },
    sub: { fontSize: 14, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
    errorGeneral: { color: "#B3261E", fontSize: 13, marginTop: spacing.md },
    aviso: { color: "#1F7A44", fontSize: 13, marginTop: spacing.md },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center", marginTop: spacing.xl },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
    link: { color: colors.primary, fontWeight: "700" },
});