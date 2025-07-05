import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  GastoDto, 
  GastoCreacionDto, 
  DetalleGastoDto,
  SaldoUsuarioDto 
} from '../models/gasto.model';
import { ResponseDto, PaginatedResponse } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private readonly apiUrl = `${environment.apiUrl}/api/gastos`;

  constructor(private http: HttpClient) {}

  // ✅ MÉTODO 1: CrearGastoAsync
  crearGasto(gastoCreacion: GastoCreacionDto): Observable<ResponseDto<GastoDto>> {
    return this.http.post<ResponseDto<GastoDto>>(this.apiUrl, gastoCreacion)
      .pipe(
        catchError(error => {
          console.error('Error creando gasto:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al crear gasto' 
          });
        })
      );
  }

  // ✅ MÉTODO 2: GetByIdAsync
  obtenerGasto(idGasto: string): Observable<ResponseDto<GastoDto>> {
    return this.http.get<ResponseDto<GastoDto>>(`${this.apiUrl}/${idGasto}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo gasto:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al obtener gasto' 
          });
        })
      );
  }

  // ✅ MÉTODO 3: GetByGrupoAsync - CORREGIDO CON PARÁMETROS
  obtenerGastosPorGrupo(idGrupo: string): Observable<ResponseDto<GastoDto[]>> {
    return this.http.get<ResponseDto<GastoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}`)
      .pipe(
        map(response => ({
          exito: response.exito,
          data: Array.isArray(response.data) ? response.data : [],
          mensaje: response.mensaje
        })),
        catchError(error => {
          console.error('Error obteniendo gastos por grupo:', error);
          return of({ 
            exito: false, 
            data: [], 
            mensaje: error.error?.mensaje || 'Error al obtener gastos' 
          });
        })
      );
  }

  // ✅ MÉTODO 4: GetRecientesAsync
  obtenerRecientes(cantidad: number = 10): Observable<ResponseDto<GastoDto[]>> {
    const params = new HttpParams().set('cantidad', cantidad.toString());
    
    return this.http.get<ResponseDto<GastoDto[]>>(`${this.apiUrl}/recientes`, { params })
      .pipe(
        map(response => ({
          exito: response.exito,
          data: Array.isArray(response.data) ? response.data : [],
          mensaje: response.mensaje
        })),
        catchError(error => {
          console.error('Error obteniendo gastos recientes:', error);
          return of({ 
            exito: false, 
            data: [], 
            mensaje: error.error?.mensaje || 'Error al obtener gastos recientes' 
          });
        })
      );
  }

  // ✅ MÉTODO 5: GetSaldosGrupoAsync - NUEVO
  obtenerSaldosGrupo(idGrupo: string): Observable<ResponseDto<SaldoUsuarioDto[]>> {
    return this.http.get<ResponseDto<SaldoUsuarioDto[]>>(`${this.apiUrl}/saldos/grupo/${idGrupo}`)
      .pipe(
        map(response => ({
          exito: response.exito,
          data: Array.isArray(response.data) ? response.data : [],
          mensaje: response.mensaje
        })),
        catchError(error => {
          console.error('Error obteniendo saldos del grupo:', error);
          return of({ 
            exito: false, 
            data: [], 
            mensaje: error.error?.mensaje || 'Error al obtener saldos del grupo' 
          });
        })
      );
  }

  // ✅ MÉTODO 6: GetSaldosUsuarioAsync - NUEVO
  obtenerSaldosUsuario(): Observable<ResponseDto<SaldoUsuarioDto[]>> {
    return this.http.get<ResponseDto<SaldoUsuarioDto[]>>(`${this.apiUrl}/saldos/usuario`)
      .pipe(
        map(response => ({
          exito: response.exito,
          data: Array.isArray(response.data) ? response.data : [],
          mensaje: response.mensaje
        })),
        catchError(error => {
          console.error('Error obteniendo saldos del usuario:', error);
          return of({ 
            exito: false, 
            data: [], 
            mensaje: error.error?.mensaje || 'Error al obtener saldos del usuario' 
          });
        })
      );
  }

  // ✅ MÉTODO 7: MarcarComoPagadoAsync
  marcarComoPagado(idGasto: string, idDetalle: string): Observable<ResponseDto<void>> {
    return this.http.put<ResponseDto<void>>(`${this.apiUrl}/${idGasto}/detalle/${idDetalle}/pagado`, {})
      .pipe(
        catchError(error => {
          console.error('Error marcando como pagado:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al marcar como pagado' 
          });
        })
      );
  }

  // ✅ MÉTODO 8: EliminarGastoAsync
  eliminarGasto(idGasto: string): Observable<ResponseDto<void>> {
    return this.http.delete<ResponseDto<void>>(`${this.apiUrl}/${idGasto}`)
      .pipe(
        catchError(error => {
          console.error('Error eliminando gasto:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al eliminar gasto' 
          });
        })
      );
  }

  // ✅ MÉTODO 9: GetPaginatedByGrupoAsync - NUEVO
  obtenerGastosPaginados(
    idGrupo: string, 
    pagina: number = 1, 
    limite: number = 10
  ): Observable<PaginatedResponse<GastoDto>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    return this.http.get<PaginatedResponse<GastoDto>>(`${this.apiUrl}/grupo/${idGrupo}/paginado`, { params })
      .pipe(
        catchError(error => {
          console.error('Error obteniendo gastos paginados:', error);
          return of({ 
            exito: false, 
            data: [], 
            totalRegistros: 0,
            totalPaginas: 0,
            paginaActual: 1,
            registrosPorPagina: limite,
            mensaje: error.error?.mensaje || 'Error al obtener gastos paginados' 
          });
        })
      );
  }

  // ✅ MÉTODOS AUXILIARES: Para mantener compatibilidad con código existente
  obtenerGastos(): Observable<ResponseDto<GastoDto[]>> {
    return this.http.get<ResponseDto<GastoDto[]>>(`${this.apiUrl}`)
      .pipe(
        map(response => ({
          exito: response.exito,
          data: Array.isArray(response.data) ? response.data : [],
          mensaje: response.mensaje
        })),
        catchError(error => {
          console.error('Error obteniendo gastos:', error);
          return of({ 
            exito: false, 
            data: [], 
            mensaje: 'Error al obtener gastos' 
          });
        })
      );
  }

  obtenerMisGastos(): Observable<ResponseDto<GastoDto[]>> {
    return this.obtenerRecientes(100); // Obtener los últimos 100 gastos del usuario
  }

  // ✅ MÉTODO AUXILIAR: Para estadísticas
  obtenerEstadisticasGastos(): Observable<ResponseDto<any>> {
    return this.http.get<ResponseDto<any>>(`${this.apiUrl}/estadisticas`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo estadísticas:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al obtener estadísticas' 
          });
        })
      );
  }

  // ✅ MÉTODO AUXILIAR: Para validar gasto antes de crear
  validarGasto(gastoCreacion: GastoCreacionDto): boolean {
    if (!gastoCreacion.idGrupo || !gastoCreacion.descripcion || gastoCreacion.monto <= 0) {
      return false;
    }
    
    if (!gastoCreacion.detalles || gastoCreacion.detalles.length === 0) {
      return false;
    }

    const totalDetalles = gastoCreacion.detalles.reduce((sum, d) => sum + d.monto, 0);
    return Math.abs(totalDetalles - gastoCreacion.monto) < 0.01;
  }

  actualizarGasto(idGasto: string, gasto: GastoCreacionDto): Observable<any> {
    return this.http.put<any>(`/api/gastos/${idGasto}`, gasto);
  }
}