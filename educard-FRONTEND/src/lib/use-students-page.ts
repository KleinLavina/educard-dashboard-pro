/**
 * useStudentsPage
 * Provides data for the Students route.
 * Falls back to mock data when the API is unreachable.
 */
import { useLearners, useAtRiskLearners, useSections } from './use-api'
import {
  allLearners as mockAllLearners,
  allSections as mockAllSections,
  departments as mockDepartments,
  SF2_TARGET,
} from './school-data'

export function useStudentsPage(search = '', deptFilter: 'all' | 'JHS' | 'SHS' = 'all') {
  const learnersQuery = useLearners({ search: search || undefined })
  const atRiskQuery   = useAtRiskLearners()
  const sectionsQuery = useSections()

  const isLoading = learnersQuery.isLoading
  const isError   = learnersQuery.isError

  // ── Learners list ─────────────────────────────────────────────────────────
  const apiLearners = learnersQuery.data?.results ?? []

  // Normalise API learners to the shape the table expects
  const normalisedApi = apiLearners.map(l => ({
    lrn:            l.lrn,
    fullName:       l.full_name,
    firstName:      l.first_name,
    middleInitial:  l.middle_initial,
    lastName:       l.last_name,
    sectionLabel:   l.section_label ?? '—',
    departmentKey:  (l.section_label?.startsWith('Grade 1') ? 'SHS' : 'JHS') as 'JHS' | 'SHS',
    gpa:            Number(l.gpa),
    attendanceRate: Number(l.attendance_rate),
    status:         l.status,
    id:             l.id,
  }))

  // Normalise mock learners to the same shape
  const normalisedMock = mockAllLearners.map(l => ({
    lrn:            l.learner.lrn,
    fullName:       `${l.learner.firstName} ${l.learner.middleInitial}. ${l.learner.lastName}`,
    firstName:      l.learner.firstName,
    middleInitial:  l.learner.middleInitial,
    lastName:       l.learner.lastName,
    sectionLabel:   l.sectionLabel,
    departmentKey:  l.department.key as 'JHS' | 'SHS',
    gpa:            l.learner.gpa,
    attendanceRate: l.learner.attendanceRate,
    status:         l.status,
    id:             null as number | null,
  }))

  const allLearners = normalisedApi.length > 0 ? normalisedApi : normalisedMock

  // Apply dept filter client-side (API already handles search)
  const filtered = allLearners.filter(l => {
    const matchDept = deptFilter === 'all' || l.departmentKey === deptFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      l.fullName.toLowerCase().includes(q) ||
      l.lrn.includes(q) ||
      l.sectionLabel.toLowerCase().includes(q)
    return matchDept && matchSearch
  })

  const atRiskCount = atRiskQuery.data?.length
    ?? mockAllLearners.filter(l => l.status === 'At Risk').length

  const sectionCount = sectionsQuery.data?.length ?? mockAllSections.length

  return {
    isLoading,
    isError,
    filtered,
    totalCount: allLearners.length,
    atRiskCount,
    sectionCount,
  }
}
