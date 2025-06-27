import { Usuario } from './usuario.model';

export interface LoginResponse {
  nombre: any;
  token: string;
  expiracion: string; // ISO string
  refreshToken: string;
  usuario: Usuario;
}