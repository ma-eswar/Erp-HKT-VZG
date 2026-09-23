import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Gradebook } from './components/Gradebook';
import { StudentPortal } from './components/StudentPortal';
import { GovernanceDrawer } from './components/GovernanceDrawer';
import {
  ShieldCheck,
  Activity,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [governanceOpen, setGovernanceOpen] = useState<boolean>(false);

  const isStudent = user?.role === 'STUDENT';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      {/* Main Workspace Area */}
      <main className="flex-1">
        {isStudent ? (
          <StudentPortal />
        ) : (
          <Gradebook />
        )}
      </main>

      {/* Dean Governance Floating Quick Access Button */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setGovernanceOpen(true)}
            className="px-5 py-3 rounded-2xl bg-purple-900 text-white font-semibold text-xs shadow-xl hover:bg-purple-950 transition-all flex items-center gap-2 border border-purple-700/50 hover:scale-105 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span>Dean Governance Queue</span>
          </button>
        </div>
      )}

      {/* Governance Drawer for Dean */}
      <GovernanceDrawer
        isOpen={governanceOpen}
        onClose={() => setGovernanceOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Institutional ERP Platform</span>
            <span>•</span>
            <span className="font-mono text-[11px]">OCC + ABAC + Maker-Checker Governance</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <Activity className="w-3.5 h-3.5" />
              API Gateway: :3001
            </span>
            <span>•</span>
            <span className="text-slate-400">PostgreSQL + NestJS Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
