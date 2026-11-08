import { Component, Input, inject } from '@angular/core';
import { PlataformaService } from '../../../core/plataforma/plataforma.service';
import { CuandoAnticipo, ReglasPago } from '../../../core/plataforma/plataforma.model';
import { RESERVAS_PARA_CONFIANZA } from '../../reservas/models/reserva.model';

/** La empresa decide cuándo y cuánto anticipo pedir. Los jugadores de confianza nunca pagan anticipo. */
@Component({
  selector: 'app-reglas-pago',
  standalone: true,
  templateUrl: './reglas-pago.component.html',
  styleUrl: './reglas-pago.component.scss',
})
export class ReglasPagoComponent {
  @Input({ required: true }) empresaId!: string;

  private readonly plataforma = inject(PlataformaService);

  readonly reservasParaConfianza = RESERVAS_PARA_CONFIANZA;
  readonly porcentajes = [20, 30, 50];
  readonly opciones: { id: CuandoAnticipo; titulo: string; detalle: string }[] = [
    { id: 'nunca', titulo: 'Nunca', detalle: 'Todo en la cancha' },
    { id: 'pico', titulo: 'Horas pico', detalle: 'De 6 a 10 p. m.' },
    { id: 'siempre', titulo: 'Siempre', detalle: 'A cualquier hora' },
  ];

  get reglas(): ReglasPago {
    return this.plataforma.reglasDe(this.empresaId);
  }

  cambiar(cambios: Partial<ReglasPago>): void {
    this.plataforma.setReglas(this.empresaId, cambios);
  }
}
