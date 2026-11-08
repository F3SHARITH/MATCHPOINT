export type DeporteId = 'futbol' | 'voley' | 'baloncesto' | 'tenis' | 'padel';

export interface Deporte {
  id: DeporteId;
  nombre: string;
  /** variable CSS para usar en [style], ej. 'var(--futbol)' */
  colorVar: string;
  /** valor hexadecimal real, para SVG / estilos inline */
  hex: string;
}
