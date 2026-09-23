import React, { useState } from 'react';
import { X, Send, FileEdit, AlertCircle } from 'lucide-react';
import { api, ApiError } from '../api/client';

interface AmendmentModalProps {
  isOpen: boolean;
  resultId: string | null;
  studentName: string;
  currentMarks: number | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const AmendmentModal: React.FC<AmendmentModalProps> = ({
  isOpen,
  resultId,
  studentName,
  currentMarks,
  onSuccess,
  onClose,
}) => {
  const [proposedMarks, setProposedMarks] = useState<string>(
    currentMarks !== null ? currentMarks.toString() : '',
  );
  const [justification, setJustification] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !resultId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMarks = parseFloat(proposedMarks);
    if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
      setErrorMessage('Please enter a valid mark between 0.0 and 100.0');
      return;
    }
    if (!justification.trim()) {
      setErrorMessage('Please provide a rigorous academic justification for this amendment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.requestAmendment(resultId, parsedMarks, justification.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Failed to submit amendment request';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Request Post-Publication Amendment
              </h3>
              <p className="text-xs text-slate-400">
                Maker-Checker Governance Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-semibold text-slate-800">{studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Published Mark:</span>
              <span className="font-mono font-bold text-slate-900">
                {currentMarks !== null ? currentMarks.toFixed(1) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Governance Rule:</span>
              <span className="text-amber-700 font-medium">Requires Dean / Checker approval</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proposed New Mark (0.0 - 100.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={proposedMarks}
              onChange={(e) => setProposedMarks(e.target.value)}
              placeholder="e.g. 88.5"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Justification & Evidence
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Re-evaluation of Question 4 indicated a grading tabulation omission (+5.0 marks)."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 flex items-start gap-2">
            <span className="font-bold text-blue-800">Note:</span>
            <span>
              Once submitted, the amendment request is routed to the Dean's queue. Upon adjudication, a new immutable revision will be stamped in the audit ledger.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
