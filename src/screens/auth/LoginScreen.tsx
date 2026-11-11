import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Logo from "../../components/Logo";
import TextField from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import { LoginForm, loginSchema } from "../../schemas/auth";
import { colors, radius, spacing } from "../../theme";
import type { RootStackParamList } from "../../navigation/types";

export default function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Login">) {
    const { login } = useAuth();
    const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
    const {
        control, handleSubmit, formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { identificador: "", clave: "" } });

    const enviar = async (v: LoginForm) => {
        setErrorGeneral(null);
        try {
            await login(v.identificador.trim(), v.clave);
        } catch (e: any) {
            setErrorGeneral(
                e?.response?.status === 401
                    ? "Credenciales incorrectas. Revisa tu usuario y contraseña."
                    : "No pudimos conectar con el servidor. Intenta de nuevo."
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Pressable onPress={() => navigation.navigate("Inicio")} style={{ marginBottom: spacing.lg }}>
                    <Text style={styles.volver}>← Volver al inicio</Text>
                </Pressable>

                <Logo size={56} />
                <Text style={styles.marca}>FoodMap</Text>
                <Text style={styles.titulo}>Bienvenido de nuevo</Text>
                <Text style={styles.sub}>Inicia sesión en tu cuenta de FoodMap.</Text>

                <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
                    <Controller
                        control={control}
                        name="identificador"
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                label="Correo electrónico o usuario" icono="mail-outline" placeholder="tu@correo.com"
                                keyboardType="email-address" value={value} onChangeText={onChange}
                                error={errors.identificador?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="clave"
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                label="Contraseña" icono="lock-closed-outline" placeholder="••••••••" secure
                                value={value} onChangeText={onChange} error={errors.clave?.message}
                            />
                        )}
                    />
                    <Pressable onPress={() => navigation.navigate("RecuperarClave")} style={{ alignSelf: "flex-end" }}>
                        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
                    </Pressable>
                </View>

                {!!errorGeneral && <Text style={styles.errorGeneral}>{errorGeneral}</Text>}

                <Pressable style={styles.boton} onPress={handleSubmit(enviar)} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Iniciar sesión</Text>}
                </Pressable>

                <View style={styles.pie}>
                    <Text style={styles.sub}>¿No tienes cuenta? </Text>
                    <Pressable onPress={() => navigation.navigate("Registro")}>
                        <Text style={styles.link}>Regístrate</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.xl, paddingTop: spacing.xl },
    volver: { color: colors.textMuted, fontWeight: "600" },
    marca: { fontSize: 18, fontWeight: "800", color: colors.primary, marginTop: spacing.sm },
    titulo: { fontSize: 28, fontWeight: "800", color: colors.text, marginTop: spacing.xl },
    sub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    errorGeneral: { color: "#B3261E", fontSize: 13, marginTop: spacing.md },
    boton: {
        backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15,
        alignItems: "center", marginTop: spacing.xl,
    },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
    pie: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
    link: { color: colors.primary, fontWeight: "700", marginTop: 4 },
});