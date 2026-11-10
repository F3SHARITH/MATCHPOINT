import { Component, Input, inject, signal } from '@angular/core';
import { ReservasService } from '../../../reservas/services/reservas.service';
import { ComunidadService } from '../../services/comunidad.service';
import { Publicacion } from '../../models/publicacion.model';

/** Lo que ve el organizador: quién se apuntó, si suele cumplir, y la opción de quitarlo. */
@Component({
  selector: 'app-lista-apuntados',
  standalone: true,
  templateUrl: './lista-apuntados.component.html',
  styleUrl: './lista-apuntados.component.scss',
})
export class ListaApuntadosComponent {
  @Input({ required: true }) publicacion!: Publicacion;

  private readonly comunidad = inject(ComunidadService);
  private readonly reservasService = inject(ReservasService);

  /** Jugador al que se le tocó "Quitar" y espera la segunda confirmación. */
  readonly porQuitar = signal<string | null>(null);

  iniciales(nombre: string): string {
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  esDeConfianza(usuarioId: string): boolean {
    return this.reservasService.confianzaDe(usuarioId).esDeConfianza;
  }

  historial(usuarioId: string): string {
    const { cumplidas, fallas, esDeConfianza } = this.reservasService.confianzaDe(usuarioId);
    if (esDeConfianza) return `De confianza · ${cumplidas} partidos cumplidos`;
    if (fallas) return `No llegó a ${fallas} ${fallas === 1 ? 'partido' : 'partidos'}`;
    if (cumplidas) return `${cumplidas} ${cumplidas === 1 ? 'partido cumplido' : 'partidos cumplidos'}`;
    return 'Nuevo en MatchPoint';
  }

  quitar(usuarioId: string): void {
    this.comunidad.quitarApuntado(this.publicacion.id, usuarioId);
    this.porQuitar.set(null);
  }
}
