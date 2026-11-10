import { inject } from '@angular/core';
import { CanActivateFn, RedirectFunction, Router } from '@angular/router';
import { Rol } from './sesion.model';
import { INICIO_POR_ROL, SesionService } from './sesion.service';

/** Sin sesión, manda a la pantalla de entrada. */
export const conSesion: CanActivateFn = () => {
  const sesion = inject(SesionService);
  return sesion.usuario() ? true : inject(Router).parseUrl('/entrar');
};

/** Deja pasar solo a los roles indicados; a los demás los manda a su propio inicio. */
export function soloRol(...roles: Rol[]): CanActivateFn {
  return () => {
    const rol = inject(SesionService).rol();
    if (rol && roles.includes(rol)) return true;
    return inject(Router).parseUrl(rol ? INICIO_POR_ROL[rol] : '/entrar');
  };
}

/** La ruta vacía ('/') lleva a la pantalla principal de cada rol. */
export const inicioSegunRol: RedirectFunction = () => {
  const rol = inject(SesionService).rol();
  return rol ? INICIO_POR_ROL[rol] : '/entrar';
};
