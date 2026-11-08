import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SesionService } from '../../../../core/sesion/sesion.service';
import { CanchasService } from '../../services/canchas.service';
import { FavoritosService } from '../../services/favoritos.service';
import { Cancha } from '../../models/cancha.model';
import { FiltroDeportesComponent } from '../filtro-deportes/filtro-deportes.component';
import { BuscadorCanchasComponent } from '../buscador-canchas/buscador-canchas.component';
import { TarjetaCanchaComponent } from '../tarjeta-cancha/tarjeta-cancha.component';
import { BannerCategoriaComponent } from '../banner-categoria/banner-categoria.component';
import { EmpresasRecomendadasComponent } from '../empresas-recomendadas/empresas-recomendadas.component';
import { LateralJugadorComponent } from '../lateral-jugador/lateral-jugador.component';
import { ReservaRapidaComponent } from '../../../reservas/components/reserva-rapida/reserva-rapida.component';
import { IconoComponent } from '../../../../shared/icono/icono.component';

/**
 * Pantalla de Exploración de Canchas: portada, buscador con filtros, deportes, el grid de
 * resultados y empresas recomendadas. Al jugador además le muestra su columna (reservas y comunidad).
 */
@Component({
  selector: 'app-exploracion-canchas',
  standalone: true,
  imports: [
    CommonModule,
    FiltroDeportesComponent,
    BuscadorCanchasComponent,
    TarjetaCanchaComponent,
    BannerCategoriaComponent,
    EmpresasRecomendadasComponent,
    LateralJugadorComponent,
    ReservaRapidaComponent,
    IconoComponent,
  ],
  templateUrl: './exploracion-canchas.component.html',
  styleUrl: './exploracion-canchas.component.scss',
})
export class ExploracionCanchasComponent {
  readonly canchasService = inject(CanchasService);
  readonly sesion = inject(SesionService);
  private readonly favoritos = inject(FavoritosService);
  private readonly router = inject(Router);

  readonly rol = computed(() => this.sesion.rol() ?? 'usuario');

  readonly tituloGrid = computed(() => {
    const deporte = this.canchasService.sportFilter();
    return deporte ? `Canchas de ${this.canchasService.deporte(deporte).nombre}` : 'Canchas destacadas';
  });

  /** Cancha elegida para reservar; mientras tenga valor, el panel de reserva está abierto. */
  readonly canchaAReservar = signal<Cancha | null>(null);

  toggleFavorita(id: string): void {
    this.favoritos.toggle(id);
  }

  esFavorita(id: string): boolean {
    return this.favoritos.mias().has(id);
  }

  reservar(id: string): void {
    this.canchaAReservar.set(this.canchasService.cancha(id) ?? null);
  }

  gestionar(): void {
    this.router.navigateByUrl('/empresa');
  }
}
