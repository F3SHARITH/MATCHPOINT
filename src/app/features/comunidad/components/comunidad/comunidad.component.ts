import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconoComponent } from '../../../../shared/icono/icono.component';
import { deISO, etiquetaDia, horaTexto, hoyISO, sumarDias } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { DeporteId } from '../../../canchas/models/deporte.model';
import { ComunidadService } from '../../services/comunidad.service';
import { Publicacion, TEXTO_DIAS, TipoPublicacion, cuposLibres } from '../../models/publicacion.model';
import { InvitacionesComponent } from '../invitaciones/invitaciones.component';
import { MisPartidosComponent } from '../mis-partidos/mis-partidos.component';
import { NuevaPublicacionComponent } from '../nueva-publicacion/nueva-publicacion.component';
import { TarjetaPublicacionComponent } from '../tarjeta-publicacion/tarjeta-publicacion.component';

type Filtro = 'todas' | TipoPublicacion;
type Cuando = 'cualquiera' | 'hoy' | 'manana' | 'finde';

/** Muro de la comunidad: publicar, filtrar, responder invitaciones y ver quién busca o quiere jugar. */
@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [IconoComponent, InvitacionesComponent, MisPartidosComponent, NuevaPublicacionComponent, TarjetaPublicacionComponent],
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
  readonly cuando = signal<Cuando>('cualquiera');

  readonly filtros: { id: Filtro; texto: string }[] = [
    { id: 'todas', texto: 'Todas' },
    { id: 'faltan', texto: 'Faltan jugadores' },
    { id: 'busco-equipo', texto: 'Quieren jugar' },
    { id: 'evento', texto: 'Eventos' },
  ];

  readonly opcionesCuando: { id: Cuando; texto: string }[] = [
    { id: 'cualquiera', texto: 'Cualquier día' },
    { id: 'hoy', texto: 'Hoy' },
    { id: 'manana', texto: 'Mañana' },
    { id: 'finde', texto: 'Fin de semana' },
  ];

  readonly lista = computed(() =>
    this.comunidad.recientes().filter(p =>
      (this.filtro() === 'todas' || p.tipo === this.filtro()) &&
      (!this.deporte() || p.deporteId === this.deporte()) &&
      this.coincideCuando(p),
    ),
  );

  readonly buscanAhora = computed(() => this.comunidad.buscanJugadores().filter(p => !this.comunidad.esMia(p)).slice(0, 4));
  readonly quierenAhora = computed(() => this.comunidad.quierenJugar().slice(0, 3));

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

  iniciales(nombre: string): string {
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  detalleQuiere(publicacion: Publicacion): string {
    const disponible = publicacion.disponibilidad;
    const deporte = publicacion.deporteId ? this.canchasService.deporte(publicacion.deporteId).nombre : '';
    return [deporte, disponible?.posicion, disponible && TEXTO_DIAS[disponible.dias]].filter(Boolean).join(' · ');
  }

  verTipo(tipo: Filtro): void {
    this.filtro.set(tipo);
    this.deporte.set(null);
  }

  /** El filtro de día solo existe en "Faltan jugadores": las demás publicaciones no tienen fecha. */
  private coincideCuando(publicacion: Publicacion): boolean {
    const fecha = publicacion.busqueda?.partido.fecha;
    if (this.filtro() !== 'faltan' || this.cuando() === 'cualquiera' || !fecha) return true;
    const hoy = hoyISO();
    switch (this.cuando()) {
      case 'hoy': return fecha === hoy;
      case 'manana': return fecha === sumarDias(hoy, 1);
      default: return [0, 6].includes(deISO(fecha).getDay());
    }
  }
}
