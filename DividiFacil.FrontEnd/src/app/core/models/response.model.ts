/**
 * 🔧 CORREGIDO: Estructura genérica que coincide con el backend
 */
export interface ResponseDto<T = undefined> {
  exito: boolean;
  mensaje?: string;
  data?: T;
}

/**
 * 🔧 MANTENER: Para compatibilidad con código existente
 * Pero usar ResponseDto<T> en servicios nuevos
 */
export interface ApiResponse<T> {
  exito: boolean;
  data: T;
  mensaje?: string;
}

/**
 * 🔧 NUEVO: Para respuestas paginadas
 */
export interface PaginatedResponseDto<T> extends ResponseDto {
  items: T[];
  totalItems: number;
  paginaActual: number;
  itemsPorPagina: number;
  totalPaginas: number;
}