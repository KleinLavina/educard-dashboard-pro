/**
 * EduCard Pro — React Query hooks
 * Drop-in replacements for the mock data imports.
 *
 * Every hook returns { data, isLoading, error } and falls back
 * to the mock data when the API is unreachable (dev mode).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api, { ApiError } from './api'

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.dashboard.stats(),
    staleTime: 30_000,
  })
}

export function useDashboardDepartments() {
  return useQuery({
    queryKey: ['dashboard', 'departments'],
    queryFn: () => api.dashboard.departments(),
    staleTime: 60_000,
  })
}

// ─── School Structure ─────────────────────────────────────────────────────────

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => api.departments.list(),
    staleTime: Infinity,
  })
}

export function useSections(params?: { grade_level?: number; department?: number }) {
  return useQuery({
    queryKey: ['sections', params],
    queryFn: () => api.sections.list(params),
    staleTime: 60_000,
  })
}

export function useSectionsBelowTarget() {
  return useQuery({
    queryKey: ['sections', 'below-target'],
    queryFn: () => api.sections.belowTarget(),
    staleTime: 30_000,
  })
}

// ─── Learners ─────────────────────────────────────────────────────────────────

export function useLearners(params?: {
  search?: string
  section?: number
  graduation_status?: string
  page?: number
}) {
  return useQuery({
    queryKey: ['learners', params],
    queryFn: () => api.learners.list(params),
    staleTime: 30_000,
  })
}

export function useLearner(id: number | null) {
  return useQuery({
    queryKey: ['learner', id],
    queryFn: () => api.learners.get(id!),
    enabled: id !== null,
    staleTime: 30_000,
  })
}

export function useAtRiskLearners() {
  return useQuery({
    queryKey: ['learners', 'at-risk'],
    queryFn: () => api.learners.atRisk(),
    staleTime: 30_000,
  })
}

export function useLearnerGrades(learnerId: number | null) {
  return useQuery({
    queryKey: ['learner-grades', learnerId],
    queryFn: () => api.learners.grades(learnerId!),
    enabled: learnerId !== null,
    staleTime: 30_000,
  })
}

export function useLearnerAttendance(learnerId: number | null) {
  return useQuery({
    queryKey: ['learner-attendance', learnerId],
    queryFn: () => api.learners.attendance(learnerId!),
    enabled: learnerId !== null,
    staleTime: 30_000,
  })
}

export function useLearnerConduct(learnerId: number | null) {
  return useQuery({
    queryKey: ['learner-conduct', learnerId],
    queryFn: () => api.learners.conduct(learnerId!),
    enabled: learnerId !== null,
    staleTime: 60_000,
  })
}

export function useCreateLearner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof api.learners.create>[0]) =>
      api.learners.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learners'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ─── Grades ───────────────────────────────────────────────────────────────────

export function useGrades(params?: { learner?: number; subject?: number; quarter?: number }) {
  return useQuery({
    queryKey: ['grades', params],
    queryFn: () => api.grades.list(params),
    staleTime: 30_000,
  })
}

export function useSubjects(sectionId?: number) {
  return useQuery({
    queryKey: ['subjects', sectionId],
    queryFn: () => api.subjects.list({ section: sectionId }),
    staleTime: 60_000,
    enabled: sectionId != null,
  })
}

export function useGradesBySection(sectionId: number | null) {
  return useQuery({
    queryKey: ['grades', 'section', sectionId],
    queryFn: () => api.grades.list({ section: sectionId! }),
    staleTime: 30_000,
    enabled: sectionId != null,
  })
}

export function useUpsertGrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number | null; data: Parameters<typeof api.grades.upsert>[1] }) =>
      api.grades.upsert(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] })
      qc.invalidateQueries({ queryKey: ['learner-grades'] })
    },
  })
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useAttendanceToday(sectionId?: number) {
  return useQuery({
    queryKey: ['attendance', 'today', sectionId],
    queryFn: () => api.attendance.today(sectionId),
    refetchInterval: 30_000, // poll every 30s for live monitor
    staleTime: 0,
  })
}

export function useProlongedAbsences(threshold = 5) {
  return useQuery({
    queryKey: ['attendance', 'prolonged', threshold],
    queryFn: () => api.attendance.prolongedAbsences(threshold),
    staleTime: 60_000,
  })
}

export function useScanAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ barcode, session }: { barcode: string; session: string }) =>
      api.attendance.scan(barcode, session),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}

// ─── ID Cards ─────────────────────────────────────────────────────────────────

export function useIDQueue(status?: string) {
  return useQuery({
    queryKey: ['id-queue', status],
    queryFn: () => api.idCards.queue(status),
    staleTime: 30_000,
  })
}

export function useMarkPrinted() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.idCards.markPrinted(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['id-queue'] }),
  })
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useNotifications(learnerId?: number) {
  return useQuery({
    queryKey: ['notifications', learnerId],
    queryFn: () => api.notifications.list(learnerId),
    staleTime: 30_000,
  })
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: () => api.messages.list(),
    staleTime: 30_000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['messages', 'unread'],
    queryFn: () => api.messages.unreadCount(),
    refetchInterval: 60_000,
    staleTime: 0,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof api.messages.send>[0]) =>
      api.messages.send(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  })
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useSchoolSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.get(),
    staleTime: Infinity,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof api.settings.update>[0]) =>
      api.settings.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}

// ─── Admin Tasks ──────────────────────────────────────────────────────────────

export function useAdminTasks(status?: string) {
  return useQuery({
    queryKey: ['tasks', status],
    queryFn: () => api.tasks.list(status),
    staleTime: 30_000,
  })
}

// ─── Conduct ──────────────────────────────────────────────────────────────────

export function useConductLogs(learnerId?: number) {
  return useQuery({
    queryKey: ['conduct', learnerId],
    queryFn: () => api.conduct.list(learnerId),
    staleTime: 60_000,
  })
}

// ─── Learner Parents ─────────────────────────────────────────────────────────

export function useLearnerParents(learnerId?: number) {
  return useQuery({
    queryKey: ['learner-parents', learnerId],
    queryFn: () => api.learnerParents.list(learnerId),
    staleTime: 60_000,
  })
}

export function useParentChildren(parentId: number) {
  return useQuery({
    queryKey: ['learner-parents', 'parent', parentId],
    queryFn: () => api.learnerParents.listByParent(parentId),
    enabled: parentId > 0,
    staleTime: 60_000,
  })
}

/** Returns all learners linked to the current parent user */
export function useMyChildren() {
  return useQuery({
    queryKey: ['my-children'],
    queryFn: () => api.learners.list({ page: 1 }),
    staleTime: 60_000,
  })
}

/** Returns the single learner record for the current student user */
export function useMyLearner() {
  return useQuery({
    queryKey: ['my-learner'],
    queryFn: async () => {
      const res = await api.learners.list({ page: 1 })
      return res.results[0] ?? null
    },
    staleTime: 60_000,
  })
}

/** Returns the section + learners for the current teacher user */
export function useMyTeacherSection() {
  return useQuery({
    queryKey: ['my-teacher-section'],
    queryFn: async () => {
      const [sections, learners] = await Promise.all([
        api.sections.list(),
        api.learners.list({ page: 1 }),
      ])
      return { sections, learners: learners.results }
    },
    staleTime: 60_000,
  })
}

export function useAddLearnerParent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof api.learnerParents.create>[0]) =>
      api.learnerParents.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['learner-parents'] }),
  })
}

export function useRemoveLearnerParent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.learnerParents.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['learner-parents'] }),
  })
}

// ─── Graduation ───────────────────────────────────────────────────────────────

export function useGraduationCandidates() {
  return useQuery({
    queryKey: ['graduation', 'candidates'],
    queryFn: () => api.graduation.candidates(),
    staleTime: 60_000,
  })
}

export function useGraduationNotifications(learnerId?: number) {
  return useQuery({
    queryKey: ['graduation-notifications', learnerId],
    queryFn: () => api.graduation.notifications(learnerId),
    staleTime: 60_000,
  })
}

// ─── Absence Alerts ───────────────────────────────────────────────────────────

export function useAbsenceAlerts(threshold?: number) {
  return useQuery({
    queryKey: ['absence-alerts', threshold],
    queryFn: () => api.absenceAlerts.list(threshold),
    staleTime: 60_000,
  })
}
