import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AlertaStock, MovimientoInventario } from '../models/models';

export interface FiltroMovimientos {
  productoId?: number;
  desde?: string;
  hasta?: string;
}

export interface ReabastecerRequest {
  productoId: number;
  cantidad: number;
  motivo?: string;
}

export interface AjusteStockRequest {
  productoId: number;
  delta: number;
  motivo?: string;
}

export interface ReabastecerMasivoItem {
  productoId: number;
  cantidad: number;
  motivo?: string;
}

export interface ReabastecerMasivoResult {
  productoId: number;
  nombre: string;
  stockAnterior: number;
  stockNuevo: number;
  exitoso: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly base = `${environment.apiUrl}/inventario`;

  constructor(private http: HttpClient) {}

  movimientos(filtros: FiltroMovimientos = {}): Observable<MovimientoInventario[]> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<MovimientoInventario[]>(`${this.base}/movimientos`, { params });
  }

  reabastecer(data: ReabastecerRequest): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.base}/reabastecer`, data);
  }

  ajustar(data: AjusteStockRequest): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.base}/ajustar`, data);
  }

  reabastecerMasivo(items: ReabastecerMasivoItem[]): Observable<ReabastecerMasivoResult[]> {
    return this.http.post<ReabastecerMasivoResult[]>(`${this.base}/reabastecer-masivo`, { items });
  }

  ajustarMasivo(items: AjusteStockRequest[]): Observable<ReabastecerMasivoResult[]> {
    return this.http.post<ReabastecerMasivoResult[]>(`${this.base}/ajustar-masivo`, items);
  }

  alertas(): Observable<AlertaStock[]> {
    return this.http.get<AlertaStock[]>(`${this.base}/alertas`);
  }

  notificarStockBajo(): Observable<{ mensaje: string; productos: AlertaStock[] }> {
    return this.http.post<{ mensaje: string; productos: AlertaStock[] }>(
      `${this.base}/notificar-stock-bajo`,
      {}
    );
  }
}
