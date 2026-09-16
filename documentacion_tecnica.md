# Documentación Técnica - Calculadora de Propinas

## 📖 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Flujo de la Aplicación](#flujo-de-la-aplicación)
5. [Componentes Principales](#componentes-principales)
6. [API y Servicios](#api-y-servicios)
7. [Seguridad](#seguridad)
8. [Pruebas](#pruebas)
9. [Despliegue](#despliegue)
10. [Mantenimiento](#mantenimiento)

## Descripción General

La aplicación "Calculadora de Propinas" es una solución web desarrollada con React y TypeScript que permite a restaurantes calcular y distribuir propinas entre el personal de manera justa y transparente. La aplicación considera porcentajes configurables para Transbank, cocina y garzones individuales.

### Características Principales
- Cálculo automático de distribución de propinas
- Sistema de autenticación seguro
- Gestión de usuarios y permisos
- Historial de cálculos
- Estadísticas visuales
- Backup y restauración de datos
- Configuración personalizable

## Arquitectura del Sistema

### Clean Architecture
La aplicación sigue el patrón de arquitectura limpia (Clean Architecture) con las siguientes capas:

```
┌─────────────────────────────────────────┐
│              PRESENTATION               │
│  Riverpod, UI, Navegación, Screens    │
├─────────────────────────────────────────┤
│                DATA                     │
│  Repositories, Data Sources, Models   │
├─────────────────────────────────────────┤
│               DOMAIN                    │
│  Entities, Use Cases, Repos Interfaces │
└─────────────────────────────────────────┘
```

### Capa de Dominio (Domain Layer)
Contiene la lógica de negocio central:

- **Entities**: Modelos de dominio con validaciones
  - `Propina`: Representa un cálculo de propina
  - `Usuario`: Representa un usuario del sistema
  - `Garzon`: Representa un garzón con su porcentaje

- **Use Cases**: Lógica de negocio específica
  - `CalcularPropinaUseCase`: Cálculo de propinas
  - `GestionarGarzonesUseCase`: Gestión de garzones

- **Repositories**: Interfaces de acceso a datos

### Capa de Datos (Data Layer)
Responsable del acceso a fuentes de datos:

- **Models**: Modelos de datos heredados
- **Data Sources**: Acceso a fuentes externas
- **Repositories**: Implementaciones concretas

### Capa de Presentación (Presentation Layer)
Responsable de la interfaz de usuario:

- **Screens**: Pantallas de la aplicación
- **Widgets**: Componentes reutilizables
- **Providers**: Estado de Riverpod

## Tecnologías Utilizadas

### Framework y Lenguaje
- **Flutter**: SDK para desarrollo multiplataforma
- **Dart**: Lenguaje de programación

### Dependencias Principales
- **Riverpod**: Gestión de estado reactiva
- **Go Router**: Navegación declarativa
- **Hive**: Base de datos local NoSQL
- **Shared Preferences**: Almacenamiento de configuraciones
- **Crypto**: Encriptación de contraseñas
- **FL Chart**: Visualización de gráficos
- **File Saver/Picker**: Gestión de archivos

### Patrones de Diseño
- **Repository Pattern**: Abstracción de fuentes de datos
- **Singleton Pattern**: Servicios globales
- **Observer Pattern**: Gestión de estado con Riverpod
- **Strategy Pattern**: Implementación de algoritmos de cálculo

## Flujo de la Aplicación

### Flujo Principal
```
1. Inicio de Aplicación
   ↓
2. Inicialización de Servicios
   ↓
3. Verificación de Sesión
   ↓
4. Navegación Condicionada
   ↓
5. Pantalla Principal (si autenticado)
   ↓
6. Cálculo de Propinas
   ↓
7. Almacenamiento de Resultados
```

### Flujo de Autenticación
```
1. Pantalla de Login
   ↓
2. Validación de Credenciales
   ↓
3. Hash de Contraseña
   ↓
4. Verificación en Base de Datos
   ↓
5. Inicio de Sesión
   ↓
6. Redirección a Pantalla Principal
```

### Flujo de Cálculo de Propinas
```
1. Ingreso de Monto Total
   ↓
2. Ingreso de Porcentajes
   ↓
3. Validación de Datos
   ↓
4. Cálculo de Distribución
   ↓
5. Validación de Resultados
   ↓
6. Almacenamiento
   ↓
7. Visualización de Resultados
```

## Componentes Principales

### Servicios del Sistema

#### ConfiguracionService
- Almacenamiento de configuraciones persistentes
- Valores predeterminados para porcentajes
- Preferencias de usuario

#### AutenticacionService
- Hash de contraseñas con SHA256
- Validación de credenciales
- Gestión de sesiones

#### AuditoriaService
- Registro de eventos importantes
- Seguimiento de acciones de usuarios
- Exportación de registros

#### CacheService
- Almacenamiento eficiente de datos frecuentes
- Política de expiración configurable
- Gestión LRU

#### NotificacionService
- Sistema de alertas para eventos
- Diferentes tipos de notificaciones
- Panel de notificaciones

#### PermisoService
- Control granular de acceso
- Roles y permisos por usuario
- Validación de autorizaciones

### Entidades del Dominio

#### Propina
```dart
class Propina extends Equatable {
  final DateTime fecha;
  final double montoTotal;
  final double montoTransbank;
  final double montoCocina;
  final Map<String, double> montosPorGarzon;
  
  // Validaciones y métodos de utilidad
}
```

#### Usuario
```dart
class Usuario extends Equatable {
  final String nombre;
  final RolUsuario rol;
  
  // Validaciones y métodos de utilidad
}
```

#### Garzon
```dart
class Garzon extends Equatable {
  final String nombre;
  final double porcentaje;
  
  // Validaciones y métodos de utilidad
}
```

### Casos de Uso

#### CalcularPropinaService
- Validación de entradas
- Cálculo matemático preciso
- Verificación de consistencia
- Manejo de errores

#### GestionarGarzonesService
- Validación de porcentajes
- Control de consistencia
- Operaciones CRUD

## API y Servicios

### Servicios Externos
La aplicación no utiliza servicios externos, opera completamente offline con almacenamiento local.

### API Interna
La aplicación expone servicios internos para diferentes funcionalidades:

#### DatabaseService
- `guardarPropina(Propina)`
- `obtenerHistorial()`
- `eliminarPropina(int)`
- `generarCSV()`

#### CalculadoraPropinaService
- `calcular({montoTotal, porcentajeTransbank, porcentajeCocina, porcentajesGarzones})`

#### AutenticacionService
- `autenticar(usuario, contrasena)`
- `cambiarContrasena(usuario, actual, nueva)`

## Seguridad

### Autenticación
- Contraseñas encriptadas con SHA256
- Sesiones con tiempos de expiración
- Control de intentos fallidos

### Validación de Datos
- Validaciones en múltiples capas
- Control de rangos y formatos
- Verificación de integridad

### Control de Acceso
- Sistema de permisos por roles
- Validación antes de operaciones sensibles
- Registro de eventos de seguridad

### Almacenamiento
- Datos locales con Hive
- Configuraciones con Shared Preferences
- Backups en formato JSON

## Pruebas

### Pruebas Unitarias
- Cobertura de lógica de negocio
- Validación de entidades
- Servicios de negocio
- Cálculos matemáticos

### Pruebas de Integración
- Flujo completo de autenticación
- Cálculo de propinas end-to-end
- Gestión de datos

### Cobertura de Pruebas
- Lógica de cálculo: 100%
- Validaciones: 95%
- Servicios: 90%
- Entidades: 100%

## Despliegue

### Configuración de Entorno
- Variables de entorno para diferentes ambientes
- Configuración específica por plataforma

### Proceso de Compilación
- `flutter build apk` para Android
- `flutter build ios` para iOS
- `flutter build web` para Web

### Versionado
- SemVer para control de versiones
- Etiquetas de release en Git
- Registro de cambios (CHANGELOG)

## Mantenimiento

### Actualizaciones
- Actualización regular de dependencias
- Pruebas de regresión
- Validación de funcionalidades

### Monitoreo
- Sistema de logging
- Registro de errores
- Estadísticas de uso

### Soporte
- Documentación actualizada
- Guía de resolución de problemas
- Comunicación con usuarios

---
**Versión**: 1.0  
**Fecha**: Enero 2026  
**Estado**: Documentación Completa
