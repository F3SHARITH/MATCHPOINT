import { DeporteId } from '../models/deporte.model';
import { CategoriaBanner } from '../models/categoria-banner.model';

/** URL de la foto de portada de cada deporte (también reutilizada en las tarjetas del grid). */
export const IMAGEN_POR_DEPORTE: Record<DeporteId, string> = {
  futbol: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
  voley: 'https://images.unsplash.com/photo-1530869685324-333806073961',
  baloncesto: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
  tenis: 'https://images.unsplash.com/photo-1678734491865-d4dc8a5f5399',
  padel: 'https://images.pexels.com/photos/32897040/pexels-photo-32897040.jpeg',
};

/** Jugador pateando el balón: portada cuando no hay un deporte elegido. */
const IMAGEN_TODOS = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12';

export const BANNERS_POR_DEPORTE: Record<DeporteId, CategoriaBanner> = {
  futbol: {
    titulo: 'Canchas de Fútbol',
    descripcion: 'Sintética, techada o al aire libre: encuentra tu cancha para el partido de hoy.',
    imagen: IMAGEN_POR_DEPORTE.futbol,
    caracteristicas: [
      { icono: 'cancha', titulo: 'Césped de calidad', subtitulo: 'Sintético o natural' },
      { icono: 'led', titulo: 'Iluminación LED', subtitulo: 'Juega de noche' },
      { icono: 'parqueadero', titulo: 'Parqueadero', subtitulo: 'Llega en carro' },
      { icono: 'reserva', titulo: 'Reserva fácil', subtitulo: 'En pocos pasos' },
    ],
  },
  voley: {
    titulo: 'Canchas de Vóley Playa',
    descripcion: 'Disfruta del sol, la arena y el mejor ambiente para jugar tu deporte favorito.',
    imagen: IMAGEN_POR_DEPORTE.voley,
    caracteristicas: [
      { icono: 'playa', titulo: 'Ambiente playero', subtitulo: 'Vive la experiencia' },
      { icono: 'cancha', titulo: 'Canchas premium', subtitulo: 'Arena de calidad' },
      { icono: 'duchas', titulo: 'Servicios completos', subtitulo: 'Duchas y más' },
      { icono: 'reserva', titulo: 'Reserva fácil', subtitulo: 'En pocos pasos' },
    ],
  },
  baloncesto: {
    titulo: 'Canchas de Baloncesto',
    descripcion: 'Tableros profesionales y buen piso para tu próximo partido de básquet.',
    imagen: IMAGEN_POR_DEPORTE.baloncesto,
    caracteristicas: [
      { icono: 'techada', titulo: 'Cancha techada', subtitulo: 'Juega bajo techo' },
      { icono: 'cancha', titulo: 'Tableros profesionales', subtitulo: 'Calidad de juego' },
      { icono: 'vestidores', titulo: 'Vestidores', subtitulo: 'Cambio cómodo' },
      { icono: 'reserva', titulo: 'Reserva fácil', subtitulo: 'En pocos pasos' },
    ],
  },
  tenis: {
    titulo: 'Canchas de Tenis',
    descripcion: 'Superficies profesionales para jugar individual o dobles a cualquier hora.',
    imagen: IMAGEN_POR_DEPORTE.tenis,
    caracteristicas: [
      { icono: 'cancha', titulo: 'Superficie profesional', subtitulo: 'Rápida y pareja' },
      { icono: 'led', titulo: 'Iluminación nocturna', subtitulo: 'Juega de noche' },
      { icono: 'parqueadero', titulo: 'Parqueadero', subtitulo: 'Llega en carro' },
      { icono: 'reserva', titulo: 'Reserva fácil', subtitulo: 'En pocos pasos' },
    ],
  },
  padel: {
    titulo: 'Canchas de Pádel',
    descripcion: 'Paredes de cristal y el estándar internacional para tu partido de pádel.',
    imagen: IMAGEN_POR_DEPORTE.padel,
    caracteristicas: [
      { icono: 'cancha', titulo: 'Paredes de cristal', subtitulo: 'Estándar internacional' },
      { icono: 'cafeteria', titulo: 'Cafetería', subtitulo: 'Descansa entre sets' },
      { icono: 'parqueadero', titulo: 'Parqueadero', subtitulo: 'Llega en carro' },
      { icono: 'reserva', titulo: 'Reserva fácil', subtitulo: 'En pocos pasos' },
    ],
  },
};

export const BANNER_TODOS: CategoriaBanner = {
  titulo: 'Todas las canchas',
  descripcion: 'Fútbol, vóley playa, baloncesto, tenis y pádel en Yopal. Encuentra tu cancha, reserva en 3 clics y juega hoy.',
  imagen: IMAGEN_TODOS,
  caracteristicas: [
    { icono: 'reserva', titulo: 'Reserva fácil', subtitulo: 'En 3 clics' },
    { icono: 'pago', titulo: 'Paga como quieras', subtitulo: 'Efectivo, Nequi o Bre-B' },
    { icono: 'cancha', titulo: 'Todas las canchas', subtitulo: 'En un solo lugar' },
    { icono: 'soporte', titulo: 'Soporte', subtitulo: 'Siempre disponible' },
  ],
};
