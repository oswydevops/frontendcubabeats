import React from 'react';
import { Navbar } from './Navbar';
import { Player } from '../player/Player';
import { Footer } from './Footer';
import { useApp } from '../../store/AppContext';

interface CatalogLayoutProps {
  children: React.ReactNode;
}

export const CatalogLayout: React.FC<CatalogLayoutProps> = ({ children }) => {
  const { currentPath } = useApp();
  const isAuthPage = currentPath === '/login' || currentPath === '/register';

  return (
    <div className="min-h-screen bg-[#0D0D14] text-white flex flex-col transition-colors">
      {/* Top Navbar */}
      {!isAuthPage && <Navbar />}

      {/* Main Content Area */}
      <main className={`flex-grow ${isAuthPage ? '' : 'pt-16 pb-12'} overflow-x-hidden animate-in fade-in duration-300`}>
        {children}
      </main>

      {/* Modern Catalog/Public Footer */}
      {!isAuthPage && <Footer />}

      {/* Global Bottom Audio play bar */}
      {!isAuthPage && <Player />}
    </div>
  );
};

