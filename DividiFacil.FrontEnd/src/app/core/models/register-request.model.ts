export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
  telefono?: string;
}