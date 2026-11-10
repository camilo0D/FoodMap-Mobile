import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

export default function Logo({ size = 56 }: { size?: number }) {
    return (
        <View
            style={{
                width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary,
                alignItems: "center", justifyContent: "center",
            }}
        >
            <Ionicons name="location" size={size * 0.55} color="#fff" />
        </View>
    );
}