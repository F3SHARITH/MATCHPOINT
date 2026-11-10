import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SesionService } from '../../../../core/sesion/sesion.service';
import { diaDelMes, etiquetaDia, horaTexto, hoyISO, proximosDias, sumarDias } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { DeporteId } from '../../../canchas/models/deporte.model';
import { ReservasService } from '../../../reservas/services/reservas.service';
import { HORAS_DEL_DIA, Reserva, cuotaPorJugador } from '../../../reservas/models/reserva.model';
import { ComunidadService } from '../../services/comunidad.service';
import {
  DiasParaJugar, Franja, Nivel, POSICIONES, TEXTO_DIAS, TEXTO_FRANJA, TEXTO_NIVEL, TipoPublicacion,
} from '../../models/publicacion.model';

interface OpcionTipo {
  id: TipoPublicacion;
  titulo: string;
  detalle: string;
}

const TIPOS_POR_ROL: Record<string, OpcionTipo[]> = {
  usuario: [
    { id: 'faltan', titulo: 'Me faltan jugadores', detalle: 'Completa tu partido' },
    { id: 'busco-equipo', titulo: 'Quiero jugar', detalle: 'Que me inviten' },
    { id: 'general', titulo: 'Pregunta u otro', detalle: 'Lo que quieras' },
  ],
  empresa: [
    { id: 'evento', titulo: 'Evento o torneo', detalle: 'Promociona tu cancha' },
    { id: 'general', titulo: 'Publicación', detalle: 'Avisos y novedades' },
  ],
  admin: [{ id: 'general', titulo: 'Aviso', detalle: 'Para toda la comunidad' }],
};

/**
 * Formulario para publicar. Empieza cerrado para no tapar el muro: tocar un tipo lo abre.
 * Lo más común ("me faltan jugadores") se arma en pocos toques: la reserva, cuántos faltan
 * y el nivel. El texto es opcional.
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
  readonly abierto = signal(false);
  readonly deporteElegido = signal<DeporteId | null>(null);
  readonly reservaId = signal('');
  readonly faltan = signal(2);
  readonly nivel = signal<Nivel>('intermedio');
  readonly posicion = signal<string | null>(null);
  readonly texto = signal('');

  /** Solo se usan si el partido todavía no tiene reserva. */
  readonly fecha = signal(sumarDias(hoyISO(), 1));
  readonly hora = signal(19);
  readonly diasPartido = proximosDias(7).filter(fecha => this.horasDe(fecha).length > 0);
  readonly horas = computed(() => this.horasDe(this.fecha()));

  /** Solo se usan en "Quiero jugar". */
  readonly diasJuego = signal<DiasParaJugar>('cualquiera');
  readonly franja = signal<Franja>('noche');

  readonly niveles = Object.entries(TEXTO_NIVEL) as [Nivel, string][];
  readonly opcionesDias = Object.entries(TEXTO_DIAS) as [DiasParaJugar, string][];
  readonly opcionesFranja = Object.entries(TEXTO_FRANJA) as [Franja, string][];
  readonly etiquetaDia = etiquetaDia;
  readonly diaDelMes = diaDelMes;
  readonly horaTexto = horaTexto;

  readonly buscaGente = computed(() => this.tipo() === 'faltan' || this.tipo() === 'busco-equipo');

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

  readonly posiciones = computed(() => {
    const deporte = this.deporte();
    return deporte ? POSICIONES[deporte] : [];
  });

  /** La posición solo vale si existe en el deporte actual (pudo cambiar de deporte después de elegirla). */
  readonly posicionElegida = computed(() => {
    const posicion = this.posicion();
    return posicion && this.posiciones().includes(posicion) ? posicion : null;
  });

  readonly cuota = computed(() => {
    const reserva = this.reserva();
    const deporte = this.deporte();
    return reserva && deporte ? cuotaPorJugador(reserva, deporte) : 0;
  });

  readonly puedePublicar = computed(() => {
    if (this.buscaGente()) return !!this.deporte();
    return this.texto().trim().length > 0;
  });

  readonly placeholder = computed(() => {
    switch (this.tipo()) {
      case 'faltan': return 'Cuéntales más (opcional): "Buen ambiente, llegar 10 min antes"';
      case 'busco-equipo': return 'Cuéntales más (opcional): "Llego puntual y llevo balón"';
      case 'evento': return 'Ej: Torneo de fútbol 5 el sábado, inscripción $120.000 por equipo';
      default: return 'Escribe tu publicación';
    }
  });

  ngOnInit(): void {
    const reserva = this.misReservas().find(r => r.id === this.reservaInicial);
    if (!reserva) return;
    this.elegirTipo('faltan');
    this.reservaId.set(reserva.id);
    this.faltan.set(this.cuposSinNombre(reserva) || 2);
  }

  elegirTipo(tipo: TipoPublicacion): void {
    this.tipo.set(tipo);
    this.abierto.set(true);
  }

  elegirFecha(fecha: string): void {
    this.fecha.set(fecha);
    const horas = this.horasDe(fecha);
    if (!horas.includes(this.hora())) this.hora.set(horas[0]);
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
    const posicion = this.posicionElegida() ?? undefined;

    let texto = this.texto().trim();
    if (!texto && this.tipo() === 'faltan') {
      const quienes = faltan === 1 ? 'Nos falta 1' : `Nos faltan ${faltan}`;
      texto = `${posicion ? `Buscamos ${posicion.toLowerCase()}` : quienes} para jugar ${nombreDeporte}. ¿Quién se anima?`;
    } else if (!texto && this.tipo() === 'busco-equipo') {
      texto = `Quiero jugar ${nombreDeporte}${posicion ? ` de ${posicion.toLowerCase()}` : ''}. ¿Alguien tiene cupo?`;
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
            posicion,
            partido: reserva
              ? { canchaId: reserva.canchaId, fecha: reserva.fecha, hora: reserva.hora, reservaId: reserva.id }
              : { fecha: this.fecha(), hora: this.hora() },
          }
        : undefined,
      disponibilidad: this.tipo() === 'busco-equipo'
        ? { nivel: this.nivel(), posicion, dias: this.diasJuego(), franja: this.franja() }
        : undefined,
    });

    this.texto.set('');
    this.reservaId.set('');
    this.posicion.set(null);
    this.abierto.set(false);
    this.publicada.emit();
  }

  private horasDe(fecha: string): number[] {
    return HORAS_DEL_DIA.filter(hora => !this.reservasService.yaPaso({ fecha, hora }));
  }

  /** En una vaca, los cupos que siguen como "Jugador 3", "Jugador 4"... son los que faltan. */
  private cuposSinNombre(reserva: Reserva): number {
    return reserva.vaca?.filter(j => /^Jugador \d+$/.test(j.nombre)).length ?? 0;
  }
}
