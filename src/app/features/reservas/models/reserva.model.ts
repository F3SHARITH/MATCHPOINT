import { MetodoPagoId } from '../../../core/plataforma/plataforma.model';
import { DeporteId } from '../../canchas/models/deporte.model';

/**
 * - apartada:   reservó pero no ha pagado nada y todavía no es de confianza
 * - confirmada: dejó anticipo, o es de confianza y paga todo en la cancha
 * - pagada:     la cancha ya recibió el total
 * - no-llego:   la empresa lo marcó; el responsable pierde la confianza
 */
export type EstadoReserva = 'apartada' | 'confirmada' | 'pagada' | 'no-llego' | 'cancelada';

/** Cómo se reparten la cuenta los jugadores. Para la cancha no cambia nada: siempre hay un responsable. */
export type ModalidadPago = 'organizador' | 'vaca' | 'reto';

export interface Pago {
  monto: number;
  metodo: MetodoPagoId;
  /** Quién puso la plata: el responsable o, en un reto, el nombre del equipo. */
  quien: string;
  /** "En línea" o el empleado que cobró en la cancha, para cuadrar la caja. */
  registradoPor: string;
  fecha: string;
  esAnticipo?: boolean;
}

/** En la vaca, cada jugador le paga al organizador o lleva su parte en efectivo. */
export type EstadoJugadorVaca = 'debe' | 'pago' | 'al-llegar';

export interface JugadorVaca {
  nombre: string;
  estado: EstadoJugadorVaca;
}

export type LadoReto = 'A' | 'B';

/** "El que pierde paga". El equipo A es el del responsable de la reserva. */
export interface Reto {
  equipoA: string;
  equipoB: string;
  ganador?: LadoReto | 'empate';
  pagadoPor?: LadoReto | 'mitad';
}

export interface Reserva {
  id: string;
  /** Código corto (REZ-K7M2P) para identificarse en la cancha o cancelar. */
  codigo: string;
  canchaId: string;
  /** Responsable ante la cancha: quien hizo la reserva. */
  usuarioId: string;
  cliente: string;
  fecha: string;
  /** Una reserva dura 1 hora: `hora` es la hora de inicio (18 = 6:00 p. m.). */
  hora: number;
  precio: number;
  /** Cómo dijo que iba a pagar al reservar. */
  metodoPago: MetodoPagoId;
  estado: EstadoReserva;
  pagos: Pago[];
  modalidad: ModalidadPago;
  vaca?: JugadorVaca[];
  reto?: Reto;
}

/** Horario de las canchas: se puede reservar desde las 6:00 a. m. hasta las 10:00 p. m. */
export const HORAS_DEL_DIA: number[] = Array.from({ length: 17 }, (_, i) => i + 6);

/** Reservas cumplidas (y ninguna falla) para ser de confianza y no pagar anticipo. */
export const RESERVAS_PARA_CONFIANZA = 3;

/** Jugadores habituales por deporte, para proponer en cuántos se divide la vaca. */
export const JUGADORES_POR_DEPORTE: Record<DeporteId, number> = {
  futbol: 10,
  voley: 4,
  baloncesto: 10,
  tenis: 2,
  padel: 4,
};

export const TEXTO_ESTADO_RESERVA: Record<EstadoReserva, string> = {
  apartada: 'Apartada',
  confirmada: 'Confirmada',
  pagada: 'Pagada',
  'no-llego': 'No llegó',
  cancelada: 'Cancelada',
};

export function totalPagado(reserva: Reserva): number {
  return reserva.pagos.reduce((total, pago) => total + pago.monto, 0);
}

export function saldoDe(reserva: Reserva): number {
  return Math.max(0, reserva.precio - totalPagado(reserva));
}

/** Cuota de cada jugador en la vaca, redondeada hacia arriba a los $100. */
export function cuotaVaca(reserva: Reserva): number {
  const jugadores = reserva.vaca?.length ?? 0;
  return jugadores ? Math.ceil(reserva.precio / jugadores / 100) * 100 : 0;
}

/** Lo que pone cada jugador: la cuota de la vaca o, sin vaca, el precio entre los jugadores habituales del deporte. */
export function cuotaPorJugador(reserva: Reserva, deporteId: DeporteId): number {
  return reserva.vaca ? cuotaVaca(reserva) : Math.ceil(reserva.precio / JUGADORES_POR_DEPORTE[deporteId] / 100) * 100;
}

/**
 * Después de un reto, quién le debe a quién. Pasa porque el anticipo lo puso el responsable
 * (equipo A) pero el saldo lo pagó el que perdió.
 */
export function deudaReto(reserva: Reserva): { deudor: string; acreedor: string; monto: number } | null {
  const reto = reserva.reto;
  if (!reto?.pagadoPor) return null;

  const parteDeB = reto.pagadoPor === 'B' ? reserva.precio : reto.pagadoPor === 'mitad' ? reserva.precio / 2 : 0;
  const pagadoPorB = reserva.pagos.filter(p => p.quien === reto.equipoB).reduce((total, p) => total + p.monto, 0);
  const diferencia = Math.round(parteDeB - pagadoPorB);

  if (diferencia > 0) return { deudor: reto.equipoB, acreedor: `${reserva.cliente} (${reto.equipoA})`, monto: diferencia };
  if (diferencia < 0) return { deudor: reto.equipoA, acreedor: reto.equipoB, monto: -diferencia };
  return null;
}
