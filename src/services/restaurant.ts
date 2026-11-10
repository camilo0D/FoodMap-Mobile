import { api, API_URL } from "./api";
import type { Plato, Restaurante, Resena } from "../types";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
const fixImg = (u: string | null) =>
    u ? u.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/, API_ORIGIN) : null;

export async function getRestaurantes(): Promise<Restaurante[]> {
    const { data } = await api.get("/restaurantes/");
    const lista: Restaurante[] = Array.isArray(data) ? data : data.results ?? [];
    return lista.map((r) => ({ ...r, imagen: fixImg(r.imagen) }));
}

export async function getMenu(id: string): Promise<Plato[]> {
    const { data } = await api.get(`/restaurantes/${id}/menu/`);
    const lista: Plato[] = Array.isArray(data) ? data : data.results ?? [];
    return lista.map((p) => ({ ...p, imagen: fixImg(p.imagen) }));
}

export async function getResenas(id: string): Promise<{ total: number; results: Resena[] }> {
    const { data } = await api.get(`/restaurantes/${id}/reviews/`);
    const results: Resena[] = (data.results ?? []).map((x: Resena) => ({
        ...x,
        usuario_avatar: fixImg(x.usuario_avatar),
    }));
    return { total: data.total ?? results.length, results };
}

export async function crearResena(id: string, rating: number, comment: string) {
    const { data } = await api.post(`/restaurantes/${id}/reviews/`, { rating, comment });
    return data;
}