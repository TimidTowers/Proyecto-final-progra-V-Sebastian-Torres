import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/models';

const STORAGE_KEY = 'tienda_virtual_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.leerUsuarioGuardado());
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  get usuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  get isAuth(): boolean {
    return !!this.usuario?.token;
  }

  get esAdmin(): boolean {
    return this.usuario?.rol === 'Administrador';
  }

  login(email: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(u => this.guardarSesion(u)));
  }

  register(data: { nombre: string; email: string; password: string; telefono?: string; direccion?: string; }): Observable<Usuario> {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(u => this.guardarSesion(u)));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this.usuarioSubject.next(null);
  }

  private guardarSesion(u: Usuario) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    this.usuarioSubject.next(u);
  }

  private leerUsuarioGuardado(): Usuario | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const u: Usuario = JSON.parse(raw);
      if (new Date(u.expiracion) < new Date()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return u;
    } catch {
      return null;
    }
  }
}
