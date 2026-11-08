import { Injectable, computed, signal } from '@angular/core';
import { diasHasta, hoyISO, sumarDias } from '../../shared/utils/fechas.util';
import { EstadoSuscripcion, MetodoPagoId, ReglasPago, Suscripcion } from './plataforma.model';
import { METODOS_PAGO, REGLAS_PAGO_POR_DEFECTO, VALOR_MENSUALIDAD_INICIAL, suscripcionesIniciales } from './plataforma.mock';

/** Días antes del cobro en que la mensualidad se marca "por vencer". */
const DIAS_AVISO = 5;

/**
 * Reglas de la plataforma que controla el administrador: valor de la mensualidad,
 * métodos de pago habilitados y el estado de pago de cada empresa.
 */
@Injectable({ providedIn: 'root' })
export class PlataformaService {
  readonly valorMensualidad = signal(VALOR_MENSUALIDAD_INICIAL);
  readonly metodosPago = signal(METODOS_PAGO);
  readonly suscripciones = signal<Record<string, Suscripcion>>(suscripcionesIniciales());
  /** Reglas de anticipo de cada empresa; las cambia la propia empresa en su panel. */
  private readonly reglasPago = signal<Record<string, ReglasPago>>({});

  readonly metodosActivos = computed(() => this.metodosPago().filter(m => m.activo));

  /** Empresas que están pagando (al día o por vencer). */
  readonly empresasPagando = computed(
    () => Object.values(this.suscripciones()).filter(s => this.estadoDe(s) === 'al-dia' || this.estadoDe(s) === 'por-vencer').length,
  );

  readonly ingresoMensual = computed(() => this.empresasPagando() * this.valorMensualidad());

  suscripcionDe(empresaId: string): Suscripcion | undefined {
    return this.suscripciones()[empresaId];
  }

  estadoDe(suscripcion: Suscripcion | undefined): EstadoSuscripcion {
    if (!suscripcion) return 'vencida';
    if (suscripcion.suspendida) return 'suspendida';
    const dias = diasHasta(suscripcion.proximoCobro);
    if (dias < 0) return 'vencida';
    return dias <= DIAS_AVISO ? 'por-vencer' : 'al-dia';
  }

  /** Las canchas de una empresa suspendida no se muestran a los jugadores. */
  estaSuspendida(empresaId: string): boolean {
    return this.suscripcionDe(empresaId)?.suspendida ?? false;
  }

  /** Pago de la mensualidad: queda al día por 30 días más y se quita cualquier suspensión. */
  registrarPago(empresaId: string): void {
    const hoy = hoyISO();
    this.actualizar(empresaId, { ultimoPago: hoy, proximoCobro: sumarDias(hoy, 30), suspendida: false });
  }

  suspender(empresaId: string): void {
    this.actualizar(empresaId, { suspendida: true });
  }

  reactivar(empresaId: string): void {
    this.actualizar(empresaId, { suspendida: false });
  }

  setValorMensualidad(valor: number): void {
    if (valor > 0) this.valorMensualidad.set(Math.round(valor));
  }

  nombreMetodo(id: MetodoPagoId): string {
    return this.metodosPago().find(m => m.id === id)?.nombre ?? id;
  }

  reglasDe(empresaId: string): ReglasPago {
    return this.reglasPago()[empresaId] ?? REGLAS_PAGO_POR_DEFECTO;
  }

  setReglas(empresaId: string, cambios: Partial<ReglasPago>): void {
    const nuevas = { ...this.reglasDe(empresaId), ...cambios };
    this.reglasPago.update(todas => ({ ...todas, [empresaId]: nuevas }));
  }

  toggleMetodo(id: MetodoPagoId): void {
    this.metodosPago.update(lista => lista.map(m => (m.id === id ? { ...m, activo: !m.activo } : m)));
  }

  private actualizar(empresaId: string, cambios: Partial<Suscripcion>): void {
    this.suscripciones.update(todas => {
      const actual = todas[empresaId];
      return actual ? { ...todas, [empresaId]: { ...actual, ...cambios } } : todas;
    });
  }
}
