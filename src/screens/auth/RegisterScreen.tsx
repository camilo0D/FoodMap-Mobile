import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import TextField from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import { registerRestaurant, registerUser } from "../../services/auth";
import { RegistroForm, registroSchema } from "../../schemas/auth";
import { colors, radius, spacing } from "../../theme";
import type { RootStackParamList } from "../../navigation/types";

export default function RegisterScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, "Registro">) {
    const { login } = useAuth();
    const [tipo, setTipo] = useState<"usuario" | "restaurante">(route.params?.tipo ?? "usuario");
    const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
    const {
        control, handleSubmit, setError, formState: { errors, isSubmitting },
    } = useForm<RegistroForm>({
        resolver: zodResolver(registroSchema),
        defaultValues: { username: "", email: "", clave: "", confirmar: "" },
    });

    const enviar = async (v: RegistroForm) => {
        setErrorGeneral(null);
        try {
            const registrar = tipo === "restaurante" ? registerRestaurant : registerUser;
            await registrar(v.username.trim(), v.email.trim(), v.clave);
            await login(v.email.trim(), v.clave); // entra directo después de registrarse
        } catch (e: any) {
            const d = e?.response?.data;
            if (e?.response?.status === 400 && d) {
                if (d.username?.[0]) setError("username", { message: d.username[0] });
                if (d.email?.[0]) setError("email", { message: d.email[0] });
                if (d.password?.[0]) setError("clave", { message: d.password[0] });
                if (!d.username && !d.email && !d.password) setErrorGeneral("No pudimos crear tu cuenta.");
            } else {
                setErrorGeneral("No pudimos conectar con el servidor. Intenta de nuevo.");
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.titulo}>Únete a FoodMap</Text>
                <Text style={styles.sub}>Descubre restaurantes cerca de ti o muestra el tuyo.</Text>

                <View style={styles.tabs}>
                    {([["usuario", "Soy comensal"], ["restaurante", "Dueño de restaurante"]] as const).map(([id, label]) => (
                        <Pressable key={id} onPress={() => setTipo(id)} style={[styles.tab, tipo === id && styles.tabActiva]}>
                            <Text style={[styles.tabTxt, tipo === id && styles.tabTxtActiva]}>{label}</Text>
                        </Pressable>
                    ))}
                </View>

                <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
                    <Controller control={control} name="username" render={({ field: { onChange, value } }) => (
                        <TextField label="Nombre de usuario" icono="person-outline" placeholder="Tu nombre de usuario"
                            value={value} onChangeText={onChange} error={errors.username?.message} />
                    )} />
                    <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
                        <TextField label="Correo electrónico" icono="mail-outline" placeholder="tu@correo.com"
                            keyboardType="email-address" value={value} onChangeText={onChange} error={errors.email?.message} />
                    )} />
                    <Controller control={control} name="clave" render={({ field: { onChange, value } }) => (
                        <TextField label="Contraseña" icono="lock-closed-outline" placeholder="Mínimo 8 caracteres" secure
                            value={value} onChangeText={onChange} error={errors.clave?.message} />
                    )} />
                    <Controller control={control} name="confirmar" render={({ field: { onChange, value } }) => (
                        <TextField label="Confirmar contraseña" icono="lock-closed-outline" placeholder="Repite tu contraseña" secure
                            value={value} onChangeText={onChange} error={errors.confirmar?.message} />
                    )} />
                </View>

                {!!errorGeneral && <Text style={styles.errorGeneral}>{errorGeneral}</Text>}

                <Pressable onPress={() => navigation.navigate("Inicio")} style={{ marginBottom: 16 }}>
                    <Text style={{ color: colors.textMuted, fontWeight: "600" }}>← Volver al inicio</Text>
                </Pressable>

                <View style={styles.pie}>
                    <Text style={styles.sub}>¿Ya tienes cuenta? </Text>
                    <Pressable onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.link}>Inicia sesión</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.xl, paddingTop: 40 },
    titulo: { fontSize: 28, fontWeight: "800", color: colors.text },
    sub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    tabs: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, marginTop: spacing.xl },
    tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: radius.pill },
    tabActiva: { backgroundColor: colors.primary },
    tabTxt: { fontWeight: "600", color: colors.textMuted, fontSize: 13 },
    tabTxtActiva: { color: "#fff" },
    errorGeneral: { color: "#B3261E", fontSize: 13, marginTop: spacing.md },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center", marginTop: spacing.xl },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
    pie: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl, marginBottom: spacing.xl },
    link: { color: colors.primary, fontWeight: "700", marginTop: 4 },
});