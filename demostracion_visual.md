# Demostración Visual: Calculadora de Propinas

## Pantalla de Login
```
┌─────────────────────────────────┐
│        Calculadora de Propinas  │
├─────────────────────────────────┤
│                                 │
│    ╭─────────────────────╮      │
│    │      Iniciar Sesión │      │
│    ╰─────────────────────╯      │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 📧 Usuario                 │ │
│  │ ─────────────────────────   │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 🔑 Contraseña              │ │
│  │ ─────────────────────────   │ │
│  └─────────────────────────────┘ │
│                                 │
│        [ Iniciar Sesión ]        │
│                                 │
│    Usuarios de prueba:          │
│    • admin / admin123 (Admin)   │
│    • ana / ana123 (Garzón)      │
│    • luis / luis123 (Garzón)    │
│                                 │
└─────────────────────────────────┘
```

## Pantalla Principal (Home)
```
┌─────────────────────────────────────────┐
│ Calculadora de Propinas         👤 Ana │
├─────────────────────────────────────────┤
│                                         │
│  🕒 Sesión activa: Ana                │
│  🏷️ Rol: garzon                       │
│  ⏱️ Tiempo restante: 25:42 min        │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Monto total                       │ │
│  │ ┌─────────────────────────────────┐ │ │
│  │ │ 150000                         │ │ │
│  │ └─────────────────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Porcentaje Transbank (%)          │ │
│  │ ┌─────────────────────────────────┐ │ │
│  │ │ 3.5                            │ │ │
│  │ └─────────────────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Porcentaje Cocina (%)             │ │
│  │ ┌─────────────────────────────────┐ │ │
│  │ │ 10.0                           │ │ │
│  │ └─────────────────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  📊 Ponderación por Garzón              │
│  ┌─────────────────────────────────────┐ │
│  │ Ana        ┌─────────────────────┐ │ │
│  │            │ 30 %                │ │ │
│  │            └─────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ Luis       ┌─────────────────────┐ │ │
│  │            │ 70 %                │ │ │
│  │            └─────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
│                                         │
│        [ Calcular Propina ]             │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Resultado del Cálculo:             │ │
│  ├─────────────────────────────────────┤ │
│  │ Transbank: $5,250                  │ │
│  │ Cocina: $14,250                    │ │
│  │                                     │ │
│  │ Distribución por Garzón:           │ │
│  │ • Ana: $38,250                     │ │
│  │ • Luis: $90,250                    │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  [Ver Historial] [Ver Estadísticas]     │
│  [Gestionar Garzones] [Configuración]   │
│                                         │
└─────────────────────────────────────────┘
```

## Pantalla de Gestión de Garzones
```
┌─────────────────────────────────────────┐
│        Gestionar Garzones        ⚙️    │
├─────────────────────────────────────────┤
│                                         │
│  📊 Porcentaje Total: 100.0%          │
│  ✅ Estado: Válido                     │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Garzón: Ana                       │ │
│  │ Porcentaje: 30 %                  │ │
│  │ [Editar] [Eliminar]               │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ Garzón: Luis                      │ │
│  │ Porcentaje: 70 %                  │ │
│  │ [Editar] [Eliminar]               │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ + Agregar Garzón                  │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  [Guardar Configuración]               │
│                                         │
└─────────────────────────────────────────┘
```

## Pantalla de Configuración
```
┌─────────────────────────────────────────┐
│           Configuración          ⚙️    │
├─────────────────────────────────────────┤
│                                         │
│  📊 Configuración de Porcentajes        │
│  ┌─────────────────────────────────────┐ │
│  │ Porcentaje Transbank (%)          │ │
│  │ ┌─────────────────────────────────┐ │ │
│  │ │ 3.5                            │ │ │
│  │ └─────────────────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ Porcentaje Cocina (%)             │ │
│  │ ┌─────────────────────────────────┐ │ │
│  │ │ 10.0                           │ │ │
│  │ └─────────────────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  🎨 Apariencia                         │
│  ┌─────────────────────────────────────┐ │
│  │ Modo Oscuro [ ]                   │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  Modo del Tema:                        │
│  [Claro] [Sistema] [Oscuro]           │
│                                         │
│  [Guardar Configuración]               │
│  [Restaurar Valores Predeterminados]   │
│  [Gestión de Backup]                   │
│  [Cambiar Contraseña]                  │
│                                         │
└─────────────────────────────────────────┘
```

## Pantalla de Notificaciones
```
┌─────────────────────────────────────────┐
│         Notificaciones           🔔    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ ✅ Éxito                           │ │
│  │ Cálculo completado                 │ │
│  │ Hace 2m                            │ │
│  │ [✓] [×]                           │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ ⚠️ Advertencia                     │ │
│  │ Porcentaje alto detectado          │ │
│  │ Hace 5m                            │ │
│  │ [✓] [×]                           │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ 📅 Recordatorio                    │ │
│  │ Revisar cálculos pendientes        │ │
│  │ Hace 10m                           │ │
│  │ [✓] [×]                           │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  [Marcar todas como leídas]            │
│                                         │
└─────────────────────────────────────────┘
```

## Características Avanzadas Implementadas

### 🔐 Seguridad
- Autenticación con contraseñas encriptadas
- Control de sesiones con expiración
- Sistema de permisos por roles
- Auditoría de eventos importantes

### 🚀 Rendimiento
- Sistema de cache eficiente
- Validaciones en tiempo real
- Gestión óptima de recursos

### 🎨 Experiencia de Usuario
- Interfaz moderna con Material Design 3
- Modo claro/oscuro
- Notificaciones inteligentes
- Feedback visual inmediato

### 📊 Funcionalidades Completas
- Cálculo de propinas con validaciones
- Gestión completa de garzones
- Historial detallado
- Estadísticas visuales
- Backup y restauración
- Configuración avanzada
```