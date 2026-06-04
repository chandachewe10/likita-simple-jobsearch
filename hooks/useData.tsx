import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Job, Application, AiReview } from '../types';
import { MAX_RESUME_STORAGE_CHARS } from '../lib/resume';
import { isProfileComplete } from '../lib/profile';
import { v4 as uuidv4 } from 'uuid';

type DataState = {
  users: User[];
  jobs: Job[];
  applications: Application[];
};

type DataContextValue = {
  state: DataState;
  currentUser: User | null;
  loading: boolean;
  signUp: (u: Omit<User, 'id' | 'rating'>) => Promise<User>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  postJob: (job: Omit<Job, 'id' | 'createdAt'>) => Promise<Job>;
  applyToJob: (
    jobId: string,
    employeeId: string,
    options?: {
      coverLetter?: string;
      yearsOfExperience?: number;
      resumeUri?: string;
      resumeFileName?: string;
    }
  ) => Promise<Application>;
  saveApplicationAiReview: (applicationId: string, review: AiReview) => Promise<void>;
  acceptApplication: (applicationId: string) => Promise<Application>;
  rejectApplication: (applicationId: string) => Promise<Application>;
  markApplicationComplete: (applicationId: string) => Promise<Application>;
  rateApplication: (applicationId: string, rating: number) => Promise<void>;
  recordApplicationPayment: (
    applicationId: string,
    payment: { reference: string; status: 'paid' | 'failed' | 'pending'; phone?: string }
  ) => Promise<Application>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
};

const STORAGE_KEY = 'JOB_APP_DATA_V1';
const AUTH_KEY = 'JOB_APP_AUTH_V1';

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DataState>({ users: [], jobs: [], applications: [] });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setState(JSON.parse(raw));
        } else {
          // seed with a sample employer + job for a better first-time experience
          const employer: User = {
            id: uuidv4(),
            name: 'Acme Co',
            email: 'employer@acme.test',
            password: 'password',
            role: 'employer',
            location: { latitude: -15.3875, longitude: 28.3228 },
            address: 'Cairo Road, Lusaka',
            profileComplete: true,
          };
          const employee: User = {
            id: uuidv4(),
            name: 'Jane Doe',
            email: 'jane@doe.test',
            password: 'password',
            role: 'employee',
            skills: ['Plumbing', 'Electrical works'],
            rating: 4.5,
            phone: '+260 97 123 4567',
            address: '123 Cairo Road, Lusaka',
            nrc: '123456/78/1',
            qualifications: 'Licensed Plumber',
            location: { latitude: -15.392, longitude: 28.318 },
            profileComplete: true,
          };
          const employee2: User = {
            id: uuidv4(),
            name: 'John Banda',
            email: 'john@banda.test',
            password: 'password',
            role: 'employee',
            skills: ['Carpentry', 'Roofing', 'Painting'],
            rating: 3.8,
            phone: '+260 96 987 6543',
            address: 'Kabulonga, Lusaka',
            qualifications: 'Trade Certificate in Carpentry',
            location: { latitude: -15.41, longitude: 28.35 },
            profileComplete: true,
          };
          const job: Job = {
            id: uuidv4(),
            title: 'Plumber needed',
            description: 'Fix kitchen pipes and install new taps',
            skillsRequired: ['Plumbing'],
            employerId: employer.id,
            createdAt: Date.now(),
          };
          const init = { users: [employer, employee, employee2], jobs: [job], applications: [] };
          setState(init);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(init));
        }

        const authRaw = await AsyncStorage.getItem(AUTH_KEY);
        if (authRaw) {
          setCurrentUser(JSON.parse(authRaw));
        }
      } catch (e) {
        console.warn('Failed to load storage', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) => {
      console.warn('Failed to persist app data', e);
    });
  }, [state]);

  useEffect(() => {
    if (currentUser) {
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(currentUser)).catch((e) => console.warn(e));
    } else {
      AsyncStorage.removeItem(AUTH_KEY).catch(() => {});
    }
  }, [currentUser]);

  const signUp = async (u: Omit<User, 'id' | 'rating'>) => {
    const existing = state.users.find((x) => x.email.toLowerCase() === u.email.toLowerCase());
    if (existing) throw new Error('Email already in use');
    const user: User = { ...u, id: uuidv4(), profileComplete: false };
    const next = { ...state, users: [...state.users, user] };
    setState(next);
    setCurrentUser(user);
    return user;
  };

  const login = async (email: string, password: string) => {
    const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) throw new Error('Not logged in');
    const merged = { ...currentUser, ...updates };
    const updatedUser: User = {
      ...merged,
      profileComplete: isProfileComplete(merged),
    };
    setCurrentUser(updatedUser);
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === currentUser.id ? updatedUser : u)
    }));
    return updatedUser;
  };

  const postJob = async (jobPartial: Omit<Job, 'id' | 'createdAt'>) => {
    const job: Job = { ...jobPartial, id: uuidv4(), createdAt: Date.now() };
    setState((s) => ({ ...s, jobs: [job, ...s.jobs] }));
    return job;
  };

  const applyToJob = async (
    jobId: string,
    employeeId: string,
    options?: {
      coverLetter?: string;
      yearsOfExperience?: number;
      resumeUri?: string;
      resumeFileName?: string;
    }
  ) => {
    const employee = state.users.find((u) => u.id === employeeId);
    if (employee && !isProfileComplete(employee)) {
      throw new Error('Please complete your profile before applying for jobs.');
    }
    const already = state.applications.find((a) => a.jobId === jobId && a.employeeId === employeeId);
    if (already) throw new Error('Already applied');
    if (options?.resumeUri && options.resumeUri.length > MAX_RESUME_STORAGE_CHARS) {
      throw new Error('Resume is too large to save. Please use a file under 2 MB.');
    }
    const years = options?.yearsOfExperience;
    if (years == null || Number.isNaN(years) || years < 0) {
      throw new Error('Please enter years of experience');
    }
    const application: Application = {
      id: uuidv4(),
      jobId,
      employeeId,
      coverLetter: options?.coverLetter?.trim() || undefined,
      yearsOfExperience: years,
      resumeUri: options?.resumeUri,
      resumeFileName: options?.resumeFileName,
      status: 'applied',
      appliedAt: Date.now(),
    };
    setState((s) => ({ ...s, applications: [application, ...s.applications] }));
    return application;
  };

  const saveApplicationAiReview = async (applicationId: string, review: AiReview) => {
    setState((s) => ({
      ...s,
      applications: s.applications.map((a) =>
        a.id === applicationId ? { ...a, aiReview: review } : a
      ),
    }));
  };

  const updateApplication = (applicationId: string, patch: Partial<Application>) => {
    let updated: Application | undefined;
    setState((s) => {
      const applications = s.applications.map((a) => {
        if (a.id !== applicationId) return a;
        updated = { ...a, ...patch };
        return updated;
      });
      return { ...s, applications };
    });
    if (!updated) throw new Error('Application not found');
    return updated;
  };

  const acceptApplication = async (applicationId: string) => {
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');
    if (app.status !== 'applied') throw new Error('Application already reviewed');
    return updateApplication(applicationId, { status: 'accepted' });
  };

  const rejectApplication = async (applicationId: string) => {
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');
    if (app.status !== 'applied') throw new Error('Application already reviewed');
    return updateApplication(applicationId, { status: 'rejected' });
  };

  const markApplicationComplete = async (applicationId: string) => {
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');
    if (app.status !== 'accepted') throw new Error('Only accepted applications can be marked complete');
    return updateApplication(applicationId, { status: 'completed' });
  };

  const recordApplicationPayment = async (
    applicationId: string,
    payment: { reference: string; status: 'paid' | 'failed' | 'pending'; phone?: string }
  ) => {
    return updateApplication(applicationId, {
      paymentReference: payment.reference,
      paymentPhone: payment.phone,
      paymentStatus: payment.status,
      paidAt: payment.status === 'paid' ? Date.now() : undefined,
    });
  };

  const rateApplication = async (applicationId: string, rating: number) => {
    setState((s) => {
      const applications = s.applications.map((a) =>
        a.id === applicationId ? { ...a, rating } : a
      );
      const app = s.applications.find((a) => a.id === applicationId);
      if (!app) return { ...s, applications };
      const employeeId = app.employeeId;
      const employeeApps = applications.filter(
        (a) => a.employeeId === employeeId && typeof a.rating === 'number'
      );
      const avg =
        employeeApps.reduce((sum, cur) => sum + (cur.rating || 0), 0) /
        (employeeApps.length || 1);
      const users = s.users.map((u) =>
        u.id === employeeId ? { ...u, rating: Math.round(avg * 10) / 10 } : u
      );
      return { ...s, applications, users };
    });
  };

  const value: DataContextValue = {
    state,
    currentUser,
    loading,
    signUp,
    login,
    logout,
    postJob,
    applyToJob,
    saveApplicationAiReview,
    acceptApplication,
    rejectApplication,
    markApplicationComplete,
    recordApplicationPayment,
    rateApplication,
    updateProfile,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};