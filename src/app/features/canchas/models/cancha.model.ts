import { DeporteId } from './deporte.model';

export interface Cancha {
  id: string;
  nombre: string;
  deporteId: DeporteId;
  empresaId: string;
  zona: string;
  distanciaKm: number;
  precioHora: number;
  calificacion: number;
  numResenas: number;
  tags: string[];
  disponibleAhora: boolean;
  /** URL de la foto de la cancha (o del deporte, como respaldo) */
  imagenUrl?: string;
}
