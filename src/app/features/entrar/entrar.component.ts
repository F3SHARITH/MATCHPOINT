import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { SesionService, INICIO_POR_ROL } from '../../core/sesion/sesion.service';
import { Rol } from '../../core/sesion/sesion.model';
import { PlataformaService } from '../../core/plataforma/plataforma.service';
import { IconoComponent, NombreIcono } from '../../shared/icono/icono.component';

interface OpcionEntrada {
  rol: Rol;
  titulo: string;
  descripcion: string;
  icono: NombreIcono;
}

/**
 * Pantalla de entrada: una sola pregunta ("¿quién eres?") y tres botones grandes.
 * Con backend, cada botón llevará al formulario de inicio de sesión de ese rol.
 */
@Component({
  selector: 'app-entrar',
  standalone: true,
  imports: [CurrencyPipe, IconoComponent],
  templateUrl: './entrar.component.html',
  styleUrl: './entrar.component.scss',
})
export class EntrarComponent {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  readonly plataforma = inject(PlataformaService);

  readonly deportes = ['futbol', 'voley', 'baloncesto', 'tenis', 'padel'];

  readonly opciones: OpcionEntrada[] = [
    { rol: 'usuario', titulo: 'Quiero jugar', descripcion: 'Busco una cancha y la reservo en 3 clics.', icono: 'calendario' },
    { rol: 'empresa', titulo: 'Tengo canchas', descripcion: 'Recibo reservas y veo mi agenda del día.', icono: 'edificio' },
    { rol: 'admin', titulo: 'Soy administrador', descripcion: 'Controlo empresas, pagos y la plataforma.', icono: 'escudo' },
  ];

  entrar(rol: Rol): void {
    this.sesion.entrarComo(rol);
    this.router.navigateByUrl(INICIO_POR_ROL[rol]);
  }
}
