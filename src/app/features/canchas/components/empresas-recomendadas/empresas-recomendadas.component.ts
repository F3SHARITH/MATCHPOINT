import { Component, computed, inject } from '@angular/core';
import { PlataformaService } from '../../../../core/plataforma/plataforma.service';
import { CanchasService } from '../../services/canchas.service';

/**
 * Fila de empresas mejor calificadas (calculado de sus canchas). Tocar una filtra el grid por esa empresa.
 * Es parte de las ventajas de pagar la mensualidad: más visibilidad para la empresa.
 */
@Component({
  selector: 'app-empresas-recomendadas',
  standalone: true,
  templateUrl: './empresas-recomendadas.component.html',
  styleUrl: './empresas-recomendadas.component.scss',
})
export class EmpresasRecomendadasComponent {
  private readonly canchasService = inject(CanchasService);
  private readonly plataforma = inject(PlataformaService);

  readonly empresas = computed(() =>
    Object.values(this.canchasService.empresas())
      .filter(empresa => !this.plataforma.estaSuspendida(empresa.id))
      .map(empresa => {
        const canchas = this.canchasService.canchasDeEmpresa(empresa.id);
        const resenas = canchas.reduce((total, c) => total + c.numResenas, 0);
        const calificacion = resenas ? canchas.reduce((total, c) => total + c.calificacion * c.numResenas, 0) / resenas : 0;
        return {
          id: empresa.id,
          nombre: empresa.nombre,
          iniciales: empresa.nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase(),
          color: canchas[0] ? this.canchasService.deporte(canchas[0].deporteId).hex : 'var(--brand)',
          canchas: canchas.length,
          resenas,
          calificacion,
        };
      })
      .filter(empresa => empresa.canchas > 0)
      .sort((a, b) => b.calificacion - a.calificacion)
      .slice(0, 6),
  );

  ver(nombre: string): void {
    this.canchasService.setQuery(nombre);
  }
}
