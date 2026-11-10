import { Component, Input, computed, inject, signal } from '@angular/core';
import { ReservasService } from '../../reservas/services/reservas.service';

interface FilaRanking {
  equipo: string;
  ganados: number;
  jugados: number;
}

/**
 * Ranking de los retos ("el que pierde paga") jugados en las canchas de la empresa.
 * Engancha a los equipos a volver y es la base para armar torneos.
 */
@Component({
  selector: 'app-ranking-retos',
  standalone: true,
  templateUrl: './ranking-retos.component.html',
  styleUrl: './ranking-retos.component.scss',
})
export class RankingRetosComponent {
  private readonly reservasService = inject(ReservasService);

  private readonly ids = signal<string[]>([]);
  @Input({ required: true }) set canchaIds(valor: string[]) {
    this.ids.set(valor);
  }

  private readonly retosJugados = computed(() =>
    this.reservasService
      .reservas()
      .filter(r => this.ids().includes(r.canchaId) && r.reto?.ganador)
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora - a.hora),
  );

  readonly ranking = computed(() => {
    const tabla = new Map<string, FilaRanking>();
    const sumar = (equipo: string, gano: boolean) => {
      const fila = tabla.get(equipo) ?? { equipo, ganados: 0, jugados: 0 };
      fila.jugados++;
      if (gano) fila.ganados++;
      tabla.set(equipo, fila);
    };
    for (const { reto } of this.retosJugados()) {
      if (!reto) continue;
      sumar(reto.equipoA, reto.ganador === 'A');
      sumar(reto.equipoB, reto.ganador === 'B');
    }
    return [...tabla.values()].sort((a, b) => b.ganados - a.ganados || a.jugados - b.jugados).slice(0, 5);
  });

  readonly ultimo = computed(() => {
    const reto = this.retosJugados()[0]?.reto;
    if (!reto) return '';
    if (reto.ganador === 'empate') return `${reto.equipoA} y ${reto.equipoB} empataron`;
    const [ganador, perdedor] = reto.ganador === 'A' ? [reto.equipoA, reto.equipoB] : [reto.equipoB, reto.equipoA];
    return `${ganador} le ganó a ${perdedor} (y ${perdedor} pagó la cancha)`;
  });
}
