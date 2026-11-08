import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SesionService, INICIO_POR_ROL } from '../../core/sesion/sesion.service';
import { NOMBRE_ROL, Rol } from '../../core/sesion/sesion.model';
import { IconoComponent } from '../../shared/icono/icono.component';
import { MENU_POR_ROL } from '../menu';

/**
 * Marco de la app con sesión iniciada: menú lateral en computador, barra inferior en celular.
 * El menú cambia según el rol.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet, IconoComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  readonly roles: Rol[] = ['usuario', 'empresa', 'admin'];
  readonly nombreRol = NOMBRE_ROL;
  readonly menu = computed(() => {
    const rol = this.sesion.rol();
    return rol ? MENU_POR_ROL[rol] : [];
  });
  readonly cuentaAbierta = signal(false);

  /** Solo para la demo: cambiar de rol sin cerrar sesión. */
  verComo(rol: Rol): void {
    this.sesion.entrarComo(rol);
    this.cuentaAbierta.set(false);
    this.router.navigateByUrl(INICIO_POR_ROL[rol]);
  }

  salir(): void {
    this.sesion.salir();
    this.router.navigateByUrl('/entrar');
  }
}
