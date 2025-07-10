import { Usuario } from './usuario.model';

export interface LoginResponse {
  nombre: any;
  token: string;
  expiracion: string; 
  refreshToken: string;
  usuario: Usuario;
}