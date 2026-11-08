import { Routes } from '@angular/router';
import { ExploracionCanchasComponent } from './features/canchas/components/exploracion-canchas/exploracion-canchas.component';
import { EntrarComponent } from './features/entrar/entrar.component';
import { ShellComponent } from './layout/shell/shell.component';
import { conSesion, inicioSegunRol, soloRol } from './core/sesion/sesion.guards';

/**
 * Mapa de pantallas por rol:
 *  - Jugador (usuario): /canchas, /reservas y /comunidad
 *  - Empresa:           /empresa (y /canchas para ver cómo la ven los jugadores, /comunidad para sus eventos)
 *  - Administrador:     /admin   (y /canchas, /comunidad para moderar)
 * Los paneles se cargan solo cuando alguien entra a ellos (loadComponent).
 */
export const routes: Routes = [
  { path: 'entrar', component: EntrarComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [conSesion],
    children: [
      { path: '', pathMatch: 'full', redirectTo: inicioSegunRol },
      { path: 'canchas', component: ExploracionCanchasComponent },
      {
        path: 'reservas',
        canActivate: [soloRol('usuario')],
        loadComponent: () =>
          import('./features/reservas/components/mis-reservas/mis-reservas.component').then(m => m.MisReservasComponent),
      },
      {
        path: 'comunidad',
        loadComponent: () =>
          import('./features/comunidad/components/comunidad/comunidad.component').then(m => m.ComunidadComponent),
      },
      {
        path: 'empresa',
        canActivate: [soloRol('empresa')],
        loadComponent: () =>
          import('./features/empresa/panel-empresa/panel-empresa.component').then(m => m.PanelEmpresaComponent),
      },
      {
        path: 'admin',
        canActivate: [soloRol('admin')],
        loadComponent: () =>
          import('./features/admin/panel-admin/panel-admin.component').then(m => m.PanelAdminComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
