import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SesionService } from '../../../../core/sesion/sesion.service';
import { SvgSeguroPipe } from '../../../../shared/pipes/svg-seguro.pipe';
import { CanchasService } from '../../services/canchas.service';
import { Deporte } from '../../models/deporte.model';
import { ICONOS_DEPORTE, ICONO_TODOS } from '../../data/iconos-deporte';
import { ICONOS_CARACTERISTICA } from '../../data/iconos-caracteristica';

/**
 * Portada de la exploración: título grande, foto del deporte que se funde con el fondo,
 * estadísticas reales (calculadas del propio dataset) y las ventajas en una franja abajo.
 * Todo se pinta con el color del deporte elegido.
 */
@Component({
  selector: 'app-banner-categoria',
  standalone: true,
  imports: [CommonModule, SvgSeguroPipe],
  templateUrl: './banner-categoria.component.html',
  styleUrl: './banner-categoria.component.scss',
})
export class BannerCategoriaComponent {
  readonly canchasService = inject(CanchasService);
  private readonly sesion = inject(SesionService);

  /** Solo al jugador se le saluda por su nombre; empresa y admin ven esta pantalla como vista previa. */
  readonly primerNombre = computed(() =>
    this.sesion.rol() === 'usuario' ? this.sesion.usuario()?.nombre.split(' ')[0] ?? '' : '',
  );

  get deporteActivo(): Deporte | null {
    const id = this.canchasService.sportFilter();
    return id ? this.canchasService.deporte(id) : null;
  }

  get iconoDeporte(): string {
    const id = this.canchasService.sportFilter();
    return id ? ICONOS_DEPORTE[id] : ICONO_TODOS;
  }

  iconoCaracteristica(clave: string): string {
    return ICONOS_CARACTERISTICA[clave] ?? '';
  }
}
