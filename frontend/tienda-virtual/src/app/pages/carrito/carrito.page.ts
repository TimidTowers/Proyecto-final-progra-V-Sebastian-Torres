import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { CarritoItem } from '../../models/models';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: false
})
export class CarritoPage {

  /** Mapa productoId → seleccionado */
  seleccionados = new Map<number, boolean>();
  modoSeleccion = false;

  constructor(
    public carritoSrv: CarritoService,
    public auth: AuthService,
    private router: Router,
    private alert: AlertController,
    private toast: ToastController
  ) {}

  // ============ SELECCIÓN ============

  toggleModoSeleccion() {
    this.modoSeleccion = !this.modoSeleccion;
    if (!this.modoSeleccion) {
      this.seleccionados.clear();
    }
  }

  toggleSeleccion(productoId: number) {
    if (this.seleccionados.get(productoId)) {
      this.seleccionados.delete(productoId);
    } else {
      this.seleccionados.set(productoId, true);
    }
  }

  estaSeleccionado(productoId: number): boolean {
    return this.seleccionados.get(productoId) === true;
  }

  get todosSeleccionados(): boolean {
    return this.carritoSrv.items.length > 0
      && this.seleccionados.size === this.carritoSrv.items.length;
  }

  get algunoSeleccionado(): boolean {
    return this.seleccionados.size > 0;
  }

  get cantidadSeleccionados(): number {
    return this.seleccionados.size;
  }

  toggleSeleccionarTodo() {
    if (this.todosSeleccionados) {
      this.seleccionados.clear();
    } else {
      this.carritoSrv.items.forEach(i => this.seleccionados.set(i.productoId, true));
    }
  }

  async eliminarSeleccionados() {
    if (this.seleccionados.size === 0) return;

    const nombres = this.carritoSrv.items
      .filter(i => this.seleccionados.has(i.productoId))
      .map(i => i.nombreProducto);

    const a = await this.alert.create({
      header: 'Eliminar seleccionados',
      message: `¿Eliminar ${nombres.length} producto${nombres.length > 1 ? 's' : ''}?`,
      subHeader: nombres.join(', '),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const ids = Array.from(this.seleccionados.keys());
            ids.forEach(id => this.carritoSrv.eliminar(id));
            this.seleccionados.clear();
            this.modoSeleccion = false;
            this.mostrarToast(`${ids.length} producto${ids.length > 1 ? 's' : ''} eliminado${ids.length > 1 ? 's' : ''}`, 'warning');
          }
        }
      ]
    });
    await a.present();
  }

  // ============ CANTIDAD ============

  cambiarCantidad(item: CarritoItem, delta: number) {
    const nueva = item.cantidad + delta;
    if (nueva < 1) return;
    this.carritoSrv.actualizarCantidad(item.productoId, nueva);
  }

  // ============ ELIMINAR UNO ============

  async eliminarUno(item: CarritoItem) {
    const a = await this.alert.create({
      header: 'Eliminar producto',
      message: `¿Eliminar "${item.nombreProducto}" del carrito?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.carritoSrv.eliminar(item.productoId);
            this.seleccionados.delete(item.productoId);
            this.mostrarToast(`${item.nombreProducto} eliminado`, 'warning');
          }
        }
      ]
    });
    await a.present();
  }

  // ============ ACCIONES GENERALES ============

  async vaciar() {
    const a = await this.alert.create({
      header: 'Vaciar carrito',
      message: '¿Eliminar todos los productos del carrito?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Vaciar todo',
          role: 'destructive',
          handler: () => {
            this.carritoSrv.vaciar();
            this.seleccionados.clear();
            this.modoSeleccion = false;
            this.mostrarToast('Carrito vaciado', 'warning');
          }
        }
      ]
    });
    await a.present();
  }

  irACheckout() {
    if (this.carritoSrv.items.length === 0) {
      this.mostrarToast('El carrito esta vacio', 'warning');
      return;
    }
    if (!this.auth.isAuth) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }

  trackByProducto(_: number, item: CarritoItem): number {
    return item.productoId;
  }

  async mostrarToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const t = await this.toast.create({ message, duration: 1800, color, position: 'bottom' });
    await t.present();
  }
}
