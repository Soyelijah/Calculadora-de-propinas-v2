import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../services/authService';
import { StorageService, generarSalt, hashConSalt } from '../services/storageService';

describe('AuthService & Seguridad Criptográfica', () => {
  let authService: AuthService;
  let storageService: StorageService;

  beforeEach(async () => {
    // Reset mock localStorage before each test
    localStorage.clear();
    authService = AuthService.getInstance();
    storageService = StorageService.getInstance();
    // Force re-init default credentials in storage
    await storageService.initDefaultData();
  });

  describe('Autenticación y Criptografía PBKDF2', () => {
    it('debe autenticar exitosamente a usuarios iniciales con contraseña correcta', async () => {
      const res = await authService.autenticarConDetalle('admin', 'admin123');
      expect(res.usuario).not.toBeNull();
      expect(res.usuario?.nombre.toLowerCase()).toBe('admin');
      expect(res.usuario?.rol).toBe('admin');
      expect(res.error).toBeUndefined();
    });

    it('debe rechazar contraseñas incorrectas con mensaje claro', async () => {
      const res = await authService.autenticarConDetalle('admin', 'wrongpass');
      expect(res.usuario).toBeNull();
      expect(res.error).toContain('Usuario o contraseña incorrectos');
    });

    it('debe rechazar usuarios que no existen', async () => {
      const res = await authService.autenticarConDetalle('noexiste', 'cualquiera');
      expect(res.usuario).toBeNull();
      expect(res.error).toContain('Usuario o contraseña incorrectos');
    });

    it('debe generar salt único y hash PBKDF2', async () => {
      const salt1 = generarSalt();
      const salt2 = generarSalt();
      expect(salt1).not.toBe(salt2);
      expect(salt1.length).toBeGreaterThanOrEqual(16);

      const hash1 = await hashConSalt('mypassword123', salt1);
      const hash2 = await hashConSalt('mypassword123', salt2);
      // Salting prevents identical hashes for identical passwords
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Protección contra Fuerza Bruta y Bloqueo de Cuentas', () => {
    it('debe bloquear la cuenta temporalmente tras 5 intentos fallidos', async () => {
      // 4 failed attempts
      for (let i = 1; i <= 4; i++) {
        const res = await authService.autenticarConDetalle('ana', 'badpass');
        expect(res.usuario).toBeNull();
        expect(res.error).toContain('intento');
      }

      // 5th failed attempt should trigger lockout
      const res5 = await authService.autenticarConDetalle('ana', 'badpass');
      expect(res5.usuario).toBeNull();
      expect(res5.error).toContain('Cuenta bloqueada por 5 minutos');

      // Subsequent attempt even with correct password is still locked
      const resBloqueado = await authService.autenticarConDetalle('ana', 'ana123');
      expect(resBloqueado.usuario).toBeNull();
      expect(resBloqueado.error).toContain('Cuenta temporalmente bloqueada');
    });

    it('debe reiniciar el contador de intentos fallidos tras un inicio de sesión exitoso', async () => {
      // 2 failed attempts
      await authService.autenticarConDetalle('luis', 'badpass');
      await authService.autenticarConDetalle('luis', 'badpass');

      // Correct login resets counter
      const res = await authService.autenticarConDetalle('luis', 'luis123');
      expect(res.usuario).not.toBeNull();

      const creds = storageService.getUsuariosCredenciales()['luis'];
      expect(creds.intentosFallidos).toBe(0);
    });
  });

  describe('Cambio Seguro de Contraseña', () => {
    it('debe permitir cambiar la contraseña y desmarcar debeCambiarContrasena', async () => {
      // Mark user as needing password change
      const creds = storageService.getUsuariosCredenciales();
      if (creds['ana']) {
        creds['ana'].debeCambiarContrasena = true;
        storageService.guardarUsuariosCredenciales(creds);
      }

      const res = await authService.cambiarContrasena('ana', 'ana123', 'nuevaContrasena99');
      expect(res.success).toBe(true);

      const updatedCreds = storageService.getUsuariosCredenciales()['ana'];
      expect(updatedCreds.debeCambiarContrasena).toBe(false);

      // Verify new password works and old password fails
      const fail = await authService.autenticarConDetalle('ana', 'ana123');
      expect(fail.usuario).toBeNull();

      const success = await authService.autenticarConDetalle('ana', 'nuevaContrasena99');
      expect(success.usuario?.nombre).toBe('Ana');
    });
  });
});
