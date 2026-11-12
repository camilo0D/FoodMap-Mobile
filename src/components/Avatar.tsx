import { Image, Text, View } from "react-native";
import { colors } from "../theme";

type Props = { uri?: string | null; nombre: string; size?: number };

export default function Avatar({ uri, nombre, size = 40 }: Props) {
    if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
    return (
        <View
            style={{
                width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary,
                alignItems: "center", justifyContent: "center",
            }}
        >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.4 }}>
                {nombre.charAt(0).toUpperCase()}
            </Text>
        </View>
    );
}