import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private loading: LoadingController,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  async ingresar() {
    if (!this.email || !this.password) {
      this.mostrarToast('Completa todos los campos', 'warning');
      return;
    }
    const load = await this.loading.create({ message: 'Iniciando sesión...' });
    await load.present();
    this.auth.login(this.email, this.password).subscribe({
      next: async () => {
        await load.dismiss();
        this.mostrarToast('¡Bienvenido!', 'success');
        this.router.navigate(['/home']);
      },
      error: async (e) => {
        await load.dismiss();
        const msg = e?.error?.message || 'Credenciales inválidas o backend no disponible.';
        const a = await this.alert.create({ header: 'Error', message: msg, buttons: ['OK'] });
        await a.present();
      }
    });
  }

  async mostrarToast(message: string, color: 'success'|'warning'|'danger' = 'success') {
    const t = await this.toast.create({ message, duration: 1800, color });
    await t.present();
  }
}
