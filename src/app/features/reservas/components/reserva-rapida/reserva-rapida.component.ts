import { Component, EventEmitter, HostListener, Input, Output, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PlataformaService } from '../../../../core/plataforma/plataforma.service';
import { MetodoPagoId } from '../../../../core/plataforma/plataforma.model';
import { IconoComponent } from '../../../../shared/icono/icono.component';
import { diaDelMes, etiquetaDia, horaTexto, hoyISO, proximosDias } from '../../../../shared/utils/fechas.util';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { Cancha } from '../../../canchas/models/cancha.model';
import { ReservasService } from '../../services/reservas.service';
import {
  HORAS_DEL_DIA, JUGADORES_POR_DEPORTE, ModalidadPago, RESERVAS_PARA_CONFIANZA, Reserva,
} from '../../models/reserva.model';
import { ConfirmacionReservaComponent } from '../confirmacion-reserva/confirmacion-reserva.component';

type EstadoHorario = 'libre' | 'ocupada' | 'pasada';

const FRANJAS = [
  { nombre: 'Mañana', desde: 6, hasta: 11 },
  { nombre: 'Tarde', desde: 12, hasta: 17 },
  { nombre: 'Noche', desde: 18, hasta: 22 },
];

/**
 * Reserva en 4 pasos, todos visibles a la vez: día → hora → quién paga → cómo paga.
 * Se abre como panel lateral en computador y como hoja desde abajo en celular,
 * pintado con el color del deporte de la cancha.
 */
@Component({
  selector: 'app-reserva-rapida',
  standalone: true,
  imports: [CurrencyPipe, IconoComponent, ConfirmacionReservaComponent],
  templateUrl: './reserva-rapida.component.html',
  styleUrl: './reserva-rapida.component.scss',
})
export class ReservaRapidaComponent {
  @Input({ required: true }) cancha!: Cancha;
  @Output() cerrar = new EventEmitter<void>();

  private readonly reservasService = inject(ReservasService);
  private readonly canchasService = inject(CanchasService);
  private readonly plataforma = inject(PlataformaService);

  readonly dias = proximosDias(7);
  readonly fecha = signal(hoyISO());
  readonly hora = signal<number | null>(null);
  readonly modalidad = signal<ModalidadPago>('organizador');
  private readonly jugadoresElegidos = signal<number | null>(null);
  readonly equipoPropio = signal('');
  readonly equipoRival = signal('');
  readonly metodoElegido = signal<MetodoPagoId | null>(null);
  readonly reservaHecha = signal<Reserva | null>(null);

  readonly confianza = this.reservasService.miConfianza;
  readonly reservasParaConfianza = RESERVAS_PARA_CONFIANZA;

  readonly etiquetaDia = etiquetaDia;
  readonly diaDelMes = diaDelMes;
  readonly horaTexto = horaTexto;

  readonly modalidades: { id: ModalidadPago; titulo: string; detalle: string }[] = [
    { id: 'organizador', titulo: 'Pago yo', detalle: 'Una persona paga todo' },
    { id: 'vaca', titulo: 'Hacemos la vaca', detalle: 'Dividimos entre todos' },
    { id: 'reto', titulo: 'El que pierde paga', detalle: 'Reto entre equipos' },
  ];

  readonly franjas = computed(() => {
    const ocupadas = this.reservasService.horasOcupadas(this.cancha.id, this.fecha());
    return FRANJAS.map(franja => ({
      nombre: franja.nombre,
      horas: HORAS_DEL_DIA.filter(h => h >= franja.desde && h <= franja.hasta).map(hora => ({
        hora,
        estado: (ocupadas.has(hora)
          ? 'ocupada'
          : this.reservasService.yaPaso({ fecha: this.fecha(), hora })
            ? 'pasada'
            : 'libre') as EstadoHorario,
      })),
    }));
  });

  readonly horasLibres = computed(() =>
    this.franjas().reduce((total, f) => total + f.horas.filter(h => h.estado === 'libre').length, 0),
  );

  readonly jugadores = computed(() => this.jugadoresElegidos() ?? JUGADORES_POR_DEPORTE[this.cancha.deporteId]);
  readonly cuota = computed(() => Math.ceil(this.cancha.precioHora / this.jugadores() / 100) * 100);

  readonly anticipo = computed(() => {
    const hora = this.hora();
    return hora === null ? { monto: 0, razon: '' } : this.reservasService.anticipoPara(this.cancha, hora);
  });

  /** Si la hora pide anticipo, solo sirven los pagos en línea; si no, también efectivo en la cancha. */
  readonly metodos = computed(() => {
    const activos = this.plataforma.metodosActivos();
    return this.anticipo().monto > 0 ? activos.filter(m => m.id !== 'en-cancha') : activos;
  });

  readonly metodo = computed(() => {
    const disponibles = this.metodos();
    return disponibles.find(m => m.id === this.metodoElegido())?.id ?? disponibles[0]?.id ?? null;
  });

  /** Lo que se paga ahora en línea: el anticipo si lo piden, todo si eligió pagar en línea, o nada. */
  readonly pagaAhora = computed(() => {
    const metodo = this.metodo();
    if (!metodo || metodo === 'en-cancha') return 0;
    return this.anticipo().monto || this.cancha.precioHora;
  });

  readonly faltaParaConfirmar = computed(() => {
    if (this.hora() === null) return 'Elige una hora para continuar';
    if (this.modalidad() === 'reto' && (!this.equipoPropio().trim() || !this.equipoRival().trim())) {
      return 'Escribe el nombre de los dos equipos';
    }
    if (!this.metodo()) return 'No hay métodos de pago activos';
    return '';
  });

  get deporte() {
    return this.canchasService.deporte(this.cancha.deporteId);
  }

  get nombreEmpresa(): string {
    return this.canchasService.empresaNombre(this.cancha.empresaId);
  }

  elegirDia(fecha: string): void {
    this.fecha.set(fecha);
    this.hora.set(null);
  }

  cambiarJugadores(cambio: number): void {
    this.jugadoresElegidos.set(Math.min(22, Math.max(2, this.jugadores() + cambio)));
  }

  confirmar(): void {
    const hora = this.hora();
    const metodo = this.metodo();
    if (hora === null || !metodo || this.faltaParaConfirmar()) return;

    const reserva = this.reservasService.crear({
      canchaId: this.cancha.id,
      fecha: this.fecha(),
      hora,
      precio: this.cancha.precioHora,
      metodoPago: metodo,
      pagaAhora: this.pagaAhora(),
      esAnticipo: this.anticipo().monto > 0,
      modalidad: this.modalidad(),
      jugadores: this.jugadores(),
      equipos: { propio: this.equipoPropio().trim(), rival: this.equipoRival().trim() },
    });
    this.reservaHecha.set(reserva);
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.cerrar.emit();
  }
}
