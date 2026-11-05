// src/lib/types.ts

export type UserRole = "applicant" | "admin" | "superadmin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  order_index: number;
  is_active: boolean;
}

export interface Application {
  category_id: string | null;
  category_name: string | null;
  phone: string | null;
  location: string | null;
  submitted_at: string | null;
  updated_at: string;
}

export interface Question {
  id: string;
  prompt: string;
  order_index: number;
  is_active: boolean;
}

export interface Answer {
  question_id: string;
  question_prompt: string;
  response_text: string;
  updated_at: string;
}

export interface Upload {
  id: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  uploaded_at: string;
}

export interface UploadWithDownloadUrl extends Upload {
  download_url: string;
}

export interface ApplicantSummary {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface ApplicantDetail {
  user: ApplicantSummary;
  application: Application | null;
  answers: Answer[];
  uploads: UploadWithDownloadUrl[];
}

// ---------- Admin ----------

export interface ApplicantListItem {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  category_id: string | null;
  category_name: string | null;
  location: string | null;
  submitted_at: string | null;
}

export interface ApplicantFilters {
  category_id?: string;
  location?: string;
  submitted_from?: string;
  submitted_to?: string;
}

export interface AdminDashboardStats {
  total_applicants: number;
  submitted_count: number;
  in_progress_count: number;
  by_category: { category: string; count: number }[];
  recent_applicants: ApplicantListItem[];
}

// ---------- Superadmin: user management ----------

export interface AdminAccount {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

// ---------- Superadmin: site content ----------

export interface LeadershipMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo_url: string | null;
  order_index: number;
  is_active: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_active: boolean;
}
