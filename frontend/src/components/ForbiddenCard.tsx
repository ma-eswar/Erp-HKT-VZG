import React from 'react';
import { ShieldAlert, ArrowRight, UserCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ForbiddenCardProps {
  offeringTitle?: string;
  offeringCode?: string;
  facultyName?: string;
}

export const ForbiddenCard: React.FC<ForbiddenCardProps> = ({
  offeringTitle = 'Intro to Computer Science',
  offeringCode = 'CS101',
  facultyName = 'Prof. Alan Turing',
}) => {
  const { user, switchPersona } = useAuth();

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-sm border border-rose-200/70 text-center animate-fadeIn">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      {/* Title */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-3">
        <ShieldAlert className="w-3.5 h-3.5" />
        ABAC Guard Active — 403 Forbidden
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Access Blocked at Gateway
      </h2>

      <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
        You are authenticated as{' '}
        <span className="font-semibold text-slate-900">{user?.fullName || 'Prof. Sarah Connor'}</span> (
        <span className="font-mono text-xs text-slate-700">{user?.email}</span>), but you are not the designated instructor for{' '}
        <span className="font-semibold text-slate-900">{offeringCode} - {offeringTitle}</span>.
      </p>

      {/* ABAC Policy Decision Matrix */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left mb-6 max-w-lg mx-auto font-mono text-xs space-y-2">
        <div className="flex justify-between pb-1 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
          <span>Attribute Policy</span>
          <span>Evaluated Value</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span className="text-slate-500">Subject (Active User):</span>
          <span className="font-medium text-rose-700">{user?.email}</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span className="text-slate-500">Resource (Assigned Faculty):</span>
          <span className="font-medium text-blue-700">alan@erp.edu ({facultyName})</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span className="text-slate-500">ABAC Policy Decision:</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
            HTTP 403 FORBIDDEN
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => switchPersona('alan@erp.edu')}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          Switch to Prof. Alan Turing (Assigned)
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => switchPersona('dean@erp.edu')}
          className="px-4 py-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all"
        >
          Switch to Dean Evans (Admin Access)
        </button>
      </div>
    </div>
  );
};
