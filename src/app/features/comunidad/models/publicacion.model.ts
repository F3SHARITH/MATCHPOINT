import { Rol } from '../../../core/sesion/sesion.model';
import { DeporteId } from '../../canchas/models/deporte.model';

/**
 * - faltan:       "Nos faltan 2 para jugar" (con cupos para apuntarse)
 * - busco-equipo: alguien suelto que busca con quién jugar
 * - evento:       torneos o promociones que publican las empresas
 * - general:      preguntas y todo lo demás
 */
export type TipoPublicacion = 'faltan' | 'busco-equipo' | 'evento' | 'general';

export type Nivel = 'principiante' | 'intermedio' | 'avanzado';

/** El partido que necesita gente. Si viene de una reserva, los que se apuntan entran a su vaca. */
export interface Busqueda {
  faltan: number;
  nivel: Nivel;
  /** Lo que pone cada uno; 0 si no lo dijeron. */
  cuota: number;
  partido?: {
    canchaId: string;
    fecha: string;
    hora: number;
    reservaId?: string;
  };
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
  apuntados: { usuarioId: string; nombre: string }[];
  meGusta: string[];
  comentarios: Comentario[];
}

export const TEXTO_TIPO: Record<TipoPublicacion, string> = {
  faltan: 'Faltan jugadores',
  'busco-equipo': 'Busco equipo',
  evento: 'Evento',
  general: 'Publicación',
};

export const TEXTO_NIVEL: Record<Nivel, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export function cuposLibres(publicacion: Publicacion): number {
  return publicacion.busqueda ? Math.max(0, publicacion.busqueda.faltan - publicacion.apuntados.length) : 0;
}
