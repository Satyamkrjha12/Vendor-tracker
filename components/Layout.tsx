
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onLogout?: () => void;
  showLogout?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onLogout, showLogout }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl border-x border-slate-200">
      <header className="sticky top-0 z-10 bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-tight">Zappy <span className="font-normal opacity-80">Vendor</span></h1>
        {showLogout && (
          <button 
            onClick={onLogout}
            className="text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded transition-colors"
          >
            Logout
          </button>
        )}
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        {children}
      </main>
      
      <footer className="p-4 text-center text-slate-400 text-xs border-t border-slate-100">
        &copy; 2024 Zappy Events Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
