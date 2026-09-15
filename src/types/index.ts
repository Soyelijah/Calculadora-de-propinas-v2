export type RolUsuario = 'admin' | 'garzon';

export interface Usuario {
  nombre: string;
  rol: RolUsuario;
  debeCambiarContrasena?: boolean;
}

export interface UsuarioCredenciales {
  nombre: string;
  rol: RolUsuario;
  salt: string;
  contrasenaHash: string;
  intentosFallidos?: number;
  bloqueadoHasta?: string | null;
  debeCambiarContrasena?: boolean;
}

export interface Garzon {
  nombre: string;
  porcentaje: number;
}

export type ModoDistribucion = 'proporcional_remanente' | 'porcentaje_directo';

export interface Propina {
  id: string;
  fecha: string; // ISO String
  montoTotal: number;
  montoTransbank: number;
  montoCocina: number;
  porcentajeTransbank?: number;
  porcentajeCocina?: number;
  montosPorGarzon: Record<string, number>;
  modoDistribucion?: ModoDistribucion;
  montoRemanenteNoAsignado?: number;
  puntosTotalesGarzones?: number;
  valorPorPunto?: number;
}

export type TipoEvento =
  | 'login'
  | 'logout'
  | 'calculoPropina'
  | 'cambioConfiguracion'
  | 'gestionGarzon'
  | 'backup'
  | 'seguridad';

export interface EventoAuditoria {
  id: string;
  fecha: string;
  tipo: TipoEvento;
  descripcion: string;
  usuario?: string;
  metadata?: Record<string, unknown>;
}

export type ThemeMode = 'light' | 'system' | 'dark';

export interface Configuracion {
  porcentajeTransbank: number;
  porcentajeCocina: number;
  ultimoUsuario: string;
  modoOscuro: boolean;
  themeMode: ThemeMode;
  modoDistribucionPredeterminado: ModoDistribucion;
  minutosInactividad: number;
  minutosMaximoSesion: number;
}

export interface InfoBackup {
  fecha_backup: string;
  version: string;
  cantidad_registros: number;
  tamanio_bytes: number;
}

export type ScreenType =
  | 'home'
  | 'login'
  | 'gestionar-garzones'
  | 'historial'
  | 'estadisticas'
  | 'configuracion'
  | 'backup'
  | 'cambiar-contrasena'
  | 'garzon-detail';

export interface DesgloseGarzonCalculo {
  nombre: string;
  porcentajeConfigurado: number;
  puntos: number;
  porcentajeEfectivoDelTotal: number;
  porcentajeFondoGarzones: number;
  montoAsignado: number;
}

export interface DetalleDistribucion {
  montoTotal: number;
  montoTransbank: number;
  subtotal: number;
  montoCocina: number;
  fondoGarzonesDisponible: number;
  puntosTotalesGarzones: number;
  valorPorPunto: number;
  garzones: DesgloseGarzonCalculo[];
  remanenteNoAsignado: number;
}


