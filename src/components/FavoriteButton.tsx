import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../context/FavoritesContext";
import { colors } from "../theme";
import type { Restaurante } from "../types";

type Props = { restaurante: Restaurante; size?: number; flotante?: boolean };

export default function FavoriteButton({ restaurante, size = 20, flotante }: Props) {
    const { esFavorito, toggle } = useFavorites();
    const activo = esFavorito(restaurante.id);
    const caja = size + 16;

    return (
        <Pressable
            onPress={() => toggle(restaurante)}
            hitSlop={8}
            style={
                flotante
                    ? { width: caja, height: caja, borderRadius: caja / 2, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 3 }
                    : undefined
            }
        >
            <Ionicons name={activo ? "heart" : "heart-outline"} size={size} color={activo ? "#E5383B" : colors.textMuted} />
        </Pressable>
    );
}