import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgSeguroPipe } from '../../../../shared/pipes/svg-seguro.pipe';
import { CanchasService } from '../../services/canchas.service';
import { DeporteId } from '../../models/deporte.model';
import { ICONOS_DEPORTE, ICONO_TODOS } from '../../data/iconos-deporte';

/** Chips de deporte, cada uno con su ícono y su color. Filtra en un solo clic (y cambia el color de la app). */
@Component({
  selector: 'app-filtro-deportes',
  standalone: true,
  imports: [CommonModule, SvgSeguroPipe],
  templateUrl: './filtro-deportes.component.html',
  styleUrl: './filtro-deportes.component.scss',
})
export class FiltroDeportesComponent {
  readonly canchasService = inject(CanchasService);

  readonly iconos = ICONOS_DEPORTE;
  readonly iconoTodos = ICONO_TODOS;

  seleccionar(id: DeporteId | null): void {
    this.canchasService.setSportFilter(id);
  }
}
