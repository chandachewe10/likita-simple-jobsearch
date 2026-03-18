import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Job, Application } from '../types';
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
  applyToJob: (jobId: string, employeeId: string, coverLetter?: string) => Promise<Application>;
  rateApplication: (applicationId: string, rating: number) => Promise<void>;
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
          };
          const employee: User = {
            id: uuidv4(),
            name: 'Jane Doe',
            email: 'jane@doe.test',
            password: 'password',
            role: 'employee',
            skills: ['javascript', 'react', 'design'],
            rating: 4.5,
          };
          const job: Job = {
            id: uuidv4(),
            title: 'Frontend Contractor',
            description: 'Build a small React app UI',
            skillsRequired: ['react', 'javascript'],
            employerId: employer.id,
            createdAt: Date.now(),
          };
          const init = { users: [employer, employee], jobs: [job], applications: [] };
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
    // persist state
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) => console.warn(e));
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
    const user: User = { ...u, id: uuidv4() };
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
    const updatedUser = { ...currentUser, ...updates };
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

  const applyToJob = async (jobId: string, employeeId: string, coverLetter?: string) => {
    const already = state.applications.find((a) => a.jobId === jobId && a.employeeId === employeeId);
    if (already) throw new Error('Already applied');
    const application: Application = {
      id: uuidv4(),
      jobId,
      employeeId,
      coverLetter,
      status: 'applied',
      appliedAt: Date.now(),
    };
    setState((s) => ({ ...s, applications: [application, ...s.applications] }));
    return application;
  };

  const rateApplication = async (applicationId: string, rating: number) => {
    setState((s) => {
      const applications = s.applications.map((a) => (a.id === applicationId ? { ...a, rating, status: 'completed' as const } : a));
      // update employee average rating
      const app = s.applications.find((a) => a.id === applicationId);
      if (!app) return { ...s, applications };
      const employeeId = app.employeeId;
      const employeeApps = applications.filter((a) => a.employeeId === employeeId && typeof a.rating === 'number');
      const avg = employeeApps.reduce((sum, cur) => sum + (cur.rating || 0), 0) / (employeeApps.length || 1);
      const users = s.users.map((u) => (u.id === employeeId ? { ...u, rating: Math.round(avg * 10) / 10 } : u));
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