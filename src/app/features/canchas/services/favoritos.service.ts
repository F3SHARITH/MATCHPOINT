import { Injectable, computed, inject, signal } from '@angular/core';
import { SesionService } from '../../../core/sesion/sesion.service';

/** Canchas favoritas de cada usuario: cada quien ve solo las suyas. */
@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly sesion = inject(SesionService);
  private readonly porUsuario = signal<Record<string, string[]>>({});

  readonly mias = computed(() => new Set(this.porUsuario()[this.sesion.usuario()?.id ?? ''] ?? []));

  toggle(canchaId: string): void {
    const usuarioId = this.sesion.usuario()?.id;
    if (!usuarioId) return;
    this.porUsuario.update(todos => {
      const actuales = todos[usuarioId] ?? [];
      const nuevas = actuales.includes(canchaId) ? actuales.filter(id => id !== canchaId) : [...actuales, canchaId];
      return { ...todos, [usuarioId]: nuevas };
    });
  }
}
