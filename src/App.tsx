import React from 'react';
import { useApp } from './store/AppContext';

// Layout wrappers
import { CatalogLayout } from './components/layout/CatalogLayout';
import { PanelLayout } from './components/layout/PanelLayout';

// Public/Catalog/Auth screens
import { CatalogPage } from './pages/catalog/CatalogPage';
import { AboutUsPage } from './pages/about/AboutUsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { TwoFactorPage } from './pages/auth/TwoFactorPage';
import { KycPage } from './pages/auth/KycPage';
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { ArtistDashboard } from './pages/artist/ArtistDashboard';

// Producer panel screens
import { ProducerDashboard } from './pages/producer/ProducerDashboard';
import { ProducerAnalytics } from './pages/producer/ProducerAnalytics';
import { ProducerBeats } from './pages/producer/ProducerBeats';
import { ProducerOrders } from './pages/producer/ProducerOrders';
import { ProducerEarnings } from './pages/producer/ProducerEarnings';
import { ProducerProfile } from './pages/producer/ProducerProfile';
import { ProducerPaymentMethods } from './pages/producer/ProducerPaymentMethods';
import { ProducerPlans } from './pages/producer/ProducerPlans';
import { ProducerPendingApproval } from './pages/producer/ProducerPendingApproval';
import { BecomeProducerPage } from './pages/producer/BecomeProducerPage';

// Admin panel screens
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminTransactions } from './pages/admin/AdminTransactions';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminStats } from './pages/admin/AdminStats';
import { AdminProfile } from './pages/admin/AdminProfile';
import { AdminPlanRequests } from './pages/admin/AdminPlanRequests';
import { AdminPaymentMethods } from './pages/admin/AdminPaymentMethods';
import { AdminSupport } from './pages/admin/AdminSupport';
import { SupportChatWidget } from './components/support/SupportChatWidget';
import { ErrorPages } from './pages/errors/ErrorPages';
import { MaintenancePage } from './pages/errors/MaintenancePage';
import { useStaffPermissions } from './hooks/useStaffPermission';

// Alerts icons
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const { currentPath, toasts, user, isMaintenanceMode } = useApp();
  const staffPermissions = useStaffPermissions();

  // 1. Dynamic route selector
  const renderContent = () => {
    // If the platform is in maintenance, override render for non-admins (except when testing errors specifically)
    if (isMaintenanceMode && user?.role !== 'admin' && currentPath !== '/login' && !currentPath.startsWith('/errors/')) {
      return <MaintenancePage />;
    }

    const PENDING_ALLOWED_PATHS = ['/producer/pending-approval', '/hazte-vendedor', '/vendedor'];

    const isBlockedPendingProducer =
      user?.role === 'producer' &&
      user?.producerApprovalStatus === 'pending' &&
      currentPath.startsWith('/producer/') &&
      !PENDING_ALLOWED_PATHS.includes(currentPath);

    if (isBlockedPendingProducer) {
      return <ProducerPendingApproval />;
    }

    switch (currentPath) {
      // Catalog public paths
      case '/':
        return <CatalogPage />;
      case '/about':
        return <AboutUsPage />;
      case '/login':
        return <LoginPage />;
      case '/register':
        return <RegisterPage />;
      case '/two-factor':
        return <TwoFactorPage />;
      case '/kyc':
        return <KycPage />;
      case '/cart':
        return <CartPage />;
      case '/checkout':
        return <CheckoutPage />;
      case '/artist/dashboard':
        return <ArtistDashboard />;

      // Error and Maintenance paths
      case '/errors/401':
        return <ErrorPages code="401" />;
      case '/errors/403':
        return <ErrorPages code="403" />;
      case '/errors/404':
        return <ErrorPages code="404" />;
      case '/errors/500':
        return <ErrorPages code="500" />;
      case '/errors/503':
        return <ErrorPages code="503" />;
      case '/mantenimiento':
        return <MaintenancePage />;

      // Producer workspace paths
      case '/producer/dashboard':
        return <ProducerDashboard />;
      case '/producer/analytics':
        return <ProducerAnalytics />;
      case '/producer/beats':
        return <ProducerBeats />;
      case '/producer/orders':
        return <ProducerOrders />;
      case '/producer/transactions':
      case '/producer/earnings':
        return <ProducerEarnings />;
      case '/producer/profile':
        return <ProducerProfile />;
      case '/producer/payment-methods':
        return <ProducerPaymentMethods />;
      case '/producer/plans':
        return <ProducerPlans />;
      case '/producer/pending-approval':
        return <ProducerPendingApproval />;
      case '/hazte-vendedor':
      case '/vendedor':
        return <BecomeProducerPage />;

      // Administration setup paths
      case '/admin/dashboard':
        return <AdminDashboard />;
      case '/admin/users':
        if (!staffPermissions.canManageUsers) {
          return (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-brand-surface rounded-2xl border border-brand-border/40 space-y-3">
              <h2 className="text-xl font-bold text-brand-accent-red">Acceso Denegado</h2>
              <p className="text-xs text-gray-400">No tienes permisos para gestionar o moderar usuarios en la plataforma.</p>
            </div>
          );
        }
        return <AdminUsers />;
      case '/admin/transactions':
        if (!staffPermissions.canViewTransactions) {
          return (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-brand-surface rounded-2xl border border-brand-border/40 space-y-3">
              <h2 className="text-xl font-bold text-brand-accent-red">Acceso Denegado</h2>
              <p className="text-xs text-gray-400">Tu rol de colaborador no tiene privilegios para acceder a los registros financieros ni de transacciones.</p>
            </div>
          );
        }
        return <AdminTransactions />;
      case '/admin/plans':
        if (!staffPermissions.canManagePlans) {
          return (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-brand-surface rounded-2xl border border-brand-border/40 space-y-3">
              <h2 className="text-xl font-bold text-brand-accent-red">Acceso Denegado</h2>
              <p className="text-xs text-gray-400">Tu rol no tiene privilegios para configurar o editar planes de suscripción.</p>
            </div>
          );
        }
        return <AdminPlans />;
      case '/admin/plan-requests':
        if (!staffPermissions.canAssignRoles) {
          return (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-brand-surface rounded-2xl border border-brand-border/40 space-y-3">
              <h2 className="text-xl font-bold text-brand-accent-red">Acceso Denegado</h2>
              <p className="text-xs text-gray-400">La aprobación de solicitudes de planes está reservada al Super Administrador.</p>
            </div>
          );
        }
        return <AdminPlanRequests />;
      case '/admin/stats':
        return <AdminStats />;
      case '/admin/payment-methods':
        if (!staffPermissions.canManagePaymentAccounts) {
          return (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-brand-surface rounded-2xl border border-brand-border/40 space-y-3">
              <h2 className="text-xl font-bold text-brand-accent-red">Acceso Denegado</h2>
              <p className="text-xs text-gray-400">Los colaboradores no tienen privilegios para consultar o modificar las cuentas de cobro oficiales de la plataforma.</p>
            </div>
          );
        }
        return <AdminPaymentMethods />;
      case '/admin/support':
        if (!staffPermissions.canManageSupport) {
          return (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-brand-surface rounded-2xl border border-brand-border/40 space-y-3">
              <h2 className="text-xl font-bold text-brand-accent-red">Acceso Denegado</h2>
              <p className="text-xs text-gray-400">Tu rol administrativo no tiene asignada la gestión del centro de soporte técnico.</p>
            </div>
          );
        }
        return <AdminSupport />;
      case '/admin/profile':
        return <AdminProfile />;

      default:
        return <ErrorPages code="404" />;
    }
  };

  // 2. Identify layout wrappers
  const isPanelPath = currentPath.startsWith('/producer/') || currentPath.startsWith('/admin/');

  return (
    <div className="relative font-sans antialiased text-slate-200">
      
      {/* Dynamic layout mounting */}
      {isPanelPath ? (
        <PanelLayout>{renderContent()}</PanelLayout>
      ) : (
        <CatalogLayout>{renderContent()}</CatalogLayout>
      )}

      {/* Floating System-Wide Notifier Toasts */}
      <div id="qb-toast-container" className="fixed top-25 right-5 space-y-2.5 z-999 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              p-4 rounded-xl shadow-xl flex items-start gap-3 border pointer-events-auto animate-in slide-in-from-right-10 duration-200
              ${t.type === 'success' ? 'bg-[#15803d]/95 border-emerald-500/30 text-white' : ''}
              ${t.type === 'error' ? 'bg-[#be123c]/95 border-red-500/30 text-white' : ''}
              ${t.type === 'info' ? 'bg-[#1e1b4b]/95 border-[#7F77DD]/30 text-white' : ''}
            `}
          >
            {t.type === 'success' && <CheckCircle2 size={16} className="text-emerald-300 flex-shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle size={16} className="text-red-300 flex-shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info size={16} className="text-indigo-300 flex-shrink-0 mt-0.5" />}

            <div className="flex-grow text-xs font-semibold leading-normal text-left">
              {t.msg}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Support Chat Widget for Artists & Producers */}
      <SupportChatWidget />

    </div>
  );
}
