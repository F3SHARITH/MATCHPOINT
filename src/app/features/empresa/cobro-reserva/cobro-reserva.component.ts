import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PlataformaService } from '../../../core/plataforma/plataforma.service';
import { MetodoPagoId } from '../../../core/plataforma/plataforma.model';
import { horaTexto } from '../../../shared/utils/fechas.util';
import { CanchasService } from '../../canchas/services/canchas.service';
import { ReservasService } from '../../reservas/services/reservas.service';
import { LadoReto, Reserva, deudaReto, saldoDe, totalPagado } from '../../reservas/models/reserva.model';

/**
 * Recepción cobra en la cancha: cuánto recibe y cómo. En un reto, además anota
 * quién ganó y qué equipo pagó, y avisa si un equipo le quedó debiendo al otro.
 */
@Component({
  selector: 'app-cobro-reserva',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './cobro-reserva.component.html',
  styleUrl: './cobro-reserva.component.scss',
})
export class CobroReservaComponent implements OnInit {
  @Input({ required: true }) reserva!: Reserva;
  @Output() cerrar = new EventEmitter<void>();

  private readonly reservasService = inject(ReservasService);
  private readonly canchasService = inject(CanchasService);
  readonly plataforma = inject(PlataformaService);

  readonly monto = signal(0);
  readonly metodo = signal<MetodoPagoId>('en-cancha');
  readonly ganador = signal<LadoReto | 'empate' | null>(null);
  readonly pagadoPor = signal<LadoReto | 'mitad' | null>(null);
  readonly cobrado = signal(false);
  readonly deuda = signal<ReturnType<typeof deudaReto>>(null);

  readonly horaTexto = horaTexto;
  readonly saldoDe = saldoDe;
  readonly totalPagado = totalPagado;

  ngOnInit(): void {
    this.monto.set(saldoDe(this.reserva));
  }

  get nombreCancha(): string {
    return this.canchasService.cancha(this.reserva.canchaId)?.nombre ?? '';
  }

  get listosVaca(): number {
    return this.reserva.vaca?.filter(j => j.estado === 'pago').length ?? 0;
  }

  get puedeCobrar(): boolean {
    return this.monto() > 0 && (!this.reserva.reto || this.pagadoPor() !== null);
  }

  /** Por defecto paga el que perdió; si empatan, mitad y mitad. Recepción lo puede cambiar. */
  elegirGanador(ganador: LadoReto | 'empate'): void {
    this.ganador.set(ganador);
    this.pagadoPor.set(ganador === 'A' ? 'B' : ganador === 'B' ? 'A' : 'mitad');
  }

  cobrar(): void {
    if (!this.puedeCobrar) return;
    this.reservasService.cobrar(this.reserva.id, {
      monto: this.monto(),
      metodo: this.metodo(),
      ganador: this.ganador() ?? undefined,
      pagadoPor: this.pagadoPor() ?? undefined,
    });
    const actualizada = this.reservasService.reservas().find(r => r.id === this.reserva.id);
    this.deuda.set(actualizada ? deudaReto(actualizada) : null);
    this.cobrado.set(true);
  }
}
