import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api, ApiError } from '../api/client';

export interface PersonaInfo {
  name: string;
  email: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  description: string;
  badge: string;
  color: string;
}

export const PERSONAS: PersonaInfo[] = [
  {
    name: 'Prof. Alan Turing',
    email: 'alan@erp.edu',
    role: 'FACULTY',
    description: 'Assigned Instructor for CS101',
    badge: 'Assigned Faculty',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'Prof. Sarah Connor',
    email: 'sarah@erp.edu',
    role: 'FACULTY',
    description: 'Unassigned Instructor (Tests ABAC 403)',
    badge: 'Unassigned Faculty',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    name: 'Dean Evans',
    email: 'dean@erp.edu',
    role: 'ADMIN',
    description: 'Institutional Admin & Governance Checker',
    badge: 'Admin & Dean',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    name: 'Bob Smith',
    email: 'bob@erp.edu',
    role: 'STUDENT',
    description: 'Enrolled Student (90% Attendance)',
    badge: 'Student',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeEmail: string;
  error: string | null;
  switchPersona: (email: string) => Promise<void>;
  currentPersonaInfo: PersonaInfo | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('erp_token'));
  const [activeEmail, setActiveEmail] = useState<string>('alan@erp.edu');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const switchPersona = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.switchPersona(email);
      localStorage.setItem('erp_token', response.accessToken);
      setToken(response.accessToken);
      setUser(response.user);
      setActiveEmail(email);
    } catch (err: any) {
      console.error('Failed to switch persona:', err);
      const msg = err instanceof ApiError ? err.message : 'Failed to switch persona';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Mount: auto-switch to default persona Prof. Alan
  useEffect(() => {
    switchPersona('alan@erp.edu');
  }, []);

  const currentPersonaInfo = PERSONAS.find((p) => p.email === activeEmail);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        activeEmail,
        error,
        switchPersona,
        currentPersonaInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
