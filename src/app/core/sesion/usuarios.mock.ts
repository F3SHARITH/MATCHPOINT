import { Rol, UsuarioSesion } from './sesion.model';

/**
 * Una cuenta de demo por rol. Mientras no exista el backend, "iniciar sesión" es elegir una
 * de estas cuentas. Con backend, esto lo reemplaza POST /api/auth/login.
 */
export const USUARIOS_DEMO: Record<Rol, UsuarioSesion> = {
  usuario: { id: 'u-valentina', nombre: 'Valentina Ríos', rol: 'usuario' },
  empresa: { id: 'u-carlos', nombre: 'Carlos Gómez', rol: 'empresa', empresaId: 'arena-sport' },
  admin: { id: 'u-admin', nombre: 'Administración MatchPoint', rol: 'admin' },
};
