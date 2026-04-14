import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Factura } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private readonly base = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.base);
  }

  obtener(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.base}/${id}`);
  }

  obtenerPorPedido(pedidoId: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.base}/pedido/${pedidoId}`);
  }
}
