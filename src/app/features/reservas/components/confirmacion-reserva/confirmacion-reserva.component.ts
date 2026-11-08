import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconoComponent } from '../../../../shared/icono/icono.component';
import { etiquetaDia, fechaLarga, horaTexto } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { Cancha } from '../../../canchas/models/cancha.model';
import { Reserva, saldoDe, totalPagado } from '../../models/reserva.model';
import { linkWhatsApp, mensajeParaElGrupo } from '../../utils/mensaje-whatsapp.util';

/** "¡Listo, reservaste!": código, qué falta pagar y el mensaje para el grupo del equipo. */
@Component({
  selector: 'app-confirmacion-reserva',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, IconoComponent],
  templateUrl: './confirmacion-reserva.component.html',
  styleUrl: './confirmacion-reserva.component.scss',
})
export class ConfirmacionReservaComponent {
  @Input({ required: true }) reserva!: Reserva;
  @Input({ required: true }) cancha!: Cancha;
  @Output() cerrar = new EventEmitter<void>();

  private readonly canchasService = inject(CanchasService);
  readonly copiado = signal(false);

  readonly etiquetaDia = etiquetaDia;
  readonly fechaLarga = fechaLarga;
  readonly horaTexto = horaTexto;
  readonly saldoDe = saldoDe;
  readonly totalPagado = totalPagado;

  get mensaje(): string {
    const deporte = this.canchasService.deporte(this.cancha.deporteId).nombre;
    return mensajeParaElGrupo(this.reserva, this.cancha, deporte, this.canchasService.empresaNombre(this.cancha.empresaId));
  }

  get linkGrupo(): string {
    return linkWhatsApp(this.mensaje);
  }

  async copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.mensaje);
      this.copiado.set(true);
    } catch {
      this.copiado.set(false);
    }
  }
}
