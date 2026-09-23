import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { api, ApiError } from '../api/client';
import { AmendmentItem } from '../types';

interface GovernanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjudicated?: () => void;
}

export const GovernanceDrawer: React.FC<GovernanceDrawerProps> = ({
  isOpen,
  onClose,
  onAdjudicated,
}) => {
  const [amendments, setAmendments] = useState<AmendmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPendingAmendments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPendingAmendments();
      setAmendments(data);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch pending amendments';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPendingAmendments();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdjudicate = async (
    amendmentId: string,
    decision: 'APPROVED' | 'REJECTED',
  ) => {
    setActionLoadingId(amendmentId);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await api.adjudicateAmendment(amendmentId, decision);
      setSuccessMessage(res.message);
      await fetchPendingAmendments();
      if (onAdjudicated) {
        onAdjudicated();
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Adjudication failed';
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform ease-in-out duration-300">
          {/* Top Bar */}
          <div className="px-6 py-5 bg-purple-950 text-white flex items-center justify-between border-b border-purple-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Dean Governance & Adjudication Queue
                </h2>
                <p className="text-xs text-purple-300">
                  Maker-Checker Protocol: Separation of Academic Duties
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-purple-900/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner notification */}
          <div className="bg-purple-50 px-6 py-3 border-b border-purple-100 flex items-center justify-between text-xs text-purple-900 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Pending Tickets: <strong>{amendments.length}</strong> requires Dean Adjudication</span>
            </span>
            <button
              onClick={fetchPendingAmendments}
              className="text-[11px] underline hover:text-purple-700 font-semibold"
            >
              Refresh Queue
            </button>
          </div>

          {/* Feedback banners */}
          {successMessage && (
            <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ticket list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-2">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-medium">Loading pending tickets...</p>
              </div>
            )}

            {!isLoading && amendments.length === 0 && (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <FileCheck2 className="w-12 h-12 mx-auto text-emerald-500 opacity-60" />
                <h3 className="text-base font-semibold text-slate-800">
                  All Governance Queues Cleared
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are no pending post-publication grade amendments waiting for Dean review.
                </p>
              </div>
            )}

            {amendments.map((ticket) => {
              const isActioning = actionLoadingId === ticket.id;
              const markDiff = ticket.proposedMarks - ticket.originalMarks;

              return (
                <div
                  key={ticket.id}
                  className="bg-white border-2 border-purple-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {ticket.studentName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {ticket.studentEmail}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Course: {ticket.courseCode || 'CS101'} - {ticket.courseTitle} ({ticket.term})
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                      PENDING REVIEW
                    </span>
                  </div>

                  {/* Mark Comparison Diff */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Original Published Mark
                      </span>
                      <span className="text-lg font-mono font-bold text-slate-600 line-through">
                        {ticket.originalMarks.toFixed(1)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-0.5">
                        Proposed New Mark
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-mono font-extrabold text-emerald-600">
                          {ticket.proposedMarks.toFixed(1)}
                        </span>
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            markDiff >= 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {markDiff >= 0 ? `+${markDiff.toFixed(1)}` : markDiff.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Justification Box */}
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs">
                    <span className="font-semibold text-amber-900 block mb-1">
                      Faculty Justification (Maker: {ticket.makerName}):
                    </span>
                    <p className="text-slate-700 italic">
                      "{ticket.justification}"
                    </p>
                  </div>

                  {/* Footer & Adjudication Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjudicate(ticket.id, 'REJECTED')}
                        disabled={isActioning}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        onClick={() => handleAdjudicate(ticket.id, 'APPROVED')}
                        disabled={isActioning}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve & Increment Revision
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
