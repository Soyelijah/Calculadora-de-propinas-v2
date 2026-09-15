# Guía de Estilo y Buenas Prácticas - Calculadora de Propinas

## 📋 Índice
1. [Introducción](#introducción)
2. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
3. [Estructura del Código](#estructura-del-código)
4. [Principios de Arquitectura](#principios-de-arquitectura)
5. [Prácticas de Seguridad](#prácticas-de-seguridad)
6. [Manejo de Errores](#manejo-de-errores)
7. [Documentación](#documentación)
8. [Pruebas](#pruebas)
9. [Rendimiento](#rendimiento)

## Introducción

Esta guía establece las convenciones y buenas prácticas para el desarrollo del proyecto "Calculadora de Propinas". Su objetivo es mantener la consistencia, calidad y mantenibilidad del código.

## Convenciones de Nomenclatura

### Dart/Flutter
- **Clases**: `PascalCase` (ej. `CalculadoraPropinaService`)
- **Variables/Métodos**: `camelCase` (ej. `calcularPropina()`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej. `DEFAULT_PERCENTAGE`)
- **Archivos**: `snake_case.dart` (ej. `calcular_propina_usecase.dart`)
- **Paquetes**: `lowercase_with_underscores` (ej. `core.utils`)

### Nombres Descriptivos
- Usar nombres que expresen claramente la intención
- Evitar abreviaturas no estándar
- Prefijar con guion bajo para miembros privados

```dart
// ❌ Mal
class CPService {}
var x = 5;
void calc() {}

// ✅ Bien
class CalculadoraPropinaService {}
var porcentajeTransbank = 5.0;
void calcularDistribucionPropina() {}
```

## Estructura del Código

### Organización de Archivos
```
lib/
├── domain/                 # Lógica de negocio
│   ├── entities/           # Modelos de dominio
│   ├── repositories/       # Interfaces de repositorio
│   └── usecases/           # Casos de uso
├── data/                   # Capa de datos
│   ├── datasources/        # Fuentes de datos
│   ├── models/             # Modelos de datos heredados
│   └── repositories/       # Implementaciones de repositorio
├── presentation/           # Capa de presentación
│   ├── providers/          # Riverpod providers
│   ├── screens/            # Pantallas de la app
│   └── widgets/            # Componentes reutilizables
├── core/                   # Componentes transversales
│   ├── errors/             # Excepciones personalizadas
│   └── utils/              # Servicios y utilidades
├── services/               # Servicios de negocio
├── test/                   # Pruebas unitarias
└── main.dart               # Punto de entrada
```

### Importación de Paquetes
Ordenar imports en este orden:
1. Paquetes de Flutter
2. Paquetes externos
3. Paquetes locales (proyecto)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'package:calculadora_propinas/core/utils/configuracion_service.dart';
import 'package:calculadora_propinas/domain/entities/propina.dart';
import 'package:calculadora_propinas/ui/widgets/garzon_card.dart';
```

## Principios de Arquitectura

### Clean Architecture
- **Separación de responsabilidades**: Cada capa tiene responsabilidades claras
- **Dependencias hacia adentro**: Capas externas dependen de capas internas
- **Independencia de frameworks**: Lógica de negocio no depende de Flutter

### Single Responsibility Principle (SRP)
Cada clase debe tener una sola razón para cambiar.

```dart
// ❌ Mal - Una clase hace demasiado
class CalculadoraService {
  // Calcula propinas
  // Guarda en DB
  // Envia notificaciones
}

// ✅ Bien - Responsabilidades separadas
class CalculadoraPropinaService {}
class DatabaseService {}
class NotificacionService {}
```

### Dependency Inversion Principle (DIP)
Depender de abstracciones, no de implementaciones concretas.

```dart
// ✅ Bien - Dependencia de abstracción
abstract class PropinaRepository {
  Future<void> guardarPropina(Propina propina);
}

class DatabaseService implements PropinaRepository {
  @override
  Future<void> guardarPropina(Propina propina) async {
    // Implementación
  }
}
```

## Prácticas de Seguridad

### Validación de Entradas
- Validar todas las entradas de usuario
- Usar tipos seguros y validaciones en tiempo de compilación cuando sea posible

```dart
// ✅ Bien - Validación robusta
class CalculadoraPropinaService {
  Propina calcular({
    required double montoTotal,
    required double porcentajeTransbank,
    required double porcentajeCocina,
    required Map<String, double> porcentajesGarzones,
  }) {
    if (montoTotal <= 0) throw ValoresNegativosException();
    if (porcentajeTransbank < 0 || porcentajeTransbank > 100) throw PorcentajeInvalidoException();
    // ... más validaciones
  }
}
```

### Manejo de Contraseñas
- Nunca almacenar contraseñas en texto plano
- Usar hashing seguro (SHA256 o superior)
- Implementar políticas de contraseñas seguras

### Control de Acceso
- Implementar sistema de permisos
- Validar roles antes de operaciones sensibles
- Registrar eventos de seguridad

## Manejo de Errores

### Excepciones Personalizadas
Crear excepciones específicas para diferentes tipos de errores:

```dart
class PorcentajesInvalidosException implements Exception {
  final String message;
  PorcentajesInvalidosException([this.message = "La suma de porcentajes excede el 100%"]);
}

class ValoresNegativosException implements Exception {
  final String message;
  ValoresNegativosException([this.message = "No se permiten valores negativos"]);
}
```

### Manejo Global de Errores
Implementar un manejador global para capturar errores no manejados:

```dart
class GlobalErrorHandler {
  static void initGlobalErrorHandlers() {
    FlutterError.onError = (FlutterErrorDetails details) {
      _logError('Flutter Error', details.exception, details.stack);
    };
  }
}
```

## Documentación

### Comentarios en Código
- Documentar clases, métodos y variables complejas
- Usar documentación en formato DartDoc para APIs públicas
- Explicar decisiones de diseño importantes

```dart
/// Servicio para calcular la distribución de propinas entre garzones
/// 
/// Este servicio implementa la lógica de negocio para distribuir 
/// propinas considerando porcentajes para Transbank, cocina y garzones.
/// 
/// ## Ejemplo de uso:
/// ```dart
/// final calculadora = CalculadoraPropinaService();
/// final propina = calculadora.calcular(
///   montoTotal: 100000,
///   porcentajeTransbank: 3.5,
///   porcentajeCocina: 10,
///   porcentajesGarzones: {'Ana': 30, 'Luis': 70},
/// );
/// ```
class CalculadoraPropinaService {
  // ...
}
```

### Archivos README
Mantener actualizados los archivos README con:
- Descripción del proyecto
- Instrucciones de instalación
- Guía de uso
- Tecnologías utilizadas

## Pruebas

### Pruebas Unitarias
- Cubrir la lógica de negocio con pruebas unitarias
- Probar casos límite y errores esperados
- Mantener alto porcentaje de cobertura

```dart
void main() {
  group('CalculadoraPropinaService - Cálculos Correctos', () {
    test('debería calcular correctamente una propina simple', () {
      final calculadora = CalculadoraPropinaService();
      final propina = calculadora.calcular(
        montoTotal: 100000,
        porcentajeTransbank: 3.5,
        porcentajeCocina: 10,
        porcentajesGarzones: {'Ana': 30, 'Luis': 70},
      );
      
      expect(propina.montoTotal, 100000);
      expect(propina.montoTransbank, 3500);
      expect(propina.montoCocina, 9650);
    });
  });
}
```

### Pruebas de Integración
- Probar la interacción entre diferentes componentes
- Validar flujos completos de la aplicación

## Rendimiento

### Optimización de Widgets
- Usar `const` cuando sea posible
- Implementar `Equatable` para comparaciones eficientes
- Evitar reconstrucciones innecesarias

```dart
// ✅ Bien - Widget constante
class GarzonCard extends StatelessWidget {
  const GarzonCard({
    super.key,
    required this.nombre,
    required this.porcentaje,
    this.monto,
  });
  
  // ...
}
```

### Gestión de Recursos
- Liberar recursos adecuadamente
- Usar `dispose()` en widgets que manejan recursos
- Implementar cache eficiente

### Monitoreo
- Medir tiempos de respuesta
- Supervisar uso de memoria
- Registrar métricas de rendimiento

## Buenas Prácticas Adicionales

### Código Limpio
- Funciones pequeñas y con una sola responsabilidad
- Nombres descriptivos
- Evitar código duplicado
- Comentar solo lo necesario (el código debe ser autoexplicativo)

### Control de Versiones
- Usar Git con convenciones de commits claras
- Ramas con nombres descriptivos
- Pull requests con descripciones detalladas

### Colaboración
- Revisión de código por pares
- Discusión de decisiones técnicas
- Documentación compartida

---
**Nota**: Esta guía debe ser revisada y actualizada regularmente según evolucione el proyecto y se adopten nuevas prácticas.