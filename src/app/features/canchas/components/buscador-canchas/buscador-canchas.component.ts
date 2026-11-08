import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanchasService } from '../../services/canchas.service';
import { ResultadoBusqueda } from '../../models/busqueda.model';
import { resaltar } from '../../utils/text.util';

/**
 * Buscador con autocompletado en vivo agrupado por categoría (estilo Roblox):
 * Deportes, Canchas, Empresas, Ciudad/Zona. Navegable con teclado.
 */
@Component({
  selector: 'app-buscador-canchas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buscador-canchas.component.html',
  styleUrl: './buscador-canchas.component.scss',
})
export class BuscadorCanchasComponent {
  readonly canchasService = inject(CanchasService);

  readonly texto = signal('');
  readonly panelAbierto = signal(false);
  readonly indiceActivo = signal(-1);

  private debounceId?: ReturnType<typeof setTimeout>;

  readonly grupos = computed(() => this.canchasService.buscarSugerencias(this.texto()));
  readonly planos = computed(() => this.grupos().flatMap(g => g.items));

  onInput(valor: string): void {
    this.texto.set(valor);
    this.indiceActivo.set(-1);
    clearTimeout(this.debounceId);
    this.debounceId = setTimeout(() => {
      this.canchasService.setQuery(valor);
      this.panelAbierto.set(valor.trim().length > 0);
    }, 160);
  }

  onFocus(): void {
    if (this.texto().trim().length > 0) this.panelAbierto.set(true);
  }

  /** Retraso para que el (mousedown) de un resultado se registre antes de que el input pierda foco. */
  onBlur(): void {
    setTimeout(() => this.panelAbierto.set(false), 120);
  }

  onKeydown(evento: KeyboardEvent): void {
    const total = this.planos().length;
    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      if (total) this.indiceActivo.set((this.indiceActivo() + 1) % total);
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      if (total) this.indiceActivo.set((this.indiceActivo() - 1 + total) % total);
    } else if (evento.key === 'Enter') {
      const seleccion = this.planos()[this.indiceActivo()];
      if (seleccion) this.seleccionar(seleccion);
    } else if (evento.key === 'Escape') {
      this.panelAbierto.set(false);
    }
  }

  seleccionar(resultado: ResultadoBusqueda): void {
    this.canchasService.seleccionarSugerencia(resultado);
    this.texto.set(this.canchasService.query());
    this.panelAbierto.set(false);
  }

  limpiar(): void {
    this.texto.set('');
    this.canchasService.setQuery('');
    this.panelAbierto.set(false);
  }

  resaltar(texto: string): string {
    return resaltar(texto, this.texto());
  }

  indiceDe(resultado: ResultadoBusqueda): number {
    return this.planos().indexOf(resultado);
  }
}
