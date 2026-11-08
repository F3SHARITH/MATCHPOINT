/** Quita tildes/diacriticos y pasa a minusculas, para comparar texto sin importar acentos. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Envuelve en <mark> la primera coincidencia de `query` dentro de `texto` (para resaltar en el buscador). */
export function resaltar(texto: string, query: string): string {
  if (!query.trim()) return texto;
  const indice = normalizar(texto).indexOf(normalizar(query));
  if (indice === -1) return texto;
  return (
    texto.slice(0, indice) +
    '<mark>' + texto.slice(indice, indice + query.length) + '</mark>' +
    texto.slice(indice + query.length)
  );
}
