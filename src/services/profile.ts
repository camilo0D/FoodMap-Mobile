import { Platform } from "react-native";
import { api, API_URL } from "./api";
import { fixImg } from "./restaurant";
import type { MiResena, Perfil } from "../types";

const ORIGEN = API_URL.replace(/\/api\/?$/, "");
const urlAvatar = (u: string | null) => (u && u.startsWith("/") ? `${ORIGEN}${u}` : fixImg(u));

export async function getPerfil(): Promise<Perfil> {
    const { data } = await api.get("/auth/users/me/");
    return { ...data, avatar: urlAvatar(data.avatar) };
}

export type FotoElegida = { uri: string; name: string; type: string };

export async function actualizarPerfil(datos: { nombre: string; bio: string; foto?: FotoElegida | null }): Promise<Perfil> {
    const form = new FormData();
    form.append("nombre", datos.nombre);
    form.append("bio", datos.bio);
    if (datos.foto) {
        if (Platform.OS === "web") {
            const blob = await (await fetch(datos.foto.uri)).blob();
            form.append("avatar", blob, datos.foto.name);
        } else {
            form.append("avatar", { uri: datos.foto.uri, name: datos.foto.name, type: datos.foto.type } as any);
        }
    }
    const { data } = await api.patch("/auth/users/me/", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return { ...data, avatar: urlAvatar(data.avatar) };
}

export async function getMisResenas(): Promise<MiResena[]> {
    const { data } = await api.get("/auth/users/me/reviews/");
    const lista: MiResena[] = Array.isArray(data) ? data : data.results ?? [];
    return lista.map((x) => ({ ...x, restaurante: { ...x.restaurante, imagen: fixImg(x.restaurante.imagen) } }));
}

export const borrarResena = (id: string) => api.delete(`/auth/users/me/reviews/${id}/`);