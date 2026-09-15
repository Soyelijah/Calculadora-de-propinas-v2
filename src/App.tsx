import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { GestionarGarzonesScreen } from './screens/GestionarGarzonesScreen';
import { HistorialScreen } from './screens/HistorialScreen';
import { EstadisticasScreen } from './screens/EstadisticasScreen';
import { ConfiguracionScreen } from './screens/ConfiguracionScreen';
import { BackupScreen } from './screens/BackupScreen';
import { CambiarContrasenaScreen } from './screens/CambiarContrasenaScreen';
import { GarzonDetailScreen } from './screens/GarzonDetailScreen';
import { CheckCircle2, AlertCircle, Info, Clock } from 'lucide-react';

const ScreenRenderer: React.FC = () => {
  const { currentScreen, setCurrentScreen, notification, showNotification } = useApp();
  const {
    usuarioActual,
    sesionActiva,
    alertaExpiracionVisible,
    tiempoInactividadRestante,
    tiempoMaximoRestante,
    motivoExpiracion,
    extenderSesion,
    cerrarSesion,
  } = useAuth();

  // Route Guard Enforcement
  useEffect(() => {
    // 1. If password reset is required, force user to password change screen
    if (sesionActiva && usuarioActual?.debeCambiarContrasena && currentScreen !== 'cambiar-contrasena') {
      if (currentScreen === 'login') {
        cerrarSesion('Regreso a pantalla de login');
        return;
      }
      showNotification('Debe actualizar su contraseña obligatoriamente antes de continuar', 'error');
      setCurrentScreen('cambiar-contrasena');
      return;
    }

    // 2. Admin-only screens guard
    const adminScreens = ['gestionar-garzones', 'configuracion', 'backup'];
    if (adminScreens.includes(currentScreen)) {
      if (!sesionActiva) {
        showNotification('Debe iniciar sesión como Administrador para acceder', 'error');
        setCurrentScreen('login');
      } else if (usuarioActual?.rol !== 'admin') {
        showNotification('Acceso denegado: requiere privilegios de Administrador', 'error');
        setCurrentScreen('home');
      }
    }

    // 3. Authenticated-only screens guard
    const authScreens = ['cambiar-contrasena'];
    if (authScreens.includes(currentScreen) && !sesionActiva) {
      showNotification('Debe iniciar sesión para acceder a esta pantalla', 'error');
      setCurrentScreen('login');
    }
  }, [currentScreen, sesionActiva, usuarioActual, setCurrentScreen, showNotification]);

  const segundosAviso = motivoExpiracion === 'inactividad' ? tiempoInactividadRestante : tiempoMaximoRestante;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Header />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-xs font-medium border ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : notification.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {notification.type === 'info' && <Info className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Session Expiration Warning Modal (Countdown + Action) */}
      {alertaExpiracionVisible && sesionActiva && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-amber-300 dark:border-amber-700/60 p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Advertencia de Cierre de Sesión
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {motivoExpiracion === 'inactividad'
                    ? 'Inactividad detectada en el sistema'
                    : 'Límite máximo de duración de sesión'}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Su sesión se cerrará automáticamente en{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-mono text-base">
                {segundosAviso}
              </strong>{' '}
              segundos para proteger la seguridad de los datos.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={extenderSesion}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Extender Sesión
              </button>
              <button
                onClick={() => cerrarSesion('Cierre manual por usuario en advertencia')}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                Cerrar Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {currentScreen === 'home' && <HomeScreen />}
        {currentScreen === 'login' && <LoginScreen />}
        {currentScreen === 'gestionar-garzones' && <GestionarGarzonesScreen />}
        {currentScreen === 'historial' && <HistorialScreen />}
        {currentScreen === 'estadisticas' && <EstadisticasScreen />}
        {currentScreen === 'configuracion' && <ConfiguracionScreen />}
        {currentScreen === 'backup' && <BackupScreen />}
        {currentScreen === 'cambiar-contrasena' && <CambiarContrasenaScreen />}
        {currentScreen === 'garzon-detail' && <GarzonDetailScreen />}
      </main>

      {/* Clean minimal footer */}
      <footer className="py-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
        Calculadora de Propinas &bull; Sistema de Gestión y Distribución
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ScreenRenderer />
      </AppProvider>
    </AuthProvider>
  );
}

