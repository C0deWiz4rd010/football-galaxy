import type { Locale } from '@/contexts/LocaleContext'

/**
 * Country names in the UI language. Providers deliver English names (ESPN
 * nationalities) or FIFA codes (football-data.org national teams); both are
 * resolved to an ISO 3166 region and rendered with Intl.DisplayNames.
 */

/** FIFA trigrams that differ from — or have no — ISO alpha-2 equivalent. */
const FIFA_TO_ISO: Record<string, string> = {
  ALB: 'AL', ALG: 'DZ', AND: 'AD', ANG: 'AO', ARG: 'AR', ARM: 'AM', AUS: 'AU', AUT: 'AT', AZE: 'AZ',
  BEL: 'BE', BEN: 'BJ', BFA: 'BF', BHR: 'BH', BIH: 'BA', BLR: 'BY', BOL: 'BO', BRA: 'BR', BUL: 'BG',
  CAN: 'CA', CHI: 'CL', CHN: 'CN', CIV: 'CI', CMR: 'CM', COD: 'CD', COL: 'CO', CPV: 'CV', CRC: 'CR',
  CRO: 'HR', CUB: 'CU', CUW: 'CW', CYP: 'CY', CZE: 'CZ', DEN: 'DK', DOM: 'DO', ECU: 'EC', EGY: 'EG',
  ESP: 'ES', EST: 'EE', FIN: 'FI', FRA: 'FR', GAB: 'GA', GEO: 'GE', GER: 'DE', GHA: 'GH', GRE: 'GR',
  GUA: 'GT', GUI: 'GN', HAI: 'HT', HON: 'HN', HUN: 'HU', IDN: 'ID', IRL: 'IE', IRN: 'IR', IRQ: 'IQ',
  ISL: 'IS', ISR: 'IL', ITA: 'IT', JAM: 'JM', JOR: 'JO', JPN: 'JP', KAZ: 'KZ', KEN: 'KE', KOR: 'KR',
  KOS: 'XK', KSA: 'SA', KUW: 'KW', LTU: 'LT', LUX: 'LU', LVA: 'LV', MAR: 'MA', MEX: 'MX', MKD: 'MK',
  MLI: 'ML', MNE: 'ME', NCL: 'NC', NED: 'NL', NGA: 'NG', NOR: 'NO', NZL: 'NZ', OMA: 'OM', PAN: 'PA',
  PAR: 'PY', PER: 'PE', POL: 'PL', POR: 'PT', PRK: 'KP', QAT: 'QA', ROU: 'RO', RSA: 'ZA', RUS: 'RU',
  SEN: 'SN', SLV: 'SV', SRB: 'RS', SUI: 'CH', SUR: 'SR', SVK: 'SK', SVN: 'SI', SWE: 'SE', SYR: 'SY',
  THA: 'TH', TRI: 'TT', TUN: 'TN', TUR: 'TR', UAE: 'AE', UKR: 'UA', URU: 'UY', USA: 'US', UZB: 'UZ',
  VEN: 'VE', VIE: 'VN', ZAM: 'ZM',
}

/** Football nations that are not ISO regions. */
const HOME_NATIONS: Record<string, Record<Locale, string>> = {
  ENG: { de: 'England', en: 'England' },
  SCO: { de: 'Schottland', en: 'Scotland' },
  WAL: { de: 'Wales', en: 'Wales' },
  NIR: { de: 'Nordirland', en: 'Northern Ireland' },
}

/** Provider spellings that Intl's English names don't produce. */
const NAME_ALIASES: Record<string, string> = {
  'korea republic': 'KR',
  'south korea': 'KR',
  'ir iran': 'IR',
  iran: 'IR',
  usa: 'US',
  'united states': 'US',
  "cote d'ivoire": 'CI',
  'ivory coast': 'CI',
  'cape verde': 'CV',
  'cape verde islands': 'CV',
  'congo dr': 'CD',
  'dr congo': 'CD',
  'czech republic': 'CZ',
  turkey: 'TR',
  türkiye: 'TR',
  'bosnia-herzegovina': 'BA',
  'bosnia and herzegovina': 'BA',
  curacao: 'CW',
  'north macedonia': 'MK',
  'republic of ireland': 'IE',
  holland: 'NL',
}

const HOME_NATION_NAMES: Record<string, string> = {
  england: 'ENG',
  scotland: 'SCO',
  wales: 'WAL',
  'northern ireland': 'NIR',
}

const displayNames = new Map<Locale, Intl.DisplayNames | null>()

function regionNames(locale: Locale): Intl.DisplayNames | null {
  if (!displayNames.has(locale)) {
    try {
      displayNames.set(locale, new Intl.DisplayNames([locale], { type: 'region' }))
    } catch {
      displayNames.set(locale, null)
    }
  }
  return displayNames.get(locale) ?? null
}

let englishIndex: Map<string, string> | undefined

/** English region name → ISO code, built once from Intl itself. */
function isoFromEnglishName(name: string): string | undefined {
  const key = name.trim().toLowerCase()
  if (NAME_ALIASES[key]) return NAME_ALIASES[key]
  if (!englishIndex) {
    englishIndex = new Map()
    const english = regionNames('en')
    if (english) {
      for (let a = 65; a <= 90; a += 1) {
        for (let b = 65; b <= 90; b += 1) {
          const code = String.fromCharCode(a, b)
          const label = english.of(code)
          if (label && label !== code) englishIndex.set(label.toLowerCase(), code)
        }
      }
    }
  }
  return englishIndex.get(key)
}

function localize(iso: string, locale: Locale): string | undefined {
  const label = regionNames(locale)?.of(iso)
  return label && label !== iso ? label : undefined
}

/** National team name from its FIFA code, falling back to the provider name. */
export function nationName(fifaCode: string | undefined, fallback: string, locale: Locale): string {
  const code = fifaCode?.toUpperCase()
  if (code && HOME_NATIONS[code]) return HOME_NATIONS[code][locale]
  const iso = (code && FIFA_TO_ISO[code]) ?? isoFromEnglishName(fallback)
  return (iso && localize(iso, locale)) ?? countryName(fallback, locale)
}

/** Country from an English provider name (e.g. ESPN nationality). */
export function countryName(englishName: string | undefined, locale: Locale): string {
  if (!englishName) return ''
  const homeNation = HOME_NATION_NAMES[englishName.trim().toLowerCase()]
  if (homeNation) return HOME_NATIONS[homeNation]![locale]
  const iso = isoFromEnglishName(englishName)
  return (iso && localize(iso, locale)) ?? englishName
}
