import { api } from "./api";
import { fixImg } from "./restaurant";
import type { Restaurante } from "../types";

export async function getFavoritos(): Promise<Restaurante[]> {
    const { data } = await api.get("/restaurantes/favoritos/");
    const lista: Restaurante[] = Array.isArray(data) ? data : data.results ?? [];
    return lista.map((r) => ({ ...r, imagen: fixImg(r.imagen) }));
}

export const agregarFavorito = (id: string) => api.post(`/restaurantes/${id}/favorito/`);
export const quitarFavorito = (id: string) => api.delete(`/restaurantes/${id}/favorito/`);