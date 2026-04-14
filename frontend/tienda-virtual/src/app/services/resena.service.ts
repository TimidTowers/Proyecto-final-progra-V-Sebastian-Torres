import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resena, ResenaResumen, ResenasPaginadas } from '../models/models';

export interface CrearResenaDto {
  productoId: number;
  pedidoId: number;
  calificacion: number;
  titulo: string;
  descripcion?: string;
  fotos?: { imagenBase64: string; contentType: string }[];
}

export interface EditarResenaDto {
  calificacion: number;
  titulo: string;
  descripcion?: string;
  fotos?: { imagenBase64: string; contentType: string }[];
}

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private base = `${environment.apiUrl}/resenas`;

  constructor(private http: HttpClient) {}

  obtenerPorProducto(productoId: number, pagina = 1, porPagina = 10, orden = 'recientes'): Observable<ResenasPaginadas> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('porPagina', porPagina)
      .set('orden', orden);
    return this.http.get<ResenasPaginadas>(`${this.base}/producto/${productoId}`, { params });
  }

  obtenerResumen(productoId: number): Observable<ResenaResumen> {
    return this.http.get<ResenaResumen>(`${this.base}/producto/${productoId}/resumen`);
  }

  misResenas(): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.base}/mis-resenas`);
  }

  puedeResenar(productoId: number, pedidoId: number): Observable<{ puede: boolean; razon: string }> {
    return this.http.get<{ puede: boolean; razon: string }>(`${this.base}/puede-resenar/${productoId}/${pedidoId}`);
  }

  crear(dto: CrearResenaDto): Observable<Resena> {
    return this.http.post<Resena>(this.base, dto);
  }

  editar(id: number, dto: EditarResenaDto): Observable<Resena> {
    return this.http.put<Resena>(`${this.base}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  reportar(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/${id}/reportar`, {});
  }

  // Admin
  listarAdmin(estado?: string, pagina = 1, porPagina = 20): Observable<ResenasPaginadas> {
    let params = new HttpParams().set('pagina', pagina).set('porPagina', porPagina);
    if (estado) params = params.set('estado', estado);
    return this.http.get<ResenasPaginadas>(`${this.base}/admin`, { params });
  }

  moderar(id: number, estado: string, motivoRechazo?: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/moderar`, { estado, motivoRechazo });
  }
}
