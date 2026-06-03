/**
 * useIDCardsPage
 * Provides data for the ID Cards route.
 * Falls back to mock data when the API is unreachable.
 */
import { useIDQueue, useMarkPrinted } from './use-api'
import {
  allLearners as mockAllLearners,
  idReprintRequests as mockReprintRequests,
  idPrintHistory as mockPrintHistory,
} from './school-data'

export function useIDCardsPage() {
  const queueQuery   = useIDQueue()
  const markPrinted  = useMarkPrinted()

  const isLoading = queueQuery.isLoading

  // ── Print queue ───────────────────────────────────────────────────────────
  const apiQueue = queueQuery.data?.results ?? []

  const normalisedQueue = apiQueue.map(item => ({
    id:           item.id,
    lrn:          item.learner_lrn,
    studentName:  item.learner_name,
    section:      item.learner_section ?? '—',
    reason:       item.reason.charAt(0).toUpperCase() + item.reason.slice(1).replace('_', ' '),
    status:       item.status,
    requestedAt:  item.requested_at?.split('T')[0] ?? '—',
    pdfPath:      item.pdf_path,
  }))

  // Mock fallback
  const mockQueue = mockReprintRequests.map(r => ({
    id:           null as number | null,
    lrn:          r.lrn,
    studentName:  r.studentName,
    section:      r.section,
    reason:       r.reason,
    status:       r.status,
    requestedAt:  r.requestedAt,
    pdfPath:      null as string | null,
  }))

  const queue = normalisedQueue.length > 0 ? normalisedQueue : mockQueue

  const pendingCount  = queue.filter(i => i.status === 'pending').length
  const printedCount  = apiQueue.filter(i => i.status === 'printed').length
    || (mockAllLearners.length - mockReprintRequests.length)
  const totalCount    = mockAllLearners.length

  return {
    isLoading,
    queue,
    pendingCount,
    printedCount,
    totalCount,
    markPrinted,
  }
}
