import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rol } from '../../../../core/sesion/sesion.model';
import { Cancha } from '../../models/cancha.model';
import { CanchasService } from '../../services/canchas.service';
import { ocupacionEjemplo } from '../../utils/ocupacion.util';

/** Tarjeta de una cancha en el grid. Componente presentacional: recibe todo por @Input. */
@Component({
  selector: 'app-tarjeta-cancha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-cancha.component.html',
  styleUrl: './tarjeta-cancha.component.scss',
})
export class TarjetaCanchaComponent {
  @Input({ required: true }) cancha!: Cancha;
  @Input() modo: Rol = 'usuario';
  @Input() esFavorita = false;

  /** true si la foto de la cancha no cargó; en ese caso se muestra el degradado de respaldo. */
  imagenConError = false;

  @Output() reservar = new EventEmitter<string>();
  @Output() favorito = new EventEmitter<string>();
  @Output() gestionar = new EventEmitter<string>();

  private readonly canchasService = inject(CanchasService);

  get deporte() {
    return this.canchasService.deporte(this.cancha.deporteId);
  }

  /** Etiqueta de la foto, como en el boceto: "Mejor valorado" o "Popular". */
  get etiqueta(): string {
    if (this.cancha.calificacion >= 4.8) return 'Mejor valorado';
    if (this.cancha.numResenas >= 120) return 'Popular';
    return '';
  }

  get esPropia(): boolean {
    return this.canchasService.esPropia(this.cancha);
  }

  get nombreEmpresa(): string {
    return this.canchasService.empresaNombre(this.cancha.empresaId);
  }

  get ocupacionSemana(): number {
    return ocupacionEjemplo(this.cancha.id);
  }
}
