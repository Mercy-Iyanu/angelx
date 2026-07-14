export const CLASS_LEVELS = [
  'Pre-Nursery',
  'Nursery 1',
  'Nursery 2',
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SS 1',
  'SS 2',
  'SS 3',
] as const

export type ClassLevel = (typeof CLASS_LEVELS)[number]

export const ADMISSION_STATUSES = [
  'Active',
  'Exited-Cleared',
  'Exited-Unresolved',
  'Suspended',
] as const

export type AdmissionStatus = (typeof ADMISSION_STATUSES)[number]
