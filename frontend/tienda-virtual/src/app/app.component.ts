import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CarritoService } from './services/carrito.service';
import { TemaService, ModoTema } from './services/tema.service';

interface MenuOpcion {
  titulo: string;
  icono: string;
  ruta: string;
  soloAuth?: boolean;
  soloAdmin?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  opciones: MenuOpcion[] = [
    { titulo: 'Inicio', icono: 'home', ruta: '/home' },
    { titulo: 'Mi carrito', icono: 'cart', ruta: '/carrito' },
    { titulo: 'Mis pedidos', icono: 'receipt', ruta: '/pedidos', soloAuth: true },
    { titulo: 'Mi perfil', icono: 'person', ruta: '/perfil', soloAuth: true },
    { titulo: 'Administración', icono: 'settings', ruta: '/admin', soloAdmin: true },
  ];

  constructor(
    public auth: AuthService,
    public carrito: CarritoService,
    public tema: TemaService,
    private router: Router
  ) {}

  opcionesVisibles(): MenuOpcion[] {
    return this.opciones.filter(o => {
      if (o.soloAdmin) return this.auth.esAdmin;
      if (o.soloAuth) return this.auth.isAuth;
      return true;
    });
  }

  cambiarTema(modo: ModoTema) {
    this.tema.setModo(modo);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
