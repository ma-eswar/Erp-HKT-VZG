import React from 'react';
import { RefreshCw, X, ShieldAlert } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  errorMessage: string;
  onRefresh: () => void;
  onClose: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  errorMessage,
  onRefresh,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden transform transition-all animate-scaleUp">
        {/* Header Strip */}
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950">
                Optimistic Concurrency Conflict (409)
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                Lost-Update Anomaly Prevented by OCC Lock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-rose-400 hover:text-rose-700 transition-colors p-1 rounded-lg hover:bg-rose-100/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/80 text-xs text-rose-900 leading-relaxed font-mono">
            {errorMessage ||
              'The record was modified by another evaluator. Expected version mismatch prevented overwriting.'}
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-800">• Integrity Guarantee:</span>
              <span>The database rejected stale version writes to ensure atomicity.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-800">• Resolution:</span>
              <span>Click "Refresh & Reconcile" to load the latest state and current version lock.</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onRefresh();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh & Reconcile Data
          </button>
        </div>
      </div>
    </div>
  );
};
