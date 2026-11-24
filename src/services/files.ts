import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

export type FotoElegida = { uri: string; name: string; type: string };

export async function elegirFoto(aspect: [number, number] = [4, 3]): Promise<FotoElegida | null> {
    const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect,
    });
    if (r.canceled) return null;
    const a = r.assets[0];
    return { uri: a.uri, name: a.fileName ?? "foto.jpg", type: a.mimeType ?? "image/jpeg" };
}

export async function agregarArchivo(form: FormData, campo: string, foto: FotoElegida) {
    if (Platform.OS === "web") {
        const blob = await (await fetch(foto.uri)).blob();
        form.append(campo, blob, foto.name);
    } else {
        form.append(campo, { uri: foto.uri, name: foto.name, type: foto.type } as any);
    }
}