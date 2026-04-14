import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import * as L from 'leaflet';

import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { PdfService } from '../../services/pdf.service';
import { DireccionService } from '../../services/direccion.service';
import { CuponService } from '../../services/cupon.service';
import { FacturaService } from '../../services/factura.service';
import { CostoEnvioResponse, Direccion, ValidarCuponResponse } from '../../models/models';

/** Coordenadas de la tienda (desde donde se calcula el envío). */
const TIENDA_LAT = 10.174564601257563;
const TIENDA_LNG = -83.7800279420646;
/** Bounding box aproximado de Costa Rica continental. */
const CR_LAT_MIN = 8.0, CR_LAT_MAX = 11.25;
const CR_LNG_MIN = -85.95, CR_LNG_MAX = -82.55;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: false
})
export class CheckoutPage implements AfterViewInit, OnDestroy {
  // Datos del pedido
  direccionTexto = '';
  metodoPago = 'Tarjeta';
  fechaEntrega = new Date().toISOString();
  numeroTarjeta = '';
  cvv = '';
  vencimiento = '';

  // Mapa y coordenadas elegidas
  private map?: L.Map;
  private marcador?: L.Marker;
  latitud: number = TIENDA_LAT;
  longitud: number = TIENDA_LNG;
  dentroDeCR = true;

  // Direcciones guardadas
  direccionesGuardadas: Direccion[] = [];
  direccionSeleccionadaId: number | null = null;

  // Cupón
  codigoCupon = '';
  cuponValidado: ValidarCuponResponse | null = null;
  validandoCupon = false;

  // Cálculos
  subtotal = 0;
  descuento = 0;
  baseImponible = 0;
  iva = 0;
  costoEnvio = 0;
  total = 0;
  envioGratis = false;
  distanciaKm = 0;
  mensajeEnvio = '';

  constructor(
    public carritoSrv: CarritoService,
    public auth: AuthService,
    private pedidoSrv: PedidoService,
    private pdf: PdfService,
    private direcciones: DireccionService,
    private cupones: CuponService,
    private facturas: FacturaService,
    private router: Router,
    private alert: AlertController,
    private loading: LoadingController,
    private toast: ToastController,
    private cdr: ChangeDetectorRef
  ) {
    this.subtotal = this.carritoSrv.total;
    this.calcularTotales();
  }

  ngAfterViewInit() {
    this.cargarDireccionesGuardadas();
    setTimeout(() => this.inicializarMapa(), 200);
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  // ============ DIRECCIONES GUARDADAS ============
  private cargarDireccionesGuardadas() {
    if (!this.auth.isAuth) return;
    this.direcciones.listar().subscribe({
      next: d => {
        this.direccionesGuardadas = d;
        const pred = d.find(x => x.predeterminada) || d[0];
        if (pred) {
          this.direccionSeleccionadaId = pred.direccionId;
          this.usarDireccion(pred);
        }
      },
      error: () => {}
    });
  }

  onDireccionSeleccionada(event: any) {
    const id = event.detail.value;
    const d = this.direccionesGuardadas.find(x => x.direccionId === id);
    if (d) this.usarDireccion(d);
  }

  usarDireccion(d: Direccion) {
    this.direccionSeleccionadaId = d.direccionId;
    this.direccionTexto = `${d.detalle}, ${d.distrito}, ${d.canton}, ${d.provincia}`;
    this.latitud = d.latitud;
    this.longitud = d.longitud;
    if (this.map && this.marcador) {
      this.marcador.setLatLng([d.latitud, d.longitud]);
      this.map.setView([d.latitud, d.longitud], 14);
    }
    this.recalcularEnvio();
  }

  // ============ MAPA ============
  private inicializarMapa() {
    if (this.map) return;
    const mapEl = document.getElementById('mapa-checkout');
    if (!mapEl) return;

    // Fix iconos por defecto de Leaflet (rutas bundler)
    const iconDefault = L.Icon.Default.prototype as any;
    delete iconDefault._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    this.map = L.map('mapa-checkout').setView([this.latitud, this.longitud], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    // Marcador de la tienda (icono diferenciado)
    const tiendaIcon = L.divIcon({
      html: '<div style="background:#e26767;border:3px solid white;border-radius:50%;width:22px;height:22px;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([TIENDA_LAT, TIENDA_LNG], { icon: tiendaIcon })
      .addTo(this.map)
      .bindPopup('<b>Tienda Virtual CR</b><br>Punto de despacho');

    // Marcador arrastrable para la dirección del cliente
    this.marcador = L.marker([this.latitud, this.longitud], { draggable: true })
      .addTo(this.map)
      .bindPopup('Arrastra para ubicar tu entrega');

    this.marcador.on('dragend', (e: any) => {
      const pos = e.target.getLatLng();
      this.latitud = pos.lat;
      this.longitud = pos.lng;
      this.direccionSeleccionadaId = null;
      this.recalcularEnvio();
      this.cdr.detectChanges();
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.latitud = e.latlng.lat;
      this.longitud = e.latlng.lng;
      this.marcador!.setLatLng(e.latlng);
      this.direccionSeleccionadaId = null;
      this.recalcularEnvio();
      this.cdr.detectChanges();
    });

    this.recalcularEnvio();
  }

  usarMiUbicacion() {
    if (!navigator.geolocation) {
      this.mostrarToast('Tu dispositivo no soporta geolocalización', 'warning');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.latitud = pos.coords.latitude;
        this.longitud = pos.coords.longitude;
        if (this.map && this.marcador) {
          this.marcador.setLatLng([this.latitud, this.longitud]);
          this.map.setView([this.latitud, this.longitud], 15);
        }
        this.direccionSeleccionadaId = null;
        this.recalcularEnvio();
        this.cdr.detectChanges();
      },
      () => this.mostrarToast('No se pudo obtener tu ubicación', 'warning')
    );
  }

  // ============ CÁLCULO EN VIVO (cliente) ============
  private estaEnCR(lat: number, lng: number): boolean {
    return lat >= CR_LAT_MIN && lat <= CR_LAT_MAX && lng >= CR_LNG_MIN && lng <= CR_LNG_MAX;
  }

  private distanciaKmLocal(lat: number, lng: number): number {
    const R = 6371;
    const dLat = ((lat - TIENDA_LAT) * Math.PI) / 180;
    const dLng = ((lng - TIENDA_LNG) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((TIENDA_LAT * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  recalcularEnvio() {
    this.subtotal = this.carritoSrv.total;
    this.dentroDeCR = this.estaEnCR(this.latitud, this.longitud);

    if (!this.dentroDeCR) {
      this.costoEnvio = 0;
      this.envioGratis = false;
      this.distanciaKm = 0;
      this.mensajeEnvio = '⚠️ La dirección está fuera del territorio continental de Costa Rica.';
      this.calcularTotales();
      return;
    }

    // Pedimos al backend el cálculo oficial (fuente de verdad)
    this.direcciones
      .calcularCostoEnvio({
        latitud: this.latitud,
        longitud: this.longitud,
        subtotal: this.subtotal
      })
      .subscribe({
        next: (r: CostoEnvioResponse) => {
          this.distanciaKm = r.distanciaKm;
          this.costoEnvio = r.costoEnvio;
          this.envioGratis = r.envioGratis;
          this.mensajeEnvio = r.mensaje || '';
          this.dentroDeCR = r.dentroDeCostaRica;
          this.calcularTotales();
        },
        error: () => {
          // Fallback: cálculo local
          this.distanciaKm = this.distanciaKmLocal(this.latitud, this.longitud);
          if (this.subtotal >= 50000) {
            this.envioGratis = true;
            this.costoEnvio = 0;
            this.mensajeEnvio = '¡Envío gratis por pedido mayor a ₡50.000!';
          } else {
            this.envioGratis = false;
            this.costoEnvio = Math.min(10000, Math.round(1500 + 300 * this.distanciaKm));
            this.mensajeEnvio = `Distancia aproximada: ${this.distanciaKm.toFixed(1)} km`;
          }
          this.calcularTotales();
        }
      });
  }

  // ============ CUPÓN ============
  validarCupon() {
    const codigo = (this.codigoCupon || '').trim();
    if (!codigo) {
      this.cuponValidado = null;
      this.descuento = 0;
      this.calcularTotales();
      return;
    }
    this.validandoCupon = true;
    this.cupones.validar(codigo, this.carritoSrv.total).subscribe({
      next: r => {
        this.validandoCupon = false;
        this.cuponValidado = r;
        if (r.valido) {
          this.descuento = r.descuento;
          this.mostrarToast(`Cupón aplicado: -₡${r.descuento.toLocaleString('es-CR')}`, 'success');
        } else {
          this.descuento = 0;
          this.mostrarToast(r.mensaje || 'Cupón no válido', 'warning');
        }
        this.calcularTotales();
      },
      error: () => {
        this.validandoCupon = false;
        this.cuponValidado = { valido: false, mensaje: 'No se pudo validar el cupón', descuento: 0 };
        this.descuento = 0;
        this.mostrarToast('Error al validar cupón', 'danger');
        this.calcularTotales();
      }
    });
  }

  quitarCupon() {
    this.codigoCupon = '';
    this.cuponValidado = null;
    this.descuento = 0;
    this.calcularTotales();
  }

  // ============ TOTALES ============
  private calcularTotales() {
    this.subtotal = this.carritoSrv.total;
    const baseSinIva = Math.max(0, this.subtotal - this.descuento);
    this.baseImponible = baseSinIva;
    this.iva = Math.round(baseSinIva * 0.13);
    this.total = this.baseImponible + this.iva + this.costoEnvio;
  }

  // ============ CONFIRMAR COMPRA ============
  async confirmarCompra(esProforma: boolean) {
    if (this.carritoSrv.items.length === 0) {
      this.mostrarToast('El carrito está vacío', 'warning');
      return;
    }
    if (!this.dentroDeCR) {
      this.mostrarToast('La dirección debe estar dentro de Costa Rica', 'danger');
      return;
    }
    if (!this.direccionTexto || this.direccionTexto.trim().length < 5) {
      this.mostrarToast('Describe la dirección de entrega (mín. 5 caracteres)', 'warning');
      return;
    }
    if (!esProforma && this.metodoPago === 'Tarjeta' && (!this.numeroTarjeta || !this.cvv)) {
      this.mostrarToast('Completa los datos de la tarjeta', 'warning');
      return;
    }

    const load = await this.loading.create({
      message: esProforma ? 'Generando proforma...' : 'Procesando pago...'
    });
    await load.present();

    this.pedidoSrv
      .crear({
        items: this.carritoSrv.items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
        direccionEnvio: this.direccionTexto,
        latitud: this.latitud,
        longitud: this.longitud,
        metodoPago: this.metodoPago,
        esProforma,
        codigoCupon: this.cuponValidado?.valido ? this.codigoCupon.trim() : undefined
      })
      .subscribe({
        next: async pedido => {
          await load.dismiss();
          if (!esProforma) this.carritoSrv.vaciar();

          const botones: any[] = [
            {
              text: 'Descargar PDF',
              handler: () => this.pdf.generarProforma(pedido, this.auth.usuario!.nombre)
            }
          ];

          // Si se generó factura, ofrecer descarga específica
          if (!esProforma && pedido.facturaId) {
            botones.unshift({
              text: 'Ver factura',
              handler: () => {
                this.facturas
                  .obtener(pedido.facturaId!)
                  .subscribe(f => this.pdf.generarFactura(f));
              }
            });
          }

          botones.push({ text: 'Ver pedidos', handler: () => this.router.navigate(['/pedidos']) });

          const a = await this.alert.create({
            header: esProforma ? 'Proforma generada' : '¡Compra exitosa!',
            message: `Pedido #${pedido.pedidoId} por ₡${pedido.total.toLocaleString('es-CR')}`,
            buttons: botones
          });
          await a.present();
        },
        error: async e => {
          await load.dismiss();
          const a = await this.alert.create({
            header: 'Error',
            message: e?.error?.message || 'No se pudo procesar el pedido.',
            buttons: ['OK']
          });
          await a.present();
        }
      });
  }

  async mostrarToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const t = await this.toast.create({ message, duration: 2200, color });
    await t.present();
  }
}
