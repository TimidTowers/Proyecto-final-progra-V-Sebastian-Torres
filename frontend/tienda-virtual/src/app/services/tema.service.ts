import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModoTema = 'claro' | 'oscuro' | 'contraste';

const KEY = 'tienda_tema';

@Injectable({ providedIn: 'root' })
export class TemaService {
  private modoSubject = new BehaviorSubject<ModoTema>(this.leerModo());
  modo$ = this.modoSubject.asObservable();

  get modo(): ModoTema {
    return this.modoSubject.value;
  }

  constructor() {
    this.aplicar(this.modo);
  }

  setModo(modo: ModoTema) {
    localStorage.setItem(KEY, modo);
    this.modoSubject.next(modo);
    this.aplicar(modo);
  }

  alternar() {
    const orden: ModoTema[] = ['claro', 'oscuro', 'contraste'];
    const idx = orden.indexOf(this.modo);
    this.setModo(orden[(idx + 1) % orden.length]);
  }

  private aplicar(modo: ModoTema) {
    const body = document.body;
    body.classList.remove('tema-claro', 'tema-oscuro', 'tema-contraste');
    body.classList.add(`tema-${modo}`);
    if (modo === 'oscuro' || modo === 'contraste') {
      document.documentElement.classList.add('ion-palette-dark');
    } else {
      document.documentElement.classList.remove('ion-palette-dark');
    }
  }

  private leerModo(): ModoTema {
    return (localStorage.getItem(KEY) as ModoTema) || 'claro';
  }
}
