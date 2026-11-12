import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import Avatar from "../components/Avatar";
import TextField from "../components/TextField";
import { actualizarPerfil, FotoElegida, getPerfil } from "../services/profile";
import { colors, radius, spacing } from "../theme";
import type { Perfil } from "../types";

export default function EditProfileScreen() {
    const navigation = useNavigation<any>();
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [nombre, setNombre] = useState("");
    const [bio, setBio] = useState("");
    const [foto, setFoto] = useState<FotoElegida | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getPerfil().then((p) => { setPerfil(p); setNombre(p.nombre ?? ""); setBio(p.bio ?? ""); }).catch(() => setError("No pudimos cargar tu perfil."));
    }, []);

    const elegirFoto = async () => {
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [1, 1] });
        if (r.canceled) return;
        const a = r.assets[0];
        setFoto({ uri: a.uri, name: a.fileName ?? "avatar.jpg", type: a.mimeType ?? "image/jpeg" });
    };

    const guardar = async () => {
        if (nombre.length > 150) return setError("El nombre es demasiado largo (máximo 150 caracteres).");
        setGuardando(true);
        setError(null);
        try {
            await actualizarPerfil({ nombre: nombre.trim(), bio: bio.trim(), foto });
            navigation.goBack();
        } catch (e: any) {
            const d = e?.response?.data;
            setError(d?.avatar?.[0] ?? d?.nombre?.[0] ?? "No pudimos guardar los cambios.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
                <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: spacing.lg }}>
                    <Text style={styles.volver}>← Volver</Text>
                </Pressable>
                <Text style={styles.titulo}>Editar perfil</Text>

                <Pressable style={styles.fotoCaja} onPress={elegirFoto}>
                    <Avatar uri={foto?.uri ?? perfil?.avatar} nombre={perfil?.username ?? "?"} size={96} />
                    <View style={styles.camara}>
                        <Ionicons name="camera" size={16} color="#fff" />
                    </View>
                </Pressable>
                <Text style={styles.cambiar}>Cambiar foto</Text>

                <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
                    <TextField label="Nombre" icono="person-outline" placeholder="Tu nombre" autoCapitalize="words" value={nombre} onChangeText={setNombre} />
                    <View style={{ gap: 6 }}>
                        <Text style={styles.label}>Biografía</Text>
                        <TextInput
                            style={styles.bio}
                            multiline
                            placeholder="Cuéntanos qué te gusta comer"
                            placeholderTextColor={colors.textMuted}
                            value={bio}
                            onChangeText={setBio}
                        />
                    </View>
                    <View style={styles.solo}>
                        <Text style={styles.soloTxt}>Usuario: {perfil?.username}</Text>
                        <Text style={styles.soloTxt}>Correo: {perfil?.email}</Text>
                    </View>
                </View>

                {!!error && <Text style={styles.error}>{error}</Text>}

                <Pressable style={styles.boton} onPress={guardar} disabled={guardando || !perfil}>
                    {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Guardar cambios</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    volver: { color: colors.textMuted, fontWeight: "600" },
    titulo: { fontSize: 26, fontWeight: "800", color: colors.text },
    fotoCaja: { alignSelf: "center", marginTop: spacing.lg },
    camara: {
        position: "absolute", right: 0, bottom: 0, width: 30, height: 30, borderRadius: 15,
        backgroundColor: colors.text, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.background,
    },
    cambiar: { textAlign: "center", color: colors.primary, fontWeight: "700", marginTop: spacing.sm },
    label: { fontSize: 13, fontWeight: "600", color: colors.text },
    bio: {
        minHeight: 100, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
        padding: spacing.md, color: colors.text, textAlignVertical: "top", outlineStyle: "none",
    } as any,
    solo: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 4 },
    soloTxt: { fontSize: 13, color: colors.textMuted },
    error: { color: "#B3261E", fontSize: 13, marginTop: spacing.md },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center", marginTop: spacing.xl },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});