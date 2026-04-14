import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  AlertaStock,
  Categoria,
  Cupon,
  Dashboard,
  Factura,
  MovimientoInventario,
  Producto,
  Resena,
  ResenaResumen,
  TipoDescuento
} from '../../models/models';
import { ProductoService } from '../../services/producto.service';
import { ReportesService, FiltrosDashboard } from '../../services/reportes.service';
import { CuponService } from '../../services/cupon.service';
import { InventarioService } from '../../services/inventario.service';
import { FacturaService } from '../../services/factura.service';
import { ExcelService } from '../../services/excel.service';
import { PdfService } from '../../services/pdf.service';
import { ResenaService } from '../../services/resena.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type Seccion =
  | 'dashboard'
  | 'productos'
  | 'categorias'
  | 'cupones'
  | 'inventario'
  | 'facturas'
  | 'imagenes'
  | 'resenas';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false
})
export class AdminPage implements OnInit {
  seccion: Seccion = 'dashboard';

  // Productos
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  cargando = false;

  // Formulario de producto (modal inline)
  mostrarFormProducto = false;
  productoEditando: Producto | null = null;
  formProducto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    stockMinimo: 5,
    imagenUrl: '',
    categoriaId: 0
  };

  // Categorías
  arbolCategorias: Categoria[] = [];

  // Cupones
  cupones: Cupon[] = [];

  // Inventario
  movimientos: MovimientoInventario[] = [];
  alertas: AlertaStock[] = [];
  filtroProductoId: number | null = null;

  // Inventario rediseñado
  inventarioProductos: Producto[] = [];
  inventarioFiltrados: Producto[] = [];
  inventarioBusqueda = '';
  inventarioSeleccionados = new Map<number, boolean>();
  inventarioCantidades = new Map<number, number>();
  inventarioMotivo = '';
  inventarioPagina = 1;
  inventarioPageSize = 10;
  inventarioCargando = false;
  inventarioTab: 'reabastecer' | 'historial' = 'reabastecer';

  // Reseñas
  resenasAdmin: Resena[] = [];
  resenasResumen?: ResenaResumen;
  resenasTotal = 0;
  resenasPagina = 1;
  resenasTotalPaginas = 1;
  resenasEstadoFiltro = '';
  resenasCargando = false;

  // Imagenes
  imagenesProductos: Producto[] = [];
  imagenesFiltrados: Producto[] = [];
  imagenesBusqueda = '';
  imagenEditandoId: number | null = null;
  imagenNuevaUrl = '';
  imagenCargando = false;

  // Facturas
  facturas: Factura[] = [];

  // Dashboard
  dashboard: Dashboard | null = null;
  filtros: FiltrosDashboard = {};

  ventasChart: ChartData<'line'> = { labels: [], datasets: [] };
  ventasChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };

  productosChart: ChartData<'bar'> = { labels: [], datasets: [] };
  productosChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  categoriasChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  categoriasChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  };

  metodosChart: ChartData<'pie'> = { labels: [], datasets: [] };
  metodosChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  };

  @ViewChild(BaseChartDirective) chartDirective?: BaseChartDirective;

  constructor(
    private productoSrv: ProductoService,
    private reportes: ReportesService,
    private cupones$: CuponService,
    private inventario$: InventarioService,
    private facturas$: FacturaService,
    private excel: ExcelService,
    private pdf: PdfService,
    private resenaSrv: ResenaService,
    private http: HttpClient,
    private alert: AlertController,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.cargarDashboard();
    this.productoSrv.categorias().subscribe(c => (this.categorias = c));
  }

  cambiarSeccion(s: Seccion) {
    this.seccion = s;
    if (s === 'dashboard') this.cargarDashboard();
    if (s === 'productos') this.cargarProductos();
    if (s === 'categorias') this.cargarArbolCategorias();
    if (s === 'cupones') this.cargarCupones();
    if (s === 'inventario') this.cargarInventario();
    if (s === 'facturas') this.cargarFacturas();
    if (s === 'imagenes') this.cargarImagenes();
    if (s === 'resenas') this.cargarResenasAdmin();
  }

  // ============ DASHBOARD ============
  cargarDashboard() {
    this.cargando = true;
    this.reportes.dashboard(this.filtros).subscribe({
      next: d => {
        this.dashboard = d;
        this.prepararCharts(d);
        this.cargando = false;
      },
      error: () => (this.cargando = false)
    });
  }

  prepararCharts(d: Dashboard) {
    this.ventasChart = {
      labels: d.ventasPorDia.map(v => v.fecha),
      datasets: [
        {
          label: 'Ventas (₡)',
          data: d.ventasPorDia.map(v => v.monto),
          borderColor: '#2d63e2',
          backgroundColor: 'rgba(45,99,226,0.25)',
          fill: true,
          tension: 0.3
        }
      ]
    };

    this.productosChart = {
      labels: d.productosTop.map(p => p.nombre),
      datasets: [
        {
          label: 'Total vendido',
          data: d.productosTop.map(p => p.total),
          backgroundColor: '#18b37c'
        }
      ]
    };

    const palette = ['#2d63e2', '#18b37c', '#f0a500', '#e26767', '#9b59b6', '#27ae60', '#f39c12'];

    this.categoriasChart = {
      labels: d.categoriasTop.map(c => c.nombre),
      datasets: [
        {
          label: 'Categorías',
          data: d.categoriasTop.map(c => c.total),
          backgroundColor: palette
        }
      ]
    };

    this.metodosChart = {
      labels: d.porMetodoPago.map(m => m.metodo),
      datasets: [
        {
          label: 'Método de pago',
          data: d.porMetodoPago.map(m => m.total),
          backgroundColor: palette
        }
      ]
    };

    setTimeout(() => this.chartDirective?.update(), 50);
  }

  limpiarFiltros() {
    this.filtros = {};
    this.cargarDashboard();
  }

  exportarDashboardExcel() {
    if (!this.dashboard) return;
    const d = this.dashboard;
    this.excel.exportarMulti(
      [
        {
          nombre: 'Resumen',
          filas: [
            {
              TotalVendido: d.totalVendido,
              Pedidos: d.cantidadPedidos,
              Ticket: d.ticketPromedio,
              Clientes: d.clientesActivos,
              StockBajo: d.productosStockBajo
            }
          ]
        },
        { nombre: 'Ventas por día', filas: d.ventasPorDia },
        { nombre: 'Top productos', filas: d.productosTop },
        { nombre: 'Top categorías', filas: d.categoriasTop },
        { nombre: 'Por método pago', filas: d.porMetodoPago },
        { nombre: 'Por estado', filas: d.porEstado }
      ],
      `dashboard_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  // ============ PRODUCTOS ============
  cargarProductos() {
    this.cargando = true;
    this.productoSrv.listar().subscribe({
      next: p => {
        this.productos = p;
        this.cargando = false;
      },
      error: () => (this.cargando = false)
    });
  }

  abrirFormProducto(p?: Producto) {
    if (p) {
      this.productoEditando = p;
      this.formProducto = {
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio: p.precio,
        stock: p.stock,
        stockMinimo: p.stockMinimo ?? 5,
        imagenUrl: p.imagenUrl || '',
        categoriaId: p.categoriaId
      };
    } else {
      this.productoEditando = null;
      this.formProducto = { nombre: '', descripcion: '', precio: 0, stock: 0, stockMinimo: 5, imagenUrl: '', categoriaId: 0 };
    }
    this.mostrarFormProducto = true;
  }

  cerrarFormProducto() {
    this.mostrarFormProducto = false;
    this.productoEditando = null;
  }

  guardarProducto() {
    const f = this.formProducto;
    if (!f.nombre || !f.precio || !f.categoriaId) {
      this.mostrarToast('Nombre, precio y categoría son obligatorios', 'warning');
      return;
    }

    const payload: any = {
      nombre: f.nombre,
      descripcion: f.descripcion,
      precio: Number(f.precio),
      stock: Number(f.stock || 0),
      stockMinimo: Number(f.stockMinimo || 5),
      imagenUrl: f.imagenUrl,
      categoriaId: Number(f.categoriaId)
    };

    if (this.productoEditando) {
      this.productoSrv.actualizar(this.productoEditando.productoId, payload).subscribe({
        next: () => {
          this.mostrarToast('Producto actualizado', 'success');
          this.cerrarFormProducto();
          this.cargarProductos();
        },
        error: e => this.mostrarToast(e?.error?.message || 'Error al actualizar', 'danger')
      });
    } else {
      this.productoSrv.crear(payload).subscribe({
        next: () => {
          this.mostrarToast('Producto creado', 'success');
          this.cerrarFormProducto();
          this.cargarProductos();
        },
        error: e => this.mostrarToast(e?.error?.message || 'Error al crear', 'danger')
      });
    }
  }

  async eliminar(p: Producto) {
    const a = await this.alert.create({
      header: 'Eliminar',
      message: `¿Eliminar "${p.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí',
          handler: () => {
            this.productoSrv.eliminar(p.productoId).subscribe(() => {
              this.mostrarToast('Eliminado', 'warning');
              this.cargarProductos();
            });
          }
        }
      ]
    });
    await a.present();
  }

  // ============ CATEGORÍAS ============
  cargarArbolCategorias() {
    this.http.get<Categoria[]>(`${environment.apiUrl}/categorias/arbol`).subscribe(a => {
      this.arbolCategorias = a;
    });
    this.productoSrv.categorias().subscribe(c => (this.categorias = c));
  }

  async nuevaCategoria(padreId: number | null = null) {
    const inputs: any[] = [
      { name: 'nombre', type: 'text', placeholder: 'Nombre' },
      { name: 'descripcion', type: 'textarea', placeholder: 'Descripción' },
      { name: 'icono', type: 'text', placeholder: 'Icono (ionicons)' }
    ];

    const a = await this.alert.create({
      header: padreId ? 'Nueva subcategoría' : 'Nueva categoría',
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: data => {
            if (!data.nombre) {
              this.mostrarToast('Nombre requerido', 'warning');
              return false;
            }
            this.http
              .post(`${environment.apiUrl}/categorias`, {
                nombre: data.nombre,
                descripcion: data.descripcion,
                icono: data.icono,
                categoriaPadreId: padreId
              })
              .subscribe({
                next: () => {
                  this.mostrarToast('Categoría creada', 'success');
                  this.cargarArbolCategorias();
                },
                error: e => this.mostrarToast(e?.error?.message || 'Error', 'danger')
              });
            return true;
          }
        }
      ]
    });
    await a.present();
  }

  async eliminarCategoria(c: Categoria) {
    const a = await this.alert.create({
      header: 'Eliminar categoría',
      message: `¿Eliminar "${c.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí',
          handler: () => {
            this.http.delete(`${environment.apiUrl}/categorias/${c.categoriaId}`).subscribe({
              next: () => {
                this.mostrarToast('Eliminada', 'warning');
                this.cargarArbolCategorias();
              },
              error: e => this.mostrarToast(e?.error?.message || 'No se puede eliminar', 'danger')
            });
          }
        }
      ]
    });
    await a.present();
  }

  // ============ CUPONES ============
  cargarCupones() {
    this.cupones$.listar().subscribe(c => (this.cupones = c));
  }

  async nuevoCupon() {
    const a = await this.alert.create({
      header: 'Nuevo cupón',
      inputs: [
        { name: 'codigo', type: 'text', placeholder: 'Código' },
        { name: 'descripcion', type: 'text', placeholder: 'Descripción' },
        { name: 'tipo', type: 'radio', label: 'Porcentaje', value: 'Porcentaje', checked: true },
        { name: 'tipo', type: 'radio', label: 'Monto fijo (₡)', value: 'MontoFijo' },
        { name: 'valor', type: 'number', placeholder: 'Valor' },
        { name: 'fechaInicio', type: 'date' },
        { name: 'fechaFin', type: 'date' },
        { name: 'limiteUso', type: 'number', placeholder: 'Límite de usos (0 = ilimitado)', value: 0 },
        { name: 'montoMinimo', type: 'number', placeholder: 'Monto mínimo', value: 0 }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: data => {
            if (!data.codigo || !data.valor || !data.fechaInicio || !data.fechaFin) {
              this.mostrarToast('Completa los campos requeridos', 'warning');
              return false;
            }
            this.cupones$
              .crear({
                codigo: data.codigo,
                descripcion: data.descripcion,
                tipo: (data.tipo || 'Porcentaje') as TipoDescuento,
                valor: Number(data.valor),
                fechaInicio: new Date(data.fechaInicio).toISOString(),
                fechaFin: new Date(data.fechaFin).toISOString(),
                limiteUso: Number(data.limiteUso || 0),
                montoMinimo: Number(data.montoMinimo || 0),
                activo: true
              })
              .subscribe({
                next: () => {
                  this.mostrarToast('Cupón creado', 'success');
                  this.cargarCupones();
                },
                error: e => this.mostrarToast(e?.error?.message || 'Error', 'danger')
              });
            return true;
          }
        }
      ]
    });
    await a.present();
  }

  async toggleCupon(c: Cupon) {
    this.cupones$.actualizar(c.cuponId, { ...c, activo: !c.activo }).subscribe(() => {
      this.mostrarToast(c.activo ? 'Cupón desactivado' : 'Cupón activado', 'success');
      this.cargarCupones();
    });
  }

  async eliminarCupon(c: Cupon) {
    const a = await this.alert.create({
      header: 'Eliminar cupón',
      message: `¿Eliminar "${c.codigo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí',
          handler: () => {
            this.cupones$.eliminar(c.cuponId).subscribe(() => {
              this.mostrarToast('Eliminado', 'warning');
              this.cargarCupones();
            });
          }
        }
      ]
    });
    await a.present();
  }

  // ============ INVENTARIO ============
  cargarInventario() {
    this.inventarioCargando = true;
    this.productoSrv.listar().subscribe({
      next: p => {
        this.inventarioProductos = p;
        this.productos = p;
        this.filtrarInventario();
        this.inventarioCargando = false;
      },
      error: () => (this.inventarioCargando = false)
    });
    this.inventario$
      .movimientos(this.filtroProductoId ? { productoId: this.filtroProductoId } : {})
      .subscribe(m => (this.movimientos = m));
    this.inventario$.alertas().subscribe(a => (this.alertas = a));
  }

  filtrarInventario() {
    const q = this.inventarioBusqueda.toLowerCase().trim();
    this.inventarioFiltrados = q
      ? this.inventarioProductos.filter(p =>
          p.nombre.toLowerCase().includes(q) || p.categoriaNombre.toLowerCase().includes(q))
      : [...this.inventarioProductos];
    this.inventarioPagina = 1;
  }

  get inventarioPaginado(): Producto[] {
    const start = (this.inventarioPagina - 1) * this.inventarioPageSize;
    return this.inventarioFiltrados.slice(start, start + this.inventarioPageSize);
  }

  get inventarioTotalPaginas(): number {
    return Math.max(1, Math.ceil(this.inventarioFiltrados.length / this.inventarioPageSize));
  }

  inventarioPaginaAnterior() {
    if (this.inventarioPagina > 1) this.inventarioPagina--;
  }

  inventarioPaginaSiguiente() {
    if (this.inventarioPagina < this.inventarioTotalPaginas) this.inventarioPagina++;
  }

  // Seleccion
  invToggleSeleccion(productoId: number) {
    if (this.inventarioSeleccionados.get(productoId)) {
      this.inventarioSeleccionados.delete(productoId);
      this.inventarioCantidades.delete(productoId);
    } else {
      this.inventarioSeleccionados.set(productoId, true);
      if (!this.inventarioCantidades.has(productoId)) {
        this.inventarioCantidades.set(productoId, 1);
      }
    }
  }

  invEstaSeleccionado(id: number): boolean {
    return this.inventarioSeleccionados.has(id);
  }

  invToggleTodo() {
    if (this.inventarioSeleccionados.size === this.inventarioFiltrados.length) {
      this.inventarioSeleccionados.clear();
      this.inventarioCantidades.clear();
    } else {
      this.inventarioFiltrados.forEach(p => {
        this.inventarioSeleccionados.set(p.productoId, true);
        if (!this.inventarioCantidades.has(p.productoId)) {
          this.inventarioCantidades.set(p.productoId, 1);
        }
      });
    }
  }

  get invTodoSeleccionado(): boolean {
    return this.inventarioFiltrados.length > 0
      && this.inventarioSeleccionados.size === this.inventarioFiltrados.length;
  }

  invGetCantidad(id: number): number {
    return this.inventarioCantidades.get(id) || 0;
  }

  invSetCantidad(id: number, val: any) {
    const n = Math.max(0, Math.floor(Number(val) || 0));
    this.inventarioCantidades.set(id, n);
  }

  // Reabastecimiento individual
  reabastecerIndividual(p: Producto) {
    const cant = this.inventarioCantidades.get(p.productoId) || 0;
    if (cant <= 0) {
      this.mostrarToast('La cantidad debe ser mayor a 0', 'warning');
      return;
    }
    this.inventario$.reabastecer({
      productoId: p.productoId,
      cantidad: cant,
      motivo: this.inventarioMotivo || 'Reabastecimiento'
    }).subscribe({
      next: () => {
        this.mostrarToast(`${p.nombre}: +${cant} unidades`, 'success');
        this.inventarioCantidades.delete(p.productoId);
        this.inventarioSeleccionados.delete(p.productoId);
        this.cargarInventario();
      },
      error: e => this.mostrarToast(e?.error?.message || 'Error', 'danger')
    });
  }

  // Reabastecimiento masivo
  async reabastecerMasivo() {
    const items: { productoId: number; cantidad: number; motivo?: string }[] = [];
    this.inventarioSeleccionados.forEach((_, id) => {
      const cant = this.inventarioCantidades.get(id) || 0;
      if (cant > 0) {
        items.push({ productoId: id, cantidad: cant, motivo: this.inventarioMotivo || 'Reabastecimiento masivo' });
      }
    });

    if (items.length === 0) {
      this.mostrarToast('No hay productos con cantidad valida seleccionados', 'warning');
      return;
    }

    const a = await this.alert.create({
      header: 'Confirmar reabastecimiento',
      message: `Se reabastecera${items.length > 1 ? 'n' : ''} ${items.length} producto${items.length > 1 ? 's' : ''}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.inventarioCargando = true;
            this.inventario$.reabastecerMasivo(items).subscribe({
              next: resultados => {
                const exitosos = resultados.filter(r => r.exitoso).length;
                this.mostrarToast(`${exitosos} de ${resultados.length} productos reabastecidos`, 'success');
                this.inventarioSeleccionados.clear();
                this.inventarioCantidades.clear();
                this.inventarioMotivo = '';
                this.cargarInventario();
              },
              error: e => {
                this.inventarioCargando = false;
                this.mostrarToast(e?.error?.message || 'Error en reabastecimiento', 'danger');
              }
            });
          }
        }
      ]
    });
    await a.present();
  }

  // Acciones rapidas
  async accionResetearTodo() {
    const a = await this.alert.create({
      header: 'Restablecer todo a cero',
      message: 'Esta accion pondra el stock de TODOS los productos activos en 0. ¿Continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Si, restablecer',
          role: 'destructive',
          handler: () => {
            const ajustes = this.inventarioProductos
              .filter(p => p.stock > 0)
              .map(p => ({ productoId: p.productoId, delta: -p.stock, motivo: 'Restablecimiento total a cero' }));
            if (ajustes.length === 0) {
              this.mostrarToast('Todos los productos ya estan en 0', 'warning');
              return;
            }
            this.inventario$.ajustarMasivo(ajustes).subscribe({
              next: r => {
                this.mostrarToast(`${r.filter(x => x.exitoso).length} productos restablecidos a 0`, 'success');
                this.cargarInventario();
              },
              error: () => this.mostrarToast('Error al restablecer', 'danger')
            });
          }
        }
      ]
    });
    await a.present();
  }

  async accionResetearMinimo() {
    const a = await this.alert.create({
      header: 'Restablecer a stock minimo',
      message: 'Se ajustara cada producto a su nivel de stock minimo. ¿Continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Continuar',
          handler: () => {
            const ajustes = this.inventarioProductos
              .filter(p => p.stock !== (p.stockMinimo || 5))
              .map(p => ({
                productoId: p.productoId,
                delta: (p.stockMinimo || 5) - p.stock,
                motivo: 'Restablecimiento a stock minimo'
              }));
            if (ajustes.length === 0) {
              this.mostrarToast('Todos ya estan en su stock minimo', 'warning');
              return;
            }
            this.inventario$.ajustarMasivo(ajustes).subscribe({
              next: r => {
                this.mostrarToast(`${r.filter(x => x.exitoso).length} productos ajustados`, 'success');
                this.cargarInventario();
              },
              error: () => this.mostrarToast('Error al ajustar', 'danger')
            });
          }
        }
      ]
    });
    await a.present();
  }

  notificarStockBajo() {
    this.inventario$.notificarStockBajo().subscribe({
      next: r => this.mostrarToast(r.mensaje, 'success'),
      error: () => this.mostrarToast('Error al notificar', 'danger')
    });
  }

  exportarMovimientosExcel() {
    if (this.movimientos.length === 0) return;
    this.excel.exportar(
      this.movimientos.map(m => ({
        Fecha: new Date(m.fecha).toLocaleString('es-CR'),
        Producto: m.nombreProducto,
        Tipo: m.tipo,
        Cantidad: m.cantidad,
        StockAnterior: m.stockAnterior,
        StockNuevo: m.stockNuevo,
        Motivo: m.motivo || '',
        Usuario: m.usuarioNombre || ''
      })),
      'movimientos_inventario.xlsx'
    );
  }

  // ============ FACTURAS ============
  cargarFacturas() {
    this.facturas$.listar().subscribe(f => (this.facturas = f));
  }

  descargarFactura(f: Factura) {
    this.facturas$.obtener(f.facturaId).subscribe(full => this.pdf.generarFactura(full));
  }

  exportarFacturasExcel() {
    if (this.facturas.length === 0) return;
    this.excel.exportar(
      this.facturas.map(f => ({
        Consecutivo: f.numeroConsecutivo,
        Fecha: new Date(f.fechaEmision).toLocaleString('es-CR'),
        Cliente: f.usuarioNombre,
        Subtotal: f.subtotal,
        Descuento: f.descuento,
        BaseImponible: f.baseImponible,
        IVA: f.iva,
        Envio: f.costoEnvio,
        Total: f.total
      })),
      'facturas.xlsx'
    );
  }

  // ============ IMAGENES ============
  cargarImagenes() {
    this.imagenCargando = true;
    this.productoSrv.listar().subscribe({
      next: p => {
        this.imagenesProductos = p;
        this.filtrarImagenes();
        this.imagenCargando = false;
      },
      error: () => (this.imagenCargando = false)
    });
  }

  filtrarImagenes() {
    const q = this.imagenesBusqueda.toLowerCase().trim();
    this.imagenesFiltrados = q
      ? this.imagenesProductos.filter(p =>
          p.nombre.toLowerCase().includes(q) || p.categoriaNombre.toLowerCase().includes(q))
      : [...this.imagenesProductos];
  }

  editarImagen(p: Producto) {
    this.imagenEditandoId = p.productoId;
    this.imagenNuevaUrl = p.imagenUrl || '';
  }

  cancelarEdicionImagen() {
    this.imagenEditandoId = null;
    this.imagenNuevaUrl = '';
  }

  guardarImagen(p: Producto) {
    if (!this.imagenNuevaUrl.trim()) {
      this.mostrarToast('La URL no puede estar vacia', 'warning');
      return;
    }
    this.productoSrv.actualizar(p.productoId, {
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      stockMinimo: p.stockMinimo,
      imagenUrl: this.imagenNuevaUrl.trim(),
      categoriaId: p.categoriaId
    }).subscribe({
      next: () => {
        this.mostrarToast(`Imagen de "${p.nombre}" actualizada`, 'success');
        this.imagenEditandoId = null;
        this.imagenNuevaUrl = '';
        this.cargarImagenes();
      },
      error: e => this.mostrarToast(e?.error?.message || 'Error al actualizar imagen', 'danger')
    });
  }

  imagenError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/120x120?text=Sin+imagen';
  }

  // ============ RESEÑAS MODERACIÓN ============
  cargarResenasAdmin(pagina = 1) {
    this.resenasCargando = true;
    this.resenasPagina = pagina;
    this.resenaSrv.listarAdmin(this.resenasEstadoFiltro || undefined, pagina, 20).subscribe({
      next: data => {
        this.resenasAdmin = data.resenas;
        this.resenasResumen = data.resumen;
        this.resenasTotal = data.total;
        this.resenasTotalPaginas = Math.ceil(data.total / data.porPagina) || 1;
        this.resenasCargando = false;
      },
      error: () => (this.resenasCargando = false)
    });
  }

  filtrarResenasAdmin() {
    this.cargarResenasAdmin(1);
  }

  resenasPaginaAnterior() {
    if (this.resenasPagina > 1) this.cargarResenasAdmin(this.resenasPagina - 1);
  }

  resenasPaginaSiguiente() {
    if (this.resenasPagina < this.resenasTotalPaginas) this.cargarResenasAdmin(this.resenasPagina + 1);
  }

  async moderarResena(r: Resena, estado: string) {
    if (estado === 'Rechazada') {
      const a = await this.alert.create({
        header: 'Motivo de rechazo',
        inputs: [{ name: 'motivo', type: 'textarea', placeholder: 'Motivo del rechazo' }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Rechazar',
            handler: data => {
              this.resenaSrv.moderar(r.resenaId, estado, data.motivo).subscribe({
                next: () => {
                  this.mostrarToast('Reseña rechazada', 'warning');
                  this.cargarResenasAdmin(this.resenasPagina);
                },
                error: () => this.mostrarToast('Error al moderar', 'danger')
              });
            }
          }
        ]
      });
      await a.present();
    } else {
      this.resenaSrv.moderar(r.resenaId, estado).subscribe({
        next: () => {
          this.mostrarToast(`Reseña ${estado.toLowerCase()}`, 'success');
          this.cargarResenasAdmin(this.resenasPagina);
        },
        error: () => this.mostrarToast('Error al moderar', 'danger')
      });
    }
  }

  async eliminarResenaAdmin(r: Resena) {
    const a = await this.alert.create({
      header: 'Eliminar reseña',
      message: `¿Eliminar la reseña de "${r.nombreUsuario}" sobre "${r.nombreProducto}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.resenaSrv.eliminar(r.resenaId).subscribe({
              next: () => {
                this.mostrarToast('Reseña eliminada', 'warning');
                this.cargarResenasAdmin(this.resenasPagina);
              },
              error: () => this.mostrarToast('Error al eliminar', 'danger')
            });
          }
        }
      ]
    });
    await a.present();
  }

  getEstrellasArr(n: number): number[] { return Array(n).fill(0); }
  getEstrellasVaciasArr(n: number): number[] { return Array(5 - n).fill(0); }

  colorResenaEstado(estado: string): string {
    const m: { [k: string]: string } = {
      'Aprobada': 'success', 'Pendiente': 'warning',
      'Rechazada': 'danger', 'Reportada': 'tertiary'
    };
    return m[estado] || 'medium';
  }

  async mostrarToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const t = await this.toast.create({ message, duration: 1800, color });
    await t.present();
  }
}
