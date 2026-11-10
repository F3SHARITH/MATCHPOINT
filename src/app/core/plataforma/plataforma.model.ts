export type MetodoPagoId = 'en-cancha' | 'nequi' | 'bre-b' | 'daviplata' | 'tarjeta' | 'pse';

export interface MetodoPago {
  id: MetodoPagoId;
  nombre: string;
  descripcion: string;
  /** El administrador decide qué métodos ven los jugadores al reservar. */
  activo: boolean;
}

/** Mensualidad que cada empresa paga para tener sus canchas publicadas. */
export interface Suscripcion {
  empresaId: string;
  ultimoPago: string;
  proximoCobro: string;
  /** El administrador puede suspender una empresa: sus canchas dejan de aparecer. */
  suspendida: boolean;
}

export type EstadoSuscripcion = 'al-dia' | 'por-vencer' | 'vencida' | 'suspendida';

export const TEXTO_ESTADO_SUSCRIPCION: Record<EstadoSuscripcion, string> = {
  'al-dia': 'Al día',
  'por-vencer': 'Por vencer',
  vencida: 'Vencida',
  suspendida: 'Suspendida',
};

/**
 * Cuándo pide anticipo una empresa. Los jugadores de confianza nunca lo pagan.
 *  - nunca:   todo se paga en la cancha (como funciona hoy por WhatsApp)
 *  - pico:    solo en horas pico
 *  - siempre: a cualquier hora
 */
export type CuandoAnticipo = 'nunca' | 'pico' | 'siempre';

export interface ReglasPago {
  anticipo: CuandoAnticipo;
  /** Parte del precio que se paga como anticipo, en porcentaje (30 = 30 %). */
  porcentaje: number;
}

/** Horas pico: reservas que empiezan entre las 6:00 y las 9:00 p. m. (la última termina a las 10:00 p. m.). */
export const HORA_PICO = { desde: 18, hasta: 21 };

export function esHoraPico(hora: number): boolean {
  return hora >= HORA_PICO.desde && hora <= HORA_PICO.hasta;
}
