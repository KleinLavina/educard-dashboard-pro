/**
 * useAlertsPage
 * Provides data for the Alerts route.
 * Falls back to mock data when the API is unreachable.
 */
import { useNotifications, useProlongedAbsences, useAbsenceAlerts } from './use-api'
import {
  notificationHistory as mockNotifHistory,
  parentProfiles as mockParentProfiles,
  allLearners as mockAllLearners,
  SF2_TARGET,
} from './school-data'

export function useAlertsPage() {
  const notifQuery    = useNotifications()
  const prolongedQuery = useProlongedAbsences(5)
  const absenceAlerts = useAbsenceAlerts()

  const isLoading = notifQuery.isLoading

  // ── Notification history ──────────────────────────────────────────────────
  const apiNotifs = notifQuery.data ?? []

  const normalisedNotifs = apiNotifs.map(n => ({
    id:          String(n.id),
    parentId:    String(n.parent),
    parentName:  n.parent_name,
    channel:     n.channel,
    status:      n.status,
    message:     n.message,
    triggeredBy: n.triggered_by,
    sentAt:      n.sent_at,
  }))

  const mockNotifs = mockNotifHistory.map(n => {
    const parent = mockParentProfiles.find(p => p.id === n.parentId)
    return {
      id:          n.id,
      parentId:    n.parentId,
      parentName:  parent?.name ?? 'Unknown',
      channel:     n.channel,
      status:      n.status,
      message:     n.message,
      triggeredBy: n.triggeredBy,
      sentAt:      n.sentAt,
    }
  })

  const notifications = normalisedNotifs.length > 0 ? normalisedNotifs : mockNotifs

  // ── Prolonged absences ────────────────────────────────────────────────────
  const prolongedLearners = prolongedQuery.data?.map(l => ({
    lrn:            l.lrn,
    fullName:       l.full_name,
    sectionLabel:   l.section_label ?? '—',
    attendanceRate: Number(l.attendance_rate),
  })) ?? mockAllLearners
    .filter(l => l.learner.attendanceRate < SF2_TARGET)
    .map(l => ({
      lrn:            l.learner.lrn,
      fullName:       `${l.learner.firstName} ${l.learner.middleInitial}. ${l.learner.lastName}`,
      sectionLabel:   l.sectionLabel,
      attendanceRate: l.learner.attendanceRate,
    }))

  return {
    isLoading,
    notifications,
    prolongedLearners,
    notifCount: notifications.length,
    sentCount:  notifications.filter(n => n.status === 'sent').length,
    failedCount: notifications.filter(n => n.status === 'failed').length,
  }
}
