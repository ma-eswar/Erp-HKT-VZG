import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  Save,
  Send,
  History,
  FileEdit,
  ShieldCheck,
  RefreshCw,
  Zap,
  Layers,
} from 'lucide-react';
import { api, ApiError } from '../api/client';
import { GradebookResponse, GradeSheetItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { ConflictModal } from './ConflictModal';
import { AuditDrawer } from './AuditDrawer';
import { AmendmentModal } from './AmendmentModal';
import { GovernanceDrawer } from './GovernanceDrawer';
import { ForbiddenCard } from './ForbiddenCard';

export const Gradebook: React.FC = () => {
  const { user, activeEmail } = useAuth();

  const [data, setData] = useState<GradebookResponse | null>(null);
  const [editedMarks, setEditedMarks] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // 403 Forbidden State (ABAC guard)
  const [isForbidden, setIsForbidden] = useState<boolean>(false);

  // Modals & Drawers state
  const [conflictModalOpen, setConflictModalOpen] = useState<boolean>(false);
  const [conflictError, setConflictError] = useState<string>('');
  const [auditResultId, setAuditResultId] = useState<string | null>(null);
  const [auditStudentName, setAuditStudentName] = useState<string>('');
  const [amendmentItem, setAmendmentItem] = useState<{
    resultId: string;
    studentName: string;
    currentMarks: number | null;
  } | null>(null);
  const [governanceDrawerOpen, setGovernanceDrawerOpen] = useState<boolean>(false);

  // Fetch initial offering ID (default to first offering or CS101)
  const [offeringId, setOfferingId] = useState<string>('');

  // 1. Fetch available course offerings
  const loadOfferingsAndGradebook = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);
    setIsForbidden(false);

    try {
      const offerings = await api.getOfferings();
      if (offerings.length > 0) {
        const targetId = offeringId || offerings[0].id;
        setOfferingId(targetId);
        await fetchGradebookData(targetId);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setIsForbidden(true);
      } else {
        setFeedbackMessage({
          type: 'error',
          text: err.message || 'Failed to fetch course offerings',
        });
      }
      setIsLoading(false);
    }
  };

  // 2. Fetch specific gradebook
  const fetchGradebookData = async (targetOfferingId: string) => {
    try {
      const gradebook = await api.getGradebook(targetOfferingId);
      setData(gradebook);
      setIsForbidden(false);

      // Initialize edited marks state
      const initialMarks: Record<string, string> = {};
      gradebook.gradesheet.forEach((item) => {
        if (item.resultId) {
          initialMarks[item.resultId] =
            item.marks !== null ? item.marks.toString() : '';
        }
      });
      setEditedMarks(initialMarks);
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setIsForbidden(true);
      } else {
        setFeedbackMessage({
          type: 'error',
          text: err.message || 'Failed to load gradebook',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOfferingsAndGradebook();
  }, [user, activeEmail]);

  // Handle Mark Save with OCC
  const handleSaveMark = async (
    item: GradeSheetItem,
    forceStaleVersion: boolean = false,
  ) => {
    if (!item.resultId) return;

    const inputVal = editedMarks[item.resultId];
    const parsedMark = parseFloat(inputVal);

    if (isNaN(parsedMark) || parsedMark < 0 || parsedMark > 100) {
      setFeedbackMessage({
        type: 'error',
        text: 'Please enter a valid mark between 0.0 and 100.0',
      });
      return;
    }

    // Force stale version (0) to simulate 409 conflict
    const versionToSend = forceStaleVersion ? 0 : item.version;

    setIsSavingId(item.resultId);
    setFeedbackMessage(null);

    try {
      const response = await api.updateMark(
        item.resultId,
        parsedMark,
        versionToSend,
      );
      setFeedbackMessage({
        type: 'success',
        text: `✅ Saved: ${item.studentName}'s mark updated to ${response.marks} (New Version: v${response.newVersion})`,
      });
      // Refresh gradebook to obtain incremented version
      if (offeringId) {
        await fetchGradebookData(offeringId);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setConflictError(err.message);
        setConflictModalOpen(true);
      } else {
        setFeedbackMessage({
          type: 'error',
          text: err.message || 'Failed to save grade',
        });
      }
    } finally {
      setIsSavingId(null);
    }
  };

  // State Machine Action: Submit for Review
  const handleSubmitReview = async () => {
    if (!offeringId) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await api.submitForReview(offeringId);
      setFeedbackMessage({
        type: 'success',
        text: `🚀 ${res.message}`,
      });
      await fetchGradebookData(offeringId);
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to submit section for review',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // State Machine Action: Dean Publishes Results
  const handlePublishResults = async () => {
    if (!offeringId) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await api.publishResults(offeringId);
      setFeedbackMessage({
        type: 'success',
        text: `🏛️ ${res.message}`,
      });
      await fetchGradebookData(offeringId);
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to publish results',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (isForbidden) {
    return (
      <ForbiddenCard
        offeringTitle={data?.offering.courseTitle || 'Intro to Computer Science'}
        offeringCode={data?.offering.courseCode || 'CS101'}
        facultyName={data?.offering.faculty.fullName || 'Prof. Alan Turing'}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Loading Academic Gradebook & OCC Ledger...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Course Offering Found</h3>
        <p className="text-xs text-slate-500 mt-1">Please ensure the backend database is seeded.</p>
      </div>
    );
  }

  const { offering, gradesheet } = data;
  const totalStudents = gradesheet.length;
  const barredCount = gradesheet.filter((g) => g.isBarred).length;
  const eligibleCount = totalStudents - barredCount;
  const eligibilityRate =
    totalStudents > 0 ? ((eligibleCount / totalStudents) * 100).toFixed(0) : '0';

  const isDraft = offering.status === 'DRAFT';
  const isUnderReview = offering.status === 'UNDER_REVIEW';
  const isPublished = offering.status === 'PUBLISHED';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner / Notification */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 animate-fadeIn ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. TOP KPI STRIP (Course Snapshot, Status Stepper, Eligibility Metric) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Course Snapshot */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {offering.courseCode}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {offering.term}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
            {offering.courseTitle}
          </h2>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Credits: <strong className="text-slate-700">{offering.credits} Units</strong></span>
            <span>Instructor: <strong className="text-slate-700">{offering.faculty.fullName}</strong></span>
          </div>
        </div>

        {/* Card 2: Lifecycle Stepper */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lifecycle State
            </span>
            {isDraft && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                DRAFT
              </span>
            )}
            {isUnderReview && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                UNDER_REVIEW
              </span>
            )}
            {isPublished && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                PUBLISHED
              </span>
            )}
          </div>

          {/* Stepper Visual */}
          <div className="grid grid-cols-3 gap-2 my-2">
            <div
              className={`h-2 rounded-full ${
                isDraft || isUnderReview || isPublished
                  ? 'bg-blue-600'
                  : 'bg-slate-200'
              }`}
              title="1. Draft (Editable by Faculty)"
            />
            <div
              className={`h-2 rounded-full ${
                isUnderReview || isPublished
                  ? 'bg-amber-500'
                  : 'bg-slate-200'
              }`}
              title="2. Under Review (Locked for Dean inspection)"
            />
            <div
              className={`h-2 rounded-full ${
                isPublished ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
              title="3. Published (Official transcripts released)"
            />
          </div>

          <div className="text-[11px] text-slate-500 flex justify-between">
            <span className={isDraft ? 'font-bold text-blue-700' : ''}>1. Draft</span>
            <span className={isUnderReview ? 'font-bold text-amber-700' : ''}>2. Review</span>
            <span className={isPublished ? 'font-bold text-emerald-700' : ''}>3. Published</span>
          </div>
        </div>

        {/* Card 3: Exam Eligibility Metric */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Exam Eligibility
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {eligibilityRate}%{' '}
              <span className="text-xs font-normal text-slate-500">
                ({barredCount} of {totalStudents} Barred)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Policy rule: &lt;75% Attendance marks student as <span className="font-semibold text-rose-600">BARRED</span>.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
            {eligibleCount}/{totalStudents}
          </div>
        </div>
      </div>

      {/* 2. STUDENT PROFICIENCY DATA GRID (Data Sheet Table) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Student Proficiency & Mark Ledger
              </h3>
              <p className="text-[11px] text-slate-500">
                Optimistic Concurrency Control (OCC) enabled with atomic version locking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchGradebookData(offering.id)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Sheet
            </button>
          </div>
        </div>

        {/* Data Grid Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Student Information</th>
                <th className="py-3.5 px-4">Attendance Metric</th>
                <th className="py-3.5 px-4">Policy Status</th>
                <th className="py-3.5 px-4">OCC Lock</th>
                <th className="py-3.5 px-6">Mark Entry (0 - 100)</th>
                <th className="py-3.5 px-6 text-right">Actions & Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {gradesheet.map((row) => {
                const isBarred = row.isBarred;
                const isSaving = isSavingId === row.resultId;
                const currentVal = row.resultId ? editedMarks[row.resultId] ?? '' : '';
                const isEditable = isDraft && !isBarred;

                return (
                  <tr
                    key={row.studentId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isBarred ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Student Info */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">
                        {row.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        ID: {row.studentId.slice(0, 8)}...
                      </div>
                    </td>

                    {/* Attendance Metric */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold font-mono text-xs ${
                            row.attendancePercentage >= 75
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {row.attendancePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.attendancePercentage >= 75
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, row.attendancePercentage)}%` }}
                        />
                      </div>
                    </td>

                    {/* Policy Badge */}
                    <td className="py-4 px-4">
                      {isBarred ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <Lock className="w-3 h-3 text-rose-600" />
                          BARRED (&lt;75%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ELIGIBLE
                        </span>
                      )}
                    </td>

                    {/* OCC Version Tag */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200 font-semibold shadow-2xs">
                          v{row.version}
                        </span>
                        {row.revisionNumber > 1 && (
                          <span className="font-mono text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200">
                            Rev {row.revisionNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Mark Entry Field */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {isBarred ? (
                          <div className="relative group">
                            <input
                              type="text"
                              disabled
                              value="0.0"
                              className="w-24 px-3 py-1.5 text-xs font-mono font-bold bg-slate-100 text-slate-400 border border-slate-200 rounded-xl cursor-not-allowed"
                            />
                            <div className="hidden group-hover:block absolute bottom-full mb-1 left-0 z-20 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg">
                              Student barred due to attendance policy violation (&lt;75%).
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              disabled={!isEditable}
                              value={currentVal}
                              onChange={(e) => {
                                if (row.resultId) {
                                  setEditedMarks({
                                    ...editedMarks,
                                    [row.resultId]: e.target.value,
                                  });
                                }
                              }}
                              className={`w-24 px-3 py-1.5 text-xs font-mono font-bold border rounded-xl transition-all ${
                                isEditable
                                  ? 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                  : 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                              }`}
                            />
                            {isEditable && (
                              <button
                                onClick={() => handleSaveMark(row, false)}
                                disabled={isSaving}
                                title="Save Grade (Updates with OCC Lock)"
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all flex items-center gap-1 disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {isSaving ? '...' : 'Save'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions & Audit Trail */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* If Published: Allow Faculty to Request Maker-Checker Correction */}
                        {isPublished && !isBarred && row.resultId && (
                          <button
                            onClick={() =>
                              setAmendmentItem({
                                resultId: row.resultId!,
                                studentName: row.studentName,
                                currentMarks: row.marks,
                              })
                            }
                            className="px-2.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            Request Correction
                          </button>
                        )}

                        {/* Audit Ledger Drawer Button */}
                        {row.resultId && (
                          <button
                            onClick={() => {
                              setAuditResultId(row.resultId);
                              setAuditStudentName(row.studentName);
                            }}
                            title="View Immutable Audit Ledger"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ACTION BAR & GOVERNANCE CONTROLS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Hackathon Testing Controls */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Evaluation & Governance Controls
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-300">
              Demo Harness
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Simulate concurrency edge-cases or advance section lifecycle state.
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hackathon Demo Tool: Simulate Stale OCC Conflict */}
          {isDraft && gradesheet.find((g) => !g.isBarred) && (
            <button
              onClick={() => {
                const eligible = gradesheet.find((g) => !g.isBarred);
                if (eligible) handleSaveMark(eligible, true);
              }}
              title="Sends version=0 to trigger 409 Conflict exception"
              className="px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-rose-600" />
              Simulate Stale OCC Conflict (409)
            </button>
          )}

          {/* Submit for Review (Faculty/Admin) */}
          {isDraft && (
            <button
              onClick={handleSubmitReview}
              disabled={actionLoading}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {actionLoading ? 'Submitting...' : 'Submit Section for Dean Review'}
            </button>
          )}

          {/* Publish Results (Dean / Admin Only) */}
          {isUnderReview && (
            <div>
              {isAdmin ? (
                <button
                  onClick={handlePublishResults}
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {actionLoading ? 'Publishing...' : 'Publish Official Results (Dean)'}
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Section Under Review (Awaiting Dean Publication)
                </div>
              )}
            </div>
          )}

          {/* If Dean, show Dean Governance Queue Button */}
          {isAdmin && (
            <button
              onClick={() => setGovernanceDrawerOpen(true)}
              className="px-4 py-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Dean Adjudication Queue
            </button>
          )}
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <ConflictModal
        isOpen={conflictModalOpen}
        errorMessage={conflictError}
        onRefresh={() => {
          if (offeringId) fetchGradebookData(offeringId);
        }}
        onClose={() => setConflictModalOpen(false)}
      />

      <AuditDrawer
        isOpen={auditResultId !== null}
        resultId={auditResultId}
        studentName={auditStudentName}
        onClose={() => {
          setAuditResultId(null);
          setAuditStudentName('');
        }}
      />

      <AmendmentModal
        isOpen={amendmentItem !== null}
        resultId={amendmentItem?.resultId ?? null}
        studentName={amendmentItem?.studentName ?? ''}
        currentMarks={amendmentItem?.currentMarks ?? null}
        onSuccess={() => {
          setFeedbackMessage({
            type: 'success',
            text: 'Grade amendment requested successfully and queued for Dean adjudication.',
          });
          if (offeringId) fetchGradebookData(offeringId);
        }}
        onClose={() => setAmendmentItem(null)}
      />

      <GovernanceDrawer
        isOpen={governanceDrawerOpen}
        onClose={() => setGovernanceDrawerOpen(false)}
        onAdjudicated={() => {
          if (offeringId) fetchGradebookData(offeringId);
        }}
      />
    </div>
  );
};
