export type Role = 'employee' | 'employer';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // kept simple for MVP (hashed would be needed in prod)
  role: Role;
  skills?: string[]; // only for employees
  rating?: number; // average rating for employees
  phone?: string;
  address?: string;
  nrc?: string;
  qualifications?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type Job = {
  id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  employerId: string;
  createdAt: number;
};

export type Application = {
  id: string;
  jobId: string;
  employeeId: string;
  coverLetter?: string;
  status: 'applied' | 'accepted' | 'completed' | 'rejected';
  rating?: number; // rating given by employer after completion
  appliedAt: number;
};