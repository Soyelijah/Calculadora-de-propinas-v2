# Repository Guidelines

## Project Structure & Module Organization

- `lib/` is the main application code, organized by Clean Architecture: `domain/`, `data/`, `presentation/`, `core/`, and `services/`.
- `test/` contains unit tests; `test_app/` appears to hold integration or app-level test scaffolding.
- `l10n/` holds localization resources; `doc/` and `*.md` files document features and technical details.
- Platform folders (`android/`, `ios/`, `web/`, `windows/`, `macos/`, `linux/`) contain build targets.

## Build, Test, and Development Commands

- `flutter pub get` installs dependencies defined in `pubspec.yaml`.
- `flutter run` launches the app on a connected device or emulator.
- `flutter test` runs unit tests in `test/`.
- `flutter analyze` runs static analysis using `analysis_options.yaml` and `flutter_lints`.
- `scripts/automatizacion.bat` automates setup/cleanup tasks; `scripts/pruebas.bat` wraps test runs; `scripts/versiones.bat` manages versioning and changelog updates.

## Coding Style & Naming Conventions

- Dart conventions from `guia_estilo.md`: `PascalCase` for classes, `camelCase` for methods/variables, `UPPER_SNAKE_CASE` for constants, and `snake_case.dart` for files.
- Keep imports ordered: Flutter SDK, third-party packages, then local packages.
- Follow lint rules in `analysis_options.yaml` (based on `flutter_lints`).

## Testing Guidelines

- Use the Flutter `flutter_test` framework for unit tests.
- Name tests by behavior, e.g., `deberia_calcular_propina_simple` in a `*_test.dart` file.
- Aim to cover domain use cases and edge cases (validation, percentage sums, negative values).

## Commit & Pull Request Guidelines

- Git history is not available in this workspace, so no commit message convention can be inferred.
- Suggested default: short, imperative subjects (e.g., `Add tip distribution validation`).
- Pull requests should include a concise description, test evidence (`flutter test` output), and screenshots for UI changes.

## Security & Configuration Tips

- Do not store real credentials in source; prefer test accounts and local storage only.
- Validate all user inputs in domain services before persistence.
