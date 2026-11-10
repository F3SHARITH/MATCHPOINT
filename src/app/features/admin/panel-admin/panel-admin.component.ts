import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PlataformaService } from '../../../core/plataforma/plataforma.service';
import { TEXTO_ESTADO_SUSCRIPCION } from '../../../core/plataforma/plataforma.model';
import { IconoComponent } from '../../../shared/icono/icono.component';
import { fechaCorta, fechaLarga, hoyISO } from '../../../shared/utils/fechas.util';
import { CanchasService } from '../../canchas/services/canchas.service';
import { ReservasService } from '../../reservas/services/reservas.service';

/**
 * Panel del administrador: controla la plataforma completa. Mensualidades de las empresas
 * (registrar pago, suspender, reactivar), valor del plan y métodos de pago habilitados.
 */
@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CurrencyPipe, IconoComponent],
  templateUrl: './panel-admin.component.html',
  styleUrl: './panel-admin.component.scss',
})
export class PanelAdminComponent {
  readonly plataforma = inject(PlataformaService);
  private readonly canchasService = inject(CanchasService);
  private readonly reservasService = inject(ReservasService);

  readonly textoEstado = TEXTO_ESTADO_SUSCRIPCION;
  readonly fechaCorta = fechaCorta;
  readonly hoy = fechaLarga(hoyISO());

  readonly empresas = computed(() =>
    Object.values(this.canchasService.empresas()).map(empresa => {
      const suscripcion = this.plataforma.suscripcionDe(empresa.id);
      return {
        empresa,
        canchas: this.canchasService.canchasDeEmpresa(empresa.id).length,
        suscripcion,
        estado: this.plataforma.estadoDe(suscripcion),
      };
    }),
  );

  readonly empresasConDeuda = computed(() => this.empresas().filter(e => e.estado === 'vencida').length);

  private readonly reservasDelMes = computed(() => {
    const mes = hoyISO().slice(0, 7);
    return this.reservasService.reservas().filter(r => r.fecha.startsWith(mes) && r.estado !== 'cancelada');
  });

  readonly totalReservasMes = computed(() => this.reservasDelMes().length);
  readonly jugadores = computed(() => new Set(this.reservasService.reservas().map(r => r.usuarioId)).size);

  /** Barras de "reservas por deporte" con el color de cada deporte. */
  readonly porDeporte = computed(() => {
    const conteo = new Map<string, number>();
    for (const reserva of this.reservasDelMes()) {
      const deporteId = this.canchasService.cancha(reserva.canchaId)?.deporteId;
      if (deporteId) conteo.set(deporteId, (conteo.get(deporteId) ?? 0) + 1);
    }
    const maximo = Math.max(1, ...conteo.values());
    return this.canchasService
      .deportes()
      .map(deporte => ({ deporte, total: conteo.get(deporte.id) ?? 0 }))
      .map(fila => ({ ...fila, porcentaje: Math.round((fila.total / maximo) * 100) }))
      .sort((a, b) => b.total - a.total);
  });

  cambiarValor(valor: string): void {
    this.plataforma.setValorMensualidad(Number(valor));
  }
}
