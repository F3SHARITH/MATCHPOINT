# Checklist del backend · MatchPoint

> Creado el 1 nov 2026. Marquen `[x]` a medida que terminen cada punto.
> **(piloto)** = lo mínimo para arrancar con Tercer Tiempo. **(después)** = puede esperar.

---

## Stack recomendado

| Pieza | Recomendación | Por qué |
|---|---|---|
| Framework | **NestJS** (TypeScript) | Es el mismo lenguaje del frontend y se organiza como Angular (módulos, servicios, inyección de dependencias, decoradores). Todo el equipo lo puede leer. |
| Base de datos | **PostgreSQL** | Los datos están muy relacionados (empresa → cancha → reserva → pagos), y la propia base puede impedir dos reservas a la misma hora. |
| ORM | **Prisma** | Las tablas se escriben en un solo archivo y Prisma genera las migraciones y los tipos de TypeScript. |
| Login | **JWT** + contraseñas con **argon2** o **bcrypt** | Es el estándar y no depende de ningún servicio externo. |
| Documentación | **Swagger** (`@nestjs/swagger`) + colección de **Postman** | Swagger se genera solo desde el código; Postman guarda los flujos para probarlos. |
| Pagos en línea | **Wompi** en modo pruebas (alternativas: Mercado Pago, ePayco) | Nequi, PSE y tarjeta en una sola integración. Revisar si ya soporta Bre-B y comparar comisiones. |
| Fotos de canchas | **Cloudinary** o **Supabase Storage** | Las imágenes no deben guardarse en la base de datos. |
| Publicar | API en **Render** o **Railway**; base en **Neon** o **Supabase** | Tienen plan gratis para empezar. |

> Si el equipo o el profesor exige otro lenguaje, **ASP.NET Core + Entity Framework + PostgreSQL** sirve igual y este checklist no cambia. El primer commit del repo trae el `.gitignore` de Visual Studio, así que quizá Bryan estaba pensando en C#.

### Orden recomendado

Primero hagan **una tajada completa, de punta a punta**: login → ver canchas → reservar → mis reservas, ya conectada al frontend. Solo después agreguen el resto. Así descubren temprano los problemas de conexión, CORS y tokens, y no al final.

---

## Decisiones pendientes (antes de programar)

- [ ] Stack definitivo (todo el equipo).
- [ ] Quién hace cada fase.
- [ ] Registro de jugadores: ¿celular + código, o correo + contraseña?
- [ ] ¿Las empresas nuevas quedan pendientes hasta que el admin las apruebe?
- [ ] Política de cancelación: hasta cuántas horas antes se puede cancelar y si se devuelve el anticipo.
- [ ] Cuántos minutos tiene el jugador para pagar el anticipo antes de que la hora se libere.
- [ ] Horario de cada cancha (hoy el frontend asume de 6 a. m. a 10 p. m. para todas).
- [ ] Pasarela de pagos.

---

## Fase 0 · Preparar (piloto)

- [ ] Hacer commit de los cambios del frontend que están sin subir en `sharith`.
- [ ] Crear la rama `backend` desde `main` con una carpeta `backend/` en este mismo repo. Como es una carpeta nueva, no choca con ninguna rama de frontend.
- [ ] Instalar PostgreSQL (o Docker con un `docker-compose.yml`) y el CLI de Nest (`npm i -g @nestjs/cli`).
- [ ] Revisar juntos la lista de tablas y endpoints de este documento y ajustarla.

## Fase 1 · Proyecto base (piloto)

- [ ] `nest new backend`, con un módulo por área, igual que en el frontend: `auth`, `usuarios`, `empresas`, `canchas`, `reservas`, `pagos`, `comunidad`, `admin`, `common`.
- [ ] Variables de entorno: `.env` fuera de git y `.env.example` en git (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`).
- [ ] Prefijo `/api` en todas las rutas, CORS para `http://localhost:4200`, validación global de datos (`class-validator`) y `helmet`.
- [ ] Swagger en `/api/docs`.
- [ ] Un solo formato de error, con el mensaje en español: `{ "mensaje": "Esa hora ya la tomaron", "codigo": "HORA_OCUPADA" }`. Así el frontend lo muestra tal cual.
- [ ] `GET /api/salud` para saber que el servidor está vivo.

## Fase 2 · Base de datos (piloto)

| Tabla | Campos principales | Sale de |
|---|---|---|
| `usuarios` | id, nombre, celular, correo, contraseña (hash), rol, empresa_id, verificado, acepto_datos_en, creado | `sesion.model.ts` + registro de Bryan |
| `empresas` | id, nombre, nit, zona, dirección, whatsapp, propietario_id, estado | `empresa.model.ts` |
| `canchas` | id, empresa_id, deporte, nombre, zona, precio_hora, foto_url, disponible, superficie, techada, modalidad, medidas, capacidad, iluminación, incluye | `cancha.model.ts` + Dev_f4 (Harold) |
| `horarios` | cancha_id, día de la semana, abre, cierra | nueva |
| `reservas` | id, código, cancha_id, usuario_id, responsable, fecha, hora, precio, estado, modalidad (organizador / vaca / reto), creado | `reserva.model.ts` |
| `pagos` | id, reserva_id, monto, método, quién pagó, registrado_por, es_anticipo, referencia_pasarela, fecha | `Pago` en `reserva.model.ts` |
| `jugadores_vaca` | id, reserva_id, nombre, usuario_id (opcional), estado (debe / pagó / al llegar) | `JugadorVaca` |
| `retos` | reserva_id, equipo_a, equipo_b, ganador, pagado_por | `Reto` |
| `reglas_pago` | empresa_id, anticipo (nunca / pico / siempre), porcentaje | `plataforma.model.ts` |
| `metodos_pago` | id, nombre, descripción, activo | `plataforma.model.ts` |
| `suscripciones` | empresa_id, último_pago, próximo_cobro, suspendida | `plataforma.model.ts` |
| `pagos_mensualidad` | id, empresa_id, monto, fecha, registrado_por | nueva (historial) |
| `configuracion` | valor de la mensualidad, hora pico desde / hasta | `plataforma.mock.ts` |
| `favoritos` | usuario_id, cancha_id | `favoritos.service.ts` |
| `codigos_verificacion` | usuario o celular, código (hash), vence, intentos | registro de Bryan |
| `publicaciones`, `apuntados`, `me_gusta`, `comentarios` | ver `publicacion.model.ts` | comunidad (después) |
| `resenas` | usuario_id, cancha_id, reserva_id, estrellas, comentario | nueva (después) |

- [ ] Escribir `schema.prisma` y crear la primera migración.
- [ ] Índice único que impida dos reservas activas en la misma cancha, fecha y hora (sin contar las canceladas). Es un índice parcial, así que va en SQL dentro de la migración.
- [ ] Guardar la plata como pesos enteros (`integer`), nunca con decimales.
- [ ] Guardar las fechas con zona horaria y calcular "hoy" con `America/Bogota`.
- [ ] Seed con los mismos datos de los mocks del frontend (empresas, canchas, usuarios demo), para que todo se vea igual que hoy.

## Fase 3 · Usuarios y login (piloto)

- [ ] `POST /api/auth/registro`: el jugador llena pocos campos; la empresa además da los datos de su negocio.
- [ ] `POST /api/auth/login` → devuelve el token y el usuario (`id`, `nombre`, `rol`, `empresaId`).
- [ ] `POST /api/auth/verificar` (código), `POST /api/auth/recuperar` y `POST /api/auth/restablecer`.
- [ ] `GET /api/yo` → perfil y confianza (reservas cumplidas y faltas).
- [ ] Guard por rol (usuario / empresa / admin), igual que `soloRol` en el frontend.
- [ ] Límite de intentos en el login y en los códigos.
- [ ] Aceptación de la política de tratamiento de datos (Ley 1581 de 2012), guardando la fecha en que se aceptó.

## Fase 4 · Canchas y empresas (piloto)

- [ ] `GET /api/deportes`
- [ ] `GET /api/canchas?deporte=&zona=&precioMax=&disponible=&q=`, sin mostrar las canchas de empresas suspendidas o con la mensualidad vencida.
- [ ] `GET /api/canchas/:id`
- [ ] `GET /api/canchas/:id/disponibilidad?fecha=` → cada hora con libre / ocupada, precio y anticipo. Todo lo calcula el servidor y el panel de reserva solo lo muestra.
- [ ] `GET /api/empresas/recomendadas`
- [ ] Empresa: `POST` y `PATCH /api/empresa/canchas`, prender y apagar `disponible`, subir foto.
- [ ] Favoritos: `GET /api/favoritos`, `POST /api/favoritos/:canchaId` y `DELETE /api/favoritos/:canchaId`.

## Fase 5 · Reservas, lo más importante (piloto)

- [ ] `POST /api/reservas`: revisa que la hora esté libre, calcula precio y anticipo, genera un código `REZ-XXXXX` único, crea la vaca o el reto si aplica y responde con la reserva.
- [ ] Si dos personas reservan la misma hora al mismo tiempo, el índice único deja pasar solo a una; la otra recibe "Esa hora ya la tomaron".
- [ ] `GET /api/reservas/mias?cuando=proximas|historial`
- [ ] `GET /api/reservas/codigo/:codigo`, para que la empresa busque por código como hoy hace por WhatsApp.
- [ ] `PATCH /api/reservas/:id/cancelar`, según la política de cancelación.
- [ ] Vaca: `POST`, `PATCH` y `DELETE /api/reservas/:id/jugadores/:jugadorId`.
- [ ] Confianza: con 3 reservas cumplidas y 0 "no llegó", el jugador no paga anticipo.
- [ ] Tarea programada: liberar las reservas apartadas cuyo anticipo no se pagó a tiempo.
- [ ] Pruebas automáticas de las reglas: anticipo (nunca / pico / siempre y %), confianza, cuota de la vaca, deuda del reto, doble reserva.

## Fase 6 · Panel de la empresa (piloto)

- [ ] `GET /api/empresa/agenda?fecha=`
- [ ] `GET /api/empresa/reservas?fecha=`, para la tabla de reservas.
- [ ] `POST /api/empresa/reservas`: la empresa anota a mano las reservas que le llegan por WhatsApp o por llamada, para tener una sola agenda. **Ese botón todavía no existe en el frontend.**
- [ ] `POST /api/empresa/reservas/:id/cobros` (monto, método, ganador del reto, quién pagó).
- [ ] `PATCH /api/empresa/reservas/:id/no-llego`
- [ ] `GET /api/empresa/caja?fecha=`
- [ ] `GET` y `PUT /api/empresa/reglas-pago`
- [ ] `GET /api/empresa/ranking-retos`
- [ ] `GET /api/empresa/suscripcion` (estado de la mensualidad).
- [ ] Una empresa solo puede ver y tocar sus propias canchas y reservas.

## Fase 7 · Administrador (piloto)

- [ ] `GET /api/admin/resumen` (los números del panel).
- [ ] `GET /api/admin/empresas` y aprobar empresas nuevas.
- [ ] `GET /api/admin/suscripciones`, `POST /api/admin/suscripciones/:empresaId/pagos`, `PATCH .../suspender` y `PATCH .../reactivar`.
- [ ] `PUT /api/admin/configuracion` (valor de la mensualidad).
- [ ] `PATCH /api/admin/metodos-pago/:id` (activar o desactivar) y `GET /api/metodos-pago` (los jugadores solo ven los activos).
- [ ] Tarea diaria: marcar las mensualidades por vencer y vencidas.

## Fase 8 · Comunidad (después)

- [ ] `GET /api/publicaciones?tipo=&deporte=`
- [ ] `POST /api/publicaciones` y `DELETE /api/publicaciones/:id` (solo el autor o el admin).
- [ ] `POST` y `DELETE /api/publicaciones/:id/apuntados`, que también suman o quitan al jugador de la vaca de esa reserva.
- [ ] `POST` y `DELETE /api/publicaciones/:id/me-gusta`
- [ ] `POST /api/publicaciones/:id/comentarios`
- [ ] Reportar una publicación; el admin puede borrarla.

## Fase 9 · Pagos en línea (después)

- [ ] Cuenta de la pasarela en modo pruebas (sandbox).
- [ ] `POST /api/pagos/anticipo` → crea la transacción y devuelve lo necesario para pagar.
- [ ] `POST /api/pagos/webhook`: la pasarela avisa del pago y se verifica su firma. La reserva se confirma solo ahí; nunca hay que confiar en lo que diga el frontend.
- [ ] Si la pasarela repite el mismo aviso, el pago no se registra dos veces.
- [ ] Mensualidad de las empresas por la pasarela (mientras tanto, el admin la registra a mano).
- [ ] Devoluciones según la política de cancelación.

## Fase 10 · Conectar el frontend (piloto)

- [ ] `environment.ts` con `apiUrl`.
- [ ] `provideHttpClient` con un interceptor que agrega el token y manda a `/entrar` cuando vence.
- [ ] Cambiar cada servicio mock por llamadas HTTP, uno por uno: sesión → canchas → reservas → empresa → admin → comunidad. Los comentarios `Con backend:` de cada servicio ya dicen qué endpoint usa.
- [ ] Estados de "cargando" y mensajes de error en pantalla.
- [ ] Cambiar la pantalla demo de entrar por el login y registro de Bryan.
- [ ] Quitar el selector "Modo demo · ver como".

## Fase 11 · Seguridad y pruebas (piloto)

- [ ] Revisar permisos endpoint por endpoint (por ejemplo, que un jugador no pueda ver las reservas de otro).
- [ ] Límite de peticiones (`@nestjs/throttler`) en login, códigos y crear reserva.
- [ ] Las contraseñas nunca aparecen en logs ni en respuestas.
- [ ] Colección de Postman con los flujos: registrarse, reservar, doble reserva rechazada, cobrar, cancelar.
- [ ] Pruebas e2e del flujo de reserva.

## Fase 12 · Publicar (piloto)

- [ ] Base de datos en la nube con las migraciones aplicadas.
- [ ] API publicada con HTTPS.
- [ ] Frontend publicado y apuntando a la API.
- [ ] Copias de seguridad automáticas de la base.
- [ ] Dominio propio (opcional).

## Más adelante

- [ ] WhatsApp Cloud API (Meta): confirmación automática, recordatorio 2 horas antes y código de verificación. Necesita una cuenta de WhatsApp Business verificada y plantillas aprobadas, y cobra por mensaje.
- [ ] Reseñas de canchas (hoy la calificación es un dato fijo).
- [ ] Notificaciones por correo o push.
- [ ] Reportes para empresas: ingresos por mes y horas más pedidas.
