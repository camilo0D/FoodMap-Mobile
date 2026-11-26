import { useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import GoogleButton from "./GoogleButton";
import { useAuth } from "../context/AuthContext";
import { spacing, themed, useColors } from "../theme";

export default function GoogleSection({ tipo }: { tipo?: "usuario" | "restaurante" }) {
  const styles = useStyles();
  const colors = useColors();
    const { loginGoogle } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    if (Platform.OS !== "web") return null;

    const manejar = async (idToken: string) => {
        setError(null);
        setCargando(true);
        try {
            await loginGoogle(idToken, tipo);
        } catch (e: any) {
            setError(e?.response?.data?.error ?? "No pudimos iniciar sesión con Google.");
            setCargando(false);
        }
    };

    return (
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <GoogleButton onCredential={manejar} onError={setError} />
            {cargando && <ActivityIndicator color={colors.primary} />}
            {!!error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.separador}>
                <View style={styles.linea} />
                <Text style={styles.o}>o con tu correo</Text>
                <View style={styles.linea} />
            </View>
        </View>
    );
}

const useStyles = themed((colors) => ({
    error: { color: "#B3261E", fontSize: 13, textAlign: "center" },
    separador: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    linea: { flex: 1, height: 1, backgroundColor: colors.border },
    o: { fontSize: 12, color: colors.textMuted },
}));