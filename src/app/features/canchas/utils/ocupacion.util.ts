/**
 * Genera un porcentaje de ocupación semanal determinístico a partir del id de la cancha.
 * Es solo un dato de ejemplo para la vista Empresa, mientras no exista el dato real del backend.
 */
export function ocupacionEjemplo(id: string): number {
  let hash = 0;
  for (const caracter of id) {
    hash = (hash * 31 + caracter.charCodeAt(0)) % 97;
  }
  return 35 + (hash % 55);
}
