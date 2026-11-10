import { Component, Input } from '@angular/core';

export type NombreIcono =
  | 'buscar' | 'calendario' | 'panel' | 'escudo' | 'salir' | 'mas' | 'check' | 'reloj'
  | 'cerrar' | 'edificio' | 'tarjeta' | 'alerta' | 'flecha' | 'usuarios' | 'dinero'
  | 'corazon' | 'mensaje' | 'basura' | 'trofeo' | 'ubicacion' | 'estrella' | 'enviar';

/**
 * Íconos de línea de la app (24x24). Van dibujados en la plantilla, no con [innerHTML],
 * así Angular no los filtra y heredan el color del texto (currentColor).
 */
@Component({
  selector: 'app-icono',
  standalone: true,
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (nombre) {
        @case ('buscar') { <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /> }
        @case ('calendario') { <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /> }
        @case ('panel') { <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /> }
        @case ('escudo') { <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /> }
        @case ('salir') { <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" /> }
        @case ('mas') { <path d="M12 5v14M5 12h14" /> }
        @case ('check') { <path d="m5 12 5 5 9-10" /> }
        @case ('reloj') { <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /> }
        @case ('cerrar') { <path d="M6 6l12 12M18 6 6 18" /> }
        @case ('edificio') { <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M3 21h18M8 7h4M8 11h4M8 15h4" /> }
        @case ('tarjeta') { <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /> }
        @case ('alerta') { <path d="M12 3 2 20h20L12 3ZM12 10v4M12 17h.01" /> }
        @case ('flecha') { <path d="M5 12h14m-5-5 5 5-5 5" /> }
        @case ('usuarios') { <circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-3.5-5.5" /> }
        @case ('dinero') { <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /> }
        @case ('corazon') { <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /> }
        @case ('mensaje') { <path d="M4 5h16v11H9l-5 4V5Z" /> }
        @case ('basura') { <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /> }
        @case ('trofeo') { <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8" /> }
        @case ('ubicacion') { <path d="M12 21s-6-5.4-6-11a6 6 0 0 1 12 0c0 5.6-6 11-6 11Z" /><circle cx="12" cy="10" r="2.2" /> }
        @case ('estrella') { <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" /> }
        @case ('enviar') { <path d="M4 12 20 4l-6 16-3-7-7-1Z" /> }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; width: 20px; height: 20px; flex: none; }
    svg { width: 100%; height: 100%; }
  `,
})
export class IconoComponent {
  @Input({ required: true }) nombre!: NombreIcono;
}
