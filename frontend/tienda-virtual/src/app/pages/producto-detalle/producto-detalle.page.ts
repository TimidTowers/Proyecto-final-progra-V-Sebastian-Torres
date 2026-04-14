import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Producto, Resena, ResenaResumen, ResenasPaginadas } from '../../models/models';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { ResenaService } from '../../services/resena.service';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';

interface ImagenGaleria {
  url: string;
  urlMedium: string;
  urlLarge: string;
  alt: string;
}

@Component({
  selector: 'app-producto-detalle',
  templateUrl: './producto-detalle.page.html',
  styleUrls: ['./producto-detalle.page.scss'],
  standalone: false
})
export class ProductoDetallePage implements OnInit {
  producto?: Producto;
  cantidad = 1;
  cargando = true;

  // Galeria
  imagenes: ImagenGaleria[] = [];
  imagenActualIndex = 0;
  lightboxAbierto = false;
  lightboxIndex = 0;
  touchStartX = 0;
  touchEndX = 0;

  // Zoom hover
  zoomActivo = false;
  zoomX = 50;
  zoomY = 50;

  // Productos relacionados
  productosRelacionados: Producto[] = [];

  // Reseñas
  resenas: Resena[] = [];
  resenaResumen?: ResenaResumen;
  resenaPagina = 1;
  resenaTotalPaginas = 1;
  resenaOrden = 'recientes';
  resenaCargando = false;

  // Formulario de reseña
  mostrarFormResena = false;
  resenaForm = { calificacion: 5, titulo: '', descripcion: '' };
  resenaFotos: { imagenBase64: string; contentType: string; preview: string }[] = [];
  resenaEnviando = false;
  resenaEditandoId: number | null = null;

  // Galería de fotos de reseñas
  galeriaFotosResenas: { base64: string; contentType: string; usuario: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoSrv: ProductoService,
    private carritoSrv: CarritoService,
    private resenaSrv: ResenaService,
    private pedidoSrv: PedidoService,
    public auth: AuthService,
    private toast: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoSrv.obtener(id).subscribe({
      next: p => {
        this.producto = p;
        this.generarGaleria(p);
        this.cargarRelacionados(p);
        this.cargarResenas(p.productoId);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  /** Genera multiples variaciones de imagen a partir de la URL base del producto */
  private generarGaleria(p: Producto) {
    const base = p.imagenUrl || '';
    if (!base) {
      this.imagenes = [{
        url: 'https://via.placeholder.com/400x400?text=Sin+imagen',
        urlMedium: 'https://via.placeholder.com/600x600?text=Sin+imagen',
        urlLarge: 'https://via.placeholder.com/1200x1200?text=Sin+imagen',
        alt: p.nombre
      }];
      return;
    }

    // Para URLs de Pexels, generar diferentes tamaños
    if (base.includes('images.pexels.com')) {
      const baseClean = base.replace(/\?.*$/, '');
      this.imagenes = [
        {
          url: `${baseClean}?auto=compress&cs=tinysrgb&w=400`,
          urlMedium: `${baseClean}?auto=compress&cs=tinysrgb&w=600`,
          urlLarge: `${baseClean}?auto=compress&cs=tinysrgb&w=1200`,
          alt: `${p.nombre} - Vista principal`
        },
        {
          url: `${baseClean}?auto=compress&cs=tinysrgb&w=400&fit=crop&h=400`,
          urlMedium: `${baseClean}?auto=compress&cs=tinysrgb&w=600&fit=crop&h=600`,
          urlLarge: `${baseClean}?auto=compress&cs=tinysrgb&w=1200&fit=crop&h=1200`,
          alt: `${p.nombre} - Vista detalle`
        },
        {
          url: `${baseClean}?auto=compress&cs=tinysrgb&w=400&fit=crop&h=300`,
          urlMedium: `${baseClean}?auto=compress&cs=tinysrgb&w=600&fit=crop&h=450`,
          urlLarge: `${baseClean}?auto=compress&cs=tinysrgb&w=1200&fit=crop&h=900`,
          alt: `${p.nombre} - Vista panoramica`
        },
        {
          url: `${baseClean}?auto=compress&cs=tinysrgb&w=400&dpr=2`,
          urlMedium: `${baseClean}?auto=compress&cs=tinysrgb&w=600&dpr=2`,
          urlLarge: `${baseClean}?auto=compress&cs=tinysrgb&w=1200`,
          alt: `${p.nombre} - Alta resolucion`
        }
      ];
    } else {
      // Para otras URLs, usar la misma imagen
      this.imagenes = [{
        url: base,
        urlMedium: base,
        urlLarge: base,
        alt: p.nombre
      }];
    }
  }

  private cargarRelacionados(p: Producto) {
    this.productoSrv.listar({ categoriaId: p.categoriaId }).subscribe({
      next: lista => {
        this.productosRelacionados = lista
          .filter(x => x.productoId !== p.productoId)
          .slice(0, 4);
      }
    });
  }

  get imagenActual(): ImagenGaleria {
    return this.imagenes[this.imagenActualIndex] || this.imagenes[0];
  }

  seleccionarImagen(index: number) {
    this.imagenActualIndex = index;
  }

  imagenAnterior() {
    this.imagenActualIndex = this.imagenActualIndex > 0
      ? this.imagenActualIndex - 1
      : this.imagenes.length - 1;
  }

  imagenSiguiente() {
    this.imagenActualIndex = this.imagenActualIndex < this.imagenes.length - 1
      ? this.imagenActualIndex + 1
      : 0;
  }

  // Lightbox
  abrirLightbox(index?: number) {
    this.lightboxIndex = index ?? this.imagenActualIndex;
    this.lightboxAbierto = true;
  }

  cerrarLightbox() {
    this.lightboxAbierto = false;
  }

  lightboxAnterior(event: Event) {
    event.stopPropagation();
    this.lightboxIndex = this.lightboxIndex > 0
      ? this.lightboxIndex - 1
      : this.imagenes.length - 1;
  }

  lightboxSiguiente(event: Event) {
    event.stopPropagation();
    this.lightboxIndex = this.lightboxIndex < this.imagenes.length - 1
      ? this.lightboxIndex + 1
      : 0;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.lightboxAbierto) return;
    if (event.key === 'Escape') this.cerrarLightbox();
    if (event.key === 'ArrowLeft') this.lightboxIndex = this.lightboxIndex > 0 ? this.lightboxIndex - 1 : this.imagenes.length - 1;
    if (event.key === 'ArrowRight') this.lightboxIndex = this.lightboxIndex < this.imagenes.length - 1 ? this.lightboxIndex + 1 : 0;
  }

  // Touch/Swipe
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    const threshold = 50;
    if (Math.abs(diff) < threshold) return;

    if (this.lightboxAbierto) {
      diff > 0 ? this.lightboxIndex = (this.lightboxIndex + 1) % this.imagenes.length
               : this.lightboxIndex = this.lightboxIndex > 0 ? this.lightboxIndex - 1 : this.imagenes.length - 1;
    } else {
      diff > 0 ? this.imagenSiguiente() : this.imagenAnterior();
    }
  }

  // Zoom hover
  onMouseEnterImg() {
    this.zoomActivo = true;
  }

  onMouseLeaveImg() {
    this.zoomActivo = false;
  }

  onMouseMoveImg(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.zoomX = ((event.clientX - rect.left) / rect.width) * 100;
    this.zoomY = ((event.clientY - rect.top) / rect.height) * 100;
  }

  // Cantidad
  aumentar() {
    if (this.producto && this.cantidad < this.producto.stock) this.cantidad++;
  }

  disminuir() {
    if (this.cantidad > 1) this.cantidad--;
  }

  // Carrito
  async agregarAlCarrito() {
    if (!this.producto) return;
    this.carritoSrv.agregar(this.producto, this.cantidad);
    const t = await this.toast.create({
      message: `${this.cantidad} x ${this.producto.nombre} agregado(s)`,
      duration: 1500, color: 'success', position: 'bottom'
    });
    await t.present();
  }

  comprarAhora() {
    this.agregarAlCarrito();
    this.router.navigate(['/carrito']);
  }

  imagenError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Sin+imagen';
  }

  irAProducto(id: number) {
    this.router.navigate(['/producto', id]).then(() => {
      this.cargando = true;
      this.imagenActualIndex = 0;
      this.productoSrv.obtener(id).subscribe({
        next: p => {
          this.producto = p;
          this.cantidad = 1;
          this.generarGaleria(p);
          this.cargarRelacionados(p);
          this.cargarResenas(p.productoId);
          this.cargando = false;
        },
        error: () => { this.cargando = false; }
      });
    });
  }

  // ============ RESEÑAS ============
  cargarResenas(productoId: number, pagina = 1) {
    this.resenaCargando = true;
    this.resenaPagina = pagina;
    this.resenaSrv.obtenerPorProducto(productoId, pagina, 10, this.resenaOrden).subscribe({
      next: data => {
        this.resenas = data.resenas;
        this.resenaResumen = data.resumen;
        this.resenaTotalPaginas = Math.ceil(data.total / data.porPagina) || 1;
        this.galeriaFotosResenas = [];
        for (const r of data.resenas) {
          for (const f of r.fotos) {
            this.galeriaFotosResenas.push({
              base64: f.imagenBase64,
              contentType: f.contentType,
              usuario: r.nombreUsuario
            });
          }
        }
        this.resenaCargando = false;
      },
      error: () => { this.resenaCargando = false; }
    });
  }

  cambiarOrdenResenas(orden: string) {
    this.resenaOrden = orden;
    if (this.producto) this.cargarResenas(this.producto.productoId);
  }

  paginaResenaAnterior() {
    if (this.producto && this.resenaPagina > 1)
      this.cargarResenas(this.producto.productoId, this.resenaPagina - 1);
  }

  paginaResenaSiguiente() {
    if (this.producto && this.resenaPagina < this.resenaTotalPaginas)
      this.cargarResenas(this.producto.productoId, this.resenaPagina + 1);
  }

  getEstrellas(n: number): number[] {
    return Array(Math.round(n)).fill(0);
  }

  getEstrellasVacias(n: number): number[] {
    return Array(5 - Math.round(n)).fill(0);
  }

  getPorcentajeEstrellas(count: number): number {
    if (!this.resenaResumen || this.resenaResumen.totalResenas === 0) return 0;
    return Math.round((count / this.resenaResumen.totalResenas) * 100);
  }

  // Formulario de reseña
  abrirFormResena() {
    this.mostrarFormResena = true;
    this.resenaForm = { calificacion: 5, titulo: '', descripcion: '' };
    this.resenaFotos = [];
    this.resenaEditandoId = null;
  }

  cerrarFormResena() {
    this.mostrarFormResena = false;
    this.resenaEditandoId = null;
  }

  setCalificacion(n: number) {
    this.resenaForm.calificacion = n;
  }

  async seleccionarFotoResena() {
    if (this.resenaFotos.length >= 5) {
      this.mostrarToast('Máximo 5 fotos permitidas', 'warning');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e: any) => {
      const files: FileList = e.target.files;
      for (let i = 0; i < files.length && this.resenaFotos.length < 5; i++) {
        const file = files[i];
        const base64 = await this.comprimirImagen(file, 800, 0.7);
        this.resenaFotos.push({
          imagenBase64: base64.split(',')[1],
          contentType: file.type || 'image/jpeg',
          preview: base64
        });
      }
    };
    input.click();
  }

  private comprimirImagen(file: File, maxWidth: number, quality: number): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = (maxWidth / w) * h;
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  eliminarFotoResena(index: number) {
    this.resenaFotos.splice(index, 1);
  }

  async enviarResena() {
    if (!this.producto || !this.resenaForm.titulo.trim()) {
      this.mostrarToast('El título es obligatorio', 'warning');
      return;
    }

    this.resenaEnviando = true;

    const fotos = this.resenaFotos.map(f => ({
      imagenBase64: f.imagenBase64,
      contentType: f.contentType
    }));

    if (this.resenaEditandoId) {
      this.resenaSrv.editar(this.resenaEditandoId, {
        calificacion: this.resenaForm.calificacion,
        titulo: this.resenaForm.titulo.trim(),
        descripcion: this.resenaForm.descripcion?.trim() || undefined,
        fotos: fotos.length > 0 ? fotos : undefined
      }).subscribe({
        next: () => {
          this.mostrarToast('Reseña actualizada', 'success');
          this.cerrarFormResena();
          this.cargarResenas(this.producto!.productoId);
          this.resenaEnviando = false;
        },
        error: (err) => {
          this.mostrarToast(err.error?.message || 'Error al actualizar', 'danger');
          this.resenaEnviando = false;
        }
      });
      return;
    }

    // Buscar un pedido entregado que contenga este producto
    const { pedidoId } = await this.buscarPedidoEntregado(this.producto.productoId);
    if (!pedidoId) {
      this.mostrarToast('Necesitas haber comprado y recibido este producto para dejar una reseña', 'warning');
      this.resenaEnviando = false;
      return;
    }

    this.resenaSrv.crear({
      productoId: this.producto.productoId,
      pedidoId,
      calificacion: this.resenaForm.calificacion,
      titulo: this.resenaForm.titulo.trim(),
      descripcion: this.resenaForm.descripcion?.trim() || undefined,
      fotos: fotos.length > 0 ? fotos : undefined
    }).subscribe({
      next: () => {
        this.mostrarToast('¡Reseña publicada! Gracias por tu opinión.', 'success');
        this.cerrarFormResena();
        this.cargarResenas(this.producto!.productoId);
        this.resenaEnviando = false;
      },
      error: (err) => {
        this.mostrarToast(err.error?.message || 'Error al enviar reseña', 'danger');
        this.resenaEnviando = false;
      }
    });
  }

  private buscarPedidoEntregado(productoId: number): Promise<{ pedidoId: number | null }> {
    return new Promise(resolve => {
      this.pedidoSrv.listar().subscribe({
        next: pedidos => {
          const pedido = pedidos.find(p =>
            p.estado === 'Entregado' &&
            p.detalles.some(d => d.productoId === productoId)
          );
          resolve({ pedidoId: pedido?.pedidoId ?? null });
        },
        error: () => resolve({ pedidoId: null })
      });
    });
  }

  editarResena(r: Resena) {
    this.mostrarFormResena = true;
    this.resenaEditandoId = r.resenaId;
    this.resenaForm = {
      calificacion: r.calificacion,
      titulo: r.titulo,
      descripcion: r.descripcion || ''
    };
    this.resenaFotos = r.fotos.map(f => ({
      imagenBase64: f.imagenBase64,
      contentType: f.contentType,
      preview: `data:${f.contentType};base64,${f.imagenBase64}`
    }));
  }

  async confirmarEliminarResena(r: Resena) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reseña',
      message: '¿Estás seguro de que deseas eliminar esta reseña?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: () => {
            this.resenaSrv.eliminar(r.resenaId).subscribe({
              next: () => {
                this.mostrarToast('Reseña eliminada', 'success');
                this.cargarResenas(this.producto!.productoId);
              },
              error: () => this.mostrarToast('Error al eliminar', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async reportarResena(r: Resena) {
    const alert = await this.alertCtrl.create({
      header: 'Reportar reseña',
      message: '¿Deseas reportar esta reseña como inapropiada?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reportar', role: 'destructive',
          handler: () => {
            this.resenaSrv.reportar(r.resenaId).subscribe({
              next: (res) => this.mostrarToast(res.message, 'success'),
              error: () => this.mostrarToast('Error al reportar', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const t = await this.toast.create({ message, duration: 2000, color, position: 'bottom' });
    await t.present();
  }
}
