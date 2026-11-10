import { Injectable, computed, inject, signal } from '@angular/core';
import { SesionService } from '../../../core/sesion/sesion.service';
import { DeporteId } from '../../canchas/models/deporte.model';
import { CanchasService } from '../../canchas/services/canchas.service';
import { ReservasService } from '../../reservas/services/reservas.service';
import { Busqueda, Publicacion, TipoPublicacion, cuposLibres } from '../models/publicacion.model';
import { publicacionesIniciales } from '../data/publicaciones.mock';

export interface NuevaPublicacion {
  tipo: TipoPublicacion;
  texto: string;
  deporteId?: DeporteId;
  busqueda?: Busqueda;
}

/**
 * Muro de la comunidad: "nos faltan 2", "busco equipo", eventos de las empresas.
 * Con backend: GET/POST /api/publicaciones, POST /api/publicaciones/:id/apuntados, .../comentarios.
 */
@Injectable({ providedIn: 'root' })
export class ComunidadService {
  private readonly sesion = inject(SesionService);
  private readonly reservasService = inject(ReservasService);
  private readonly canchasService = inject(CanchasService);

  readonly publicaciones = signal<Publicacion[]>(publicacionesIniciales());

  readonly recientes = computed(() => [...this.publicaciones()].sort((a, b) => b.creado - a.creado));

  /** Partidos que todavía necesitan gente y no se han jugado. */
  readonly buscanJugadores = computed(() =>
    this.recientes().filter(p => {
      const partido = p.busqueda?.partido;
      return cuposLibres(p) > 0 && (!partido || !this.reservasService.yaPaso(partido));
    }),
  );

  private get yo() {
    const usuario = this.sesion.usuario();
    return { id: usuario?.id ?? 'anonimo', nombre: usuario?.nombre ?? 'Alguien' };
  }

  publicar(datos: NuevaPublicacion): Publicacion {
    const usuario = this.sesion.usuario();
    const esEmpresa = usuario?.rol === 'empresa';
    const publicacion: Publicacion = {
      ...datos,
      id: `p-${Date.now()}`,
      autorId: this.yo.id,
      // Las empresas publican con su nombre comercial, no con el de la persona.
      autor: esEmpresa && usuario?.empresaId ? this.canchasService.empresaNombre(usuario.empresaId) : this.yo.nombre,
      rolAutor: usuario?.rol ?? 'usuario',
      creado: Date.now(),
      apuntados: [],
      meGusta: [],
      comentarios: [],
    };
    this.publicaciones.update(lista => [publicacion, ...lista]);
    return publicacion;
  }

  esMia(publicacion: Publicacion): boolean {
    return publicacion.autorId === this.yo.id;
  }

  estoyApuntado(publicacion: Publicacion): boolean {
    return publicacion.apuntados.some(a => a.usuarioId === this.yo.id);
  }

  meGustaMio(publicacion: Publicacion): boolean {
    return publicacion.meGusta.includes(this.yo.id);
  }

  toggleMeGusta(id: string): void {
    const yo = this.yo.id;
    this.actualizar(id, p => ({
      ...p,
      meGusta: p.meGusta.includes(yo) ? p.meGusta.filter(u => u !== yo) : [...p.meGusta, yo],
    }));
  }

  /** "Me apunto": toma un cupo y, si el partido viene de una reserva con vaca, entra a la vaca. */
  apuntarme(id: string): void {
    const publicacion = this.publicaciones().find(p => p.id === id);
    if (!publicacion || cuposLibres(publicacion) === 0 || this.estoyApuntado(publicacion)) return;
    const { id: usuarioId, nombre } = this.yo;
    this.actualizar(id, p => ({ ...p, apuntados: [...p.apuntados, { usuarioId, nombre }] }));

    const reservaId = publicacion.busqueda?.partido?.reservaId;
    if (reservaId) this.reservasService.sumarJugadorVaca(reservaId, nombre);
  }

  salirme(id: string): void {
    const publicacion = this.publicaciones().find(p => p.id === id);
    if (!publicacion) return;
    const { id: usuarioId, nombre } = this.yo;
    this.actualizar(id, p => ({ ...p, apuntados: p.apuntados.filter(a => a.usuarioId !== usuarioId) }));

    const reservaId = publicacion.busqueda?.partido?.reservaId;
    if (reservaId) this.reservasService.quitarJugadorVaca(reservaId, nombre);
  }

  comentar(id: string, texto: string): void {
    if (!texto.trim()) return;
    const comentario = { autor: this.yo.nombre, texto: texto.trim(), creado: Date.now() };
    this.actualizar(id, p => ({ ...p, comentarios: [...p.comentarios, comentario] }));
  }

  /** Lo puede borrar su autor o el administrador (moderación). */
  eliminar(id: string): void {
    this.publicaciones.update(lista => lista.filter(p => p.id !== id));
  }

  private actualizar(id: string, cambio: (publicacion: Publicacion) => Publicacion): void {
    this.publicaciones.update(lista => lista.map(p => (p.id === id ? cambio(p) : p)));
  }
}
