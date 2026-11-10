/** Los tres tipos de cuenta de MatchPoint. */
export type Rol = 'usuario' | 'empresa' | 'admin';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  rol: Rol;
  /** Solo para el rol empresa: id de la empresa que administra. */
  empresaId?: string;
}

/** Texto amigable de cada rol, para mostrar en pantalla. */
export const NOMBRE_ROL: Record<Rol, string> = {
  usuario: 'Jugador',
  empresa: 'Empresa',
  admin: 'Administrador',
};
