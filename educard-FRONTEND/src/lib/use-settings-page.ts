/**
 * useSettingsPage
 * Provides data for the Settings route.
 * Falls back to mock data when the API is unreachable.
 */
import { useSchoolSettings, useUpdateSettings } from './use-api'
import { SCHOOL_NAME, SCHOOL_YEAR, schoolCalendar } from './school-data'

export function useSettingsPage() {
  const settingsQuery  = useSchoolSettings()
  const updateSettings = useUpdateSettings()

  const isLoading = settingsQuery.isLoading

  // Normalise API settings to the shape the form expects
  const settings = settingsQuery.data
    ? {
        schoolName:    settingsQuery.data.school_name,
        schoolYear:    settingsQuery.data.school_year,
        logoPath:      settingsQuery.data.school_logo_path ?? null,
        primaryColor:  settingsQuery.data.primary_color,
        currentQuarter: settingsQuery.data.current_quarter,
        currentWeek:   settingsQuery.data.current_week,
        sf2Target:     settingsQuery.data.sf2_target_attendance,
        messengerEnabled: settingsQuery.data.messenger_enabled,
        smsEnabled:    settingsQuery.data.sms_enabled,
        smsCredits:    settingsQuery.data.sms_credits_remaining,
        plan:          settingsQuery.data.plan,
        tenant:        settingsQuery.data.tenant ?? null,
        tenantName:    settingsQuery.data.tenant_name ?? null,
        quarters: [
          { label: 'Q1', start: settingsQuery.data.grading_period_1_start ?? schoolCalendar.quarters[0].start, end: settingsQuery.data.grading_period_1_end ?? schoolCalendar.quarters[0].end },
          { label: 'Q2', start: settingsQuery.data.grading_period_2_start ?? schoolCalendar.quarters[1].start, end: settingsQuery.data.grading_period_2_end ?? schoolCalendar.quarters[1].end },
          { label: 'Q3', start: settingsQuery.data.grading_period_3_start ?? schoolCalendar.quarters[2].start, end: settingsQuery.data.grading_period_3_end ?? schoolCalendar.quarters[2].end },
          { label: 'Q4', start: settingsQuery.data.grading_period_4_start ?? schoolCalendar.quarters[3].start, end: settingsQuery.data.grading_period_4_end ?? schoolCalendar.quarters[3].end },
        ],
      }
    : {
        schoolName:    SCHOOL_NAME,
        schoolYear:    SCHOOL_YEAR,
        logoPath:      null,
        primaryColor:  '#3B82F6',
        currentQuarter: schoolCalendar.currentQuarter,
        currentWeek:   schoolCalendar.currentWeek,
        sf2Target:     95,
        messengerEnabled: true,
        smsEnabled:    true,
        smsCredits:    0,
        plan:          'basic',
        tenant:        null,
        tenantName:    null,
        quarters:      schoolCalendar.quarters,
      }

  const save = (data: Partial<typeof settings>) => {
    // Map back to API field names
    return updateSettings.mutateAsync({
      school_name:              data.schoolName,
      school_year:              data.schoolYear,
      primary_color:            data.primaryColor,
      current_quarter:          data.currentQuarter,
      current_week:             data.currentWeek,
      sf2_target_attendance:    data.sf2Target,
      messenger_enabled:        data.messengerEnabled,
      sms_enabled:              data.smsEnabled,
      grading_period_1_start:   data.quarters?.[0]?.start,
      grading_period_1_end:     data.quarters?.[0]?.end,
      grading_period_2_start:   data.quarters?.[1]?.start,
      grading_period_2_end:     data.quarters?.[1]?.end,
      grading_period_3_start:   data.quarters?.[2]?.start,
      grading_period_3_end:     data.quarters?.[2]?.end,
      grading_period_4_start:   data.quarters?.[3]?.start,
      grading_period_4_end:     data.quarters?.[3]?.end,
    })
  }

  return { isLoading, settings, save, isSaving: updateSettings.isPending }
}
