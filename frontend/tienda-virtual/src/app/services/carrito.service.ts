import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CarritoItem, Producto } from '../models/models';
import { AuthService } from './auth.service';

const KEY = 'carrito_local';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private itemsSubject = new BehaviorSubject<CarritoItem[]>(this.leerLocal());
  items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.auth.usuario$.subscribe(u => {
      if (u) this.sincronizarConBackend();
    });
  }

  get items(): CarritoItem[] {
    return this.itemsSubject.value;
  }

  get total(): number {
    return this.items.reduce((s, i) => s + i.subtotal, 0);
  }

  get totalItems(): number {
    return this.items.reduce((s, i) => s + i.cantidad, 0);
  }

  agregar(producto: Producto, cantidad = 1) {
    const idx = this.items.findIndex(i => i.productoId === producto.productoId);
    const nuevos = [...this.items];
    if (idx >= 0) {
      nuevos[idx] = {
        ...nuevos[idx],
        cantidad: nuevos[idx].cantidad + cantidad,
        subtotal: (nuevos[idx].cantidad + cantidad) * nuevos[idx].precioUnitario
      };
    } else {
      nuevos.push({
        productoId: producto.productoId,
        nombreProducto: producto.nombre,
        imagenUrl: producto.imagenUrl,
        cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * cantidad
      });
    }
    this.itemsSubject.next(nuevos);
    this.guardarLocal();
    if (this.auth.isAuth) {
      this.http.post(`${environment.apiUrl}/carrito`, { productoId: producto.productoId, cantidad }).subscribe();
    }
  }

  actualizarCantidad(productoId: number, cantidad: number) {
    if (cantidad < 1) return;
    const nuevos = this.items.map(i =>
      i.productoId === productoId
        ? { ...i, cantidad, subtotal: cantidad * i.precioUnitario }
        : i
    );
    this.itemsSubject.next(nuevos);
    this.guardarLocal();
    if (this.auth.isAuth) {
      this.http.post(`${environment.apiUrl}/carrito`, { productoId, cantidad }).subscribe();
    }
  }

  eliminar(productoId: number) {
    this.itemsSubject.next(this.items.filter(i => i.productoId !== productoId));
    this.guardarLocal();
    if (this.auth.isAuth) {
      this.http.delete(`${environment.apiUrl}/carrito/${productoId}`).subscribe();
    }
  }

  vaciar() {
    this.itemsSubject.next([]);
    this.guardarLocal();
    if (this.auth.isAuth) {
      this.http.delete(`${environment.apiUrl}/carrito`).subscribe();
    }
  }

  sincronizarConBackend() {
    this.http.get<CarritoItem[]>(`${environment.apiUrl}/carrito`).subscribe({
      next: remoto => {
        if (remoto && remoto.length > 0) {
          this.itemsSubject.next(remoto);
          this.guardarLocal();
        } else if (this.items.length > 0) {
          // Subir los items locales al backend
          this.items.forEach(i => {
            this.http.post(`${environment.apiUrl}/carrito`, {
              productoId: i.productoId, cantidad: i.cantidad
            }).subscribe();
          });
        }
      },
      error: () => {}
    });
  }

  private guardarLocal() {
    localStorage.setItem(KEY, JSON.stringify(this.items));
  }

  private leerLocal(): CarritoItem[] {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  }
}
