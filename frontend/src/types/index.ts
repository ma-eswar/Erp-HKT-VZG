export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT';
export type ResultStatus = 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED';
export type AmendmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface FacultySummary {
  id: string;
  fullName: string;
  email: string;
}

export interface OfferingSummary {
  id: string;
  term: string;
  frozenTitle: string;
  frozenCredits: number;
  catalog: {
    id: string;
    code: string;
    title: string;
    defaultCredits: number;
    department: string;
  };
  faculty: FacultySummary;
}

export interface GradeSheetItem {
  resultId: string | null;
  studentId: string;
  studentName: string;
  attendancePercentage: number;
  isBarred: boolean;
  marks: number | null;
  status: ResultStatus;
  version: number;
  revisionNumber: number;
}

export interface OfferingDetail {
  id: string;
  courseTitle: string;
  courseCode: string;
  term: string;
  credits: number;
  status: ResultStatus;
  faculty: FacultySummary;
}

export interface GradebookResponse {
  offering: OfferingDetail;
  gradesheet: GradeSheetItem[];
}

export interface UpdateMarkResponse {
  message: string;
  resultId: string;
  newVersion: number;
  marks: number;
}

export interface StudentGrade {
  resultId: string;
  courseCode: string;
  courseTitle: string;
  term: string;
  credits: number;
  marks: number | null;
  revisionNumber: number;
  publishedAt: string;
  facultyName: string;
}

export interface AmendmentItem {
  id: string;
  resultId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseOfferingId: string;
  courseTitle: string;
  courseCode: string;
  term: string;
  makerId: string;
  makerName: string;
  makerEmail: string;
  originalMarks: number;
  proposedMarks: number;
  justification: string;
  status: AmendmentStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actionType: string;
  actorName: string;
  actorRole: string;
  actorEmail: string;
  timestamp: string;
  beforeState: Record<string, any> | null;
  afterState: Record<string, any> | null;
}
