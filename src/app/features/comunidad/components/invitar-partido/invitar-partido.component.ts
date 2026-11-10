import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconoComponent } from '../../../../shared/icono/icono.component';
import { etiquetaDia, horaTexto } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { ReservasService } from '../../../reservas/services/reservas.service';
import { Reserva } from '../../../reservas/models/reserva.model';
import { ComunidadService } from '../../services/comunidad.service';
import { Publicacion } from '../../models/publicacion.model';

/** Muestra mis próximas reservas de ese deporte para invitar a quien publicó que quiere jugar. */
@Component({
  selector: 'app-invitar-partido',
  standalone: true,
  imports: [RouterLink, IconoComponent],
  templateUrl: './invitar-partido.component.html',
  styleUrl: './invitar-partido.component.scss',
})
export class InvitarPartidoComponent {
  @Input({ required: true }) publicacion!: Publicacion;
  @Output() listo = new EventEmitter<void>();

  private readonly comunidad = inject(ComunidadService);
  private readonly canchasService = inject(CanchasService);
  private readonly reservasService = inject(ReservasService);

  readonly etiquetaDia = etiquetaDia;
  readonly horaTexto = horaTexto;

  get reservas(): Reserva[] {
    return this.reservasService.misProximas().filter(r => this.cancha(r)?.deporteId === this.publicacion.deporteId);
  }

  get nombreDeporte(): string {
    const id = this.publicacion.deporteId;
    return id ? this.canchasService.deporte(id).nombre.toLowerCase() : '';
  }

  cancha(reserva: Reserva) {
    return this.canchasService.cancha(reserva.canchaId);
  }

  invitar(reserva: Reserva): void {
    this.comunidad.invitar(this.publicacion, reserva);
    this.listo.emit();
  }
}
