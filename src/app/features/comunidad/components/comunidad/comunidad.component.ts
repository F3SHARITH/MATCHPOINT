import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconoComponent } from '../../../../shared/icono/icono.component';
import { etiquetaDia, horaTexto } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { DeporteId } from '../../../canchas/models/deporte.model';
import { ComunidadService } from '../../services/comunidad.service';
import { Publicacion, TipoPublicacion, cuposLibres } from '../../models/publicacion.model';
import { NuevaPublicacionComponent } from '../nueva-publicacion/nueva-publicacion.component';
import { TarjetaPublicacionComponent } from '../tarjeta-publicacion/tarjeta-publicacion.component';

type Filtro = 'todas' | TipoPublicacion;

/** Muro de la comunidad: publicar, filtrar y ver qué partidos necesitan gente ahora. */
@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [IconoComponent, NuevaPublicacionComponent, TarjetaPublicacionComponent],
  templateUrl: './comunidad.component.html',
  styleUrl: './comunidad.component.scss',
})
export class ComunidadComponent {
  readonly comunidad = inject(ComunidadService);
  readonly canchasService = inject(CanchasService);

  /** Viene de "Buscar jugadores" en Mis reservas: /comunidad?reserva=r-123 */
  readonly reservaInicial = inject(ActivatedRoute).snapshot.queryParamMap.get('reserva');

  readonly filtro = signal<Filtro>('todas');
  readonly deporte = signal<DeporteId | null>(null);

  readonly filtros: { id: Filtro; texto: string }[] = [
    { id: 'todas', texto: 'Todas' },
    { id: 'faltan', texto: 'Faltan jugadores' },
    { id: 'busco-equipo', texto: 'Busco equipo' },
    { id: 'evento', texto: 'Eventos' },
  ];

  readonly lista = computed(() =>
    this.comunidad.recientes().filter(p =>
      (this.filtro() === 'todas' || p.tipo === this.filtro()) && (!this.deporte() || p.deporteId === this.deporte()),
    ),
  );

  readonly buscanAhora = computed(() => this.comunidad.buscanJugadores().slice(0, 4));

  readonly etiquetaDia = etiquetaDia;
  readonly horaTexto = horaTexto;
  readonly cuposLibres = cuposLibres;

  colorDe(publicacion: Publicacion): string {
    return publicacion.deporteId ? this.canchasService.deporte(publicacion.deporteId).hex : 'var(--brand)';
  }

  nombreCancha(publicacion: Publicacion): string {
    const canchaId = publicacion.busqueda?.partido?.canchaId;
    return canchaId ? this.canchasService.cancha(canchaId)?.nombre ?? '' : 'Sin cancha todavía';
  }

  verFaltan(): void {
    this.filtro.set('faltan');
    this.deporte.set(null);
  }
}
