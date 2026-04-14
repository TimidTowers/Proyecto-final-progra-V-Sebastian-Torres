import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pedido } from '../../models/models';
import { PedidoService } from '../../services/pedido.service';
import { PdfService } from '../../services/pdf.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: false
})
export class PedidosPage implements OnInit {
  pedidos: Pedido[] = [];
  cargando = true;

  constructor(
    private pedidoSrv: PedidoService,
    private pdf: PdfService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar(ev?: any) {
    this.cargando = true;
    this.pedidoSrv.listar().subscribe({
      next: p => {
        this.pedidos = p;
        this.cargando = false;
        if (ev) ev.target.complete();
      },
      error: () => {
        this.cargando = false;
        if (ev) ev.target.complete();
      }
    });
  }

  descargarPdf(p: Pedido) {
    this.pdf.generarProforma(p, this.auth.usuario?.nombre || 'Cliente');
  }

  cambiarEstado(p: Pedido, nuevoEstado: string) {
    this.pedidoSrv.cambiarEstado(p.pedidoId, nuevoEstado).subscribe(() => {
      p.estado = nuevoEstado;
    });
  }

  colorEstado(estado: string): string {
    const mapa: { [k: string]: string } = {
      'Pendiente': 'warning',
      'Confirmado': 'primary',
      'Enviado': 'tertiary',
      'Entregado': 'success',
      'Cancelado': 'danger',
      'Proforma': 'medium'
    };
    return mapa[estado] || 'medium';
  }

  irAResenar(productoId: number) {
    this.router.navigate(['/producto', productoId]);
  }
}
