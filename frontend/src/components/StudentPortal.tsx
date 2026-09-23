import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { api, ApiError } from '../api/client';
import { StudentGrade } from '../types';
import { useAuth } from '../context/AuthContext';

export const StudentPortal: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMyGrades();
      setGrades(data);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch academic record';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [user]);

  // Calculations
  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
  const avgMarks =
    grades.length > 0
      ? (
          grades.reduce((sum, g) => sum + (g.marks ?? 0), 0) / grades.length
        ).toFixed(1)
      : '0.0';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Student Enrollee
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-sm text-slate-300 max-w-lg">
              Official University Academic Transcript Portal. View verified, sealed grades published by the Dean of Academic Affairs.
            </p>
          </div>

          <button
            onClick={fetchGrades}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-all flex items-center gap-2 self-start md:self-auto backdrop-blur-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Transcript
          </button>
        </div>

        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Published Courses</div>
            <div className="text-2xl font-bold text-slate-900">{grades.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Average Score</div>
            <div className="text-2xl font-bold text-slate-900">{avgMarks}%</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Earned Credits</div>
            <div className="text-2xl font-bold text-slate-900">{totalCredits} Units</div>
          </div>
        </div>
      </div>

      {/* Security Policy Information Banner */}
      <div className="bg-slate-100/90 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">
            Institutional Privacy & Governance Policy:
          </span>{' '}
          In-progress grading entries in `DRAFT` or `UNDER_REVIEW` states are strictly confidential to faculty and administrators. Grades are decrypted and released to your transcript only after formal publication by the Dean.
        </div>
      </div>

      {/* Transcript Records Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Official Sealed Transcript Records
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Fall 2026 Academic Term
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Loading official transcript...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">Failed to load grades</p>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
        ) : grades.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Published Grades Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your instructor or Dean is currently finalizing evaluations. Grades will automatically appear here once the Dean publishes the results.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {grades.map((grade) => (
              <div
                key={grade.resultId}
                className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      {grade.courseCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {grade.courseTitle}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Term: {grade.term}</span>
                    <span>•</span>
                    <span>Credits: {grade.credits}</span>
                    <span>•</span>
                    <span>Instructor: {grade.facultyName || 'Prof. Alan Turing'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">Final Grade</div>
                    <div className="text-2xl font-mono font-black text-slate-900">
                      {grade.marks !== null ? grade.marks.toFixed(1) : '--'}
                      <span className="text-xs font-sans text-slate-400 ml-1">/ 100</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      PUBLISHED
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Rev {grade.revisionNumber}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
