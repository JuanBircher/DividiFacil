export interface ResponseDto<T> {
  exito: boolean;
  mensaje: string;
  data?: T;
  errores?: string[];
}

export interface ApiResponse<T> {
  exito: boolean;
  data: T;
  mensaje?: string;
}