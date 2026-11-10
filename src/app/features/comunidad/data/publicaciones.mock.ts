import { hoyISO, sumarDias } from '../../../shared/utils/fechas.util';
import { Invitacion, Publicacion } from '../models/publicacion.model';

const MINUTO = 60_000;

/** Publicaciones de ejemplo con todos los tipos. Las fechas se cuentan desde hoy para que nunca queden viejas. */
export function publicacionesIniciales(): Publicacion[] {
  const ahora = Date.now();
  const hoy = hoyISO();
  const likes = (cantidad: number) => Array.from({ length: cantidad }, (_, i) => `fan-${i}`);

  return [
    {
      id: 'p-1', autorId: 'cliente-6', autor: 'Felipe Castro', rolAutor: 'usuario', tipo: 'faltan', deporteId: 'futbol',
      texto: 'Nos faltan 2 defensas para el partido de mañana en Gol Park. Nivel intermedio, buen parche. ¿Quién se anima?',
      creado: ahora - 25 * MINUTO,
      busqueda: { faltan: 2, nivel: 'intermedio', cuota: 5000, posicion: 'Defensa', partido: { canchaId: 'c4', fecha: sumarDias(hoy, 1), hora: 19 } },
      apuntados: [], meGusta: likes(12),
      comentarios: [
        { autor: 'Andrés Silva', texto: '¿A qué hora hay que llegar?', creado: ahora - 18 * MINUTO },
        { autor: 'Felipe Castro', texto: '6:45 para calentar. ¡Los esperamos!', creado: ahora - 15 * MINUTO },
      ],
    },
    {
      id: 'p-8', autorId: 'u-valentina', autor: 'Valentina Ríos', rolAutor: 'usuario', tipo: 'faltan', deporteId: 'voley',
      texto: 'Se nos bajaron 2 para vóley playa de mañana. Buen ambiente, ¡vengan!',
      creado: ahora - 45 * MINUTO,
      busqueda: { faltan: 2, nivel: 'intermedio', cuota: 13800, partido: { canchaId: 'c10', fecha: sumarDias(hoy, 1), hora: 18, reservaId: 'r-demo-1' } },
      apuntados: [{ usuarioId: 'j-laura', nombre: 'Laura Martínez' }], meGusta: likes(4), comentarios: [],
    },
    {
      id: 'p-2', autorId: 'u-carlos', autor: 'Arena Sport', rolAutor: 'empresa', tipo: 'evento', deporteId: 'futbol',
      texto: '🏆 Torneo relámpago de Fútbol 5 este sábado. Inscripción por equipo $120.000 y premio para el campeón. Cupos limitados: escríbenos aquí.',
      creado: ahora - 2 * 60 * MINUTO,
      apuntados: [], meGusta: likes(31), comentarios: [],
    },
    {
      id: 'p-3', autorId: 'cliente-8', autor: 'Sebastián Díaz', rolAutor: 'usuario', tipo: 'faltan', deporteId: 'padel',
      texto: 'Nos falta 1 para dobles de pádel. Nivel avanzado, partido largo.',
      creado: ahora - 3 * 60 * MINUTO,
      busqueda: { faltan: 1, nivel: 'avanzado', cuota: 22500, partido: { canchaId: 'c18', fecha: sumarDias(hoy, 2), hora: 18 } },
      apuntados: [], meGusta: likes(5), comentarios: [],
    },
    {
      id: 'p-7', autorId: 'cliente-2', autor: 'Andrés Silva', rolAutor: 'usuario', tipo: 'busco-equipo', deporteId: 'futbol',
      texto: 'Soy arquero y quiero jugar entre semana por la noche. Llego puntual y llevo guantes.',
      creado: ahora - 4 * 60 * MINUTO,
      disponibilidad: { nivel: 'intermedio', posicion: 'Arquero', dias: 'semana', franja: 'noche' },
      apuntados: [], meGusta: likes(6), comentarios: [],
    },
    {
      id: 'p-4', autorId: 'cliente-5', autor: 'Daniela Torres', rolAutor: 'usuario', tipo: 'busco-equipo', deporteId: 'voley',
      texto: 'Juego vóley playa y busco equipo fijo para los sábados en la tarde. ¿Alguien tiene cupo?',
      creado: ahora - 5 * 60 * MINUTO,
      disponibilidad: { nivel: 'intermedio', posicion: 'Líbero', dias: 'finde', franja: 'tarde' },
      apuntados: [], meGusta: likes(8),
      comentarios: [{ autor: 'Camila Vargas', texto: '¡Nosotras! Jugamos en Oasis Beach a las 4. Te escribo.', creado: ahora - 4 * 60 * MINUTO }],
    },
    {
      id: 'p-9', autorId: 'u-valentina', autor: 'Valentina Ríos', rolAutor: 'usuario', tipo: 'busco-equipo', deporteId: 'futbol',
      texto: 'Quiero jugar fútbol en la noche. Me sirve cualquier día.',
      creado: ahora - 7 * 60 * MINUTO,
      disponibilidad: { nivel: 'intermedio', posicion: 'Volante', dias: 'cualquiera', franja: 'noche' },
      apuntados: [], meGusta: likes(2), comentarios: [],
    },
    {
      id: 'p-5', autorId: 'cliente-0', autor: 'Juan Pérez', rolAutor: 'usuario', tipo: 'faltan', deporteId: 'futbol',
      texto: 'Faltan 3 para fútbol en Elite Soccer. Somos principiantes, venimos a divertirnos.',
      creado: ahora - 9 * 60 * MINUTO,
      busqueda: { faltan: 3, nivel: 'principiante', cuota: 6500, partido: { canchaId: 'c7', fecha: sumarDias(hoy, 3), hora: 20 } },
      apuntados: [{ usuarioId: 'j-laura', nombre: 'Laura Martínez' }], meGusta: likes(9), comentarios: [],
    },
    {
      id: 'p-6', autorId: 'cliente-7', autor: 'Camila Vargas', rolAutor: 'usuario', tipo: 'general', deporteId: 'baloncesto',
      texto: '¿Alguien sabe si Basket Zone tiene buena iluminación de noche?',
      creado: ahora - 26 * 60 * MINUTO,
      apuntados: [], meGusta: likes(3),
      comentarios: [{ autor: 'Santiago Rojas', texto: 'Sí, tiene LED. Jugué el jueves a las 9 y se veía perfecto.', creado: ahora - 24 * 60 * MINUTO }],
    },
  ];
}

/** Una invitación esperando respuesta, para que la jugadora demo vea cómo llegan. */
export function invitacionesIniciales(): Invitacion[] {
  return [
    {
      id: 'inv-1', publicacionId: 'p-9', deId: 'cliente-4', deNombre: 'Santiago Rojas', paraId: 'u-valentina', paraNombre: 'Valentina Ríos',
      deporteId: 'futbol', partido: { canchaId: 'c3', fecha: sumarDias(hoyISO(), 4), hora: 19 }, cuota: 7000, estado: 'pendiente',
    },
  ];
}
