import { InfoBackup, Propina } from '../types';
import { StorageService } from './storageService';

export interface ResultadoRestauracion {
  success: boolean;
  importados: number;
  duplicadosOmitidos: number;
  totalActual: number;
  message?: string;
}

export class BackupService {
  private static instance: BackupService;
  private storage: StorageService;

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Crea un backup de todos los datos de propinas y descarga el archivo JSON
   */
  public async crearBackup(): Promise<{ success: boolean; info?: InfoBackup }> {
    try {
      const propinas = this.storage.getPropinas();
      const backupData = {
        fecha_backup: new Date().toLocaleString('es-CL'),
        version: '1.0',
        cantidad_registros: propinas.length,
        propinas,
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const sizeBytes = blob.size;

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_propinas_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const info: InfoBackup = {
        fecha_backup: backupData.fecha_backup,
        version: '1.0',
        cantidad_registros: propinas.length,
        tamanio_bytes: sizeBytes,
      };

      this.storage.setInfoBackup(info);
      this.storage.registrarAuditoria('backup', `Backup creado (${propinas.length} registros)`);

      return { success: true, info };
    } catch (err) {
      console.error('Error al crear backup:', err);
      return { success: false };
    }
  }

  /**
   * Restaura los datos desde un archivo JSON de backup con conversión numérica segura (int/double)
   * y deduplicación inteligente por ID y firma de datos.
   */
  public async restaurarDesdeArchivo(
    file: File,
    reemplazarTodo: boolean = false
  ): Promise<ResultadoRestauracion> {
    try {
      const text = await file.text();
      let data: Record<string, unknown>;

      try {
        data = JSON.parse(text);
      } catch {
        return {
          success: false,
          importados: 0,
          duplicadosOmitidos: 0,
          totalActual: this.storage.getPropinas().length,
          message: 'El archivo seleccionado no es un JSON válido',
        };
      }

      if (!Array.isArray(data.propinas)) {
        return {
          success: false,
          importados: 0,
          duplicadosOmitidos: 0,
          totalActual: this.storage.getPropinas().length,
          message: 'Estructura de archivo de backup no compatible (falta array de propinas)',
        };
      }

      const parseNumero = (val: unknown): number => {
        if (typeof val === 'number') return isNaN(val) ? 0 : val;
        if (typeof val === 'string') {
          const num = parseFloat(val);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      };

      const propinasValidadas: Propina[] = [];
      for (const item of data.propinas) {
        if (!item || typeof item !== 'object') continue;
        const p = item as Record<string, unknown>;

        const montoTotal = parseNumero(p.montoTotal);
        const montoTransbank = parseNumero(p.montoTransbank);
        const montoCocina = parseNumero(p.montoCocina);

        // Validación de montos por garzón
        const montosPorGarzon: Record<string, number> = {};
        if (p.montosPorGarzon && typeof p.montosPorGarzon === 'object') {
          for (const [nombre, monto] of Object.entries(p.montosPorGarzon as Record<string, unknown>)) {
            if (nombre && nombre.trim()) {
              montosPorGarzon[nombre.trim()] = parseNumero(monto);
            }
          }
        }

        if (montoTotal >= 0) {
          propinasValidadas.push({
            id: typeof p.id === 'string' && p.id.trim() ? p.id.trim() : `prop-restored-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            fecha: typeof p.fecha === 'string' && p.fecha ? p.fecha : new Date().toISOString(),
            montoTotal,
            montoTransbank,
            montoCocina,
            montosPorGarzon,
            modoDistribucion: (p.modoDistribucion as Propina['modoDistribucion']) || 'proporcional_remanente',
            montoRemanenteNoAsignado: parseNumero(p.montoRemanenteNoAsignado),
          });
        }
      }

      const currentPropinas = reemplazarTodo ? [] : this.storage.getPropinas();
      const existingIds = new Set(currentPropinas.map((cp) => cp.id));
      const existingSignatures = new Set(
        currentPropinas.map((cp) => `${cp.fecha.slice(0, 19)}_${Math.round(cp.montoTotal)}_${Math.round(cp.montoTransbank)}`)
      );

      let importados = 0;
      let duplicadosOmitidos = 0;
      const combined = [...currentPropinas];

      for (const p of propinasValidadas) {
        const sig = `${p.fecha.slice(0, 19)}_${Math.round(p.montoTotal)}_${Math.round(p.montoTransbank)}`;
        if (existingIds.has(p.id) || existingSignatures.has(sig)) {
          duplicadosOmitidos++;
        } else {
          existingIds.add(p.id);
          existingSignatures.add(sig);
          combined.push(p);
          importados++;
        }
      }

      // Ordenar por fecha descendente
      combined.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      // Guardar en almacenamiento
      localStorage.setItem('calculadora_propinas_historial', JSON.stringify(combined));

      const info: InfoBackup = {
        fecha_backup: new Date().toLocaleString('es-CL'),
        version: '1.0',
        cantidad_registros: combined.length,
        tamanio_bytes: file.size,
      };
      this.storage.setInfoBackup(info);
      this.storage.registrarAuditoria(
        'backup',
        `Restauración: ${importados} nuevos agregados, ${duplicadosOmitidos} duplicados omitidos`
      );

      return {
        success: true,
        importados,
        duplicadosOmitidos,
        totalActual: combined.length,
      };
    } catch (err) {
      console.error('Error al restaurar backup:', err);
      return {
        success: false,
        importados: 0,
        duplicadosOmitidos: 0,
        totalActual: this.storage.getPropinas().length,
        message: 'Error inesperado al procesar el archivo JSON',
      };
    }
  }

  public getInfoUltimoBackup(): InfoBackup | null {
    return this.storage.getInfoBackup();
  }
}

