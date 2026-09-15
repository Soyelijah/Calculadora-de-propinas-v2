import { RolUsuario, Usuario } from '../types';
import { generarSalt, hashConSalt, sha256, StorageService } from './storageService';

const MAX_INTENTOS_FALLIDOS = 5;
const MINUTOS_BLOQUEO = 5;

export interface ResultadoAutenticacion {
  usuario: Usuario | null;
  error?: string;
}

export class AuthService {
  private static instance: AuthService;
  private storage: StorageService;

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Autentica a un usuario con nombre de usuario y contraseña,
   * aplicando verificación de salting PBKDF2 y protección contra fuerza bruta.
   */
  public async autenticar(usuarioInput: string, contrasenaInput: string): Promise<Usuario | null> {
    const res = await this.autenticarConDetalle(usuarioInput, contrasenaInput);
    return res.usuario;
  }

  public async autenticarConDetalle(
    usuarioInput: string,
    contrasenaInput: string
  ): Promise<ResultadoAutenticacion> {
    const key = usuarioInput.trim().toLowerCase();
    const credencialesMap = this.storage.getUsuariosCredenciales();
    const credencial = credencialesMap[key];

    if (!credencial) {
      return { usuario: null, error: 'Usuario o contraseña incorrectos' };
    }

    // 1. Verificar si la cuenta se encuentra temporalmente bloqueada
    if (credencial.bloqueadoHasta) {
      const finBloqueo = new Date(credencial.bloqueadoHasta).getTime();
      const ahora = Date.now();
      if (finBloqueo > ahora) {
        const segundosRestantes = Math.ceil((finBloqueo - ahora) / 1000);
        const minutos = Math.floor(segundosRestantes / 60);
        const segundos = segundosRestantes % 60;
        const tiempoStr = minutos > 0 ? `${minutos}m ${segundos}s` : `${segundos}s`;
        return {
          usuario: null,
          error: `Cuenta temporalmente bloqueada por exceso de intentos fallidos. Intente de nuevo en ${tiempoStr}.`,
        };
      } else {
        // Bloqueo expirado: reiniciar
        credencial.bloqueadoHasta = null;
        credencial.intentosFallidos = 0;
      }
    }

    // 2. Comprobar contraseña (con salt PBKDF2 o migración de SHA256 legado)
    let passwordValida = false;
    let necesitaRehasheo = false;

    if (credencial.salt) {
      const hashedInput = await hashConSalt(contrasenaInput, credencial.salt);
      if (credencial.contrasenaHash === hashedInput) {
        passwordValida = true;
      }
    } else {
      // Compatibilidad con usuarios previos
      const legacyHashed = await sha256(contrasenaInput);
      if (credencial.contrasenaHash === legacyHashed) {
        passwordValida = true;
        necesitaRehasheo = true;
      }
    }

    // 3. Resultado de validación
    if (passwordValida) {
      // Reiniciar intentos fallidos
      credencial.intentosFallidos = 0;
      credencial.bloqueadoHasta = null;

      // Migrar a PBKDF2 con Salt si venía de hash simple
      if (necesitaRehasheo || !credencial.salt) {
        credencial.salt = generarSalt();
        credencial.contrasenaHash = await hashConSalt(contrasenaInput, credencial.salt);
      }

      credencialesMap[key] = credencial;
      this.storage.guardarUsuariosCredenciales(credencialesMap);
      this.storage.guardarConfiguracion({ ultimoUsuario: credencial.nombre });

      return {
        usuario: {
          nombre: credencial.nombre,
          rol: credencial.rol,
          debeCambiarContrasena: credencial.debeCambiarContrasena,
        },
      };
    } else {
      // Incrementar contador de intentos fallidos
      const intentos = (credencial.intentosFallidos || 0) + 1;
      credencial.intentosFallidos = intentos;

      let mensajeError = `Usuario o contraseña incorrectos.`;
      if (intentos >= MAX_INTENTOS_FALLIDOS) {
        const hasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000).toISOString();
        credencial.bloqueadoHasta = hasta;
        mensajeError = `Cuenta bloqueada por ${MINUTOS_BLOQUEO} minutos debido a ${MAX_INTENTOS_FALLIDOS} intentos fallidos consecutivos.`;
        this.storage.registrarAuditoria(
          'seguridad',
          `Bloqueo de seguridad activado para cuenta: ${credencial.nombre}`
        );
      } else {
        const restantes = MAX_INTENTOS_FALLIDOS - intentos;
        mensajeError += ` Le quedan ${restantes} ${restantes === 1 ? 'intento' : 'intentos'} antes del bloqueo temporal.`;
      }

      credencialesMap[key] = credencial;
      this.storage.guardarUsuariosCredenciales(credencialesMap);

      return {
        usuario: null,
        error: mensajeError,
      };
    }
  }

  /**
   * Registra un nuevo usuario con salt aleatorio y PBKDF2
   */
  public async registrarUsuario(
    nombre: string,
    contrasena: string,
    rol: RolUsuario
  ): Promise<{ success: boolean; message?: string }> {
    const key = nombre.trim().toLowerCase();
    if (!nombre.trim()) {
      return { success: false, message: 'El nombre no puede estar vacío' };
    }

    if (contrasena.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const credencialesMap = this.storage.getUsuariosCredenciales();
    if (credencialesMap[key]) {
      return { success: false, message: 'El usuario ya existe' };
    }

    const salt = generarSalt();
    const hash = await hashConSalt(contrasena, salt);

    credencialesMap[key] = {
      nombre: nombre.trim(),
      rol,
      salt,
      contrasenaHash: hash,
      intentosFallidos: 0,
      bloqueadoHasta: null,
      debeCambiarContrasena: false,
    };

    this.storage.guardarUsuariosCredenciales(credencialesMap);
    this.storage.registrarAuditoria(
      'seguridad',
      `Nuevo usuario registrado: ${nombre.trim()} (Rol: ${rol})`
    );
    return { success: true };
  }

  /**
   * Cambia la contraseña de un usuario generando un nuevo salt y hash PBKDF2
   */
  public async cambiarContrasena(
    usuario: string,
    contrasenaActual: string,
    nuevaContrasena: string
  ): Promise<{ success: boolean; message?: string }> {
    const key = usuario.trim().toLowerCase();
    const credencialesMap = this.storage.getUsuariosCredenciales();
    const credencial = credencialesMap[key];

    if (!credencial) {
      return { success: false, message: 'El usuario no existe' };
    }

    // Verificar contraseña actual
    let actualValida = false;
    if (credencial.salt) {
      const hashActual = await hashConSalt(contrasenaActual, credencial.salt);
      actualValida = credencial.contrasenaHash === hashActual;
    } else {
      const legacyHashed = await sha256(contrasenaActual);
      actualValida = credencial.contrasenaHash === legacyHashed;
    }

    if (!actualValida) {
      return { success: false, message: 'La contraseña actual no es correcta' };
    }

    if (nuevaContrasena.length < 6) {
      return { success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' };
    }

    if (nuevaContrasena === contrasenaActual) {
      return { success: false, message: 'La nueva contraseña debe ser diferente a la actual' };
    }

    // Generar nuevo salt y hash
    const nuevoSalt = generarSalt();
    credencial.salt = nuevoSalt;
    credencial.contrasenaHash = await hashConSalt(nuevaContrasena, nuevoSalt);
    credencial.debeCambiarContrasena = false;

    credencialesMap[key] = credencial;
    this.storage.guardarUsuariosCredenciales(credencialesMap);
    this.storage.registrarAuditoria(
      'seguridad',
      `Contraseña cambiada exitosamente para usuario: ${credencial.nombre}`
    );

    return { success: true };
  }

  /**
   * Obtiene la lista de usuarios (solo para administradores)
   */
  public obtenerUsuarios(): Usuario[] {
    const credencialesMap = this.storage.getUsuariosCredenciales();
    return Object.values(credencialesMap).map((cred) => ({
      nombre: cred.nombre,
      rol: cred.rol,
      debeCambiarContrasena: cred.debeCambiarContrasena,
    }));
  }

  /**
   * Restablece la contraseña de un usuario (para Administrador)
   */
  public async restablecerContrasenaAdmin(
    usuario: string,
    nuevaContrasena: string
  ): Promise<{ success: boolean; message?: string }> {
    const key = usuario.trim().toLowerCase();
    const credencialesMap = this.storage.getUsuariosCredenciales();
    const credencial = credencialesMap[key];

    if (!credencial) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    if (nuevaContrasena.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const salt = generarSalt();
    credencial.salt = salt;
    credencial.contrasenaHash = await hashConSalt(nuevaContrasena, salt);
    credencial.intentosFallidos = 0;
    credencial.bloqueadoHasta = null;
    credencial.debeCambiarContrasena = true;

    credencialesMap[key] = credencial;
    this.storage.guardarUsuariosCredenciales(credencialesMap);
    this.storage.registrarAuditoria(
      'seguridad',
      `Contraseña restablecida por admin para usuario: ${credencial.nombre}`
    );

    return { success: true };
  }

  /**
   * Elimina un usuario (solo para administradores, no admin principal)
   */
  public eliminarUsuario(usuario: string): boolean {
    const key = usuario.trim().toLowerCase();
    if (key === 'admin') {
      return false; // No se puede eliminar el admin principal
    }

    const credencialesMap = this.storage.getUsuariosCredenciales();
    if (credencialesMap[key]) {
      delete credencialesMap[key];
      this.storage.guardarUsuariosCredenciales(credencialesMap);
      this.storage.registrarAuditoria('seguridad', `Usuario eliminado: ${usuario}`);
      return true;
    }
    return false;
  }
}

