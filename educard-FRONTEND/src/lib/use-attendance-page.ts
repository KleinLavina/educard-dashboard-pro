/**
 * useAttendancePage
 * Provides data for the Attendance route.
 * Falls back to mock data when the API is unreachable.
 */
import { useAttendanceToday, useSectionsBelowTarget, useProlongedAbsences } from './use-api'
import {
  allSections as mockAllSections,
  allLearners as mockAllLearners,
  SF2_TARGET,
} from './school-data'

export function useAttendancePage(sectionId?: number) {
  const todayQuery   = useAttendanceToday(sectionId)
  const belowQuery   = useSectionsBelowTarget()
  const prolongedQuery = useProlongedAbsences(5)

  const isLoading = todayQuery.isLoading

  // ── Campus-wide stats ─────────────────────────────────────────────────────
  const overallAttendance = mockAllLearners.reduce(
    (a, l) => a + l.learner.attendanceRate, 0
  ) / Math.max(mockAllLearners.length, 1)

  const belowCount = belowQuery.data?.length
    ?? mockAllSections.filter(s => s.belowTarget).length

  const onTargetCount = mockAllSections.length - belowCount

  // ── Today's records (for live monitor) ───────────────────────────────────
  const todayRecords = todayQuery.data ?? []

  // ── Prolonged absences (for alerts) ──────────────────────────────────────
  const prolongedAbsences = prolongedQuery.data?.map(l => ({
    lrn:            l.lrn,
    fullName:       l.full_name,
    sectionLabel:   l.section_label ?? '—',
    attendanceRate: Number(l.attendance_rate),
    status:         l.status,
  })) ?? mockAllLearners
    .filter(l => l.learner.attendanceRate < SF2_TARGET)
    .map(l => ({
      lrn:            l.learner.lrn,
      fullName:       `${l.learner.firstName} ${l.learner.middleInitial}. ${l.learner.lastName}`,
      sectionLabel:   l.sectionLabel,
      attendanceRate: l.learner.attendanceRate,
      status:         l.status,
    }))

  return {
    isLoading,
    overallAttendance,
    belowCount,
    onTargetCount,
    totalSections: mockAllSections.length,
    todayRecords,
    prolongedAbsences,
  }
}
