export interface Caracteristica {
  icono: string;
  titulo: string;
  subtitulo: string;
}

/** Contenido del banner de cabecera para una categoría de deporte (o para "todos"). */
export interface CategoriaBanner {
  titulo: string;
  descripcion: string;
  imagen: string;
  caracteristicas: Caracteristica[];
}
