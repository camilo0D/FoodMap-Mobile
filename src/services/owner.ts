import { api } from "./api";
import { agregarArchivo, FotoElegida } from "./files";
import { fixImg } from "./restaurant";
import type { Categoria, Restaurante } from "../types";

export type DatosLocal = {
    nombre: string;
    descripcion: string;
    telefono: string;
    direccion: string;
    latitud: string;
    longitud: string;
    categoria_id: string | null;
    horario: Record<string, string>;
    imagen?: string;
};

const norm = (r: Restaurante): Restaurante => ({ ...r, imagen: fixImg(r.imagen) });
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export async function getMiRestaurante(): Promise<Restaurante | null> {
    const { data } = await api.get("/restaurantes/mio/");
    return data ? norm(data) : null;
}

export async function crearRestaurante(d: DatosLocal) {
    const { data } = await api.post("/restaurantes/mio/", d);
    return norm(data);
}

export async function actualizarRestaurante(id: string, d: Partial<DatosLocal>) {
    const { data } = await api.put(`/restaurantes/${id}/`, d);
    return norm(data);
}

export async function subirImagenLocal(foto: FotoElegida): Promise<string> {
    const form = new FormData();
    await agregarArchivo(form, "imagen", foto);
    const { data } = await api.post("/restaurantes/upload/image/", form, multipart);
    return data.url as string;
}

export async function getCategorias(): Promise<Categoria[]> {
    const { data } = await api.get("/restaurantes/categorias/");
    return Array.isArray(data) ? data : data.results ?? [];
}

export type DatosPlato = { nombre: string; descripcion: string; precio: string; disponible: boolean; foto?: FotoElegida | null };

export async function guardarPlato(restauranteId: string, platoId: string | null, d: DatosPlato) {
    const form = new FormData();
    form.append("nombre", d.nombre);
    form.append("descripcion", d.descripcion);
    form.append("precio", d.precio);
    form.append("disponible", String(d.disponible));
    if (d.foto) await agregarArchivo(form, "imagen", d.foto);
    const base = `/restaurantes/${restauranteId}/menu/`;
    if (platoId) return api.put(`${base}${platoId}/`, form, multipart);
    return api.post(base, form, multipart);
}

export const cambiarDisponible = (restauranteId: string, platoId: string, disponible: boolean) =>
    api.put(`/restaurantes/${restauranteId}/menu/${platoId}/`, { disponible });

export const borrarPlato = (restauranteId: string, platoId: string) =>
    api.delete(`/restaurantes/${restauranteId}/menu/${platoId}/`);