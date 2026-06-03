/**
 * useGradesPage
 * Provides data for the Grades route.
 * Falls back to mock data when the API is unreachable.
 */
import { useGrades } from './use-api'
import {
  allLearners as mockAllLearners,
  allSections as mockAllSections,
  gradeRecords as mockGradeRecords,
} from './school-data'

/** Grades for a specific learner (student/parent portal) */
export function useLearnerGradesPage(learnerId: number | null, lrn?: string) {
  const gradesQuery = useGrades(learnerId ? { learner: learnerId } : undefined)

  const apiGrades = gradesQuery.data?.results ?? []

  // Normalise API grades to { subject, q1, q2, q3, q4 } shape
  const normalisedApi = (() => {
    const bySubject: Record<string, { subject: string; q1: number | null; q2: number | null; q3: number | null; q4: number | null }> = {}
    for (const g of apiGrades) {
      if (!bySubject[g.subject_name]) {
        bySubject[g.subject_name] = { subject: g.subject_name, q1: null, q2: null, q3: null, q4: null }
      }
      const key = `q${g.quarter}` as 'q1' | 'q2' | 'q3' | 'q4'
      bySubject[g.subject_name][key] = g.computed_grade ? Number(g.computed_grade) : null
    }
    return Object.values(bySubject)
  })()

  // Mock fallback
  const mockGrades = lrn
    ? mockGradeRecords
        .filter(g => g.lrn === lrn)
        .map(g => ({
          subject: g.subject,
          q1: g.grades.q1,
          q2: g.grades.q2,
          q3: g.grades.q3,
          q4: g.grades.q4,
        }))
    : []

  const grades = normalisedApi.length > 0 ? normalisedApi : mockGrades

  return {
    isLoading: gradesQuery.isLoading,
    grades,
  }
}

/** School-wide grade overview (admin/principal view) */
export function useSchoolGradesPage() {
  const schoolAvg = mockAllLearners.reduce((a, l) => a + l.learner.gpa, 0) / Math.max(mockAllLearners.length, 1)
  const above90   = mockAllLearners.filter(l => l.learner.gpa >= 90).length
  const below75   = mockAllLearners.filter(l => l.learner.gpa < 75).length

  const sectionAvgs = mockAllSections.map(s => {
    const gpas = s.section.learners.map(l => l.gpa)
    const avg  = gpas.length ? gpas.reduce((a, v) => a + v, 0) / gpas.length : 0
    return {
      id:       s.section.id,
      label:    s.label,
      adviser:  s.section.adviser,
      enrolled: s.enrolled,
      avg:      Number(avg.toFixed(1)),
      highest:  gpas.length ? Math.max(...gpas) : 0,
      lowest:   gpas.length ? Math.min(...gpas) : 0,
      below:    avg < 75,
    }
  })

  return { schoolAvg, above90, below75, sectionAvgs }
}
