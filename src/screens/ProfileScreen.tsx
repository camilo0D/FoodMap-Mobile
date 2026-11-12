import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { getPerfil } from "../services/profile";
import { colors, radius, spacing } from "../theme";
import type { Perfil } from "../types";

function Item({ icono, titulo, detalle, onPress }: {
    icono: keyof typeof Ionicons.glyphMap; titulo: string; detalle?: string; onPress: () => void;
}) {
    return (
        <Pressable style={styles.item} onPress={onPress}>
            <View style={styles.iconoCaja}>
                <Ionicons name={icono} size={20} color={colors.primary} />
            </View>
            <Text style={styles.itemTitulo}>{titulo}</Text>
            {!!detalle && <Text style={styles.itemDetalle}>{detalle}</Text>}
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
    );
}

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { usuario, logout } = useAuth();
    const { favoritos } = useFavorites();
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [confirmar, setConfirmar] = useState(false);

    useFocusEffect(
        useCallback(() => {
            getPerfil().then(setPerfil).catch(() => { });
        }, [])
    );

    const nombre = perfil?.nombre || usuario?.username || "";

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
                <Text style={styles.titulo}>Mi perfil</Text>

                <View style={styles.cabecera}>
                    <Avatar uri={perfil?.avatar} nombre={nombre || "?"} size={92} />
                    <Text style={styles.nombre}>{nombre}</Text>
                    <Text style={styles.correo}>{usuario?.email}</Text>
                    <View style={styles.rol}>
                        <Text style={styles.rolTxt}>{usuario?.roles?.join(" · ")}</Text>
                    </View>
                    {!!perfil?.bio && <Text style={styles.bio}>{perfil.bio}</Text>}
                </View>

                <View style={styles.grupo}>
                    <Item icono="create-outline" titulo="Editar perfil" onPress={() => navigation.navigate("EditarPerfil")} />
                    <Item icono="star-outline" titulo="Mis reseñas" onPress={() => navigation.navigate("MisResenas")} />
                    <Item icono="heart-outline" titulo="Favoritos" detalle={String(favoritos.length)} onPress={() => navigation.navigate("Favoritos")} />
                    <Item icono="settings-outline" titulo="Configuración" onPress={() => navigation.navigate("Configuracion")} />
                </View>

                <Pressable style={styles.salir} onPress={() => setConfirmar(true)}>
                    <Ionicons name="log-out-outline" size={20} color="#B3261E" />
                    <Text style={styles.salirTxt}>Cerrar sesión</Text>
                </Pressable>
            </ScrollView>

            {confirmar && (
                <ConfirmDialog
                    titulo="¿Cerrar sesión?"
                    texto="Tendrás que iniciar sesión de nuevo para volver a entrar."
                    confirmarTxt="Cerrar sesión"
                    destructivo
                    onConfirm={logout}
                    onCancel={() => setConfirmar(false)}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    titulo: { fontSize: 28, fontWeight: "800", color: colors.text },
    cabecera: { alignItems: "center", gap: 4 },
    nombre: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: spacing.md },
    correo: { color: colors.textMuted, fontSize: 14 },
    rol: { backgroundColor: "#FBE3D3", borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
    rolTxt: { color: colors.primary, fontWeight: "700", fontSize: 12, textTransform: "capitalize" },
    bio: { color: colors.text, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },
    grupo: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden" },
    item: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
    iconoCaja: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FBE3D3", alignItems: "center", justifyContent: "center" },
    itemTitulo: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text },
    itemDetalle: { color: colors.textMuted, fontWeight: "600" },
    salir: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14 },
    salirTxt: { color: "#B3261E", fontWeight: "700" },
});