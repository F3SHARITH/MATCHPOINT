import { Injectable, computed, signal } from '@angular/core';
import { Rol, UsuarioSesion } from './sesion.model';
import { USUARIOS_DEMO } from './usuarios.mock';

const CLAVE_STORAGE = 'matchpoint.sesion';

/** Pantalla a la que llega cada rol después de entrar. */
export const INICIO_POR_ROL: Record<Rol, string> = {
  usuario: '/canchas',
  empresa: '/empresa',
  admin: '/admin',
};

/**
 * Quién está usando la app y con qué rol. Hoy es una sesión de demo guardada en el navegador;
 * con backend, aquí se guardaría el token que devuelve el login.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  readonly usuario = signal<UsuarioSesion | null>(this.leerGuardada());

  readonly rol = computed(() => this.usuario()?.rol ?? null);
  readonly empresaId = computed(() => this.usuario()?.empresaId ?? null);
  readonly iniciales = computed(() =>
    (this.usuario()?.nombre ?? '')
      .split(' ')
      .slice(0, 2)
      .map(palabra => palabra[0])
      .join('')
      .toUpperCase(),
  );

  entrarComo(rol: Rol): void {
    const usuario = USUARIOS_DEMO[rol];
    this.usuario.set(usuario);
    this.guardar(usuario);
  }

  salir(): void {
    this.usuario.set(null);
    this.guardar(null);
  }

  private leerGuardada(): UsuarioSesion | null {
    try {
      const guardada = localStorage.getItem(CLAVE_STORAGE);
      return guardada ? (JSON.parse(guardada) as UsuarioSesion) : null;
    } catch {
      return null;
    }
  }

  private guardar(usuario: UsuarioSesion | null): void {
    try {
      if (usuario) localStorage.setItem(CLAVE_STORAGE, JSON.stringify(usuario));
      else localStorage.removeItem(CLAVE_STORAGE);
    } catch {
      // Sin acceso a localStorage (modo privado): la sesión dura hasta recargar.
    }
  }
}
