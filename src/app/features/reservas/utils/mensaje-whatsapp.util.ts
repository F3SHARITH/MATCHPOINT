import { etiquetaDia, fechaCorta, horaTexto } from '../../../shared/utils/fechas.util';
import { Cancha } from '../../canchas/models/cancha.model';
import { Reserva, cuotaVaca, saldoDe } from '../models/reserva.model';

function pesos(valor: number): string {
  return '$' + valor.toLocaleString('es-CO');
}

/** Mensaje listo para pegar en el grupo del equipo: cuándo, dónde, código y cuánto pone cada uno. */
export function mensajeParaElGrupo(reserva: Reserva, cancha: Cancha, nombreDeporte: string, nombreEmpresa: string): string {
  const lineas = [
    reserva.reto ? `🏆 Reto: ${reserva.reto.equipoA} vs ${reserva.reto.equipoB}` : `📣 ¡Hay partido de ${nombreDeporte}!`,
    `📍 ${cancha.nombre} · ${nombreEmpresa} (${cancha.zona})`,
    `🗓️ ${etiquetaDia(reserva.fecha)} ${fechaCorta(reserva.fecha)} · ${horaTexto(reserva.hora)}`,
    `🔑 Código: ${reserva.codigo}`,
  ];

  if (reserva.modalidad === 'vaca') {
    lineas.push(`💰 Somos ${reserva.vaca?.length}: ${pesos(cuotaVaca(reserva))} cada uno. Pásame tu parte por Nequi o tráela en efectivo.`);
  } else if (reserva.modalidad === 'reto') {
    lineas.push(`💰 El que pierde paga la cancha: ${pesos(saldoDe(reserva))} en la cancha.`);
  } else {
    lineas.push(`💰 Cancha: ${pesos(reserva.precio)}`);
  }
  return lineas.join('\n');
}

/** Abre WhatsApp (app o web) con el mensaje escrito, para elegir a quién enviarlo. */
export function linkWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
