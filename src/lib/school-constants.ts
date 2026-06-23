export const SCHOOL_TYPES = [
  'Nursery',
  'Primary',
  'Secondary',
  'Nursery & Primary',
  'Nursery, Primary & Secondary',
] as const

export type SchoolType = (typeof SCHOOL_TYPES)[number]

export const OGUN_LGAS = [
  'Abeokuta North',
  'Abeokuta South',
  'Ado-Odo/Ota',
  'Egbado North',
  'Egbado South',
  'Ewekoro',
  'Ifo',
  'Ijebu East',
  'Ijebu North',
  'Ijebu North East',
  'Ijebu Ode',
  'Ikenne',
  'Imeko Afon',
  'Ipokia',
  'Obafemi Owode',
  'Odeda',
  'Odogbolu',
  'Ogun Waterside',
  'Remo North',
  'Sagamu',
] as const

export type OgunLGA = (typeof OGUN_LGAS)[number]
