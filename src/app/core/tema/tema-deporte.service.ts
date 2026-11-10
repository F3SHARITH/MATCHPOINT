import { DOCUMENT, Injectable, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { CanchasService } from '../../features/canchas/services/canchas.service';

/**
 * Pinta toda la app con el color del deporte elegido: verde fútbol, amarillo vóley,
 * naranja baloncesto, etc. Solo escribe data-deporte en <html>; los colores viven en styles.scss.
 * Fuera de la sección de canchas (paneles de empresa y admin) vuelve al color de MatchPoint.
 */
@Injectable({ providedIn: 'root' })
export class TemaDeporteService {
  private readonly canchasService = inject(CanchasService);
  private readonly router = inject(Router);
  private readonly documento = inject(DOCUMENT);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
      map(evento => evento.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    effect(() => {
      const enCanchas = this.url().startsWith('/canchas');
      const deporte = enCanchas ? this.canchasService.sportFilter() : null;
      this.documento.documentElement.dataset['deporte'] = deporte ?? 'todos';
    });
  }
}
