# MatchPoint

Aplicación web para **encontrar y reservar canchas deportivas**. Reúne en un solo lugar a los jugadores, a las empresas dueñas de las canchas y al administrador de la plataforma.

> **Estado:** el frontend está construido y funciona con datos de ejemplo. El backend todavía está en planeación (ver [`docs/backend-checklist.md`](docs/backend-checklist.md)).

## ¿Qué se puede hacer?

La aplicación muestra pantallas distintas según quién inicia sesión:

| Perfil | Qué puede hacer |
|---|---|
| **Jugador** | Buscar canchas por deporte, reservar una hora, ver sus reservas y participar en la comunidad |
| **Empresa** | Controlar la caja del día, cobrar reservas, definir sus reglas de pago y ver el ranking de retos |
| **Administrador** | Supervisar la plataforma y moderar la comunidad |

Algunos detalles que la hacen diferente:

- **La vaca:** el organizador de un partido lleva la cuenta de cuánto pone cada amigo y quién ya pagó.
- **Mensajes por WhatsApp:** genera el texto de la reserva para compartirlo.
- **Color según el deporte:** la aplicación cambia de color con el deporte elegido, por ejemplo verde para fútbol o naranja para baloncesto.
- **Anticipos:** cada empresa decide si cobra un anticipo, por ejemplo solo en horas pico.

## Herramientas

| Herramienta | Para qué se usa |
|---|---|
| [Angular 22](https://angular.dev/) | Construir la interfaz y organizar las pantallas |
| [TypeScript](https://www.typescriptlang.org/) | Lenguaje del proyecto: JavaScript con tipos que ayudan a evitar errores |
| SCSS | Estilos visuales |
| [RxJS](https://rxjs.dev/) | Manejar datos y eventos que cambian con el tiempo |
| [Vitest](https://vitest.dev/) | Pruebas automáticas |
| [Prettier](https://prettier.io/) | Mantener el código con un formato uniforme |

## Cómo está organizado

```text
src/app/
├── core/        → Sesión de usuario, permisos por perfil y datos de la plataforma
├── features/    → Las secciones de la aplicación
│   ├── canchas/    → Buscar y explorar canchas
│   ├── reservas/   → Reservar, confirmar, mis reservas y la vaca
│   ├── comunidad/  → Publicaciones entre jugadores y empresas
│   ├── empresa/    → Panel de la empresa
│   ├── admin/      → Panel del administrador
│   └── entrar/     → Inicio de sesión
├── layout/      → Marco común de las pantallas
└── shared/      → Piezas reutilizables
```

## Cómo ejecutarlo

Necesitas tener instalado [Node.js](https://nodejs.org/).

```bash
npm install
npm start
```

Después abre <http://localhost:4200> en el navegador.

Para ejecutar las pruebas:

```bash
npm test
```
