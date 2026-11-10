import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

type Props = { valor: number; size?: number; onChange?: (n: number) => void };

export default function Stars({ valor, size = 16, onChange }: Props) {
    return (
        <View style={{ flexDirection: "row", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} disabled={!onChange} onPress={() => onChange?.(n)} hitSlop={4}>
                    <Ionicons
                        name={n <= Math.round(valor) ? "star" : "star-outline"}
                        size={size}
                        color={colors.star}
                    />
                </Pressable>
            ))}
        </View>
    );
}