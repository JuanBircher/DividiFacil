import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  GrupoDto, 
  GrupoCreacionDto, 
  GrupoConMiembrosDto, 
  MiembroDto,
  MiembroGrupoSimpleDto,
  InvitacionDto,
  CambioRolDto 
} from '../models/grupo.model';
import { ResponseDto, PaginatedResponse } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private readonly apiUrl = `${environment.apiUrl}/api/grupos`;

  constructor(private http: HttpClient) {}

  // ✅ MÉTODO 1: CrearGrupoAsync
  crearGrupo(grupoCreacion: GrupoCreacionDto): Observable<ResponseDto<GrupoDto>> {
    console.log('[GrupoService] crearGrupo', { grupoCreacion });
    return this.http.post<ResponseDto<GrupoDto>>(this.apiUrl, grupoCreacion)
      .pipe(
        catchError(error => {
          console.error('Error creando grupo:', error);
          return of({ 
            exito: false,
            data: undefined,
            mensaje: 'Error al crear grupo' 
          });
        })
      );
  }

  // ✅ MÉTODO 2: GetByIdAsync
  obtenerGrupo(idGrupo: string): Observable<ResponseDto<GrupoDto>> {
    console.log('[GrupoService] obtenerGrupo', { idGrupo });
    return this.http.get<ResponseDto<GrupoDto>>(`${this.apiUrl}/${idGrupo}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo grupo:', error);
          return of({ 
            exito: false,
            data: undefined,
            mensaje: 'Error al obtener grupo' 
          });
        })
      );
  }

  // ✅ ALIAS: Para mantener compatibilidad
  obtenerGrupoPorId(idGrupo: string): Observable<ResponseDto<GrupoDto>> {
    console.log('[GrupoService] obtenerGrupoPorId', { idGrupo });
    return this.obtenerGrupo(idGrupo);
  }

  // ✅ MÉTODO 3: GetConMiembrosAsync - CORREGIDO
  obtenerGrupoConMiembros(idGrupo: string): Observable<ResponseDto<GrupoConMiembrosDto>> {
    console.log('[GrupoService] obtenerGrupoConMiembros', { idGrupo });
    return this.http.get<ResponseDto<GrupoConMiembrosDto>>(`${this.apiUrl}/${idGrupo}/con-miembros`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo grupo con miembros:', error);
          return of({ 
            exito: false,
            data: undefined,
            mensaje: 'Error al obtener grupo con miembros' 
          });
        })
      );
  }

  // ✅ MÉTODO 4: GetByUsuarioAsync
  obtenerGrupos(): Observable<ResponseDto<GrupoDto[]>> {
    console.log('[GrupoService] obtenerGrupos');
    return this.http.get<ResponseDto<GrupoDto[]>>(this.apiUrl)
      .pipe(
        map(response => ({
          exito: response.exito,
          data: response.data ?? [],
          mensaje: response.mensaje
        })),
        catchError(error => {
          console.error('Error obteniendo grupos:', error);
          return of({ 
            exito: false, 
            data: [], 
            mensaje: 'Error al obtener grupos' 
          });
        })
      );
  }

  // ✅ MÉTODO 5: GetByCodigoAccesoAsync
  obtenerGrupoPorCodigo(codigo: string): Observable<ResponseDto<GrupoDto>> {
    console.log('[GrupoService] obtenerGrupoPorCodigo', { codigo });
    return this.http.get<ResponseDto<GrupoDto>>(`${this.apiUrl}/codigo/${codigo}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo grupo por código:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: 'Código de acceso inválido' 
          });
        })
      );
  }

  // ✅ MÉTODO 6: AgregarMiembroAsync
  agregarMiembro(idGrupo: string, invitacion: InvitacionDto): Observable<ResponseDto<void>> {
    console.log('[GrupoService] agregarMiembro', { idGrupo, invitacion });
    return this.http.post<ResponseDto<void>>(`${this.apiUrl}/${idGrupo}/miembros`, invitacion)
      .pipe(
        catchError(error => {
          console.error('Error agregando miembro:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: 'Error al agregar miembro' 
          });
        })
      );
  }

  // ✅ MÉTODO 7: EliminarMiembroAsync
  eliminarMiembro(idGrupo: string, idMiembro: string): Observable<ResponseDto<void>> {
    console.log('[GrupoService] eliminarMiembro', { idGrupo, idMiembro });
    return this.http.delete<ResponseDto<void>>(`${this.apiUrl}/${idGrupo}/miembros/${idMiembro}`)
      .pipe(
        catchError(error => {
          console.error('Error eliminando miembro:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: 'Error al eliminar miembro' 
          });
        })
      );
  }

  // ✅ MÉTODO 8: CambiarRolMiembroAsync
  cambiarRolMiembro(idGrupo: string, idMiembro: string, nuevoRol: string): Observable<ResponseDto<void>> {
    console.log('[GrupoService] cambiarRolMiembro', { idGrupo, idMiembro, nuevoRol });
    const cambioRol: CambioRolDto = { nuevoRol };
    return this.http.put<ResponseDto<void>>(`${this.apiUrl}/${idGrupo}/miembros/${idMiembro}/rol`, cambioRol)
      .pipe(
        catchError(error => {
          console.error('Error cambiando rol:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: 'Error al cambiar rol' 
          });
        })
      );
  }

  // ✅ MÉTODO 9: GenerarCodigoAccesoAsync
  generarCodigoAcceso(idGrupo: string): Observable<ResponseDto<string>> {
    console.log('[GrupoService] generarCodigoAcceso', { idGrupo });
    return this.http.post<ResponseDto<string>>(`${this.apiUrl}/${idGrupo}/codigo-acceso`, {})
      .pipe(
        catchError(error => {
          console.error('Error generando código:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: 'Error al generar código de acceso' 
          });
        })
      );
  }

  // ✅ MÉTODO 10: ActualizarGrupoAsync
  actualizarGrupo(idGrupo: string, grupoActualizacion: GrupoCreacionDto): Observable<ResponseDto<void>> {
    console.log('[GrupoService] actualizarGrupo', { idGrupo, grupoActualizacion });
    return this.http.put<ResponseDto<void>>(`${this.apiUrl}/${idGrupo}`, grupoActualizacion)
      .pipe(
        catchError(error => {
          console.error('Error actualizando grupo:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: 'Error al actualizar grupo' 
          });
        })
      );
  }

  // ✅ MÉTODO 11: EliminarGrupoAsync
  eliminarGrupo(idGrupo: string): Observable<ResponseDto<void>> {
    console.log('[GrupoService] eliminarGrupo', { idGrupo });
    return this.http.delete<ResponseDto<void>>(`${this.apiUrl}/${idGrupo}`)
      .pipe(
        catchError(error => {
          console.error('Error eliminando grupo:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: 'Error al eliminar grupo' 
          });
        })
      );
  }

  // ✅ MÉTODO AUXILIAR: Para unirse con código (mantener compatibilidad)
  unirseConCodigo(codigo: string): Observable<ResponseDto<GrupoDto>> {
    console.log('[GrupoService] unirseConCodigo', { codigo });
    return this.obtenerGrupoPorCodigo(codigo);
  }

  // ✅ MÉTODO AUXILIAR: Para compatibilidad con componentes existentes
  obtenerMiembros(idGrupo: string): Observable<ResponseDto<GrupoConMiembrosDto>> {
    console.log('[GrupoService] obtenerMiembros', { idGrupo });
    return this.obtenerGrupoConMiembros(idGrupo);
  }

  // ✅ MÉTODO AUXILIAR: Para mantener compatibilidad con PaginatedResponse
  obtenerGruposPaginados(pagina: number = 1, limite: number = 10): Observable<PaginatedResponse<GrupoDto>> {
    console.log('[GrupoService] obtenerGruposPaginados', { pagina, limite });
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    return this.http.get<PaginatedResponse<GrupoDto>>(this.apiUrl, { params })
      .pipe(
        catchError(error => {
          console.error('Error obteniendo grupos paginados:', error);
          return of({ 
            exito: false, 
            data: [], 
            totalRegistros: 0,
            totalPaginas: 0,
            paginaActual: 1,
            registrosPorPagina: limite,
            mensaje: 'Error al obtener grupos' 
          });
        })
      );
  }

  // ✅ MÉTODO AUXILIAR: Para compatibilidad con getGrupos()
  getGrupos(): Observable<ResponseDto<GrupoDto[]>> {
    console.log('[GrupoService] getGrupos');
    return this.obtenerGrupos();
  }
}