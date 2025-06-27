import { Usuario } from './usuario.model';

export interface LoginResponse {
  token: string;
  expiracion: string; // ISO string
  refreshToken: string;
  usuario: Usuario;
}