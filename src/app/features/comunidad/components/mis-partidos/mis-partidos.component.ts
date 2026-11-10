import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { etiquetaDia, horaTexto } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { ComunidadService } from '../../services/comunidad.service';
import { MiPartido } from '../../models/publicacion.model';

/** Partidos de otros a los que voy: cuándo, dónde, cuánto llevo y cómo hablar con el organizador. */
@Component({
  selector: 'app-mis-partidos',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './mis-partidos.component.html',
  styleUrl: './mis-partidos.component.scss',
})
export class MisPartidosComponent {
  readonly comunidad = inject(ComunidadService);
  private readonly canchasService = inject(CanchasService);

  readonly etiquetaDia = etiquetaDia;
  readonly horaTexto = horaTexto;

  deporte(partido: MiPartido) {
    return partido.deporteId ? this.canchasService.deporte(partido.deporteId) : null;
  }

  nombreCancha(partido: MiPartido): string {
    const canchaId = partido.partido.canchaId;
    return canchaId ? this.canchasService.cancha(canchaId)?.nombre ?? '' : 'Cancha por definir';
  }
}
