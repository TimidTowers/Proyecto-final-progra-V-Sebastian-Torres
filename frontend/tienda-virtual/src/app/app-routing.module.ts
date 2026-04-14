import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'registro', loadChildren: () => import('./pages/registro/registro.module').then(m => m.RegistroPageModule) },
  { path: 'producto/:id', loadChildren: () => import('./pages/producto-detalle/producto-detalle.module').then(m => m.ProductoDetallePageModule) },
  { path: 'carrito', loadChildren: () => import('./pages/carrito/carrito.module').then(m => m.CarritoPageModule) },
  { path: 'checkout', canActivate: [authGuard], loadChildren: () => import('./pages/checkout/checkout.module').then(m => m.CheckoutPageModule) },
  { path: 'pedidos', canActivate: [authGuard], loadChildren: () => import('./pages/pedidos/pedidos.module').then(m => m.PedidosPageModule) },
  { path: 'perfil', canActivate: [authGuard], loadChildren: () => import('./pages/perfil/perfil.module').then(m => m.PerfilPageModule) },
  { path: 'admin', canActivate: [authGuard, adminGuard], loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminPageModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
