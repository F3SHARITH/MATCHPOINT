import { Component, Input, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReservasService } from '../../services/reservas.service';
import { EstadoJugadorVaca, Reserva, cuotaVaca } from '../../models/reserva.model';

/**
 * La cuenta de la vaca para el organizador: cuánto pone cada uno y quién ya pagó.
 * Es solo para ellos; a la cancha le llega el total igual.
 */
@Component({
  selector: 'app-vaca',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './vaca.component.html',
  styleUrl: './vaca.component.scss',
})
export class VacaComponent {
  private readonly reservasService = inject(ReservasService);

  private readonly reservaActual = signal<Reserva | null>(null);
  @Input({ required: true }) set reserva(valor: Reserva) {
    this.reservaActual.set(valor);
  }

  readonly opciones: { estado: EstadoJugadorVaca; texto: string }[] = [
    { estado: 'debe', texto: 'Debe' },
    { estado: 'pago', texto: 'Pagó' },
    { estado: 'al-llegar', texto: 'Al llegar' },
  ];

  readonly jugadores = computed(() => this.reservaActual()?.vaca ?? []);
  readonly cuota = computed(() => {
    const reserva = this.reservaActual();
    return reserva ? cuotaVaca(reserva) : 0;
  });
  readonly listos = computed(() => this.jugadores().filter(j => j.estado !== 'debe').length);
  readonly deben = computed(() => this.jugadores().filter(j => j.estado === 'debe').map(j => j.nombre));

  marcar(indice: number, estado: EstadoJugadorVaca): void {
    const reserva = this.reservaActual();
    if (reserva) this.reservasService.marcarJugadorVaca(reserva.id, indice, estado);
  }

  renombrar(indice: number, nombre: string): void {
    const reserva = this.reservaActual();
    if (reserva) this.reservasService.renombrarJugadorVaca(reserva.id, indice, nombre);
  }
}
