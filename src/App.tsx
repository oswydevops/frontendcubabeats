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

// Admin panel screens
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminTransactions } from './pages/admin/AdminTransactions';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminStats } from './pages/admin/AdminStats';
import { AdminProfile } from './pages/admin/AdminProfile';

// Alerts icons
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const { currentPath, toasts } = useApp();

  // 1. Dynamic route selector
  const renderContent = () => {
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

      // Administration setup paths
      case '/admin/dashboard':
        return <AdminDashboard />;
      case '/admin/users':
        return <AdminUsers />;
      case '/admin/transactions':
        return <AdminTransactions />;
      case '/admin/plans':
        return <AdminPlans />;
      case '/admin/stats':
        return <AdminStats />;
      case '/admin/profile':
        return <AdminProfile />;

      default:
        return <CatalogPage />;
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
      <div id="qb-toast-container" className="fixed top-5 right-5 space-y-2.5 z-999 max-w-sm w-full pointer-events-none px-4 sm:px-0">
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

    </div>
  );
}
