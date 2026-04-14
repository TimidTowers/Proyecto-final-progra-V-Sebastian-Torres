import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false
})
export class RegistroPage {
  nombre = '';
  email = '';
  password = '';
  telefono = '';
  direccion = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private loading: LoadingController,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  async registrarse() {
    if (!this.nombre || !this.email || this.password.length < 6) {
      this.mostrarToast('Completa todos los campos (contraseña mínimo 6)', 'warning');
      return;
    }
    const load = await this.loading.create({ message: 'Creando cuenta...' });
    await load.present();
    this.auth.register({
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      telefono: this.telefono,
      direccion: this.direccion
    }).subscribe({
      next: async () => {
        await load.dismiss();
        this.mostrarToast('Cuenta creada', 'success');
        this.router.navigate(['/home']);
      },
      error: async (e) => {
        await load.dismiss();
        const a = await this.alert.create({
          header: 'Error al registrar',
          message: e?.error?.message || 'No se pudo crear la cuenta.',
          buttons: ['OK']
        });
        await a.present();
      }
    });
  }

  async mostrarToast(message: string, color: 'success'|'warning'|'danger' = 'success') {
    const t = await this.toast.create({ message, duration: 1800, color });
    await t.present();
  }
}
