import { Component, Input, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SesionService } from '../../../../core/sesion/sesion.service';
import { IconoComponent } from '../../../../shared/icono/icono.component';
import { etiquetaDia, fechaCorta, haceCuanto, horaTexto } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { ReservasService } from '../../../reservas/services/reservas.service';
import { ComunidadService } from '../../services/comunidad.service';
import { Publicacion, TEXTO_NIVEL, TEXTO_TIPO, cuposLibres } from '../../models/publicacion.model';

/** Una publicación del muro: quién, qué busca, el partido (si hay) y los botones para participar. */
@Component({
  selector: 'app-tarjeta-publicacion',
  standalone: true,
  imports: [CurrencyPipe, IconoComponent],
  templateUrl: './tarjeta-publicacion.component.html',
  styleUrl: './tarjeta-publicacion.component.scss',
})
export class TarjetaPublicacionComponent {
  @Input({ required: true }) publicacion!: Publicacion;

  readonly comunidad = inject(ComunidadService);
  private readonly sesion = inject(SesionService);
  private readonly canchasService = inject(CanchasService);
  private readonly reservasService = inject(ReservasService);

  readonly comentariosAbiertos = signal(false);
  readonly nuevoComentario = signal('');

  readonly textoTipo = TEXTO_TIPO;
  readonly textoNivel = TEXTO_NIVEL;
  readonly haceCuanto = haceCuanto;
  readonly etiquetaDia = etiquetaDia;
  readonly fechaCorta = fechaCorta;
  readonly horaTexto = horaTexto;

  get deporte() {
    const id = this.publicacion.deporteId;
    return id ? this.canchasService.deporte(id) : null;
  }

  get iniciales(): string {
    return this.publicacion.autor.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  get cupos(): number {
    return cuposLibres(this.publicacion);
  }

  /** Un círculo por cada cupo que buscaban: lleno si alguien ya lo tomó. */
  get cuposDibujo(): number[] {
    return Array.from({ length: this.publicacion.busqueda?.faltan ?? 0 }, (_, i) => i);
  }

  get yaSeJugo(): boolean {
    const partido = this.publicacion.busqueda?.partido;
    return !!partido && this.reservasService.yaPaso(partido);
  }

  get puedeBorrar(): boolean {
    return this.comunidad.esMia(this.publicacion) || this.sesion.rol() === 'admin';
  }

  nombreCancha(canchaId: string): string {
    const cancha = this.canchasService.cancha(canchaId);
    return cancha ? `${cancha.nombre} · ${this.canchasService.empresaNombre(cancha.empresaId)} · ${cancha.zona}` : '';
  }

  nombresApuntados(): string {
    return this.publicacion.apuntados.map(a => a.nombre.split(' ')[0]).join(', ');
  }

  /** "Responder" o "Me interesa": abre los comentarios, con un mensaje sugerido en los eventos. */
  responder(): void {
    if (this.publicacion.tipo === 'evento' && !this.nuevoComentario()) {
      this.nuevoComentario.set('¡Me interesa! ¿Cómo me inscribo?');
    }
    this.comentariosAbiertos.set(true);
  }

  comentar(): void {
    this.comunidad.comentar(this.publicacion.id, this.nuevoComentario());
    this.nuevoComentario.set('');
  }
}
