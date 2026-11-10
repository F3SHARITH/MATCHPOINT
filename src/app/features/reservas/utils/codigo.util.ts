/** Sin 0/O ni 1/I, para que no se confundan al dictar el código por teléfono. */
const CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Código corto de reserva, como REZ-K7M2P. Con backend, lo genera el servidor (y revisa que no se repita). */
export function nuevoCodigo(aleatorio: () => number = Math.random): string {
  let codigo = '';
  for (let i = 0; i < 5; i++) codigo += CARACTERES[Math.floor(aleatorio() * CARACTERES.length)];
  return `REZ-${codigo}`;
}

/** Números "aleatorios" que siempre salen iguales para la misma semilla (datos de prueba estables). */
export function aleatorioDesde(semilla: number): () => number {
  let estado = semilla % 233_280;
  return () => {
    estado = (estado * 9301 + 49_297) % 233_280;
    return estado / 233_280;
  };
}
