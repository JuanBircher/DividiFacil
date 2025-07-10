
export interface ResponseDto<T = undefined> {
  exito: boolean;
  mensaje?: string;
  data?: T;
}


export interface ApiResponse<T = any> {
  exito: boolean;
  data: T;
  mensaje?: string;
  errores?: string[];
}

/**
 * 🔧 Para respuestas paginadas
 */
export interface PaginatedResponseDto<T> extends ResponseDto {
  items: T[];
  totalItems: number;
  paginaActual: number;
  itemsPorPagina: number;
  totalPaginas: number;
}

//  Interface para respuestas paginadas específicas de gastos
export interface PaginatedResponse<T> extends ResponseDto<T[]> {
  totalRegistros: number;
  totalPaginas: number;
  paginaActual: number;
  registrosPorPagina: number;
  // 🔧 ALIAS para compatibilidad con backend
  totalItems?: number;
  itemsPorPagina?: number;
}

// Interface para paginación
export interface PaginacionDto {
  pagina: number;
  limite: number;
  // ALIAS para compatibilidad con backend
  tamanioPagina?: number;
}