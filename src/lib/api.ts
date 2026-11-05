// src/lib/api.ts

import type {
  AdminAccount,
  AdminDashboardStats,
  Answer,
  Application,
  ApplicantDetail,
  ApplicantFilters,
  ApplicantListItem,
  ApplicantSummary,
  Category,
  FAQItem,
  LeadershipMember,
  Question,
  Upload,
  User,
  UserRole,
} from "./types";

// Set VITE_API_URL in a .env file to override. In dev, requests go through the
// Vite proxy at /api (see vite.config.ts) because the backend's CORS allow-list
// only covers the production domains.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "https://avenyar-global-server.onrender.com");

// Fired when an authenticated request comes back 401, i.e. the stored token has
// expired or been revoked. AuthContext listens for it and clears the session.
export const SESSION_EXPIRED_EVENT = "avenyra:session-expired";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    // The backend sleeps when idle and can take ~30s to wake, so a network
    // failure is usually that rather than the user being offline.
    throw new ApiError("We couldn't reach the server. It may be starting up. Please try again in a few seconds.", 0);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = formatErrorDetail(body.detail) || detail;
    } catch {
      // response wasn't JSON, fall back to statusText
    }
    // /auth/* endpoints return 401 for a wrong password (login, change
    // password, delete account), which must not end the session.
    if (res.status === 401 && token && !path.startsWith("/auth/")) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// FastAPI returns `detail` as a string for app errors, but as a list of
// { loc, msg } objects for validation (422) errors. Turn the list into a
// readable sentence like "Password: String should have at least 8 characters".
export function formatErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (!Array.isArray(detail)) return "";
  return detail
    .map((item: { loc?: (string | number)[]; msg?: string }) => {
      const field = item.loc?.filter((part): part is string => typeof part === "string" && part !== "body").pop();
      const message = (item.msg ?? "Invalid value").replace(/^Value error, /, "").replace(/\.$/, "");
      if (!field) return message;
      const label = field.replace(/_/g, " ");
      return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${message}`;
    })
    .join(". ");
}

function jsonBody(data: unknown, method: string = "POST"): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

// ---------- Health ----------

// Fire-and-forget ping so the free-tier backend starts waking up while the
// visitor is still reading the page, instead of when they first click Log in.
export function wakeServer() {
  fetch(`${API_BASE_URL}/health`).catch(() => {});
}

// ---------- Auth ----------

export function register(email: string, fullName: string, password: string) {
  return request<User>("/auth/register", jsonBody({ email, full_name: fullName, password }));
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  return request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
}

export function getCurrentUser() {
  return request<User>("/auth/me");
}

export function updateProfile(data: { full_name?: string; email?: string }) {
  return request<User>("/auth/me", jsonBody(data, "PATCH"));
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<{ message: string }>(
    "/auth/change-password",
    jsonBody({ current_password: currentPassword, new_password: newPassword })
  );
}

export function deleteAccount(password: string) {
  return request<void>("/auth/me", jsonBody({ password }, "DELETE"));
}

export function forgotPassword(email: string) {
  return request<{ message: string }>("/auth/forgot-password", jsonBody({ email }));
}

export function resetPassword(token: string, newPassword: string) {
  return request<{ message: string }>(
    "/auth/reset-password",
    jsonBody({ token, new_password: newPassword })
  );
}

// ---------- Categories (career fields) ----------

export function listCategories() {
  return request<Category[]>("/categories");
}

export function adminListCategories() {
  return request<Category[]>("/admin/categories");
}

export function adminCreateCategory(name: string, orderIndex = 0) {
  return request<Category>("/admin/categories", jsonBody({ name, order_index: orderIndex }));
}

export function adminUpdateCategory(id: string, data: { name?: string; order_index?: number; is_active?: boolean }) {
  return request<Category>(`/admin/categories/${id}`, jsonBody(data, "PATCH"));
}

export function adminDeleteCategory(id: string) {
  return request<void>(`/admin/categories/${id}`, { method: "DELETE" });
}

// ---------- Application (category, contact info, submit) ----------

export function getMyApplication() {
  return request<Application>("/application/me");
}

export function updateMyApplication(data: { category_id?: string; phone?: string; location?: string }) {
  return request<Application>("/application/me", jsonBody(data, "PUT"));
}

export function submitMyApplication() {
  return request<Application>("/application/me/submit", { method: "POST" });
}

// ---------- Questions & Answers (applicant) ----------

export function listQuestions() {
  return request<Question[]>("/questions");
}

export function submitAnswers(answers: { question_id: string; response_text: string }[]) {
  return request<Answer[]>("/answers", jsonBody({ answers }));
}

export function getMyAnswers() {
  return request<Answer[]>("/answers/me");
}

export function adminListQuestions() {
  return request<Question[]>("/admin/questions");
}

export function adminCreateQuestion(prompt: string, orderIndex = 0) {
  return request<Question>("/admin/questions", jsonBody({ prompt, order_index: orderIndex }));
}

export function adminUpdateQuestion(id: string, data: { prompt?: string; order_index?: number; is_active?: boolean }) {
  return request<Question>(`/admin/questions/${id}`, jsonBody(data, "PATCH"));
}

export function adminDeleteQuestion(id: string) {
  return request<void>(`/admin/questions/${id}`, { method: "DELETE" });
}

// ---------- Uploads (applicant) ----------

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

const UPLOAD_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const UPLOAD_ACCEPT = Object.keys(UPLOAD_TYPES).map((ext) => `.${ext}`).join(",");

// Some browsers (notably on Windows and Android) report an empty file.type for
// Word documents, so fall back to the extension. Returns null if unsupported.
function uploadContentType(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return UPLOAD_TYPES[ext] ?? null;
}

// Returns a user-facing reason the file can't be uploaded, or null if it's fine.
export function validateUpload(file: File): string | null {
  if (!uploadContentType(file)) return "Please upload a PDF or Word document (.pdf, .doc, .docx).";
  if (file.size === 0) return "This file is empty.";
  if (file.size > UPLOAD_MAX_BYTES) return `This file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The maximum size is 10 MB.`;
  return null;
}

export async function uploadFile(file: File): Promise<Upload> {
  const invalid = validateUpload(file);
  if (invalid) throw new ApiError(invalid, 0);
  const contentType = uploadContentType(file)!;

  const { upload_url, storage_key } = await request<{ upload_url: string; storage_key: string }>(
    "/uploads/presign",
    jsonBody({ filename: file.name, content_type: contentType, size_bytes: file.size })
  );

  let putRes: Response;
  try {
    putRes = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });
  } catch {
    // A network-level failure here (rather than an HTTP error) is almost always
    // the storage bucket's CORS rules not allowing this site's origin.
    throw new ApiError("The file couldn't be sent to storage. Please try again, or contact us if it keeps failing.", 0);
  }
  if (!putRes.ok) throw new ApiError("File upload to storage failed. Please try again.", putRes.status);

  return request<Upload>(
    "/uploads/confirm",
    jsonBody({
      storage_key,
      filename: file.name,
      content_type: contentType,
      size_bytes: file.size,
    })
  );
}

export function getMyUploads() {
  return request<Upload[]>("/uploads/me");
}

// ---------- Admin: applicants ----------

export function listApplicants(filters: ApplicantFilters = {}) {
  const params = new URLSearchParams();
  if (filters.category_id) params.set("category_id", filters.category_id);
  if (filters.location) params.set("location", filters.location);
  if (filters.submitted_from) params.set("submitted_from", filters.submitted_from);
  if (filters.submitted_to) params.set("submitted_to", filters.submitted_to);
  const qs = params.toString();
  return request<ApplicantListItem[]>(`/admin/applicants${qs ? `?${qs}` : ""}`);
}

export function getApplicantDetail(userId: string) {
  return request<ApplicantDetail>(`/admin/applicants/${userId}`);
}

export function adminCreateApplicant(email: string, fullName: string, password: string) {
  return request<ApplicantSummary>(
    "/admin/applicants",
    jsonBody({ email, full_name: fullName, password })
  );
}

export function adminUpdateApplicant(userId: string, data: { full_name?: string; email?: string; is_active?: boolean }) {
  return request<ApplicantSummary>(`/admin/applicants/${userId}`, jsonBody(data, "PATCH"));
}

export function adminUpdateApplicantApplication(
  userId: string,
  data: { category_id?: string; phone?: string; location?: string }
) {
  return request<ApplicantDetail>(`/admin/applicants/${userId}/application`, jsonBody(data, "PATCH"));
}

export function getAdminDashboardStats() {
  return request<AdminDashboardStats>("/admin/dashboard-stats");
}

// ---------- Superadmin: user management ----------

export function superadminListUsers() {
  return request<AdminAccount[]>("/superadmin/users");
}

export function superadminCreateUser(data: { email: string; full_name: string; password: string; role: UserRole }) {
  return request<AdminAccount>("/superadmin/users", jsonBody(data));
}

export function superadminUpdateUser(
  userId: string,
  data: { full_name?: string; email?: string; role?: UserRole; is_active?: boolean }
) {
  return request<AdminAccount>(`/superadmin/users/${userId}`, jsonBody(data, "PATCH"));
}

export function superadminDeleteUser(userId: string) {
  return request<void>(`/superadmin/users/${userId}`, { method: "DELETE" });
}

// ---------- Site content: public (no auth) ----------

export function publicListLeadership() {
  return request<LeadershipMember[]>("/site/leadership");
}

export function publicListFAQ() {
  return request<FAQItem[]>("/site/faq");
}

// ---------- Superadmin: site content management ----------

export function superadminListLeadership() {
  return request<LeadershipMember[]>("/superadmin/leadership");
}

export function superadminCreateLeadership(data: { name: string; title: string; bio: string; photo_url?: string | null; order_index?: number }) {
  return request<LeadershipMember>("/superadmin/leadership", jsonBody(data));
}

export function superadminUpdateLeadership(
  id: string,
  data: { name?: string; title?: string; bio?: string; photo_url?: string | null; order_index?: number; is_active?: boolean }
) {
  return request<LeadershipMember>(`/superadmin/leadership/${id}`, jsonBody(data, "PATCH"));
}

export function superadminDeleteLeadership(id: string) {
  return request<void>(`/superadmin/leadership/${id}`, { method: "DELETE" });
}

export function superadminListFAQ() {
  return request<FAQItem[]>("/superadmin/faq");
}

export function superadminCreateFAQ(data: { question: string; answer: string; order_index?: number }) {
  return request<FAQItem>("/superadmin/faq", jsonBody(data));
}

export function superadminUpdateFAQ(id: string, data: { question?: string; answer?: string; order_index?: number; is_active?: boolean }) {
  return request<FAQItem>(`/superadmin/faq/${id}`, jsonBody(data, "PATCH"));
}

export function superadminDeleteFAQ(id: string) {
  return request<void>(`/superadmin/faq/${id}`, { method: "DELETE" });
}

export { ApiError };
