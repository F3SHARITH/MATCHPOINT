import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconoComponent } from '../../../../shared/icono/icono.component';
import { etiquetaDia, fechaCorta, fechaLarga, horaTexto } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { ReservasService } from '../../services/reservas.service';
import {
  RESERVAS_PARA_CONFIANZA, Reserva, TEXTO_ESTADO_RESERVA, deudaReto, saldoDe, totalPagado,
} from '../../models/reserva.model';
import { linkWhatsApp, mensajeParaElGrupo } from '../../utils/mensaje-whatsapp.util';
import { VacaComponent } from '../vaca/vaca.component';
import { ComunidadService } from '../../../comunidad/services/comunidad.service';
import { InvitacionesComponent } from '../../../comunidad/components/invitaciones/invitaciones.component';
import { MisPartidosComponent } from '../../../comunidad/components/mis-partidos/mis-partidos.component';

/** "Mis reservas" del jugador: nivel de confianza, lo que viene (con la vaca), partidos de otros a los que va e historial. */
@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, IconoComponent, VacaComponent, InvitacionesComponent, MisPartidosComponent],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.scss',
})
export class MisReservasComponent {
  readonly reservasService = inject(ReservasService);
  readonly comunidad = inject(ComunidadService);
  private readonly canchasService = inject(CanchasService);

  /** Reserva a la que se le tocó "Cancelar" y espera la segunda confirmación. */
  readonly porCancelar = signal<string | null>(null);

  readonly confianza = this.reservasService.miConfianza;
  readonly pasosConfianza = Array.from({ length: RESERVAS_PARA_CONFIANZA }, (_, i) => i);
  readonly reservasParaConfianza = RESERVAS_PARA_CONFIANZA;

  readonly textoEstado = TEXTO_ESTADO_RESERVA;
  readonly etiquetaDia = etiquetaDia;
  readonly fechaLarga = fechaLarga;
  readonly fechaCorta = fechaCorta;
  readonly horaTexto = horaTexto;
  readonly saldoDe = saldoDe;
  readonly totalPagado = totalPagado;
  readonly deudaReto = deudaReto;

  cancha(reserva: Reserva) {
    return this.canchasService.cancha(reserva.canchaId);
  }

  colorDeporte(reserva: Reserva): string {
    const cancha = this.cancha(reserva);
    return cancha ? this.canchasService.deporte(cancha.deporteId).hex : 'var(--brand)';
  }

  nombreEmpresa(reserva: Reserva): string {
    const cancha = this.cancha(reserva);
    return cancha ? this.canchasService.empresaNombre(cancha.empresaId) : '';
  }

  linkGrupo(reserva: Reserva): string {
    const cancha = this.cancha(reserva);
    if (!cancha) return '';
    const deporte = this.canchasService.deporte(cancha.deporteId).nombre;
    return linkWhatsApp(mensajeParaElGrupo(reserva, cancha, deporte, this.nombreEmpresa(reserva)));
  }

  resultadoReto(reserva: Reserva): string {
    const reto = reserva.reto;
    if (!reto?.ganador) return '';
    if (reto.ganador === 'empate') return 'Empate';
    return `Ganó ${reto.ganador === 'A' ? reto.equipoA : reto.equipoB}`;
  }

  cancelar(id: string): void {
    this.reservasService.cancelar(id);
    this.porCancelar.set(null);
  }
}
