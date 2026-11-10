import { Injectable, computed, inject, signal } from '@angular/core';
import { SesionService } from '../../../core/sesion/sesion.service';
import { DeporteId } from '../../canchas/models/deporte.model';
import { CanchasService } from '../../canchas/services/canchas.service';
import { ReservasService } from '../../reservas/services/reservas.service';
import { Reserva, cuotaPorJugador } from '../../reservas/models/reserva.model';
import { linkWhatsApp } from '../../reservas/utils/mensaje-whatsapp.util';
import { fechaCorta, horaTexto } from '../../../shared/utils/fechas.util';
import {
  Busqueda, Disponibilidad, EstadoInvitacion, Invitacion, MiPartido, Partido, Publicacion, TipoPublicacion, cuposLibres,
} from '../models/publicacion.model';
import { invitacionesIniciales, publicacionesIniciales } from '../data/publicaciones.mock';

export interface NuevaPublicacion {
  tipo: TipoPublicacion;
  texto: string;
  deporteId?: DeporteId;
  busqueda?: Busqueda;
  disponibilidad?: Disponibilidad;
}

/**
 * Muro de la comunidad: "nos faltan 2", "quiero jugar", eventos de las empresas.
 * Con backend: GET/POST /api/publicaciones, POST /api/publicaciones/:id/apuntados, .../comentarios,
 * GET/POST /api/invitaciones, PATCH /api/invitaciones/:id.
 */
@Injectable({ providedIn: 'root' })
export class ComunidadService {
  private readonly sesion = inject(SesionService);
  private readonly reservasService = inject(ReservasService);
  private readonly canchasService = inject(CanchasService);

  readonly publicaciones = signal<Publicacion[]>(publicacionesIniciales());
  private readonly invitaciones = signal<Invitacion[]>(invitacionesIniciales());

  readonly recientes = computed(() => [...this.publicaciones()].sort((a, b) => b.creado - a.creado));

  /** Partidos que todavía necesitan gente y no se han jugado. */
  readonly buscanJugadores = computed(() =>
    this.recientes().filter(p => {
      const partido = p.busqueda?.partido;
      return cuposLibres(p) > 0 && (!partido || !this.reservasService.yaPaso(partido));
    }),
  );

  /** Gente suelta que espera que la inviten a un partido. */
  readonly quierenJugar = computed(() =>
    this.recientes().filter(p => p.tipo === 'busco-equipo' && !p.cerrada && !this.esMia(p)),
  );

  readonly invitacionesPendientes = computed(() =>
    this.invitaciones().filter(i => i.paraId === this.yo.id && i.estado === 'pendiente' && !this.reservasService.yaPaso(i.partido)),
  );

  /** Partidos de otros a los que voy y que todavía no se han jugado, el más cercano primero. */
  readonly misPartidos = computed<MiPartido[]>(() => {
    const yo = this.yo.id;
    const apuntados = this.publicaciones()
      .filter(p => p.busqueda && p.apuntados.some(a => a.usuarioId === yo))
      .map((p): MiPartido => ({
        id: p.id, origen: 'apuntado', organizador: p.autor, deporteId: p.deporteId, partido: p.busqueda!.partido, cuota: p.busqueda!.cuota,
      }));
    const invitado = this.invitaciones()
      .filter(i => i.paraId === yo && i.estado === 'aceptada')
      .map((i): MiPartido => ({
        id: i.id, origen: 'invitacion', organizador: i.deNombre, deporteId: i.deporteId, partido: i.partido, cuota: i.cuota,
      }));
    return [...apuntados, ...invitado]
      .filter(m => !this.reservasService.yaPaso(m.partido))
      .sort((a, b) => a.partido.fecha.localeCompare(b.partido.fecha) || a.partido.hora - b.partido.hora);
  });

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
    this.quitarApuntado(id, this.yo.id);
  }

  /** Alguien deja el partido (o el organizador lo saca): su cupo se libera y sale de la vaca. */
  quitarApuntado(id: string, usuarioId: string): void {
    const publicacion = this.publicaciones().find(p => p.id === id);
    const jugador = publicacion?.apuntados.find(a => a.usuarioId === usuarioId);
    if (!publicacion || !jugador) return;
    this.actualizar(id, p => ({ ...p, apuntados: p.apuntados.filter(a => a.usuarioId !== usuarioId) }));

    const reservaId = publicacion.busqueda?.partido.reservaId;
    if (reservaId) this.reservasService.quitarJugadorVaca(reservaId, jugador.nombre);
  }

  /** El autor avisa que ya consiguió a quién buscaba, o la reabre si se le cayó el plan. */
  alternarCerrada(id: string): void {
    this.actualizar(id, p => ({ ...p, cerrada: !p.cerrada }));
  }

  /** La invitación que ya le mandé a quien hizo esta publicación. */
  invitacionA(publicacion: Publicacion): Invitacion | undefined {
    return this.invitaciones().find(i => i.publicacionId === publicacion.id && i.deId === this.yo.id);
  }

  /** Invita a mi partido a alguien que quiere jugar. No entra hasta que acepte. */
  invitar(publicacion: Publicacion, reserva: Reserva): void {
    const deporteId = publicacion.deporteId;
    if (!deporteId || this.invitacionA(publicacion)) return;
    const invitacion: Invitacion = {
      id: `inv-${Date.now()}`,
      publicacionId: publicacion.id,
      deId: this.yo.id,
      deNombre: this.yo.nombre,
      paraId: publicacion.autorId,
      paraNombre: publicacion.autor,
      deporteId,
      partido: { canchaId: reserva.canchaId, fecha: reserva.fecha, hora: reserva.hora, reservaId: reserva.id },
      cuota: cuotaPorJugador(reserva, deporteId),
      estado: 'pendiente',
    };
    this.invitaciones.update(lista => [...lista, invitacion]);
  }

  /** Al aceptar, entra a la vaca del partido igual que si se hubiera apuntado. */
  responderInvitacion(invitacion: Invitacion, acepta: boolean): void {
    this.cambiarInvitacion(invitacion.id, acepta ? 'aceptada' : 'rechazada');
    if (acepta && invitacion.partido.reservaId) {
      this.reservasService.sumarJugadorVaca(invitacion.partido.reservaId, invitacion.paraNombre);
    }
  }

  /** Dejar un partido al que iba, sin importar cómo llegué a él. */
  salirDe(partido: MiPartido): void {
    if (partido.origen === 'apuntado') {
      this.salirme(partido.id);
      return;
    }
    this.cambiarInvitacion(partido.id, 'rechazada');
    if (partido.partido.reservaId) this.reservasService.quitarJugadorVaca(partido.partido.reservaId, this.yo.nombre);
  }

  /**
   * Abre WhatsApp con el mensaje escrito para el organizador.
   * Con backend irá directo a su celular, que solo verán quienes ya van al partido.
   */
  linkOrganizador(organizador: string, partido: Partido): string {
    const cancha = partido.canchaId ? this.canchasService.cancha(partido.canchaId)?.nombre : null;
    const lugar = cancha ? ` en ${cancha}` : '';
    const texto = `¡Hola ${organizador.split(' ')[0]}! Voy a tu partido del ${fechaCorta(partido.fecha)} a las ${horaTexto(partido.hora)}${lugar}. ¿Debo llevar algo?`;
    return linkWhatsApp(texto);
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

  private cambiarInvitacion(id: string, estado: EstadoInvitacion): void {
    this.invitaciones.update(lista => lista.map(i => (i.id === id ? { ...i, estado } : i)));
  }

  private actualizar(id: string, cambio: (publicacion: Publicacion) => Publicacion): void {
    this.publicaciones.update(lista => lista.map(p => (p.id === id ? cambio(p) : p)));
  }
}
