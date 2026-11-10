/**
 * Fechas como texto 'AAAA-MM-DD' en hora local. Se arman a mano (sin toISOString) para que
 * "hoy" no salte al día siguiente a las 7 p. m. por la diferencia con UTC.
 */
export function aISO(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function deISO(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export function hoyISO(): string {
  return aISO(new Date());
}

export function sumarDias(iso: string, dias: number): string {
  const fecha = deISO(iso);
  fecha.setDate(fecha.getDate() + dias);
  return aISO(fecha);
}

/** Los próximos `cantidad` días empezando hoy. */
export function proximosDias(cantidad: number): string[] {
  const hoy = hoyISO();
  return Array.from({ length: cantidad }, (_, i) => sumarDias(hoy, i));
}

const DIA_SEMANA = new Intl.DateTimeFormat('es-CO', { weekday: 'short' });
const FECHA_LARGA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
const FECHA_CORTA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });

/** "Hoy", "Mañana" o el día abreviado ("mié"). */
export function etiquetaDia(iso: string): string {
  const hoy = hoyISO();
  if (iso === hoy) return 'Hoy';
  if (iso === sumarDias(hoy, 1)) return 'Mañana';
  return DIA_SEMANA.format(deISO(iso)).replace('.', '');
}

/** "lunes, 26 de octubre" */
export function fechaLarga(iso: string): string {
  return FECHA_LARGA.format(deISO(iso));
}

/** "26 oct" */
export function fechaCorta(iso: string): string {
  return FECHA_CORTA.format(deISO(iso)).replace('.', '');
}

export function diaDelMes(iso: string): number {
  return deISO(iso).getDate();
}

/** 18 → "6:00 p. m." (formato de 12 horas, el más usado en Colombia). */
export function horaTexto(hora: number): string {
  const hora12 = hora % 12 || 12;
  return `${hora12}:00 ${hora < 12 ? 'a. m.' : 'p. m.'}`;
}

/** Hace cuánto pasó algo: "ahora", "hace 5 min", "hace 2 h", "ayer", "hace 3 días". */
export function haceCuanto(marca: number): string {
  const minutos = Math.max(0, Math.round((Date.now() - marca) / 60_000));
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? 'ayer' : `hace ${dias} días`;
}

/** Días que faltan desde hoy hasta `iso` (negativo si ya pasó). */
export function diasHasta(iso: string): number {
  const milisegundos = deISO(iso).getTime() - deISO(hoyISO()).getTime();
  return Math.round(milisegundos / 86_400_000);
}
