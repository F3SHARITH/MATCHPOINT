import { Component, Input, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PlataformaService } from '../../../core/plataforma/plataforma.service';
import { hoyISO } from '../../../shared/utils/fechas.util';
import { ReservasService } from '../../reservas/services/reservas.service';
import { Pago, saldoDe } from '../../reservas/models/reserva.model';

interface Linea {
  nombre: string;
  total: number;
  efectivo: number;
}

function agrupar(pagos: Pago[], clave: (pago: Pago) => string): Linea[] {
  const grupos = new Map<string, Linea>();
  for (const pago of pagos) {
    const nombre = clave(pago);
    const linea = grupos.get(nombre) ?? { nombre, total: 0, efectivo: 0 };
    linea.total += pago.monto;
    if (pago.metodo === 'en-cancha') linea.efectivo += pago.monto;
    grupos.set(nombre, linea);
  }
  return [...grupos.values()].sort((a, b) => b.total - a.total);
}

/**
 * Cuadre de caja del día: cuánto entró por cada medio, cuánto efectivo debería haber
 * en el cajón, qué falta por cobrar y quién cobró qué.
 */
@Component({
  selector: 'app-caja-dia',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './caja-dia.component.html',
  styleUrl: './caja-dia.component.scss',
})
export class CajaDiaComponent {
  private readonly reservasService = inject(ReservasService);
  private readonly plataforma = inject(PlataformaService);

  private readonly ids = signal<string[]>([]);
  private readonly dia = signal(hoyISO());

  @Input({ required: true }) set canchaIds(valor: string[]) {
    this.ids.set(valor);
  }
  @Input({ required: true }) set fecha(valor: string) {
    this.dia.set(valor);
  }

  private readonly reservasDeLaEmpresa = computed(() =>
    this.reservasService.reservas().filter(r => this.ids().includes(r.canchaId)),
  );

  /** Pagos recibidos ese día, aunque sean anticipos de reservas para otros días. */
  private readonly pagos = computed(() =>
    this.reservasDeLaEmpresa().flatMap(r => r.pagos.filter(p => p.fecha === this.dia())),
  );

  readonly porMetodo = computed(() => agrupar(this.pagos(), p => this.plataforma.nombreMetodo(p.metodo)));
  readonly porEmpleado = computed(() => agrupar(this.pagos(), p => p.registradoPor));
  readonly total = computed(() => this.pagos().reduce((suma, p) => suma + p.monto, 0));
  readonly efectivo = computed(() => this.pagos().filter(p => p.metodo === 'en-cancha').reduce((suma, p) => suma + p.monto, 0));
  readonly anticipos = computed(() => this.pagos().filter(p => p.esAnticipo).reduce((suma, p) => suma + p.monto, 0));

  private readonly reservasDelDia = computed(() => this.reservasDeLaEmpresa().filter(r => r.fecha === this.dia()));
  readonly porCobrar = computed(() =>
    this.reservasDelDia()
      .filter(r => r.estado === 'apartada' || r.estado === 'confirmada')
      .reduce((suma, r) => suma + saldoDe(r), 0),
  );
  readonly noLlegaron = computed(() => this.reservasDelDia().filter(r => r.estado === 'no-llego').length);
}
