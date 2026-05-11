import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-mesh text-slate-200">
      <Sidebar />
      <main className="flex-1 ml-72 p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto animate-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
