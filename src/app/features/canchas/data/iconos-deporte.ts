import { DeporteId } from '../models/deporte.model';

/**
 * Íconos de línea en SVG por deporte (24x24 / viewBox 0 0 48 48), para el banner
 * de categoría y otros usos pequeños. Se enlazan con [innerHTML] porque son
 * cadenas fijas definidas por nosotros mismos, no contenido de usuarios.
 */
export const ICONOS_DEPORTE: Record<DeporteId, string> = {
  futbol: `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2.2"/><path d="M24 14l7 5-2.6 8h-8.8L17 19z" fill="currentColor"/><path d="M24 14V7M31 19l6-2M16.6 27l-4.4 4.6M31.4 27l4.4 4.6M17 19l-6-2M24 34v7" stroke="currentColor" stroke-width="2"/></svg>`,
  voley: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="24" cy="24" r="20"/><path d="M24 4c6 6 6 34 0 40M4 24c8-4 32-4 40 0M8 12c10 6 22 6 32 0M8 36c10-6 22-6 32 0"/></svg>`,
  baloncesto: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="24" cy="24" r="20"/><path d="M4 24h40M24 4v40M9 9c8 8 22 8 30 0M9 39c8-8 22-8 30 0"/></svg>`,
  tenis: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="24" cy="24" r="20"/><path d="M6 14c9 4 9 16 0 20M42 14c-9 4-9 16 0 20"/></svg>`,
  padel: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="8" y="6" width="24" height="26" rx="12"/><path d="M18 32l-9 10M32 18h6a2 2 0 0 1 0 4h-4M14 20h20M14 26h20"/></svg>`,
};

/** Ícono genérico para el estado "todos los deportes" del banner. */
export const ICONO_TODOS = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M24 4l5.5 12.5L42 18l-9 9 2 13-11-6-11 6 2-13-9-9 12.5-1.5z" stroke-linejoin="round"/></svg>`;
