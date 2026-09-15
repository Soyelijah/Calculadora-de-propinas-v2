import { Configuracion, EventoAuditoria, Garzon, InfoBackup, Propina, UsuarioCredenciales } from '../types';

const STORAGE_KEYS = {
  PROPINA_HISTORIAL: 'calculadora_propinas_historial',
  GARZONES: 'calculadora_propinas_garzones',
  CONFIGURACION: 'calculadora_propinas_config',
  USUARIOS: 'calculadora_propinas_usuarios',
  AUDITORIA: 'calculadora_propinas_auditoria',
  BACKUP_INFO: 'calculadora_propinas_backup_info',
  ULTIMA_SESION: 'calculadora_propinas_ultima_sesion',
};

// Cryptographic salt generation (16 random bytes hex-encoded)
export function generarSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// PBKDF2 cryptographic password derivation with SHA-256 and 100,000 iterations
export async function hashConSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const saltBytes = new Uint8Array(
    salt.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || Array.from(encoder.encode(salt))
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Legacy SHA-256 fallback helper for migration
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class StorageService {
  private static instance: StorageService;

  private constructor() {
    this.initDefaultData();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public async initDefaultData() {
    // 1. Usuarios con Salt único y PBKDF2
    const usuariosActuales = this.getUsuariosCredenciales();
    const hayUsuarios = Object.keys(usuariosActuales).length > 0;
    const necesitaMigracionSalt = Object.values(usuariosActuales).some((u) => !u.salt);

    if (!hayUsuarios || necesitaMigracionSalt) {
      const saltAdmin = generarSalt();
      const saltAna = generarSalt();
      const saltLuis = generarSalt();

      const defaultUsers: Record<string, UsuarioCredenciales> = {
        admin: {
          nombre: 'Admin',
          rol: 'admin',
          salt: saltAdmin,
          contrasenaHash: await hashConSalt('admin123', saltAdmin),
          debeCambiarContrasena: true,
          intentosFallidos: 0,
          bloqueadoHasta: null,
        },
        ana: {
          nombre: 'Ana',
          rol: 'garzon',
          salt: saltAna,
          contrasenaHash: await hashConSalt('ana123', saltAna),
          debeCambiarContrasena: true,
          intentosFallidos: 0,
          bloqueadoHasta: null,
        },
        luis: {
          nombre: 'Luis',
          rol: 'garzon',
          salt: saltLuis,
          contrasenaHash: await hashConSalt('luis123', saltLuis),
          debeCambiarContrasena: true,
          intentosFallidos: 0,
          bloqueadoHasta: null,
        },
      };

      // Si había usuarios personalizados, mantenerlos migrando salt
      if (hayUsuarios) {
        for (const [key, user] of Object.entries(usuariosActuales)) {
          if (!defaultUsers[key]) {
            const nuevoSalt = user.salt || generarSalt();
            defaultUsers[key] = {
              ...user,
              salt: nuevoSalt,
              contrasenaHash: user.salt ? user.contrasenaHash : await hashConSalt('admin123', nuevoSalt),
            };
          }
        }
      }

      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(defaultUsers));
    }

    // 2. Garzones
    if (!localStorage.getItem(STORAGE_KEYS.GARZONES)) {
      const defaultGarzones: Garzon[] = [
        { nombre: 'Ana', porcentaje: 30 },
        { nombre: 'Luis', porcentaje: 70 },
      ];
      localStorage.setItem(STORAGE_KEYS.GARZONES, JSON.stringify(defaultGarzones));
    }

    // 3. Configuración
    const configGuardada = localStorage.getItem(STORAGE_KEYS.CONFIGURACION);
    if (!configGuardada) {
      const defaultConfig: Configuracion = {
        porcentajeTransbank: 3.5,
        porcentajeCocina: 10.0,
        ultimoUsuario: '',
        modoOscuro: false,
        themeMode: 'light',
        modoDistribucionPredeterminado: 'proporcional_remanente',
        minutosInactividad: 15,
        minutosMaximoSesion: 30,
      };
      localStorage.setItem(STORAGE_KEYS.CONFIGURACION, JSON.stringify(defaultConfig));
    } else {
      try {
        const parsed = JSON.parse(configGuardada);
        if (!parsed.modoDistribucionPredeterminado || !parsed.minutosInactividad) {
          const merged: Configuracion = {
            porcentajeTransbank: parsed.porcentajeTransbank ?? 3.5,
            porcentajeCocina: parsed.porcentajeCocina ?? 10.0,
            ultimoUsuario: parsed.ultimoUsuario ?? '',
            modoOscuro: parsed.modoOscuro ?? false,
            themeMode: parsed.themeMode ?? 'light',
            modoDistribucionPredeterminado: parsed.modoDistribucionPredeterminado ?? 'proporcional_remanente',
            minutosInactividad: parsed.minutosInactividad ?? 15,
            minutosMaximoSesion: parsed.minutosMaximoSesion ?? 30,
          };
          localStorage.setItem(STORAGE_KEYS.CONFIGURACION, JSON.stringify(merged));
        }
      } catch {
        // use default
      }
    }

    // 4. Sample history if empty
    if (!localStorage.getItem(STORAGE_KEYS.PROPINA_HISTORIAL)) {
      const samplePropinas: Propina[] = [
        {
          id: 'prop-sample-1',
          fecha: new Date(Date.now() - 86400000 * 2).toISOString(),
          montoTotal: 50000,
          montoTransbank: 1750,
          montoCocina: 4825,
          montosPorGarzon: { Ana: 13027.5, Luis: 30397.5 },
        },
        {
          id: 'prop-sample-2',
          fecha: new Date(Date.now() - 86400000 * 1).toISOString(),
          montoTotal: 75000,
          montoTransbank: 2625,
          montoCocina: 7237.5,
          montosPorGarzon: { Ana: 19541.25, Luis: 45596.25 },
        },
      ];
      localStorage.setItem(STORAGE_KEYS.PROPINA_HISTORIAL, JSON.stringify(samplePropinas));
    }
  }

  // --- Historial Propinas ---
  public getPropinas(): Propina[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROPINA_HISTORIAL);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public guardarPropina(propina: Propina): void {
    const propinas = this.getPropinas();
    propinas.unshift(propina); // most recent first
    localStorage.setItem(STORAGE_KEYS.PROPINA_HISTORIAL, JSON.stringify(propinas));
  }

  public eliminarPropina(indexOrId: number | string): void {
    const propinas = this.getPropinas();
    let updated: Propina[];
    if (typeof indexOrId === 'number') {
      updated = propinas.filter((_, idx) => idx !== indexOrId);
    } else {
      updated = propinas.filter((p) => p.id !== indexOrId);
    }
    localStorage.setItem(STORAGE_KEYS.PROPINA_HISTORIAL, JSON.stringify(updated));
  }

  public limpiarHistorial(): void {
    localStorage.setItem(STORAGE_KEYS.PROPINA_HISTORIAL, JSON.stringify([]));
  }

  public generarCSV(): string {
    const propinas = this.getPropinas();
    const rows = ['Fecha,Monto Total,Transbank,Cocina,Garzones'];

    for (const propina of propinas) {
      const fecha = new Date(propina.fecha).toLocaleDateString('es-CL');
      const resumen = Object.entries(propina.montosPorGarzon)
        .map(([nombre, monto]) => `${nombre}: $${Math.round(monto)}`)
        .join(' | ');
      rows.push(
        `"${fecha}",${propina.montoTotal},${propina.montoTransbank},${propina.montoCocina},"${resumen}"`
      );
    }

    return rows.join('\n');
  }

  // --- Garzones ---
  public getGarzones(): Garzon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GARZONES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public guardarGarzones(garzones: Garzon[]): void {
    localStorage.setItem(STORAGE_KEYS.GARZONES, JSON.stringify(garzones));
  }

  // --- Configuración ---
  public getConfiguracion(): Configuracion {
    const defaults: Configuracion = {
      porcentajeTransbank: 3.5,
      porcentajeCocina: 10.0,
      ultimoUsuario: '',
      modoOscuro: false,
      themeMode: 'light',
      modoDistribucionPredeterminado: 'proporcional_remanente',
      minutosInactividad: 15,
      minutosMaximoSesion: 30,
    };

    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIGURACION);
      if (!data) return defaults;
      const parsed = JSON.parse(data);
      return {
        ...defaults,
        ...parsed,
      };
    } catch {
      return defaults;
    }
  }

  public guardarConfiguracion(config: Partial<Configuracion>): Configuracion {
    const current = this.getConfiguracion();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEYS.CONFIGURACION, JSON.stringify(updated));
    return updated;
  }

  public restaurarConfiguracionPredeterminada(): Configuracion {
    const defaults: Configuracion = {
      porcentajeTransbank: 3.5,
      porcentajeCocina: 10.0,
      ultimoUsuario: '',
      modoOscuro: false,
      themeMode: 'light',
      modoDistribucionPredeterminado: 'proporcional_remanente',
      minutosInactividad: 15,
      minutosMaximoSesion: 30,
    };
    localStorage.setItem(STORAGE_KEYS.CONFIGURACION, JSON.stringify(defaults));
    return defaults;
  }

  // --- Usuarios & Credenciales ---
  public getUsuariosCredenciales(): Record<string, UsuarioCredenciales> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USUARIOS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public guardarUsuariosCredenciales(users: Record<string, UsuarioCredenciales>): void {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(users));
  }

  // --- Auditoria ---
  public getEventosAuditoria(): EventoAuditoria[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDITORIA);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public registrarAuditoria(
    tipo: EventoAuditoria['tipo'],
    descripcion: string,
    usuario?: string,
    metadata?: Record<string, unknown>
  ): void {
    const eventos = this.getEventosAuditoria();
    const nuevo: EventoAuditoria = {
      id: `audit-${Date.now()}`,
      fecha: new Date().toISOString(),
      tipo,
      descripcion,
      usuario,
      metadata,
    };
    eventos.unshift(nuevo);
    localStorage.setItem(STORAGE_KEYS.AUDITORIA, JSON.stringify(eventos.slice(0, 200)));
  }

  // --- Backup Info ---
  public getInfoBackup(): InfoBackup | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BACKUP_INFO);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setInfoBackup(info: InfoBackup): void {
    localStorage.setItem(STORAGE_KEYS.BACKUP_INFO, JSON.stringify(info));
  }
}
