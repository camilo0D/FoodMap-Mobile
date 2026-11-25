import { api } from "./api";
import type { AdminCategoria, AdminResumen, AdminRestaurante, AdminRol, AdminUsuario } from "../types";

const lista = <T,>(data: any): T[] => (Array.isArray(data) ? data : data?.results ?? []);

export const getResumenAdmin = async (): Promise<AdminResumen> => (await api.get("/admin/dashboard/")).data;

export const getUsuariosAdmin = async () => lista<AdminUsuario>((await api.get("/admin/users/")).data);
export const cambiarEstadoUsuario = (id: string, estado: string) => api.patch(`/admin/users/${id}/estado/`, { estado });
export const eliminarUsuario = (id: string) => api.delete(`/admin/users/${id}/`);

export const getRestaurantesAdmin = async () => lista<AdminRestaurante>((await api.get("/admin/restaurantes/")).data);
export const cambiarEstadoRestaurante = (id: string, estado: string) => api.patch(`/admin/restaurantes/${id}/estado/`, { estado });
export const eliminarRestauranteAdmin = (id: string) => api.delete(`/admin/restaurantes/${id}/`);

export const getCategoriasAdmin = async () => lista<AdminCategoria>((await api.get("/admin/categorias/")).data);
export const crearCategoria = (d: { nombre: string; icono: string }) => api.post("/admin/categorias/", d);
export const actualizarCategoria = (id: string, d: { nombre: string; icono: string }) => api.put(`/admin/categorias/${id}/`, d);
export const eliminarCategoria = (id: string) => api.delete(`/admin/categorias/${id}/`);

export const getRolesAdmin = async () => lista<AdminRol>((await api.get("/admin/roles/")).data);