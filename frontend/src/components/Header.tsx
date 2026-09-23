import React from 'react';
import { useAuth, PERSONAS } from '../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  User,
  Sparkles,
  School,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, activeEmail, switchPersona, isLoading } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            ADMIN / DEAN
          </span>
        );
      case 'FACULTY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            FACULTY
          </span>
        );
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            STUDENT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-inner">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Institutional ERP
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                  v2.0
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>NestJS + Postgres Live</span>
              </div>
            </div>
          </div>

          {/* Quick Persona Switcher Bar */}
          <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <div className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Persona:</span>
            </div>
            {PERSONAS.map((p) => {
              const isActive = activeEmail === p.email;
              return (
                <button
                  key={p.email}
                  onClick={() => switchPersona(p.email)}
                  disabled={isLoading}
                  title={`${p.name} - ${p.description}`}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
                  }`}
                >
                  {p.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {p.role === 'FACULTY' && (
                    p.email.includes('sarah') ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <GraduationCap className="w-3.5 h-3.5" />
                  )}
                  {p.role === 'STUDENT' && <User className="w-3.5 h-3.5" />}
                  <span>{p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}</span>
                  {isActive && (
                    <CheckCircle2 className="w-3 h-3 text-blue-200 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active User Identity Info */}
          <div className="flex items-center gap-3 shrink-0">
            {user && (
              <div className="flex items-center gap-3 bg-slate-800/60 pl-3 pr-2 py-1.5 rounded-xl border border-slate-700/50">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-100 flex items-center justify-end gap-1.5">
                    {user.fullName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {user.email}
                  </div>
                </div>
                <div>{getRoleBadge(user.role)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Persona Switcher Row */}
        <div className="flex md:hidden py-2 border-t border-slate-800 overflow-x-auto gap-2">
          {PERSONAS.map((p) => {
            const isActive = activeEmail === p.email;
            return (
              <button
                key={p.email}
                onClick={() => switchPersona(p.email)}
                disabled={isLoading}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
