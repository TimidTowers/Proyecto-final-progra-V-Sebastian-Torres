import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Pedido } from '../../models/models';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  ultimosPedidos: Pedido[] = [];
  mostrarMapa = false;

  constructor(
    public auth: AuthService,
    private pedidoSrv: PedidoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.pedidoSrv.listar().subscribe({
      next: p => this.ultimosPedidos = p.slice(0, 5),
      error: () => {}
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
