import { Rol } from '../../../core/sesion/sesion.model';
import { DeporteId } from '../../canchas/models/deporte.model';

/**
 * - faltan:       "Nos faltan 2 para jugar" (con cupos para apuntarse)
 * - busco-equipo: alguien suelto que quiere jugar y espera que lo inviten a un partido
 * - evento:       torneos o promociones que publican las empresas
 * - general:      preguntas y todo lo demás
 */
export type TipoPublicacion = 'faltan' | 'busco-equipo' | 'evento' | 'general';

export type Nivel = 'principiante' | 'intermedio' | 'avanzado';

/** Cuándo y dónde se juega. Sin `canchaId` aún no hay cancha. Si viene de una reserva, los que entran se suman a su vaca. */
export interface Partido {
  canchaId?: string;
  fecha: string;
  hora: number;
  reservaId?: string;
}

/** El partido que necesita gente. */
export interface Busqueda {
  faltan: number;
  nivel: Nivel;
  /** Lo que pone cada uno; 0 si no lo dijeron. */
  cuota: number;
  /** Si buscan a alguien en especial ("Arquero"). */
  posicion?: string;
  partido: Partido;
}

export type DiasParaJugar = 'semana' | 'finde' | 'cualquiera';
export type Franja = 'manana' | 'tarde' | 'noche' | 'cualquiera';

/** Lo que cuenta quien quiere jugar, para que lo inviten a un partido que le sirva. */
export interface Disponibilidad {
  nivel: Nivel;
  posicion?: string;
  dias: DiasParaJugar;
  franja: Franja;
}

export interface Comentario {
  autor: string;
  texto: string;
  creado: number;
}

export interface Publicacion {
  id: string;
  autorId: string;
  autor: string;
  rolAutor: Rol;
  tipo: TipoPublicacion;
  deporteId?: DeporteId;
  texto: string;
  /** Momento de publicación (milisegundos, como Date.now()). */
  creado: number;
  busqueda?: Busqueda;
  disponibilidad?: Disponibilidad;
  /** El autor avisó que ya consiguió a quién buscaba: no recibe más gente. */
  cerrada?: boolean;
  apuntados: { usuarioId: string; nombre: string }[];
  meGusta: string[];
  comentarios: Comentario[];
}

export type EstadoInvitacion = 'pendiente' | 'aceptada' | 'rechazada';

/** Un organizador invita a su partido a alguien que publicó que quiere jugar. Solo entra si acepta. */
export interface Invitacion {
  id: string;
  publicacionId: string;
  deId: string;
  deNombre: string;
  paraId: string;
  paraNombre: string;
  deporteId: DeporteId;
  partido: Partido;
  cuota: number;
  estado: EstadoInvitacion;
}

/** Un partido de otra persona al que voy, porque me apunté o porque acepté una invitación. */
export interface MiPartido {
  /** Id de la publicación o de la invitación, según `origen`. */
  id: string;
  origen: 'apuntado' | 'invitacion';
  organizador: string;
  deporteId?: DeporteId;
  partido: Partido;
  cuota: number;
}

export const TEXTO_TIPO: Record<TipoPublicacion, string> = {
  faltan: 'Faltan jugadores',
  'busco-equipo': 'Quiere jugar',
  evento: 'Evento',
  general: 'Publicación',
};

export const TEXTO_NIVEL: Record<Nivel, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export const TEXTO_DIAS: Record<DiasParaJugar, string> = {
  semana: 'Entre semana',
  finde: 'Fines de semana',
  cualquiera: 'Cualquier día',
};

export const TEXTO_FRANJA: Record<Franja, string> = {
  manana: 'En la mañana',
  tarde: 'En la tarde',
  noche: 'En la noche',
  cualquiera: 'A cualquier hora',
};

/** Lo que ve quien invitó, según lo que haya respondido la otra persona. */
export const TEXTO_INVITACION: Record<EstadoInvitacion, string> = {
  pendiente: 'Invitación enviada',
  aceptada: '¡Aceptó tu invitación!',
  rechazada: 'No puede ir',
};

/** Posiciones que se pueden pedir. Tenis y pádel no tienen: ahí solo importa el nivel. */
export const POSICIONES: Record<DeporteId, string[]> = {
  futbol: ['Arquero', 'Defensa', 'Volante', 'Delantero'],
  voley: ['Armador', 'Atacante', 'Líbero'],
  baloncesto: ['Base', 'Escolta', 'Alero', 'Pívot'],
  tenis: [],
  padel: [],
};

export function cuposLibres(publicacion: Publicacion): number {
  return publicacion.busqueda && !publicacion.cerrada ? Math.max(0, publicacion.busqueda.faltan - publicacion.apuntados.length) : 0;
}
