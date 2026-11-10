import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SesionService } from '../../../../core/sesion/sesion.service';
import { etiquetaDia, horaTexto } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { DeporteId } from '../../../canchas/models/deporte.model';
import { ReservasService } from '../../../reservas/services/reservas.service';
import { JUGADORES_POR_DEPORTE, Reserva, cuotaVaca } from '../../../reservas/models/reserva.model';
import { ComunidadService } from '../../services/comunidad.service';
import { Nivel, TEXTO_NIVEL, TipoPublicacion } from '../../models/publicacion.model';

interface OpcionTipo {
  id: TipoPublicacion;
  titulo: string;
  detalle: string;
}

const TIPOS_POR_ROL: Record<string, OpcionTipo[]> = {
  usuario: [
    { id: 'faltan', titulo: 'Me faltan jugadores', detalle: 'Completa tu partido' },
    { id: 'busco-equipo', titulo: 'Busco equipo', detalle: 'Únete a otros' },
    { id: 'general', titulo: 'Pregunta u otro', detalle: 'Lo que quieras' },
  ],
  empresa: [
    { id: 'evento', titulo: 'Evento o torneo', detalle: 'Promociona tu cancha' },
    { id: 'general', titulo: 'Publicación', detalle: 'Avisos y novedades' },
  ],
  admin: [{ id: 'general', titulo: 'Aviso', detalle: 'Para toda la comunidad' }],
};

/**
 * Formulario para publicar. Lo más común ("me faltan jugadores") se arma en pocos toques:
 * se elige la reserva, cuántos faltan y el nivel. El texto es opcional.
 */
@Component({
  selector: 'app-nueva-publicacion',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './nueva-publicacion.component.html',
  styleUrl: './nueva-publicacion.component.scss',
})
export class NuevaPublicacionComponent implements OnInit {
  /** Id de una reserva para dejar el formulario listo ("Buscar jugadores" desde Mis reservas). */
  @Input() reservaInicial: string | null = null;
  @Output() publicada = new EventEmitter<void>();

  readonly sesion = inject(SesionService);
  readonly canchasService = inject(CanchasService);
  private readonly reservasService = inject(ReservasService);
  private readonly comunidad = inject(ComunidadService);

  readonly tipos = computed(() => TIPOS_POR_ROL[this.sesion.rol() ?? 'usuario']);
  readonly tipo = signal<TipoPublicacion>(TIPOS_POR_ROL[this.sesion.rol() ?? 'usuario'][0].id);
  readonly deporteElegido = signal<DeporteId | null>(null);
  readonly reservaId = signal('');
  readonly faltan = signal(2);
  readonly nivel = signal<Nivel>('intermedio');
  readonly texto = signal('');

  readonly niveles = Object.entries(TEXTO_NIVEL) as [Nivel, string][];
  readonly etiquetaDia = etiquetaDia;
  readonly horaTexto = horaTexto;

  readonly misReservas = computed(() => (this.sesion.rol() === 'usuario' ? this.reservasService.misProximas() : []));
  readonly reserva = computed(() =>
    this.tipo() === 'faltan' ? this.misReservas().find(r => r.id === this.reservaId()) ?? null : null,
  );

  /** Si eligió una reserva, el deporte sale de esa cancha. */
  readonly deporte = computed(() => {
    const reserva = this.reserva();
    const cancha = reserva ? this.canchasService.cancha(reserva.canchaId) : null;
    return cancha?.deporteId ?? this.deporteElegido();
  });

  readonly cuota = computed(() => {
    const reserva = this.reserva();
    const deporte = this.deporte();
    if (!reserva || !deporte) return 0;
    return reserva.vaca ? cuotaVaca(reserva) : Math.ceil(reserva.precio / JUGADORES_POR_DEPORTE[deporte] / 100) * 100;
  });

  readonly puedePublicar = computed(() => {
    if (this.tipo() === 'faltan' || this.tipo() === 'busco-equipo') return !!this.deporte();
    return this.texto().trim().length > 0;
  });

  readonly placeholder = computed(() => {
    switch (this.tipo()) {
      case 'faltan': return 'Cuéntales más (opcional): "Buen ambiente, llegar 10 min antes"';
      case 'busco-equipo': return 'Ej: Juego de lateral, nivel intermedio, puedo los martes y jueves';
      case 'evento': return 'Ej: Torneo de fútbol 5 el sábado, inscripción $120.000 por equipo';
      default: return 'Escribe tu publicación';
    }
  });

  ngOnInit(): void {
    const reserva = this.misReservas().find(r => r.id === this.reservaInicial);
    if (!reserva) return;
    this.tipo.set('faltan');
    this.reservaId.set(reserva.id);
    this.faltan.set(this.cuposSinNombre(reserva) || 2);
  }

  nombreReserva(reserva: Reserva): string {
    const cancha = this.canchasService.cancha(reserva.canchaId);
    return `${cancha?.nombre ?? ''} · ${etiquetaDia(reserva.fecha)} ${horaTexto(reserva.hora)}`;
  }

  cambiarFaltan(cambio: number): void {
    this.faltan.set(Math.min(10, Math.max(1, this.faltan() + cambio)));
  }

  publicar(): void {
    if (!this.puedePublicar()) return;
    const deporteId = this.deporte() ?? undefined;
    const reserva = this.reserva();
    const nombreDeporte = deporteId ? this.canchasService.deporte(deporteId).nombre.toLowerCase() : '';
    const faltan = this.faltan();

    let texto = this.texto().trim();
    if (!texto && this.tipo() === 'faltan') {
      texto = `${faltan === 1 ? 'Nos falta 1' : `Nos faltan ${faltan}`} para jugar ${nombreDeporte}. ¿Quién se anima?`;
    } else if (!texto && this.tipo() === 'busco-equipo') {
      texto = `Busco equipo para jugar ${nombreDeporte}.`;
    }

    this.comunidad.publicar({
      tipo: this.tipo(),
      texto,
      deporteId,
      busqueda: this.tipo() === 'faltan'
        ? {
            faltan,
            nivel: this.nivel(),
            cuota: this.cuota(),
            partido: reserva ? { canchaId: reserva.canchaId, fecha: reserva.fecha, hora: reserva.hora, reservaId: reserva.id } : undefined,
          }
        : undefined,
    });

    this.texto.set('');
    this.reservaId.set('');
    this.publicada.emit();
  }

  /** En una vaca, los cupos que siguen como "Jugador 3", "Jugador 4"... son los que faltan. */
  private cuposSinNombre(reserva: Reserva): number {
    return reserva.vaca?.filter(j => /^Jugador \d+$/.test(j.nombre)).length ?? 0;
  }
}
