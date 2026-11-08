import { Injectable, computed, inject, signal } from '@angular/core';
import { SesionService } from '../../../core/sesion/sesion.service';
import { PlataformaService } from '../../../core/plataforma/plataforma.service';
import { MetodoPagoId, esHoraPico } from '../../../core/plataforma/plataforma.model';
import { hoyISO } from '../../../shared/utils/fechas.util';
import { Cancha } from '../../canchas/models/cancha.model';
import {
  EstadoJugadorVaca, JugadorVaca, LadoReto, ModalidadPago, Pago, RESERVAS_PARA_CONFIANZA, Reserva, saldoDe,
} from '../models/reserva.model';
import { reservasIniciales } from '../data/reservas.mock';
import { nuevoCodigo } from '../utils/codigo.util';

export interface NuevaReserva {
  canchaId: string;
  fecha: string;
  hora: number;
  precio: number;
  metodoPago: MetodoPagoId;
  /** Lo que paga en línea al reservar: el anticipo, el total, o 0 si paga todo en la cancha. */
  pagaAhora: number;
  esAnticipo: boolean;
  modalidad: ModalidadPago;
  jugadores?: number;
  equipos?: { propio: string; rival: string };
}

export interface Confianza {
  cumplidas: number;
  fallas: number;
  esDeConfianza: boolean;
}

export interface AnticipoRequerido {
  monto: number;
  razon: string;
}

/** Lo que registra recepción al cobrar en la cancha. */
export interface Cobro {
  monto: number;
  metodo: MetodoPagoId;
  /** Solo en retos: quién ganó y quién pagó el saldo. */
  ganador?: LadoReto | 'empate';
  pagadoPor?: LadoReto | 'mitad';
}

const porFechaYHora = (a: Reserva, b: Reserva) => a.fecha.localeCompare(b.fecha) || a.hora - b.hora;
const TERMINADAS: Reserva['estado'][] = ['cancelada', 'no-llego'];

/**
 * Todas las reservas de la plataforma. Cada rol ve una parte:
 * el jugador las suyas, la empresa las de sus canchas, el administrador todas.
 * Con backend: GET /api/reservas, POST /api/reservas, POST /api/reservas/:id/pagos, PATCH /api/reservas/:id.
 */
@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly sesion = inject(SesionService);
  private readonly plataforma = inject(PlataformaService);

  readonly reservas = signal<Reserva[]>(reservasIniciales());

  private readonly mias = computed(() => {
    const usuarioId = this.sesion.usuario()?.id;
    return this.reservas().filter(r => r.usuarioId === usuarioId);
  });

  readonly misProximas = computed(() =>
    this.mias().filter(r => !TERMINADAS.includes(r.estado) && !this.yaPaso(r)).sort(porFechaYHora),
  );

  readonly miHistorial = computed(() =>
    this.mias().filter(r => TERMINADAS.includes(r.estado) || this.yaPaso(r)).sort((a, b) => porFechaYHora(b, a)),
  );

  /** Reservas cumplidas (jugadas y pagadas) y fallas ("no llegó") de cada jugador. */
  private readonly historialPorUsuario = computed(() => {
    const historial = new Map<string, { cumplidas: number; fallas: number }>();
    for (const reserva of this.reservas()) {
      const actual = historial.get(reserva.usuarioId) ?? { cumplidas: 0, fallas: 0 };
      if (reserva.estado === 'pagada' && this.yaPaso(reserva)) actual.cumplidas++;
      if (reserva.estado === 'no-llego') actual.fallas++;
      historial.set(reserva.usuarioId, actual);
    }
    return historial;
  });

  readonly miConfianza = computed(() => this.confianzaDe(this.sesion.usuario()?.id ?? ''));

  /** De confianza = cumplió varias reservas y nunca dejó la cancha tirada. No paga anticipo. */
  confianzaDe(usuarioId: string): Confianza {
    const { cumplidas, fallas } = this.historialPorUsuario().get(usuarioId) ?? { cumplidas: 0, fallas: 0 };
    return { cumplidas, fallas, esDeConfianza: fallas === 0 && cumplidas >= RESERVAS_PARA_CONFIANZA };
  }

  /** Anticipo que le toca a quien está reservando, según las reglas de la empresa dueña de la cancha. */
  anticipoPara(cancha: Cancha, hora: number): AnticipoRequerido {
    const reglas = this.plataforma.reglasDe(cancha.empresaId);
    const sinAnticipo = { monto: 0, razon: '' };
    if (reglas.anticipo === 'nunca' || this.miConfianza().esDeConfianza) return sinAnticipo;
    if (reglas.anticipo === 'pico' && !esHoraPico(hora)) return sinAnticipo;
    return {
      monto: Math.round((cancha.precioHora * reglas.porcentaje) / 100),
      razon: reglas.anticipo === 'pico'
        ? 'Es hora pico y todavía no tienes nivel de confianza en MatchPoint.'
        : 'Esta cancha pide anticipo a quien todavía no tiene nivel de confianza.',
    };
  }

  /** Horas que ya no se pueden reservar en esa cancha ese día. */
  horasOcupadas(canchaId: string, fecha: string): Set<number> {
    return new Set(
      this.reservas()
        .filter(r => r.canchaId === canchaId && r.fecha === fecha && r.estado !== 'cancelada')
        .map(r => r.hora),
    );
  }

  deCanchas(canchaIds: string[], fecha: string): Reserva[] {
    return this.reservas()
      .filter(r => r.fecha === fecha && canchaIds.includes(r.canchaId) && r.estado !== 'cancelada')
      .sort(porFechaYHora);
  }

  yaPaso(reserva: Pick<Reserva, 'fecha' | 'hora'>): boolean {
    const hoy = hoyISO();
    return reserva.fecha < hoy || (reserva.fecha === hoy && reserva.hora <= new Date().getHours());
  }

  crear(datos: NuevaReserva): Reserva {
    const usuarioId = this.sesion.usuario()?.id ?? 'anonimo';
    const cliente = this.sesion.usuario()?.nombre ?? 'Cliente';
    const pagos: Pago[] = datos.pagaAhora > 0
      ? [{ monto: datos.pagaAhora, metodo: datos.metodoPago, quien: cliente, registradoPor: 'En línea', fecha: hoyISO(), esAnticipo: datos.esAnticipo }]
      : [];

    const reserva: Reserva = {
      id: `r-${Date.now()}`,
      codigo: nuevoCodigo(),
      canchaId: datos.canchaId,
      usuarioId,
      cliente,
      fecha: datos.fecha,
      hora: datos.hora,
      precio: datos.precio,
      metodoPago: datos.metodoPago,
      estado: 'apartada',
      pagos,
      modalidad: datos.modalidad,
    };

    if (datos.modalidad === 'vaca') {
      reserva.vaca = Array.from({ length: Math.max(2, datos.jugadores ?? 2) }, (_, i): JugadorVaca => ({
        nombre: i === 0 ? cliente : `Jugador ${i + 1}`,
        estado: i === 0 ? 'pago' : 'debe',
      }));
    }
    if (datos.modalidad === 'reto' && datos.equipos) {
      reserva.reto = { equipoA: datos.equipos.propio, equipoB: datos.equipos.rival };
    }

    if (saldoDe(reserva) === 0) reserva.estado = 'pagada';
    else if (pagos.length || this.confianzaDe(usuarioId).esDeConfianza) reserva.estado = 'confirmada';

    this.reservas.update(lista => [...lista, reserva]);
    return reserva;
  }

  /** Recepción cobra en la cancha. En un reto, también queda quién ganó y qué equipo pagó. */
  cobrar(id: string, cobro: Cobro): void {
    const base = { metodo: cobro.metodo, registradoPor: this.sesion.usuario()?.nombre ?? 'Empresa', fecha: hoyISO() };

    this.actualizar(id, reserva => {
      let reto = reserva.reto;
      let nuevos: Pago[] = [{ ...base, monto: cobro.monto, quien: reserva.cliente }];

      if (reto && cobro.pagadoPor) {
        reto = { ...reto, ganador: cobro.ganador ?? reto.ganador, pagadoPor: cobro.pagadoPor };
        const mitad = Math.round(cobro.monto / 2);
        nuevos = cobro.pagadoPor === 'mitad'
          ? [{ ...base, monto: mitad, quien: reto.equipoA }, { ...base, monto: cobro.monto - mitad, quien: reto.equipoB }]
          : [{ ...base, monto: cobro.monto, quien: cobro.pagadoPor === 'A' ? reto.equipoA : reto.equipoB }];
      }

      const actualizada: Reserva = { ...reserva, reto, pagos: [...reserva.pagos, ...nuevos] };
      return { ...actualizada, estado: saldoDe(actualizada) === 0 ? 'pagada' : 'confirmada' };
    });
  }

  marcarNoLlego(id: string): void {
    this.actualizar(id, reserva => ({ ...reserva, estado: 'no-llego' }));
  }

  cancelar(id: string): void {
    this.actualizar(id, reserva => ({ ...reserva, estado: 'cancelada' }));
  }

  /** El organizador lleva la cuenta de la vaca: quién ya le pagó y quién paga al llegar. */
  marcarJugadorVaca(id: string, indice: number, estado: EstadoJugadorVaca): void {
    this.actualizar(id, reserva => ({
      ...reserva,
      vaca: reserva.vaca?.map((jugador, i) => (i === indice ? { ...jugador, estado } : jugador)),
    }));
  }

  renombrarJugadorVaca(id: string, indice: number, nombre: string): void {
    if (!nombre.trim()) return;
    this.actualizar(id, reserva => ({
      ...reserva,
      vaca: reserva.vaca?.map((jugador, i) => (i === indice ? { ...jugador, nombre: nombre.trim() } : jugador)),
    }));
  }

  /** Alguien se apuntó desde la comunidad: ocupa el primer cupo sin nombre de la vaca ("Jugador 3"). */
  sumarJugadorVaca(id: string, nombre: string): void {
    this.actualizar(id, reserva => {
      if (!reserva.vaca) return reserva;
      const libre = reserva.vaca.findIndex(jugador => /^Jugador \d+$/.test(jugador.nombre));
      const nuevo: JugadorVaca = { nombre, estado: 'debe' };
      const vaca = libre >= 0
        ? reserva.vaca.map((jugador, i) => (i === libre ? nuevo : jugador))
        : [...reserva.vaca, nuevo];
      return { ...reserva, vaca };
    });
  }

  /** Se salió del partido: su cupo vuelve a quedar libre. */
  quitarJugadorVaca(id: string, nombre: string): void {
    this.actualizar(id, reserva => ({
      ...reserva,
      vaca: reserva.vaca?.map((jugador, i) =>
        jugador.nombre === nombre && i > 0 ? { nombre: `Jugador ${i + 1}`, estado: 'debe' } : jugador,
      ),
    }));
  }

  private actualizar(id: string, cambio: (reserva: Reserva) => Reserva): void {
    this.reservas.update(lista => lista.map(r => (r.id === id ? cambio(r) : r)));
  }
}
