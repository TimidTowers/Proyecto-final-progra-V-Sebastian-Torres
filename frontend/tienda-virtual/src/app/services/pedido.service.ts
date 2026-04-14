import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/models';

export interface CrearPedidoDto {
  items: { productoId: number; cantidad: number }[];
  direccionEnvio?: string;
  latitud?: number;
  longitud?: number;
  metodoPago: string;
  esProforma: boolean;
  codigoCupon?: string;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${environment.apiUrl}/pedidos`);
  }

  obtener(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${environment.apiUrl}/pedidos/${id}`);
  }

  crear(dto: CrearPedidoDto): Observable<Pedido> {
    return this.http.post<Pedido>(`${environment.apiUrl}/pedidos`, dto);
  }

  cambiarEstado(id: number, estado: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/pedidos/${id}/estado`, JSON.stringify(estado), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
