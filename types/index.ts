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
  profileComplete?: boolean;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  employerId: string;
  createdAt: number;
};

export type AiReviewRecommendation = 'strong' | 'moderate' | 'weak';

export type AiReview = {
  recommendation: AiReviewRecommendation;
  summary: string;
  generatedAt: number;
};

export type Application = {
  id: string;
  jobId: string;
  employeeId: string;
  coverLetter?: string;
  yearsOfExperience?: number;
  resumeUri?: string;
  resumeFileName?: string;
  aiReview?: AiReview;
  status: 'applied' | 'accepted' | 'completed' | 'rejected';
  rating?: number; // rating given by employer after completion
  paymentReference?: string;
  paymentPhone?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paidAt?: number;
  appliedAt: number;
};