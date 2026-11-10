import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionService } from '../../../../core/sesion/sesion.service';
import { etiquetaDia, horaTexto } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../services/canchas.service';
import { ReservasService } from '../../../reservas/services/reservas.service';
import { RESERVAS_PARA_CONFIANZA, Reserva, TEXTO_ESTADO_RESERVA } from '../../../reservas/models/reserva.model';
import { ComunidadService } from '../../../comunidad/services/comunidad.service';
import { Publicacion, cuposLibres } from '../../../comunidad/models/publicacion.model';

/**
 * Columna derecha de la portada del jugador: su nivel de confianza, sus próximas reservas
 * y los partidos de la comunidad que necesitan gente (con "Me apunto" directo).
 */
@Component({
  selector: 'app-lateral-jugador',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './lateral-jugador.component.html',
  styleUrl: './lateral-jugador.component.scss',
})
export class LateralJugadorComponent {
  readonly sesion = inject(SesionService);
  private readonly canchasService = inject(CanchasService);
  private readonly reservasService = inject(ReservasService);
  readonly comunidad = inject(ComunidadService);

  readonly confianza = this.reservasService.miConfianza;
  readonly pasos = Array.from({ length: RESERVAS_PARA_CONFIANZA }, (_, i) => i);
  readonly reservasParaConfianza = RESERVAS_PARA_CONFIANZA;
  readonly proximas = computed(() => this.reservasService.misProximas().slice(0, 3));
  readonly buscan = computed(() => this.comunidad.buscanJugadores().filter(p => !this.comunidad.esMia(p)).slice(0, 3));

  readonly textoEstado = TEXTO_ESTADO_RESERVA;
  readonly etiquetaDia = etiquetaDia;
  readonly horaTexto = horaTexto;
  readonly cuposLibres = cuposLibres;

  cancha(reserva: Reserva) {
    return this.canchasService.cancha(reserva.canchaId);
  }

  empresa(reserva: Reserva): string {
    const cancha = this.cancha(reserva);
    return cancha ? this.canchasService.empresaNombre(cancha.empresaId) : '';
  }

  fotoDe(reserva: Reserva): string {
    const foto = this.cancha(reserva)?.imagenUrl;
    return foto ? `url(${foto}?auto=format&fit=crop&w=160&q=60)` : 'none';
  }

  colorDe(publicacion: Publicacion): string {
    return publicacion.deporteId ? this.canchasService.deporte(publicacion.deporteId).hex : 'var(--brand)';
  }

  tituloBusqueda(publicacion: Publicacion): string {
    const deporte = publicacion.deporteId ? this.canchasService.deporte(publicacion.deporteId).nombre : 'Partido';
    const canchaId = publicacion.busqueda?.partido?.canchaId;
    const cancha = canchaId ? this.canchasService.cancha(canchaId)?.nombre : null;
    return cancha ? `${deporte} · ${cancha}` : deporte;
  }
}
