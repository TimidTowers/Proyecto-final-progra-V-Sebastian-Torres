import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Dashboard } from '../models/models';

export interface FiltrosDashboard {
  desde?: string;
  hasta?: string;
  categoriaId?: number;
  productoId?: number;
  metodoPago?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly base = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  dashboard(filtros: FiltrosDashboard = {}): Observable<Dashboard> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Dashboard>(`${this.base}/dashboard`, { params });
  }

  ventas(): Observable<any> {
    return this.http.get(`${this.base}/ventas`);
  }

  usuarios(): Observable<any> {
    return this.http.get(`${this.base}/usuarios`);
  }

  inventario(): Observable<any> {
    return this.http.get(`${this.base}/inventario`);
  }
}
