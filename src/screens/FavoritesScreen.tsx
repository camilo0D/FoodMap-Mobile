import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import RestaurantListItem from "../components/RestaurantListItem";
import { useFavorites } from "../context/FavoritesContext";
import { colors, radius, spacing } from "../theme";

export default function FavoritesScreen() {
    const navigation = useNavigation<any>();
    const { favoritos, recargar } = useFavorites();
    const [refrescando, setRefrescando] = useState(false);

    const refrescar = async () => {
        setRefrescando(true);
        await recargar();
        setRefrescando(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <FlatList
                data={favoritos}
                keyExtractor={(r) => r.id}
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, flexGrow: 1 }}
                refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colors.primary} />}
                ListHeaderComponent={
                    <View style={{ gap: 4 }}>
                        <Text style={styles.titulo}>Favoritos</Text>
                        {favoritos.length > 0 && (
                            <Text style={styles.sub}>
                                {favoritos.length} {favoritos.length === 1 ? "restaurante guardado" : "restaurantes guardados"}
                            </Text>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <RestaurantListItem restaurante={item} onPress={() => navigation.navigate("Detalle", { restaurante: item })} />
                )}
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        <View style={styles.icono}>
                            <Ionicons name="heart-outline" size={34} color={colors.primary} />
                        </View>
                        <Text style={styles.vacioTitulo}>Aún no tienes favoritos</Text>
                        <Text style={styles.vacioTexto}>Toca el corazón de un restaurante para guardarlo aquí.</Text>
                        <Pressable style={styles.boton} onPress={() => navigation.navigate("Explorar")}>
                            <Text style={styles.botonTxt}>Explorar restaurantes</Text>
                        </Pressable>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    titulo: { fontSize: 28, fontWeight: "800", color: colors.text },
    sub: { fontSize: 13, color: colors.textMuted },
    vacio: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingBottom: 80 },
    icono: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FBE3D3", alignItems: "center", justifyContent: "center" },
    vacioTitulo: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: spacing.sm },
    vacioTexto: { fontSize: 14, color: colors.textMuted, textAlign: "center", maxWidth: 260 },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 24, marginTop: spacing.md },
    botonTxt: { color: "#fff", fontWeight: "700" },
});