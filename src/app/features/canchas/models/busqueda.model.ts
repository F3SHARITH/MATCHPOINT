export type TipoResultado = 'deporte' | 'cancha' | 'empresa' | 'zona';

export interface ResultadoBusqueda {
  tipo: TipoResultado;
  id: string;
  titulo: string;
  meta: string;
  color: string;
}

export interface GrupoResultado {
  etiqueta: string;
  items: ResultadoBusqueda[];
  /** cuántos resultados adicionales existen para esta categoría y no se muestran */
  masResultados?: number;
}
