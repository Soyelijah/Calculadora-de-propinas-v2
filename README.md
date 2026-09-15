# Calculadora de Propinas

Una aplicación web moderna construida con React, TypeScript y Tailwind CSS para calcular y distribuir propinas en restaurantes, con autenticación segura, gestión de garzones, historial, estadísticas visuales y respaldo de datos.

## Características Principales

- 🧮 **Cálculo de Propinas**: Distribución precisa considerando deducciones de Transbank, porcentaje de cocina y ponderación entre garzones con validaciones de consistencia.
- 🔐 **Autenticación Segura**: Sesiones protegidas por tokens locales, hashing SHA-256 de contraseñas y control de acceso basado en roles (Administrador / Garzón).
- ⏱️ **Gestión de Sesión**: Temporizador de sesión activa de 30 minutos con cuenta regresiva en tiempo real.
- 👥 **Gestión de Garzones**: Agregar, editar y eliminar garzones con control estricto del porcentaje acumulado (máximo 100%) y detalle individual por garzón.
- 📜 **Historial Completo**: Registro detallado con buscador por nombre de garzón, filtro por rango de fechas, vista en tarjetas y vista en tabla.
- 📊 **Estadísticas Visuales**: Gráfico circular interactivo y métricas acumuladas (total propinas, cocina, transbank, promedios).
- 📈 **Exportación CSV**: Descarga instantánea de reportes en formato CSV.
- 💾 **Backup y Restauración**: Exportación y restauración de datos en formato JSON estandarizado.
- 🎨 **Temas y Apariencia**: Soporte para Modo Claro, Modo Oscuro y sincronización con el Sistema.

## Usuarios de Prueba

- **Administrador**: `admin` / `admin123`
- **Garzón 1**: `ana` / `ana123`
- **Garzón 2**: `luis` / `luis123`

## Tecnologías Utilizadas

- **React 18** con **TypeScript**
- **Vite** para desarrollo y empaquetado ultrarrápido
- **Tailwind CSS v4** para diseño responsivo
- **Recharts** para visualización de estadísticas
- **Lucide React** para iconografía
- **Web Crypto API** para encriptación segura SHA-256

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en http://localhost:3000
- `npm run build`: Compila la aplicación para producción
- `npm run preview`: Previsualiza la versión compilada

---

**Versión**: 1.0.0
