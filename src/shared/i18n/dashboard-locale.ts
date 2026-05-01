export const SUPPORTED_LANGUAGES = ['de', 'en', 'fr', 'es', 'it'] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]

type DashboardCopy = {
  languageLabel: string
  leagueSwitcherEyebrow: string
  leagueSwitcherTitle: string
  cacheHint: string
  updating: string
  upToDate: string
  updatedPrefix: string
  matchdayLabel: string
  seasonLabel: string
  currentStandings: string
  loadingEyebrow: string
  loadingTitle: (leagueLabel: string) => string
  loadingMessage: string
  errorEyebrow: string
  errorTitle: (leagueLabel: string) => string
  retryLabel: string
  emptyEyebrow: string
  emptyTitle: (leagueLabel: string) => string
  emptyMessage: string
  emptySupport: string
  errorSupport: string
  leader: string
  bestAttack: string
  bestDefense: string
  bestGoalDifference: string
  pointsShort: string
  goalsScored: string
  goalsConceded: string
  goalDifferenceShort: string
  playedShort: string
  played: string
  record: string
  goalDiff: string
  top4Legend: string
  relegationLegend: string
  championsLeagueLegend: string
  noData: string
}

export const LANGUAGE_OPTIONS: ReadonlyArray<{
  code: LanguageCode
  label: string
  flagCode: 'de' | 'gb' | 'fr' | 'es' | 'it'
  locale: string
}> = [
  { code: 'de', label: 'Deutsch', flagCode: 'de', locale: 'de-DE' },
  { code: 'en', label: 'English', flagCode: 'gb', locale: 'en-GB' },
  { code: 'fr', label: 'Francais', flagCode: 'fr', locale: 'fr-FR' },
  { code: 'es', label: 'Espanol', flagCode: 'es', locale: 'es-ES' },
  { code: 'it', label: 'Italiano', flagCode: 'it', locale: 'it-IT' },
]

const dashboardCopy: Record<LanguageCode, DashboardCopy> = {
  de: {
    languageLabel: 'Sprache',
    leagueSwitcherEyebrow: 'Liga',
    leagueSwitcherTitle: 'Liga',
    cacheHint: 'Geladene Ligen bleiben im Cache.',
    updating: 'Tabelle wird aktualisiert',
    upToDate: 'Tabelle aktuell',
    updatedPrefix: 'Aktualisiert',
    matchdayLabel: 'Spieltag',
    seasonLabel: 'Saison',
    currentStandings: 'Aktuelle Tabelle',
    loadingEyebrow: 'Laedt',
    loadingTitle: (leagueLabel) => `${leagueLabel} wird geladen`,
    loadingMessage:
      'Tabellenstand und Wettbewerbsdaten werden fuer die ausgewaehlte Liga geladen.',
    errorEyebrow: 'Fehler',
    errorTitle: (leagueLabel) => `${leagueLabel} konnte nicht geladen werden`,
    retryLabel: 'Erneut versuchen',
    emptyEyebrow: 'Keine Daten',
    emptyTitle: (leagueLabel) => `Keine Tabelle fuer ${leagueLabel} verfuegbar`,
    emptyMessage:
      'Fuer diesen Wettbewerb sind aktuell keine Tabellendaten verfuegbar.',
    emptySupport:
      'Football Galaxy haelt diesen Bereich bereit, sobald mehr Ligadaten verfuegbar sind.',
    errorSupport:
      'Pruefe Verbindung oder API-Verfuegbarkeit und versuche es dann erneut.',
    leader: 'Spitzenreiter',
    bestAttack: 'Beste Offensive',
    bestDefense: 'Beste Defensive',
    bestGoalDifference: 'Beste Tordifferenz',
    pointsShort: 'Pkt.',
    goalsScored: 'Tore',
    goalsConceded: 'Gegentore',
    goalDifferenceShort: 'TD',
    playedShort: 'Sp',
    played: 'Spiele',
    record: 'Bilanz',
    goalDiff: 'Diff.',
    top4Legend: 'Top 4',
    relegationLegend: 'Abstieg',
    championsLeagueLegend: 'Champions-League-Plaetze',
    noData: 'Keine Daten',
  },
  en: {
    languageLabel: 'Language',
    leagueSwitcherEyebrow: 'League',
    leagueSwitcherTitle: 'League',
    cacheHint: 'Loaded leagues stay cached.',
    updating: 'Updating standings',
    upToDate: 'Standings up to date',
    updatedPrefix: 'Updated',
    matchdayLabel: 'Matchday',
    seasonLabel: 'Season',
    currentStandings: 'Current standings',
    loadingEyebrow: 'Loading',
    loadingTitle: (leagueLabel) => `Fetching ${leagueLabel}`,
    loadingMessage:
      'League table and competition context are loading for the selected league.',
    errorEyebrow: 'Match center error',
    errorTitle: (leagueLabel) => `Unable to load ${leagueLabel}`,
    retryLabel: 'Try again',
    emptyEyebrow: 'No table yet',
    emptyTitle: (leagueLabel) => `No standings available for ${leagueLabel}`,
    emptyMessage:
      'This competition does not currently have table data ready to display.',
    emptySupport:
      'Football Galaxy will keep this space ready as more league coverage becomes available.',
    errorSupport:
      'Check your connection or API availability, then retry the selected league table.',
    leader: 'Leader',
    bestAttack: 'Best attack',
    bestDefense: 'Best defense',
    bestGoalDifference: 'Best goal difference',
    pointsShort: 'pts',
    goalsScored: 'goals',
    goalsConceded: 'against',
    goalDifferenceShort: 'GD',
    playedShort: 'P',
    played: 'Played',
    record: 'Record',
    goalDiff: 'Goal diff',
    top4Legend: 'Top 4',
    relegationLegend: 'Relegation',
    championsLeagueLegend: 'Champions League places',
    noData: 'No data',
  },
  fr: {
    languageLabel: 'Langue',
    leagueSwitcherEyebrow: 'Ligue',
    leagueSwitcherTitle: 'Ligue',
    cacheHint: 'Les ligues chargees restent en cache.',
    updating: 'Classement en cours',
    upToDate: 'Classement a jour',
    updatedPrefix: 'Mis a jour',
    matchdayLabel: 'Journee',
    seasonLabel: 'Saison',
    currentStandings: 'Classement actuel',
    loadingEyebrow: 'Chargement',
    loadingTitle: (leagueLabel) => `Chargement de ${leagueLabel}`,
    loadingMessage:
      'Le classement et le contexte de la competition sont en cours de chargement.',
    errorEyebrow: 'Erreur',
    errorTitle: (leagueLabel) => `Impossible de charger ${leagueLabel}`,
    retryLabel: 'Reessayer',
    emptyEyebrow: 'Aucune table',
    emptyTitle: (leagueLabel) => `Aucun classement pour ${leagueLabel}`,
    emptyMessage:
      'Aucune donnee de classement n est disponible pour cette competition.',
    emptySupport:
      'Football Galaxy gardera cet espace pret des que plus de donnees seront disponibles.',
    errorSupport:
      'Verifiez la connexion ou l API puis reessayez.',
    leader: 'Leader',
    bestAttack: 'Meilleure attaque',
    bestDefense: 'Meilleure defense',
    bestGoalDifference: 'Meilleure difference',
    pointsShort: 'pts',
    goalsScored: 'buts',
    goalsConceded: 'encaisses',
    goalDifferenceShort: 'Diff',
    playedShort: 'J',
    played: 'Joues',
    record: 'Bilan',
    goalDiff: 'Diff.',
    top4Legend: 'Top 4',
    relegationLegend: 'Relegation',
    championsLeagueLegend: 'Places Ligue des champions',
    noData: 'Aucune donnee',
  },
  es: {
    languageLabel: 'Idioma',
    leagueSwitcherEyebrow: 'Liga',
    leagueSwitcherTitle: 'Liga',
    cacheHint: 'Las ligas cargadas se mantienen en cache.',
    updating: 'Actualizando clasificacion',
    upToDate: 'Clasificacion al dia',
    updatedPrefix: 'Actualizado',
    matchdayLabel: 'Jornada',
    seasonLabel: 'Temporada',
    currentStandings: 'Clasificacion actual',
    loadingEyebrow: 'Cargando',
    loadingTitle: (leagueLabel) => `Cargando ${leagueLabel}`,
    loadingMessage:
      'La tabla y el contexto de la competicion se estan cargando.',
    errorEyebrow: 'Error',
    errorTitle: (leagueLabel) => `No se pudo cargar ${leagueLabel}`,
    retryLabel: 'Reintentar',
    emptyEyebrow: 'Sin tabla',
    emptyTitle: (leagueLabel) => `No hay clasificacion para ${leagueLabel}`,
    emptyMessage:
      'Actualmente no hay datos de clasificacion disponibles para esta competicion.',
    emptySupport:
      'Football Galaxy mantendra este espacio listo cuando haya mas cobertura.',
    errorSupport:
      'Comprueba la conexion o la API y vuelve a intentarlo.',
    leader: 'Lider',
    bestAttack: 'Mejor ataque',
    bestDefense: 'Mejor defensa',
    bestGoalDifference: 'Mejor diferencia',
    pointsShort: 'pts',
    goalsScored: 'goles',
    goalsConceded: 'encajados',
    goalDifferenceShort: 'DG',
    playedShort: 'PJ',
    played: 'Jugados',
    record: 'Balance',
    goalDiff: 'Dif.',
    top4Legend: 'Top 4',
    relegationLegend: 'Descenso',
    championsLeagueLegend: 'Puestos Champions',
    noData: 'Sin datos',
  },
  it: {
    languageLabel: 'Lingua',
    leagueSwitcherEyebrow: 'Lega',
    leagueSwitcherTitle: 'Lega',
    cacheHint: 'Le leghe caricate restano in cache.',
    updating: 'Classifica in aggiornamento',
    upToDate: 'Classifica aggiornata',
    updatedPrefix: 'Aggiornato',
    matchdayLabel: 'Giornata',
    seasonLabel: 'Stagione',
    currentStandings: 'Classifica attuale',
    loadingEyebrow: 'Caricamento',
    loadingTitle: (leagueLabel) => `Caricamento di ${leagueLabel}`,
    loadingMessage:
      'Classifica e contesto della competizione sono in caricamento.',
    errorEyebrow: 'Errore',
    errorTitle: (leagueLabel) => `Impossibile caricare ${leagueLabel}`,
    retryLabel: 'Riprova',
    emptyEyebrow: 'Nessuna tabella',
    emptyTitle: (leagueLabel) => `Nessuna classifica per ${leagueLabel}`,
    emptyMessage:
      'Al momento non ci sono dati di classifica disponibili per questa competizione.',
    emptySupport:
      'Football Galaxy manterra quest area pronta quando saranno disponibili piu dati.',
    errorSupport:
      'Controlla la connessione o l API e riprova.',
    leader: 'Capolista',
    bestAttack: 'Miglior attacco',
    bestDefense: 'Miglior difesa',
    bestGoalDifference: 'Miglior differenza',
    pointsShort: 'pt',
    goalsScored: 'gol',
    goalsConceded: 'subiti',
    goalDifferenceShort: 'DR',
    playedShort: 'G',
    played: 'Giocate',
    record: 'Bilancio',
    goalDiff: 'Diff.',
    top4Legend: 'Top 4',
    relegationLegend: 'Retrocessione',
    championsLeagueLegend: 'Posti Champions League',
    noData: 'Nessun dato',
  },
}

export function parseLanguage(value: string | null): LanguageCode {
  return SUPPORTED_LANGUAGES.includes(value as LanguageCode)
    ? (value as LanguageCode)
    : 'en'
}

export function getDashboardCopy(language: LanguageCode) {
  return dashboardCopy[language]
}

export function getLanguageLocale(language: LanguageCode) {
  return (
    LANGUAGE_OPTIONS.find((option) => option.code === language)?.locale ??
    'en-GB'
  )
}
