import { api, API_URL } from "./api";
import { fixImg } from "./restaurant";
import type { AdminCategoria, AdminResumen, AdminRestaurante, AdminRol, AdminUsuario } from "../types";

const lista = <T,>(data: any): T[] => (Array.isArray(data) ? data : data?.results ?? []);

const ORIGEN = API_URL.replace(/\/api\/?$/, "");
const urlAvatar = (u: string | null | undefined) => (u && u.startsWith("/") ? `${ORIGEN}${u}` : fixImg(u ?? null));

export const getResumenAdmin = async (): Promise<AdminResumen> => (await api.get("/admin/dashboard/")).data;

export const getUsuariosAdmin = async () =>
    lista<AdminUsuario>((await api.get("/admin/users/")).data).map((u: any) => ({ ...u, avatar: urlAvatar(u.avatar) })) as AdminUsuario[];
export const cambiarEstadoUsuario = (id: string, estado: string) => api.patch(`/admin/users/${id}/estado/`, { estado });
export const eliminarUsuario = (id: string) => api.delete(`/admin/users/${id}/`);
export const actualizarRolesUsuario = (id: string, roles: string[]) => api.put(`/admin/users/${id}/roles/`, { roles });

export const getRestaurantesAdmin = async () => lista<AdminRestaurante>((await api.get("/admin/restaurantes/")).data);
export const cambiarEstadoRestaurante = (id: string, estado: string) => api.patch(`/admin/restaurantes/${id}/estado/`, { estado });
export const eliminarRestauranteAdmin = (id: string) => api.delete(`/admin/restaurantes/${id}/`);
export const asignarDueno = (restauranteId: string, duenoId: string) =>
    api.patch(`/admin/restaurantes/${restauranteId}/asignar-dueno/`, { dueno_id: duenoId });

export const getCategoriasAdmin = async () => lista<AdminCategoria>((await api.get("/admin/categorias/")).data);
export const crearCategoria = (d: { nombre: string; icono: string }) => api.post("/admin/categorias/", d);
export const actualizarCategoria = (id: string, d: { nombre: string; icono: string }) => api.put(`/admin/categorias/${id}/`, d);
export const eliminarCategoria = (id: string) => api.delete(`/admin/categorias/${id}/`);

export const getRolesAdmin = async () => lista<AdminRol>((await api.get("/admin/roles/")).data);