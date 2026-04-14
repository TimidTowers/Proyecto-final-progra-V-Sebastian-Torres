import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Categoria, Producto } from '../models/models';

export interface FiltrosProducto {
  categoriaId?: number;
  q?: string;
  precioMin?: number;
  precioMax?: number;
  orden?: 'precio_asc' | 'precio_desc' | 'popularidad' | 'nombre';
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  constructor(private http: HttpClient) {}

  listar(filtros: FiltrosProducto = {}): Observable<Producto[]> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Producto[]>(`${environment.apiUrl}/productos`, { params });
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${environment.apiUrl}/productos/${id}`);
  }

  autocomplete(q: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/productos/autocomplete`, {
      params: new HttpParams().set('q', q)
    });
  }

  crear(data: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(`${environment.apiUrl}/productos`, data);
  }

  actualizar(id: number, data: Partial<Producto>): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/productos/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/productos/${id}`);
  }

  categorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${environment.apiUrl}/categorias`);
  }
}
