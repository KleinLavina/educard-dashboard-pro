/**
 * useAdminDashboard
 * Fetches real API data and maps it to the same shape the admin-view
 * components already expect from school-data.ts.
 * Falls back to mock data when the API is unreachable.
 */
import { useDashboardStats, useDashboardDepartments, useAtRiskLearners, useAdminTasks, useIDQueue } from './use-api'
import {
  totals as mockTotals,
  allLearners as mockAllLearners,
  departments as mockDepartments,
  departmentStats,
  allSections as mockAllSections,
  SF2_TARGET,
} from './school-data'

export function useAdminDashboard() {
  const statsQuery = useDashboardStats()
  const deptQuery  = useDashboardDepartments()
  const atRiskQuery = useAtRiskLearners()
  const tasksQuery  = useAdminTasks('pending')
  const idQueueQuery = useIDQueue()

  const isLoading = statsQuery.isLoading
  const isError   = statsQuery.isError

  // ── Stats (hero section + metric cards) ──────────────────────────────────
  const stats = statsQuery.data ?? {
    total_enrolled:        mockTotals.enrolled,
    campus_attendance:     mockTotals.campusAttendance,
    sections_below_target: mockTotals.below,
    at_risk_count:         mockAllLearners.filter(l => l.status === 'At Risk').length,
    id_cards_printed:      mockTotals.enrolled - 3,
    pending_tasks:         4,
    current_quarter:       3,
    current_week:          6,
    school_name:           "St. Mary's Academy",
    school_year:           '2025-2026',
  }

  // ── At-risk learners table ────────────────────────────────────────────────
  // API returns flat Learner objects; mock returns EnrichedLearner objects.
  // We normalise to a common shape both the table and the sheet can use.
  const atRiskLearners = atRiskQuery.data
    ? atRiskQuery.data.map(l => ({
        lrn:            l.lrn,
        fullName:       l.full_name,
        sectionLabel:   l.section_label ?? '—',
        adviser:        '—',          // not in list serializer; shown as dash
        attendanceRate: Number(l.attendance_rate),
        gpa:            Number(l.gpa),
        status:         l.status,
      }))
    : mockAllLearners
        .filter(l => l.learner.attendanceRate < SF2_TARGET)
        .sort((a, b) => a.learner.attendanceRate - b.learner.attendanceRate)
        .slice(0, 6)
        .map(l => ({
          lrn:            l.learner.lrn,
          fullName:       `${l.learner.firstName} ${l.learner.middleInitial}. ${l.learner.lastName}`,
          sectionLabel:   l.sectionLabel,
          adviser:        l.section.adviser,
          attendanceRate: l.learner.attendanceRate,
          gpa:            l.learner.gpa,
          status:         l.status,
        }))

  // ── Pending tasks ─────────────────────────────────────────────────────────
  const pendingTasks = tasksQuery.data
    ? tasksQuery.data.results.map(t => ({
        id:       t.id,
        task:     t.title,
        priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
        dueDate:  t.due_date ?? '—',
      }))
    : [
        { id: 0, task: 'Process 5 new enrollment applications',          priority: 'High',   dueDate: 'May 12' },
        { id: 1, task: 'Review 3 LRN reprint requests',                  priority: 'Medium', dueDate: 'May 13' },
        { id: 2, task: 'Generate SF1 reports for Division Office',        priority: 'High',   dueDate: 'May 14' },
        { id: 3, task: 'Update student photos for Grade 9 - Bonifacio',   priority: 'Low',    dueDate: 'May 15' },
      ]

  // ── ID card counts ────────────────────────────────────────────────────────
  const idPrinted = idQueueQuery.data
    ? idQueueQuery.data.results.filter(i => i.status === 'printed').length
    : stats.id_cards_printed

  const idPending = idQueueQuery.data
    ? idQueueQuery.data.results.filter(i => i.status === 'pending').length
    : 3

  // ── Department bars (chart) ───────────────────────────────────────────────
  const jhsStats = departmentStats(mockDepartments[0])
  const shsStats = departmentStats(mockDepartments[1])
  const departmentBars = [
    { name: 'JHS', attendance: Number(jhsStats.rate.toFixed(1)), target: SF2_TARGET },
    { name: 'SHS', attendance: Number(shsStats.rate.toFixed(1)), target: SF2_TARGET },
  ]

  return {
    isLoading,
    isError,
    stats,
    atRiskLearners,
    pendingTasks,
    idPrinted,
    idPending,
    departmentBars,
  }
}
