# Calculadora de Propinas - Project Overview

## Project Description
This is a Flutter application called "Calculadora de Propinas" (Tips Calculator) that helps restaurants calculate and distribute tips among staff members. The app handles tip distribution considering percentages for Transbank payments, kitchen staff, and individual waiters (garzones) based on configurable percentages.

## Architecture & Technologies
- **Framework**: Flutter (Dart)
- **State Management**: Riverpod
- **Navigation**: Go Router
- **Data Storage**: Hive (local database)
- **UI Framework**: Material Design with Material 3
- **Additional Libraries**:
  - Google Fonts
  - Intl (for internationalization)
  - FL Chart (for statistics visualization)
  - File Saver (for CSV export)
  - Equatable (for entity comparison)
  - Shared Preferences (for persistent configuration)
  - File Picker (for backup/restore functionality)
  - Crypto (for secure password hashing)

## Key Features
1. **Tip Calculation**: Calculates total tips with breakdowns for Transbank, kitchen, and waitstaff
2. **Role-based Access**: Different views for waiters and administrators
3. **History Tracking**: Stores calculation history locally
4. **Statistics Dashboard**: Visualizes tip distribution data
5. **CSV Export**: Exports historical data to CSV format
6. **Waiter Detail View**: Shows individual waiter statistics
7. **Dynamic Waiter Management**: Add, edit, and remove waiters with validation
8. **Robust Validation**: Comprehensive validation of business rules and data integrity
9. **Persistent Configuration**: Saves and loads default values for percentages
10. **Settings Screen**: Allows users to customize default configurations
11. **Comprehensive Logging**: Built-in logging system for debugging and monitoring
12. **Unit Tests**: Extensive test coverage for business logic
13. **Backup & Restore**: Full data backup and restoration capabilities
14. **Global Error Handling**: Centralized error management system
15. **Documentation**: Comprehensive code documentation
16. **Secure Authentication**: Password hashing and credential management
17. **Session Management**: Time-based session control and inactivity detection
18. **Audit Trail**: Logging of important actions and events
19. **Real-time Validation**: On-the-fly validation of user inputs
20. **Theme Management**: Light/dark mode with appearance customization
21. **Notification System**: Alerts for important events and reminders
22. **Advanced Permission Management**: Granular access control to features
23. **Caching System**: Efficient data caching for improved performance
24. **Style Guide**: Comprehensive coding standards and best practices
25. **Technical Documentation**: Detailed system architecture and implementation

## Application Structure
```
lib/
├── domain/
│   ├── entities/           # Business entities with validation
│   │   ├── propina.dart    # Tip entity with validation
│   │   ├── usuario.dart    # User entity with validation
│   │   └── garzon.dart     # Waiter entity with validation
│   ├── repositories/       # Repository interfaces
│   │   └── propina_repository.dart
│   └── usecases/           # Business logic services
│       ├── calcular_propina_usecase.dart
│       └── gestionar_garzones_usecase.dart
├── data/
│   ├── datasources/
│   ├── models/             # Legacy models (exports domain entities)
│   │   ├── propina.dart
│   │   ├── usuario.dart
│   │   └── garzon.dart
│   └── repositories/       # Repository implementations
│       └── propina_repository_impl.dart
├── presentation/
│   ├── providers/          # Riverpod state management
│   │   ├── garzones_provider.dart
│   │   └── propina_provider.dart
│   ├── screens/            # App screens
│   │   ├── home_screen.dart
│   │   ├── login_screen.dart
│   │   ├── historial_screen.dart
│   │   ├── estadisticas_screen.dart
│   │   ├── garzon_detail_screen.dart
│   │   ├── gestionar_garzones_screen.dart
│   │   ├── configuracion_screen.dart
│   │   ├── backup_screen.dart
│   │   └── cambiar_contrasena_screen.dart
│   └── widgets/            # Reusable UI components
│       ├── garzon_card.dart
│       ├── estadisticas_chart.dart
│       ├── tip_summary.dart
│       └── info_sesion_widget.dart
├── core/
│   ├── errors/             # Custom exceptions
│   │   └── exceptions.dart
│   └── utils/              # Utility functions
│       ├── configuracion_service.dart
│       ├── logging_service.dart
│       ├── backup_service.dart
│       ├── error_handler.dart
│       ├── autenticacion_service.dart
│       ├── tema_service.dart
│       ├── sesion_service.dart
│       ├── auditoria_service.dart
│       ├── notificacion_service.dart
│       ├── permiso_service.dart
│       ├── cache_service.dart
│       ├── formatter.dart
│       └── date_formatter.dart
├── services/
│   └── database_service.dart  # Local storage with Hive
├── test/                   # Unit tests
│   ├── calcular_propina_test.dart
│   ├── garzon_test.dart
│   ├── gestionar_garzones_test.dart
│   └── configuracion_service_test.dart
├── doc/                    # Documentation
│   ├── documentacion_codigo.md
│   ├── demostracion_visual.md
│   ├── guia_estilo.md
│   └── documentacion_tecnica.md
├── scripts/                # Automation scripts
│   ├── automatizacion.bat
│   ├── pruebas.bat
│   └── versiones.bat
├── CHANGELOG.md            # Version history
├── analysis_options.yaml   # Code analysis configuration
└── main.dart               # Entry point with routing setup
```

## Building and Running
### Prerequisites
- Flutter SDK (version compatible with Dart SDK 3.7.0)
- Android Studio/VS Code with Flutter plugin

### Setup Instructions
1. Clone or download the project
2. Navigate to the project directory
3. Run `flutter pub get` to install dependencies
4. Run `flutter run` to start the application

### Available Commands
- `flutter run` - Build and run the app on connected device/simulator
- `flutter test` - Run unit tests
- `flutter analyze` - Check for static analysis issues
- `flutter pub get` - Install/update dependencies
- `flutter build apk` - Build APK for Android
- `flutter build ios` - Build for iOS

## Development Conventions
- **Code Style**: Follows Flutter/Dart recommended lints from `flutter_lints`
- **Architecture**: Clean Architecture with separation of concerns (domain, data, presentation)
- **Navigation**: Uses Go Router for declarative navigation
- **Data Persistence**: Hive for local storage of tip history
- **Configuration**: Shared Preferences for persistent settings
- **Backup/Restore**: File Picker for backup operations
- **Security**: Password hashing with crypto package
- **Authentication**: Secure credential management
- **Session Management**: Time-based session control
- **Audit Trail**: Logging of important user actions
- **Notifications**: Alert system for important events
- **Permissions**: Advanced access control system
- **Caching**: Efficient data caching mechanisms
- **Logging**: Built-in logging system for debugging
- **Error Handling**: Global error management system
- **UI Components**: Reusable widgets in the widgets directory
- **State Management**: Riverpod for reactive state management
- **Authentication**: Role-based access (admin/waiter) with secure login
- **Validation**: Comprehensive validation at domain level with custom exceptions
- **Testing**: Unit tests for business logic validation
- **Documentation**: Comprehensive code documentation
- **Style Guide**: Coding standards and best practices
- **Technical Docs**: Detailed system architecture documentation

## Key Functionalities
1. **Login System**: Secure authentication with password hashing
2. **Session Management**: Automatic session timeout and inactivity detection
3. **Tip Calculation Logic**:
   - Calculates Transbank percentage (default 3.5%)
   - Calculates Kitchen percentage (default 10%)
   - Distributes remaining amount among waiters based on percentage weights
   - Comprehensive validation of business rules
4. **Data Storage**: Historical tip records saved locally
5. **Data Visualization**: Charts showing tip distribution statistics
6. **Export Feature**: Generate CSV reports of tip history
7. **Waiter Management**: Dynamic addition, editing, and removal of waiters
8. **Configuration Management**: Save/load default percentages and settings
9. **Settings Screen**: User-friendly interface for configuration
10. **Password Management**: Secure password change functionality
11. **Backup & Restore**: Full data backup and restoration capabilities
12. **Audit Trail**: Logging of important actions and events
13. **Global Error Handling**: Centralized error management system
14. **Real-time Validation**: Immediate feedback on invalid inputs
15. **Enhanced UI/UX**: Improved interface with better feedback and error handling
16. **Logging System**: Comprehensive logging for debugging and monitoring
17. **Unit Testing**: Extensive test coverage for reliable business logic
18. **Theme Management**: Light/dark mode with appearance customization
19. **Notification System**: Alerts for important events and reminders
20. **Permission Management**: Granular access control to features
21. **Caching System**: Efficient data caching for improved performance
22. **Style Guide**: Comprehensive coding standards and best practices
23. **Technical Documentation**: Detailed system architecture and implementation
24. **Documentation**: Comprehensive code documentation

## Testing
The project includes comprehensive test infrastructure with Flutter's testing framework. Tests can be run with `flutter test`. Key areas covered include:
- Tip calculation logic
- Entity validations
- Garzone management operations
- Configuration service functionality
- Backup and restore operations
- Authentication and session management
- Notification system functionality
- Permission management controls
- Caching system performance
- Integration testing

## Configuration
- Default Transbank percentage: 3.5%
- Default Kitchen percentage: 10%
- Predefined waiters: Ana (30%), Luis (70%)
- Persistent settings: Saved between app sessions
- Session timeout: 30 minutes by default
- Inactivity timeout: 15 minutes by default
- Notification retention: 30 days by default
- Cache size limit: 100 entries by default
- Backup location: Device's documents directory

## Documentation
- **Code Documentation**: Inline documentation in all classes and methods
- **Style Guide**: Comprehensive coding standards in `guia_estilo.md`
- **Technical Docs**: Detailed architecture in `documentacion_tecnica.md`
- **Visual Demo**: Interface examples in `demostracion_visual.md`
- **Implementation Guide**: Step-by-step implementation details

## Notes
- The app uses local Hive database for storing tip history
- Configuration settings are persisted using Shared Preferences
- Passwords are securely hashed using the crypto package
- Session management includes automatic timeout and inactivity detection
- Audit trail logs important user actions for security and compliance
- Notification system alerts users to important events and reminders
- Permission system provides granular access control to features
- Caching system improves performance by storing frequently accessed data
- Backup data is stored in JSON format in the device's documents directory
- Authentication is secured with password hashing
- The app follows Material Design 3 guidelines
- CSV export functionality allows for external reporting
- Business logic is separated from UI concerns
- Comprehensive validation ensures data integrity
- Logging system aids in debugging and monitoring
- Unit tests provide confidence in code changes
- Global error handler captures and logs unhandled exceptions
- File Picker enables secure file selection for backup/restore operations
- Theme management supports light/dark modes
- Style guide ensures consistent code quality
- Technical documentation provides detailed system insights
- Visual demonstrations show interface designs