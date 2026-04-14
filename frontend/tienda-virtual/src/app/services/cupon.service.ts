import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cupon, ValidarCuponResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CuponService {
  private readonly base = `${environment.apiUrl}/cupones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Cupon[]> {
    return this.http.get<Cupon[]>(this.base);
  }

  obtener(id: number): Observable<Cupon> {
    return this.http.get<Cupon>(`${this.base}/${id}`);
  }

  crear(data: Partial<Cupon>): Observable<Cupon> {
    return this.http.post<Cupon>(this.base, data);
  }

  actualizar(id: number, data: Partial<Cupon>): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  validar(codigo: string, subtotal: number): Observable<ValidarCuponResponse> {
    return this.http.post<ValidarCuponResponse>(`${this.base}/validar`, { codigo, subtotal });
  }
}
