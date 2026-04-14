import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CostoEnvioResponse, Direccion } from '../models/models';

export interface CostoEnvioRequest {
  latitud: number;
  longitud: number;
  subtotal: number;
}

@Injectable({ providedIn: 'root' })
export class DireccionService {
  private readonly base = `${environment.apiUrl}/direcciones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(this.base);
  }

  obtener(id: number): Observable<Direccion> {
    return this.http.get<Direccion>(`${this.base}/${id}`);
  }

  crear(data: Partial<Direccion>): Observable<Direccion> {
    return this.http.post<Direccion>(this.base, data);
  }

  actualizar(id: number, data: Partial<Direccion>): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  calcularCostoEnvio(data: CostoEnvioRequest): Observable<CostoEnvioResponse> {
    return this.http.post<CostoEnvioResponse>(`${this.base}/costo-envio`, data);
  }
}
