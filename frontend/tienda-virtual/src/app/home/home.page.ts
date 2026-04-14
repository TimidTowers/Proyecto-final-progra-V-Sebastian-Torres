import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Categoria, Producto } from '../models/models';
import { ProductoService, FiltrosProducto } from '../services/producto.service';
import { CarritoService } from '../services/carrito.service';

type VistaMode = 'grid' | 'list';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  cargando = false;
  query = '';
  sugerencias: string[] = [];

  filtros: FiltrosProducto = { orden: 'nombre' };

  // Toggle lista/cuadricula
  vistaMode: VistaMode = 'grid';

  constructor(
    private productoSrv: ProductoService,
    public carritoSrv: CarritoService,
    private toast: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.restaurarPreferenciaVista();
    this.cargarCategorias();
    this.buscar();
  }

  // ============ VISTA TOGGLE ============
  private restaurarPreferenciaVista() {
    const saved = localStorage.getItem('vistaMode');
    if (saved === 'list' || saved === 'grid') {
      this.vistaMode = saved;
    }
  }

  toggleVista() {
    this.vistaMode = this.vistaMode === 'grid' ? 'list' : 'grid';
    localStorage.setItem('vistaMode', this.vistaMode);
  }

  setVista(mode: VistaMode) {
    this.vistaMode = mode;
    localStorage.setItem('vistaMode', this.vistaMode);
  }

  // ============ CATEGORIAS ============
  cargarCategorias() {
    this.productoSrv.categorias().subscribe({
      next: c => this.categorias = c,
      error: () => this.categorias = []
    });
  }

  // ============ BUSQUEDA ============
  buscar(ev?: any) {
    this.cargando = true;
    this.filtros.q = this.query;
    this.productoSrv.listar(this.filtros).subscribe({
      next: p => {
        this.productos = p;
        this.cargando = false;
        if (ev) ev.target.complete();
      },
      error: async () => {
        this.cargando = false;
        if (ev) ev.target.complete();
        this.mostrarToast('No se pudo conectar al backend. Revisa que la API esté corriendo.', 'warning');
      }
    });
  }

  onInputBusqueda() {
    if (this.query.length < 2) {
      this.sugerencias = [];
      return;
    }
    this.productoSrv.autocomplete(this.query).subscribe({
      next: s => this.sugerencias = s,
      error: () => this.sugerencias = []
    });
  }

  aplicarSugerencia(s: string) {
    this.query = s;
    this.sugerencias = [];
    this.buscar();
  }

  filtrarCategoria(id?: number) {
    this.filtros.categoriaId = id;
    this.buscar();
  }

  cambiarOrden(orden: any) {
    this.filtros.orden = orden;
    this.buscar();
  }

  // ============ CARRITO ============
  agregar(p: Producto) {
    this.carritoSrv.agregar(p, 1);
    this.mostrarToast(`${p.nombre} agregado al carrito`, 'success');
  }

  verDetalle(p: Producto) {
    this.router.navigate(['/producto', p.productoId]);
  }

  imagenError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Producto';
  }

  async mostrarToast(message: string, color: 'success'|'warning'|'danger' = 'success') {
    const t = await this.toast.create({ message, duration: 1800, color, position: 'bottom' });
    await t.present();
  }
}
