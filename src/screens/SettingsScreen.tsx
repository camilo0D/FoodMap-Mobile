import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { solicitarCodigo } from "../services/auth";
import { colors, radius, spacing } from "../theme";

function Fila({ icono, titulo, valor, onPress, cargando }: {
    icono: keyof typeof Ionicons.glyphMap; titulo: string; valor?: string; onPress?: () => void; cargando?: boolean;
}) {
    return (
        <Pressable style={styles.fila} onPress={onPress} disabled={!onPress}>
            <Ionicons name={icono} size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
                <Text style={styles.filaTitulo}>{titulo}</Text>
                {!!valor && <Text style={styles.filaValor}>{valor}</Text>}
            </View>
            {cargando ? <ActivityIndicator color={colors.primary} /> : onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
        </Pressable>
    );
}

export default function SettingsScreen() {
    const navigation = useNavigation<any>();
    const { usuario, logout } = useAuth();
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cambiarClave = async () => {
        if (!usuario?.email) return setError("Tu cuenta no tiene un correo registrado.");
        setEnviando(true);
        setError(null);
        try {
            await solicitarCodigo(usuario.email);
            navigation.navigate("RestablecerClave", { email: usuario.email });
        } catch {
            setError("No pudimos enviar el código. Intenta de nuevo.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
                <View>
                    <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: spacing.lg }}>
                        <Text style={styles.volver}>← Volver</Text>
                    </Pressable>
                    <Text style={styles.titulo}>Configuración</Text>
                </View>

                <Text style={styles.seccion}>Cuenta</Text>
                <View style={styles.grupo}>
                    <Fila icono="person-outline" titulo="Usuario" valor={usuario?.username} />
                    <Fila icono="mail-outline" titulo="Correo" valor={usuario?.email || "Sin correo"} />
                </View>

                <Text style={styles.seccion}>Seguridad</Text>
                <View style={styles.grupo}>
                    <Fila icono="key-outline" titulo="Cambiar contraseña" valor="Te enviaremos un código a tu correo" onPress={cambiarClave} cargando={enviando} />
                </View>
                {!!error && <Text style={styles.error}>{error}</Text>}

                <Text style={styles.seccion}>Acerca de</Text>
                <View style={styles.grupo}>
                    <Fila icono="information-circle-outline" titulo="Versión" valor={Constants.expoConfig?.version ?? "1.0.0"} />
                </View>

                <Pressable style={styles.salir} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#B3261E" />
                    <Text style={styles.salirTxt}>Cerrar sesión</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    volver: { color: colors.textMuted, fontWeight: "600" },
    titulo: { fontSize: 26, fontWeight: "800", color: colors.text },
    seccion: { fontSize: 13, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
    grupo: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden" },
    fila: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
    filaTitulo: { fontSize: 15, fontWeight: "600", color: colors.text },
    filaValor: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    error: { color: "#B3261E", fontSize: 13 },
    salir: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14 },
    salirTxt: { color: "#B3261E", fontWeight: "700" },
});