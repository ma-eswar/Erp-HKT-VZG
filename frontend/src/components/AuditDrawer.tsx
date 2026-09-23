import React, { useEffect, useState } from 'react';
import { X, History, User, Clock, ShieldCheck, FileCode } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { AuditLog } from '../types';

interface AuditDrawerProps {
  isOpen: boolean;
  resultId: string | null;
  studentName?: string;
  onClose: () => void;
}

export const AuditDrawer: React.FC<AuditDrawerProps> = ({
  isOpen,
  resultId,
  studentName,
  onClose,
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !resultId) return;

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getAuditTrail(resultId);
        setLogs(data);
      } catch (err: any) {
        const msg = err instanceof ApiError ? err.message : 'Failed to fetch audit trail';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [isOpen, resultId]);

  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'OCC_GRADE_UPDATE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            OCC GRADE UPDATE
          </span>
        );
      case 'AMENDMENT_REQUESTED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            AMENDMENT REQUESTED
          </span>
        );
      case 'AMENDMENT_APPROVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            AMENDMENT APPROVED
          </span>
        );
      case 'AMENDMENT_REJECTED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            AMENDMENT REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform ease-in-out duration-300">
          {/* Top Bar */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Immutable Audit Ledger
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  {studentName ? `Exam Result: ${studentName}` : `ID: ${resultId}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Header Notice */}
          <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Append-Only Cryptographic Audit Trail
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              {logs.length} event{logs.length === 1 ? '' : 's'} recorded
            </span>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-medium">Fetching cryptographic audit logs...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
                <p className="font-bold mb-1">Failed to load audit trail:</p>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && logs.length === 0 && !error && (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <FileCode className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-medium text-slate-600">No modifications logged yet</p>
                <p className="text-xs text-slate-400">
                  Audit records will appear here whenever grades are saved or amended.
                </p>
              </div>
            )}

            {logs.map((log, index) => (
              <div
                key={log.id || index}
                className="relative pl-6 pb-6 border-l-2 border-slate-200 last:border-l-0 last:pb-0 group"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-600 group-hover:scale-125 transition-transform flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all">
                  {/* Top row */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>{getActionBadge(log.actionType)}</div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Actor details */}
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">{log.actorName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                      {log.actorRole}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      ({log.actorEmail})
                    </span>
                  </div>

                  {/* Diff Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="bg-rose-50/70 border border-rose-200/70 rounded-xl p-2.5">
                      <div className="text-[10px] uppercase font-bold text-rose-700 mb-1 flex items-center justify-between">
                        <span>Before State</span>
                        <span className="text-[9px] font-normal">Snapshot</span>
                      </div>
                      <pre className="text-[11px] text-rose-950 overflow-x-auto whitespace-pre-wrap">
                        {log.beforeState
                          ? JSON.stringify(log.beforeState, null, 2)
                          : 'null'}
                      </pre>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-2.5">
                      <div className="text-[10px] uppercase font-bold text-emerald-700 mb-1 flex items-center justify-between">
                        <span>After State</span>
                        <span className="text-[9px] font-normal">Mutated</span>
                      </div>
                      <pre className="text-[11px] text-emerald-950 overflow-x-auto whitespace-pre-wrap">
                        {log.afterState
                          ? JSON.stringify(log.afterState, null, 2)
                          : 'null'}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
