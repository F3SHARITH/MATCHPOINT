import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { IconoComponent } from '../../../../shared/icono/icono.component';
import { etiquetaDia, fechaCorta, horaTexto } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { ComunidadService } from '../../services/comunidad.service';
import { Invitacion } from '../../models/publicacion.model';

/** Invitaciones que esperan mi respuesta. Una sola decisión: voy o no puedo. */
@Component({
  selector: 'app-invitaciones',
  standalone: true,
  imports: [CurrencyPipe, IconoComponent],
  templateUrl: './invitaciones.component.html',
  styleUrl: './invitaciones.component.scss',
})
export class InvitacionesComponent {
  readonly comunidad = inject(ComunidadService);
  private readonly canchasService = inject(CanchasService);

  readonly etiquetaDia = etiquetaDia;
  readonly fechaCorta = fechaCorta;
  readonly horaTexto = horaTexto;

  deporte(invitacion: Invitacion) {
    return this.canchasService.deporte(invitacion.deporteId);
  }

  nombreCancha(invitacion: Invitacion): string {
    const canchaId = invitacion.partido.canchaId;
    return canchaId ? this.canchasService.cancha(canchaId)?.nombre ?? '' : 'Cancha por definir';
  }
}
