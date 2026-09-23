import {
  AuthResponse,
  GradebookResponse,
  OfferingSummary,
  UpdateMarkResponse,
  StudentGrade,
  AmendmentItem,
  AuditLog,
} from '../types';

const BASE_URL = 'http://localhost:3001';

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(statusCode: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('erp_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(0, err.message || 'Network connection error to backend server');
  }

  let json: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      json = await response.json();
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const errorMsg =
      (json && (json.message || json.error)) ||
      `HTTP Request failed with status ${response.status}: ${response.statusText}`;
    
    // NestJS sends message as array or string
    const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
    throw new ApiError(response.status, formattedMsg, json);
  }

  return json as T;
}

export const api = {
  // Auth
  switchPersona: (email: string) =>
    request<AuthResponse>('/auth/switch-persona', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Offerings & Gradebook
  getOfferings: () =>
    request<OfferingSummary[]>('/offerings', {
      method: 'GET',
    }),

  getGradebook: (offeringId: string) =>
    request<GradebookResponse>(`/offerings/${offeringId}/gradebook`, {
      method: 'GET',
    }),

  // Mark Entry & OCC
  updateMark: (resultId: string, marks: number, version: number) =>
    request<UpdateMarkResponse>(`/results/${resultId}/mark`, {
      method: 'PATCH',
      body: JSON.stringify({ marks, version }),
    }),

  // State Machine Lifecycle
  submitForReview: (offeringId: string) =>
    request<{ message: string; status: string }>(`/offerings/${offeringId}/submit-review`, {
      method: 'POST',
    }),

  publishResults: (offeringId: string) =>
    request<{ message: string; status: string }>(`/offerings/${offeringId}/publish`, {
      method: 'POST',
    }),

  // Governance / Maker-Checker
  requestAmendment: (resultId: string, proposedMarks: number, justification: string) =>
    request<{ message: string; amendment: any }>('/amendments/request', {
      method: 'POST',
      body: JSON.stringify({ resultId, proposedMarks, justification }),
    }),

  getPendingAmendments: () =>
    request<AmendmentItem[]>('/amendments/pending', {
      method: 'GET',
    }),

  adjudicateAmendment: (amendmentId: string, decision: 'APPROVED' | 'REJECTED') =>
    request<{ message: string; amendment: any; result?: any }>(
      `/amendments/${amendmentId}/adjudicate`,
      {
        method: 'POST',
        body: JSON.stringify({ decision }),
      },
    ),

  // Audit Ledger
  getAuditTrail: (resultId: string) =>
    request<AuditLog[]>(`/audit/${resultId}`, {
      method: 'GET',
    }),

  // Student Transcript
  getMyGrades: () =>
    request<StudentGrade[]>('/results/student/my-grades', {
      method: 'GET',
    }),
};
