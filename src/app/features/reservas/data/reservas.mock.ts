import { MetodoPagoId, esHoraPico } from '../../../core/plataforma/plataforma.model';
import { USUARIOS_DEMO } from '../../../core/sesion/usuarios.mock';
import { hoyISO, sumarDias } from '../../../shared/utils/fechas.util';
import { CANCHAS } from '../../canchas/data/canchas.mock';
import { HORAS_DEL_DIA, JUGADORES_POR_DEPORTE, JugadorVaca, LadoReto, ModalidadPago, Reserva, saldoDe } from '../models/reserva.model';
import { aleatorioDesde, nuevoCodigo } from '../utils/codigo.util';

const CLIENTES = [
  'Juan Pérez', 'María Rodríguez', 'Andrés Silva', 'Laura Martínez', 'Santiago Rojas',
  'Daniela Torres', 'Felipe Castro', 'Camila Vargas', 'Sebastián Díaz', 'Paula Moreno',
];
const EQUIPOS = [
  'Los Pibes', 'Real Yopal', 'Atlético Casanare', 'Los Llaneros',
  'Deportivo Morichal', 'La Banda FC', 'Inter Campiña', 'Los Veteranos',
];
const EMPLEADOS = ['Carlos Gómez', 'Diana (recepción)'];
/** En la cancha casi todo entra en efectivo. */
const METODOS_EN_CANCHA: MetodoPagoId[] = ['en-cancha', 'en-cancha', 'en-cancha', 'nequi', 'bre-b'];
const METODOS_EN_LINEA: MetodoPagoId[] = ['nequi', 'bre-b', 'tarjeta'];
const ESTADOS_VACA: JugadorVaca['estado'][] = ['pago', 'debe', 'al-llegar'];

function hash(texto: string): number {
  let resultado = 0;
  for (const caracter of texto) resultado = (resultado * 31 + caracter.charCodeAt(0)) % 10007;
  return resultado;
}

/** Probabilidad (de 100) de que una hora esté reservada: las noches se llenan más. */
function probabilidad(hora: number): number {
  if (hora >= 17 && hora <= 21) return 62;
  if (hora >= 7 && hora <= 9) return 30;
  return 14;
}

function vacaDeEjemplo(organizador: string, jugadores: number, h: number, jugada: boolean): JugadorVaca[] {
  return Array.from({ length: jugadores }, (_, i): JugadorVaca => ({
    nombre: i === 0 ? organizador : `Jugador ${i + 1}`,
    estado: i === 0 || jugada ? 'pago' : ESTADOS_VACA[(h + i) % ESTADOS_VACA.length],
  }));
}

/** Cobra el saldo en la cancha como lo haría recepción. En un reto, paga el que perdió. */
function cobrarEnCancha(reserva: Reserva, h: number): void {
  const pago = {
    monto: saldoDe(reserva),
    metodo: METODOS_EN_CANCHA[h % METODOS_EN_CANCHA.length],
    registradoPor: EMPLEADOS[h % EMPLEADOS.length],
    fecha: reserva.fecha,
  };
  if (reserva.reto) {
    // Con h % 2 el ganador dependería del equipo (que sale de h % 8): siempre ganarían los mismos.
    const ganador: LadoReto = Math.floor(h / 8) % 2 === 0 ? 'A' : 'B';
    const perdedor: LadoReto = ganador === 'A' ? 'B' : 'A';
    reserva.reto = { ...reserva.reto, ganador, pagadoPor: perdedor };
    reserva.pagos.push({ ...pago, quien: perdedor === 'A' ? reserva.reto.equipoA : reserva.reto.equipoB });
  } else {
    reserva.pagos.push({ ...pago, quien: reserva.cliente });
  }
  reserva.estado = 'pagada';
}

/**
 * Reservas de ejemplo de las últimas 2 semanas y la próxima, con todos los casos:
 * efectivo, anticipos en línea, vacas, retos, apartadas, canceladas y gente que no llegó.
 * Son determinísticas (no cambian al recargar). Hoy quedan algunas sin cobrar para probar la caja.
 */
export function reservasIniciales(): Reserva[] {
  const hoy = hoyISO();
  const horaActual = new Date().getHours();
  const reservas: Reserva[] = [];

  for (const cancha of CANCHAS) {
    for (let dia = -14; dia <= 6; dia++) {
      const fecha = sumarDias(hoy, dia);
      for (const hora of HORAS_DEL_DIA) {
        const h = hash(`${cancha.id}|${dia}|${hora}`);
        if (h % 100 >= probabilidad(hora)) continue;

        const indiceCliente = h % CLIENTES.length;
        const cliente = CLIENTES[indiceCliente];
        const yaPaso = dia < 0 || (dia === 0 && hora <= horaActual);
        const metodoEnLinea = METODOS_EN_LINEA[h % METODOS_EN_LINEA.length];
        const anticipo = esHoraPico(hora) && h % 3 === 0 ? Math.round(cancha.precioHora * 0.3) : 0;
        const modalidad: ModalidadPago = h % 5 === 0 ? 'vaca' : h % 7 === 0 ? 'reto' : 'organizador';

        const reserva: Reserva = {
          id: `r-${cancha.id}-${fecha}-${hora}`,
          codigo: nuevoCodigo(aleatorioDesde(h * 37 + hora + dia * 101 + 15_000)),
          canchaId: cancha.id,
          usuarioId: `cliente-${indiceCliente}`,
          cliente,
          fecha,
          hora,
          precio: cancha.precioHora,
          metodoPago: anticipo ? metodoEnLinea : 'en-cancha',
          estado: 'confirmada',
          pagos: anticipo
            ? [{ monto: anticipo, metodo: metodoEnLinea, quien: cliente, registradoPor: 'En línea', fecha: sumarDias(fecha, -1), esAnticipo: true }]
            : [],
          modalidad,
        };
        if (modalidad === 'vaca') reserva.vaca = vacaDeEjemplo(cliente, JUGADORES_POR_DEPORTE[cancha.deporteId], h, yaPaso);
        if (modalidad === 'reto') reserva.reto = { equipoA: EQUIPOS[h % EQUIPOS.length], equipoB: EQUIPOS[(h + 3) % EQUIPOS.length] };

        const quedaSinCobrarHoy = dia === 0 && h % 4 === 0;
        if (dia < 0 && h % 11 === 0) reserva.estado = 'cancelada';
        else if (yaPaso && h % 17 === 0) reserva.estado = 'no-llego';
        else if (yaPaso && !quedaSinCobrarHoy) cobrarEnCancha(reserva, h);
        else if (!anticipo && h % 6 === 0) reserva.estado = 'apartada';

        reservas.push(reserva);
      }
    }
  }

  return [...sinChoques(reservas, reservasDeLaJugadora(hoy)), ...reservasDeLaJugadora(hoy), ...reservasDeJugadoraConfiable(hoy)];
}

/** Historial limpio de una jugadora de la comunidad, para ver cómo se muestra alguien "de confianza". */
function reservasDeJugadoraConfiable(hoy: string): Reserva[] {
  const cliente = 'Laura Martínez';
  return [-18, -17, -16].map((dia, i): Reserva => ({
    id: `r-laura-${i}`, codigo: `REZ-LM${i}QX`, canchaId: 'c11', usuarioId: 'j-laura', cliente, fecha: sumarDias(hoy, dia), hora: 7, precio: 55000,
    metodoPago: 'en-cancha', estado: 'pagada', modalidad: 'organizador',
    pagos: [{ monto: 55000, metodo: 'en-cancha', quien: cliente, registradoPor: 'Diana (recepción)', fecha: sumarDias(hoy, dia) }],
  }));
}

/** Reservas de la cuenta demo del rol jugador: una vaca, un reto pendiente y un reto ya jugado. */
function reservasDeLaJugadora(hoy: string): Reserva[] {
  const { id, nombre } = USUARIOS_DEMO.usuario;
  const base = { usuarioId: id, cliente: nombre };
  return [
    {
      ...base, id: 'r-demo-1', codigo: 'REZ-V4LN7', canchaId: 'c10', fecha: sumarDias(hoy, 1), hora: 18, precio: 55000,
      metodoPago: 'nequi', estado: 'confirmada', modalidad: 'vaca',
      pagos: [{ monto: 16500, metodo: 'nequi', quien: nombre, registradoPor: 'En línea', fecha: hoy, esAnticipo: true }],
      vaca: [
        { nombre, estado: 'pago' },
        { nombre: 'Sofía', estado: 'pago' },
        { nombre: 'Laura Martínez', estado: 'debe' },
        { nombre: 'Jugador 4', estado: 'debe' },
      ],
    },
    {
      ...base, id: 'r-demo-2', codigo: 'REZ-P8DX3', canchaId: 'c18', fecha: sumarDias(hoy, 3), hora: 20, precio: 90000,
      metodoPago: 'bre-b', estado: 'confirmada', modalidad: 'reto',
      pagos: [{ monto: 27000, metodo: 'bre-b', quien: nombre, registradoPor: 'En línea', fecha: hoy, esAnticipo: true }],
      reto: { equipoA: 'Las Imparables', equipoB: 'Dúo Dinámico' },
    },
    {
      ...base, id: 'r-demo-3', codigo: 'REZ-H2QW9', canchaId: 'c1', fecha: sumarDias(hoy, -3), hora: 19, precio: 60000,
      metodoPago: 'en-cancha', estado: 'pagada', modalidad: 'reto',
      pagos: [{ monto: 60000, metodo: 'en-cancha', quien: 'Real Yopal', registradoPor: 'Diana (recepción)', fecha: sumarDias(hoy, -3) }],
      reto: { equipoA: 'Los Pibes', equipoB: 'Real Yopal', ganador: 'A', pagadoPor: 'B' },
    },
    {
      ...base, id: 'r-demo-4', codigo: 'REZ-M6TR4', canchaId: 'c14', fecha: sumarDias(hoy, -8), hora: 18, precio: 45000,
      metodoPago: 'en-cancha', estado: 'cancelada', modalidad: 'organizador', pagos: [],
    },
  ];
}

/** Quita las reservas de ejemplo que ocupen la misma cancha y hora que las de la jugadora demo. */
function sinChoques(reservas: Reserva[], propias: Reserva[]): Reserva[] {
  const ocupadas = new Set(propias.map(r => `${r.canchaId}|${r.fecha}|${r.hora}`));
  return reservas.filter(r => !ocupadas.has(`${r.canchaId}|${r.fecha}|${r.hora}`));
}
