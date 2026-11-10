import { Deporte } from '../models/deporte.model';
import { Empresa } from '../models/empresa.model';
import { Cancha } from '../models/cancha.model';
import { IMAGEN_POR_DEPORTE } from './categorias.mock';

export const DEPORTES: Deporte[] = [
  { id: 'futbol',     nombre: 'Fútbol',      colorVar: 'var(--futbol)',     hex: '#3DDC73' },
  { id: 'voley',      nombre: 'Vóley Playa', colorVar: 'var(--voley)',      hex: '#FFD23F' },
  { id: 'baloncesto', nombre: 'Baloncesto',  colorVar: 'var(--baloncesto)', hex: '#FF8A1F' },
  { id: 'tenis',      nombre: 'Tenis',       colorVar: 'var(--tenis)',      hex: '#4C9BFF' },
  { id: 'padel',      nombre: 'Pádel',       colorVar: 'var(--padel)',      hex: '#C084F5' },
];

export const ZONAS: string[] = ['Centro', 'La Campiña', 'Bicentenario', 'Ciudad Jardín', 'Morichal'];

export const EMPRESAS: Record<string, Empresa> = {
  'arena-sport':   { id: 'arena-sport',   nombre: 'Arena Sport',        zona: 'Centro' },
  'futbol-center': { id: 'futbol-center', nombre: 'Fútbol Center',      zona: 'La Campiña' },
  'green-fields':  { id: 'green-fields',  nombre: 'Green Fields',       zona: 'Bicentenario' },
  'playball':      { id: 'playball',      nombre: 'Playball Club',      zona: 'Centro' },
  'sunset':        { id: 'sunset',        nombre: 'Sunset Fútbol Club', zona: 'Morichal' },
  'oasis-beach':   { id: 'oasis-beach',   nombre: 'Oasis Beach',        zona: 'Ciudad Jardín' },
  'blue-beach':    { id: 'blue-beach',    nombre: 'Blue Beach',         zona: 'La Campiña' },
  'power-padel':   { id: 'power-padel',   nombre: 'Power Padel',        zona: 'Centro' },
  'elite-sports':  { id: 'elite-sports',  nombre: 'Elite Sports',       zona: 'Bicentenario' },
};

const CANCHAS_BASE: Cancha[] = [
  { id: 'c1',  nombre: 'Arena Soccer City',    deporteId: 'futbol',     empresaId: 'arena-sport',   zona: 'Centro',        distanciaKm: 1.2, precioHora: 60000, calificacion: 4.8, numResenas: 120, tags: ['LED', 'Parqueadero', 'Duchas'],         disponibleAhora: true  },
  { id: 'c2',  nombre: 'FutCenter Pro',        deporteId: 'futbol',     empresaId: 'futbol-center', zona: 'La Campiña',    distanciaKm: 2.4, precioHora: 58000, calificacion: 4.7, numResenas: 153, tags: ['Cafetería', 'Duchas'],                  disponibleAhora: true  },
  { id: 'c3',  nombre: 'Green Field Club',     deporteId: 'futbol',     empresaId: 'green-fields',  zona: 'Bicentenario',  distanciaKm: 3.1, precioHora: 55000, calificacion: 4.8, numResenas: 128, tags: ['Parqueadero', 'LED'],                   disponibleAhora: false },
  { id: 'c4',  nombre: 'Gol Park',             deporteId: 'futbol',     empresaId: 'playball',      zona: 'Centro',        distanciaKm: 0.8, precioHora: 50000, calificacion: 4.6, numResenas: 87,  tags: ['Parqueadero', 'Duchas', 'LED'],         disponibleAhora: true  },
  { id: 'c5',  nombre: 'Campo Verde',          deporteId: 'futbol',     empresaId: 'sunset',        zona: 'Morichal',      distanciaKm: 4.0, precioHora: 48000, calificacion: 4.6, numResenas: 64,  tags: ['Cafetería', 'LED'],                     disponibleAhora: true  },
  { id: 'c6',  nombre: 'Micro Sport Center',   deporteId: 'futbol',     empresaId: 'arena-sport',   zona: 'Centro',        distanciaKm: 1.5, precioHora: 80000, calificacion: 4.8, numResenas: 120, tags: ['Techada', 'LED', 'Vestidores'],         disponibleAhora: true  },
  { id: 'c7',  nombre: 'Elite Soccer',         deporteId: 'futbol',     empresaId: 'elite-sports',  zona: 'Bicentenario',  distanciaKm: 2.6, precioHora: 65000, calificacion: 4.9, numResenas: 214, tags: ['Césped FIFA', 'Duchas', 'Cafetería'],   disponibleAhora: true  },
  { id: 'c8',  nombre: 'Sport Center Yopal',   deporteId: 'futbol',     empresaId: 'arena-sport',   zona: 'Centro',        distanciaKm: 2.0, precioHora: 70000, calificacion: 4.7, numResenas: 75,  tags: ['Parqueadero', 'Duchas'],                disponibleAhora: false },
  { id: 'c9',  nombre: 'La Canchita Micro',    deporteId: 'futbol',     empresaId: 'playball',      zona: 'Ciudad Jardín', distanciaKm: 2.3, precioHora: 60000, calificacion: 4.5, numResenas: 76,  tags: ['Vestidores', 'LED'],                    disponibleAhora: true  },

  { id: 'c10', nombre: 'Oasis Vóley Playa',    deporteId: 'voley',      empresaId: 'oasis-beach',   zona: 'Ciudad Jardín', distanciaKm: 2.8, precioHora: 55000, calificacion: 4.9, numResenas: 96,  tags: ['Duchas', 'Bar', 'Balones'],             disponibleAhora: true  },
  { id: 'c11', nombre: 'Arena del Mar',        deporteId: 'voley',      empresaId: 'arena-sport',   zona: 'Centro',        distanciaKm: 2.1, precioHora: 60000, calificacion: 4.8, numResenas: 128, tags: ['Duchas', 'Bar', 'Red Pro'],             disponibleAhora: true  },
  { id: 'c12', nombre: 'Blue Beach Club',      deporteId: 'voley',      empresaId: 'blue-beach',    zona: 'La Campiña',    distanciaKm: 3.2, precioHora: 50000, calificacion: 4.7, numResenas: 87,  tags: ['Duchas', 'Parqueadero', 'Bar'],         disponibleAhora: false },
  { id: 'c13', nombre: 'Sunset Vóley Club',    deporteId: 'voley',      empresaId: 'sunset',        zona: 'Morichal',      distanciaKm: 3.6, precioHora: 48000, calificacion: 4.6, numResenas: 54,  tags: ['Duchas', 'Bar', 'LED'],                 disponibleAhora: true  },

  { id: 'c14', nombre: 'Cancha Total Básquet', deporteId: 'baloncesto', empresaId: 'arena-sport',   zona: 'Centro',        distanciaKm: 1.3, precioHora: 45000, calificacion: 4.6, numResenas: 58,  tags: ['Parqueadero', 'LED', 'Duchas'],         disponibleAhora: true  },
  { id: 'c15', nombre: 'Basket Zone',          deporteId: 'baloncesto', empresaId: 'elite-sports',  zona: 'La Campiña',    distanciaKm: 3.4, precioHora: 42000, calificacion: 4.4, numResenas: 39,  tags: ['Parqueadero', 'LED'],                   disponibleAhora: true  },

  { id: 'c16', nombre: 'Blue Court Tenis',     deporteId: 'tenis',      empresaId: 'elite-sports',  zona: 'Bicentenario',  distanciaKm: 2.9, precioHora: 55000, calificacion: 4.7, numResenas: 64,  tags: ['Parqueadero', 'Duchas', 'Iluminación'], disponibleAhora: true  },
  { id: 'c17', nombre: 'Sport Center Tenis',   deporteId: 'tenis',      empresaId: 'arena-sport',   zona: 'Centro',        distanciaKm: 1.6, precioHora: 58000, calificacion: 4.8, numResenas: 90,  tags: ['Parqueadero', 'Duchas', 'Cafetería'],   disponibleAhora: true  },

  { id: 'c18', nombre: 'Power Padel Club',     deporteId: 'padel',      empresaId: 'power-padel',   zona: 'Centro',        distanciaKm: 1.9, precioHora: 90000, calificacion: 4.9, numResenas: 98,  tags: ['Parqueadero', 'Cafetería', 'Duchas'],   disponibleAhora: true  },
];

export const CANCHAS: Cancha[] = CANCHAS_BASE.map(c => ({
  ...c,
  imagenUrl: IMAGEN_POR_DEPORTE[c.deporteId],
}));
