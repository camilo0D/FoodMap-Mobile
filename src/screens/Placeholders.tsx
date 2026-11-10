import { Text, View } from "react-native";
import { colors } from "../theme";

function Placeholder({ titulo, nota }: { titulo: string; nota: string }) {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{titulo}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6 }}>Pendiente: {nota}</Text>
        </View>
    );
}

export const ExploreScreen = () => <Placeholder titulo="Explorar" nota="MOB-015" />;
export const FavoritesScreen = () => <Placeholder titulo="Favoritos" nota="MOB-038" />;
export const ProfileScreen = () => <Placeholder titulo="Mi perfil" nota="MOB-021" />;