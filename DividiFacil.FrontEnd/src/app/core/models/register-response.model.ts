export interface RegisterResponse {
  exito: boolean;
  mensaje: string;
  resultado?: {
    token?: string;
    email?: string;
    nombre?: string;
  };
  errores?: any;
}