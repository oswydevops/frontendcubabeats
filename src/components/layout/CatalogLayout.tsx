import React from 'react';
import { Navbar } from './Navbar';
import { Player } from '../player/Player';
import { Footer } from './Footer';

interface CatalogLayoutProps {
  children: React.ReactNode;
}

export const CatalogLayout: React.FC<CatalogLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0D0D14] text-white flex flex-col transition-colors">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow pt-16 pb-12 overflow-x-hidden animate-in fade-in duration-300">
        {children}
      </main>

      {/* Modern Catalog/Public Footer */}
      <Footer />

      {/* Global Bottom Audio play bar */}
      <Player />
    </div>
  );
};
