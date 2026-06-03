/**
 * EduCard Pro — API Client
 * Connects the React frontend to the Django REST API.
 *
 * Base URL: http://localhost:8000/api  (dev)
 * Auth:     Bearer JWT stored in localStorage
 *
 * Usage:
 *   import { api } from '@/lib/api'
 *   const learners = await api.learners.list()
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '/api'

// ─── Token helpers ────────────────────────────────────────────────────────────

export const token = {
  get: () => localStorage.getItem('educard_access'),
  set: (t: string) => localStorage.setItem('educard_access', t),
  refresh: () => localStorage.getItem('educard_refresh'),
  setRefresh: (t: string) => localStorage.setItem('educard_refresh', t),
  clear: () => {
    localStorage.removeItem('educard_access')
    localStorage.removeItem('educard_refresh')
  },
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const access = token.get()
  if (access) headers['Authorization'] = `Bearer ${access}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // Auto-refresh on 401
  if (res.status === 401 && token.refresh()) {
    const refreshed = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: token.refresh() }),
    })
    if (refreshed.ok) {
      const data = await refreshed.json()
      token.set(data.access)
      headers['Authorization'] = `Bearer ${data.access}`
      const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers })
      if (!retry.ok) throw new ApiError(retry.status, await retry.json())
      return retry.json() as Promise<T>
    } else {
      token.clear()
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: Record<string, unknown>,
  ) {
    super(`API ${status}`)
  }
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

const get   = <T>(path: string) => request<T>(path)
const post  = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })
const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
const del   = <T>(path: string) => request<T>(path, { method: 'DELETE' })

// ─── Types (mirror Django serializers) ───────────────────────────────────────

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  phone: string | null
  is_2fa_enabled: boolean
  is_locked: boolean
  is_active: boolean
}

export interface LoginResponse {
  access: string
  refresh: string
  user: Pick<User, 'id' | 'username' | 'email' | 'full_name' | 'role' | 'is_2fa_enabled'>
}

export interface Department {
  id: number
  key: 'JHS' | 'SHS'
  label: string
  caption: string
}

export interface GradeLevel {
  id: number
  level: 7 | 8 | 9 | 10 | 11 | 12
  label: string
  department: number
  department_key: string
  department_label: string
}

export interface Section {
  id: number
  name: string
  strand: string | null
  grade_level: number
  grade_level_label: string
  department_key: string
  adviser: number | null
  adviser_name: string | null
  enrollment_count: number
  average_attendance: number
  below_sf2_target: boolean
  label: string
}

export interface Learner {
  id: number
  lrn: string
  full_name: string
  first_name: string
  middle_initial: string
  last_name: string
  birth_date: string
  sex: 'M' | 'F'
  section: number | null
  section_label: string | null
  gpa: number
  attendance_rate: number
  status: 'On Track' | 'At Risk'
  barcode_active: boolean
  graduation_status: 'active' | 'candidate' | 'confirmed' | 'archived'
  photo_path: string | null
  // parent_account removed — use LearnerParent through-table
}

/** Fix 1: Multi-parent support — replaces single parent_account FK */
export interface LearnerParent {
  id: number
  learner: number
  learner_name: string
  learner_lrn: string
  parent: number
  parent_name: string
  relationship: 'Mother' | 'Father' | 'Guardian'
  is_primary_contact: boolean
  created_at: string
}

export interface Subject {
  id: number
  name: string
  section: number
  section_label: string
  teacher: number | null
  teacher_name: string | null
  /** Fix 3: FK to SchoolYearConfig — enables historical subject records */
  school_year: number | null
  school_year_label: string | null
  quarter_weight_quiz: number
  quarter_weight_exam: number
  quarter_weight_activity: number
}

export interface Grade {
  id: number
  learner: number
  learner_name: string
  learner_lrn: string
  subject: number
  subject_name: string
  quarter: 1 | 2 | 3 | 4
  quiz_score: number | null
  exam_score: number | null
  activity_score: number | null
  computed_grade: number | null
}

export interface AttendanceRecord {
  id: number
  learner: number
  learner_name: string
  learner_lrn: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  time_in_morning: string | null
  time_out_morning: string | null
  time_in_afternoon: string | null
  time_out_afternoon: string | null
  /** Fix 4: FK to SchoolCalendar — validates this date is a school day */
  calendar_entry: number | null
  calendar_entry_type: 'school_day' | 'holiday' | 'suspension' | null
}

export interface IDPrintQueueItem {
  id: number
  learner: number
  learner_name: string
  learner_lrn: string
  learner_section: string | null
  reason: 'new_enrollment' | 'lost' | 'damaged' | 'renewal'
  status: 'pending' | 'generated' | 'printed'
  pdf_path: string | null
  requested_at: string
  printed_at: string | null
}

export interface NotificationRecord {
  id: number
  parent: number
  parent_name: string
  learner: number | null
  learner_name: string | null
  channel: 'messenger' | 'sms' | 'system'
  status: 'sent' | 'failed' | 'pending'
  message: string
  triggered_by: string
  sent_at: string
}

export interface ConductLog {
  id: number
  learner: number
  learner_name: string
  learner_lrn: string
  date: string
  item: string
  type: 'Positive' | 'Note' | 'Warning'
  recorded_by: number | null
  recorded_by_name: string | null
}

export interface Message {
  id: number
  sender: number
  sender_name: string
  receiver: number
  receiver_name: string
  subject: string
  body: string
  learner: number | null
  learner_name: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface DashboardStats {
  total_enrolled: number
  campus_attendance: number
  sections_below_target: number
  at_risk_count: number
  id_cards_printed: number
  pending_tasks: number
  current_quarter: number
  current_week: number
  school_name: string
  school_year: string
}

export interface SchoolSettings {
  id: number
  /** Fix 2: FK to Tenant — each school has its own settings row */
  tenant: number | null
  tenant_name: string | null
  school_name: string
  school_year: string
  school_logo_path: string | null
  primary_color: string
  current_quarter: number
  current_week: number
  sf2_target_attendance: number
  grading_period_1_start: string | null
  grading_period_1_end: string | null
  grading_period_2_start: string | null
  grading_period_2_end: string | null
  grading_period_3_start: string | null
  grading_period_3_end: string | null
  grading_period_4_start: string | null
  grading_period_4_end: string | null
  messenger_enabled: boolean
  sms_enabled: boolean
  sms_credits_remaining: number
  plan: string
}

export interface AdminTask {
  id: number
  title: string
  description: string | null
  task_type: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'done' | 'dismissed'
  learner: number | null
  learner_name: string | null
  due_date: string | null
  created_at: string
}

/** Fix 5: GraduationNotification uses FK (not OneToOne) — supports retries */
export interface GraduationNotification {
  id: number
  learner: number
  learner_name: string
  channel: 'messenger' | 'sms'
  status: 'sent' | 'failed' | 'pending'
  message: string
  sent_at: string | null
  error_message: string | null
}

export interface TeacherContact {
  id: number
  teacher: number
  teacher_name: string
  teacher_email: string
  phone: string | null
  email: string | null
  show_phone: boolean
  show_email: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ─── API namespace ────────────────────────────────────────────────────────────

export const api = {

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    login: (username: string, password: string) =>
      post<LoginResponse>('/auth/login/', { username, password }),

    me: () => get<User>('/auth/me/'),

    logout: () => {
      token.clear()
      window.location.href = '/login'
    },
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    stats: () => get<DashboardStats>('/dashboard/stats/'),
    departments: () => get<unknown[]>('/dashboard/departments/'),
  },

  // ── School Structure ──────────────────────────────────────────────────────
  departments: {
    list: () => get<PaginatedResponse<Department>>('/departments/'),
  },

  gradeLevels: {
    list: (departmentId?: number) =>
      get<PaginatedResponse<GradeLevel>>(departmentId ? `/grade-levels/?department=${departmentId}` : '/grade-levels/'),
  },

  sections: {
    list: (params?: { grade_level?: number; department?: number }) => {
      const q = new URLSearchParams()
      if (params?.grade_level) q.set('grade_level', String(params.grade_level))
      if (params?.department) q.set('grade_level__department', String(params.department))
      return get<PaginatedResponse<Section>>(`/sections/${q.toString() ? '?' + q : ''}`)
    },
    belowTarget: () => get<Section[]>('/sections/below_target/'),
  },

  // ── Learners ──────────────────────────────────────────────────────────────
  learners: {
    list: (params?: { search?: string; section?: number; graduation_status?: string; page?: number }) => {
      const q = new URLSearchParams()
      if (params?.search) q.set('search', params.search)
      if (params?.section) q.set('section', String(params.section))
      if (params?.graduation_status) q.set('graduation_status', params.graduation_status)
      if (params?.page) q.set('page', String(params.page))
      return get<PaginatedResponse<Learner>>(`/learners/${q.toString() ? '?' + q : ''}`)
    },
    get: (id: number) => get<Learner>(`/learners/${id}/`),
    create: (data: Partial<Learner>) => post<Learner>('/learners/', data),
    update: (id: number, data: Partial<Learner>) => patch<Learner>(`/learners/${id}/`, data),
    atRisk: () => get<Learner[]>('/learners/at_risk/'),
    grades: (id: number) => get<Grade[]>(`/learners/${id}/grades/`),
    attendance: (id: number) => get<AttendanceRecord[]>(`/learners/${id}/attendance/`),
    conduct: (id: number) => get<ConductLog[]>(`/learners/${id}/conduct/`),
    notifications: (id: number) => get<NotificationRecord[]>(`/learners/${id}/notifications/`),
  },

  // ── Learner Parents (Fix 1: multi-parent through-table) ───────────────────
  learnerParents: {
    list: (learnerId?: number) =>
      get<PaginatedResponse<LearnerParent>>(`/learner-parents/${learnerId ? '?learner=' + learnerId : ''}`),
    listByParent: (parentId: number) =>
      get<PaginatedResponse<LearnerParent>>(`/learner-parents/?parent=${parentId}`),
    create: (data: { learner: number; parent: number; relationship: string; is_primary_contact?: boolean }) =>
      post<LearnerParent>('/learner-parents/', data),
    remove: (id: number) => del<void>(`/learner-parents/${id}/`),
  },

  // ── Grades ────────────────────────────────────────────────────────────────
  grades: {
    list: (params?: { learner?: number; subject?: number; quarter?: number; section?: number }) => {
      const q = new URLSearchParams()
      if (params?.learner) q.set('learner', String(params.learner))
      if (params?.subject) q.set('subject', String(params.subject))
      if (params?.quarter) q.set('quarter', String(params.quarter))
      if (params?.section) q.set('learner__section', String(params.section))
      return get<PaginatedResponse<Grade>>(`/grades/${q.toString() ? '?' + q : ''}`)
    },
    upsert: (id: number | null, data: Partial<Grade>) =>
      id ? patch<Grade>(`/grades/${id}/`, data) : post<Grade>('/grades/', data),
    atRisk: (sectionId?: number) =>
      get<Learner[]>(`/grades/at_risk/${sectionId ? '?section=' + sectionId : ''}`),
  },

  // ── Subjects (Fix 3: includes school_year FK) ─────────────────────────────
  subjects: {
    list: (params?: { section?: number; school_year?: number }) => {
      const q = new URLSearchParams()
      if (params?.section) q.set('section', String(params.section))
      if (params?.school_year) q.set('school_year', String(params.school_year))
      return get<PaginatedResponse<Subject>>(`/subjects/${q.toString() ? '?' + q : ''}`)
    },
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  attendance: {
    list: (params?: { learner?: number; date?: string; status?: string }) => {
      const q = new URLSearchParams()
      if (params?.learner) q.set('learner', String(params.learner))
      if (params?.date) q.set('date', params.date)
      if (params?.status) q.set('status', params.status)
      return get<PaginatedResponse<AttendanceRecord>>(`/attendance/${q.toString() ? '?' + q : ''}`)
    },
    scan: (barcodeValue: string, session: string) =>
      post<{ success: boolean; learner: Learner; record: AttendanceRecord }>(
        '/attendance/scan/',
        { barcode_value: barcodeValue, session },
      ),
    today: (sectionId?: number) =>
      get<AttendanceRecord[]>(`/attendance/today/${sectionId ? '?section=' + sectionId : ''}`),
    prolongedAbsences: (threshold = 5) =>
      get<Learner[]>(`/attendance/prolonged_absences/?threshold=${threshold}`),
  },

  // ── ID Cards ──────────────────────────────────────────────────────────────
  idCards: {
    queue: (status?: string) =>
      get<PaginatedResponse<IDPrintQueueItem>>(`/id-queue/${status ? '?status=' + status : ''}`),
    requestPrint: (learnerId: number, reason: string) =>
      post<IDPrintQueueItem>('/id-queue/', { learner: learnerId, reason }),
    markPrinted: (id: number) =>
      patch<IDPrintQueueItem>(`/id-queue/${id}/mark_printed/`, {}),
    templates: () => get<unknown[]>('/id-templates/'),
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    list: (learnerId?: number) =>
      get<PaginatedResponse<NotificationRecord>>(`/notifications/${learnerId ? '?learner=' + learnerId : ''}`),
    preferences: (learnerId: number) =>
      get<unknown>(`/notif-prefs/?learner=${learnerId}`),
    updatePreferences: (id: number, data: unknown) =>
      patch<unknown>(`/notif-prefs/${id}/`, data),
  },

  // ── Conduct ───────────────────────────────────────────────────────────────
  conduct: {
    list: (learnerId?: number) =>
      get<PaginatedResponse<ConductLog>>(`/conduct/${learnerId ? '?learner=' + learnerId : ''}`),
    create: (data: Partial<ConductLog>) => post<ConductLog>('/conduct/', data),
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: {
    list: () => get<PaginatedResponse<Message>>('/messages/'),
    send: (data: { receiver: number; subject: string; body: string; learner?: number }) =>
      post<Message>('/messages/', data),
    markRead: (id: number) => patch<Message>(`/messages/${id}/mark_read/`, {}),
    unreadCount: () => get<{ unread_count: number }>('/messages/unread_count/'),
  },

  // ── Reports ───────────────────────────────────────────────────────────────
  reports: {
    sf2List: (sectionId?: number) =>
      get<unknown[]>(`/sf2/${sectionId ? '?section=' + sectionId : ''}`),
    sf1List: (schoolYear?: string) =>
      get<unknown[]>(`/sf1/${schoolYear ? '?school_year=' + schoolYear : ''}`),
    reportCards: (learnerId?: number) =>
      get<unknown[]>(`/report-cards/${learnerId ? '?learner=' + learnerId : ''}`),
  },

  // ── Settings (Fix 2: includes tenant FK) ──────────────────────────────────
  settings: {
    get: () => get<SchoolSettings>('/settings/'),
    update: (data: Partial<SchoolSettings>) => patch<SchoolSettings>('/settings/', data),
  },

  // ── Admin Tasks ───────────────────────────────────────────────────────────
  tasks: {
    list: (status?: string) =>
      get<PaginatedResponse<AdminTask>>(`/tasks/${status ? '?status=' + status : ''}`),
    complete: (id: number) => patch<AdminTask>(`/tasks/${id}/complete/`, {}),
  },

  // ── Activity Log ──────────────────────────────────────────────────────────
  activityLog: {
    list: () => get<unknown[]>('/activity-log/'),
  },

  // ── Teacher Contacts ──────────────────────────────────────────────────────
  teacherContacts: {
    list: () => get<PaginatedResponse<TeacherContact>>('/teacher-contacts/'),
  },

  // ── Graduation (Fix 5: notifications now return array, not single record) ─
  graduation: {
    candidates: () => get<Learner[]>('/graduation/candidates/'),
    confirm: (id: number) => post<Learner>(`/graduation/${id}/confirm/`, {}),
    alumni: () => get<Learner[]>('/graduation/alumni/'),
    notifications: (learnerId?: number) =>
      get<GraduationNotification[]>(`/graduation-notifications/${learnerId ? '?learner=' + learnerId : ''}`),
  },

  // ── Absence Alerts ────────────────────────────────────────────────────────
  absenceAlerts: {
    list: (threshold?: number) =>
      get<PaginatedResponse<unknown>>(`/absence-alerts/${threshold ? '?threshold=' + threshold : ''}`),
  },
}

export default api
