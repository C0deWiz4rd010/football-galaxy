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
  flag: string
  locale: string
}> = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'en', label: 'English', flag: '🇬🇧', locale: 'en-GB' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'es', label: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', locale: 'it-IT' },
]

const dashboardCopy: Record<LanguageCode, DashboardCopy> = {
  de: {
    languageLabel: 'Sprache',
    leagueSwitcherEyebrow: 'Liga',
    leagueSwitcherTitle: 'Wettbewerb wechseln',
    cacheHint: 'Bereits geladene Ligen bleiben zwischengespeichert.',
    updating: 'Tabelle wird aktualisiert',
    upToDate: 'Tabelle aktuell',
    updatedPrefix: 'Aktualisiert',
    matchdayLabel: 'Spieltag',
    seasonLabel: 'Saison',
    currentStandings: 'Aktuelle Tabelle',
    loadingEyebrow: 'Lädt',
    loadingTitle: (leagueLabel) => `${leagueLabel} wird geladen`,
    loadingMessage:
      'Tabellenstand und Wettbewerbsdaten werden für die ausgewählte Liga geladen.',
    errorEyebrow: 'Fehler',
    errorTitle: (leagueLabel) => `${leagueLabel} konnte nicht geladen werden`,
    retryLabel: 'Erneut versuchen',
    emptyEyebrow: 'Keine Daten',
    emptyTitle: (leagueLabel) => `Keine Tabelle für ${leagueLabel} verfügbar`,
    emptyMessage:
      'Für diesen Wettbewerb sind aktuell keine Tabellendaten verfügbar.',
    emptySupport:
      'Football Galaxy hält diesen Bereich bereit, sobald mehr Ligadaten verfügbar sind.',
    errorSupport:
      'Prüfe Verbindung oder API-Verfügbarkeit und versuche es dann erneut.',
    leader: 'Spitzenreiter',
    bestAttack: 'Beste Offensive',
    bestDefense: 'Beste Defensive',
    bestGoalDifference: 'Beste Tordifferenz',
    pointsShort: 'Pkt.',
    goalsScored: 'Tore erzielt',
    goalsConceded: 'Tore kassiert',
    goalDifferenceShort: 'TD',
    playedShort: 'Sp',
    played: 'Spiele',
    record: 'Bilanz',
    goalDiff: 'Diff.',
    top4Legend: 'Top 4',
    relegationLegend: 'Abstieg',
    championsLeagueLegend: 'Champions-League-Plätze',
    noData: 'Keine Daten',
  },
  en: {
    languageLabel: 'Language',
    leagueSwitcherEyebrow: 'Competition',
    leagueSwitcherTitle: 'Switch league',
    cacheHint: 'Previously loaded leagues stay cached while you browse.',
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
    goalsScored: 'goals scored',
    goalsConceded: 'goals conceded',
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
    leagueSwitcherEyebrow: 'Compétition',
    leagueSwitcherTitle: 'Changer de ligue',
    cacheHint: 'Les ligues déjà ouvertes restent en cache.',
    updating: 'Mise à jour du classement',
    upToDate: 'Classement à jour',
    updatedPrefix: 'Mis à jour',
    matchdayLabel: 'Journée',
    seasonLabel: 'Saison',
    currentStandings: 'Classement actuel',
    loadingEyebrow: 'Chargement',
    loadingTitle: (leagueLabel) => `Chargement de ${leagueLabel}`,
    loadingMessage:
      'Le classement et le contexte de la compétition sont en cours de chargement.',
    errorEyebrow: 'Erreur',
    errorTitle: (leagueLabel) => `Impossible de charger ${leagueLabel}`,
    retryLabel: 'Réessayer',
    emptyEyebrow: 'Aucune table',
    emptyTitle: (leagueLabel) => `Aucun classement pour ${leagueLabel}`,
    emptyMessage:
      "Aucune donnée de classement n'est actuellement disponible pour cette compétition.",
    emptySupport:
      'Football Galaxy gardera cet espace prêt dès que davantage de données seront disponibles.',
    errorSupport:
      "Vérifiez la connexion ou l'API puis réessayez.",
    leader: 'Leader',
    bestAttack: 'Meilleure attaque',
    bestDefense: 'Meilleure défense',
    bestGoalDifference: 'Meilleure différence',
    pointsShort: 'pts',
    goalsScored: 'buts marqués',
    goalsConceded: 'buts encaissés',
    goalDifferenceShort: 'Diff',
    playedShort: 'J',
    played: 'Joués',
    record: 'Bilan',
    goalDiff: 'Diff.',
    top4Legend: 'Top 4',
    relegationLegend: 'Relégation',
    championsLeagueLegend: 'Places en Ligue des champions',
    noData: 'Aucune donnée',
  },
  es: {
    languageLabel: 'Idioma',
    leagueSwitcherEyebrow: 'Competición',
    leagueSwitcherTitle: 'Cambiar liga',
    cacheHint: 'Las ligas cargadas permanecen en caché.',
    updating: 'Actualizando clasificación',
    upToDate: 'Clasificación al día',
    updatedPrefix: 'Actualizado',
    matchdayLabel: 'Jornada',
    seasonLabel: 'Temporada',
    currentStandings: 'Clasificación actual',
    loadingEyebrow: 'Cargando',
    loadingTitle: (leagueLabel) => `Cargando ${leagueLabel}`,
    loadingMessage:
      'La tabla y el contexto de la competición se están cargando.',
    errorEyebrow: 'Error',
    errorTitle: (leagueLabel) => `No se pudo cargar ${leagueLabel}`,
    retryLabel: 'Reintentar',
    emptyEyebrow: 'Sin tabla',
    emptyTitle: (leagueLabel) => `No hay clasificación para ${leagueLabel}`,
    emptyMessage:
      'Actualmente no hay datos de clasificación disponibles para esta competición.',
    emptySupport:
      'Football Galaxy mantendrá este espacio listo cuando haya más cobertura.',
    errorSupport:
      'Comprueba la conexión o la API y vuelve a intentarlo.',
    leader: 'Líder',
    bestAttack: 'Mejor ataque',
    bestDefense: 'Mejor defensa',
    bestGoalDifference: 'Mejor diferencia',
    pointsShort: 'pts',
    goalsScored: 'goles marcados',
    goalsConceded: 'goles recibidos',
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
    leagueSwitcherEyebrow: 'Competizione',
    leagueSwitcherTitle: 'Cambia campionato',
    cacheHint: 'I campionati già caricati restano in cache.',
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
      'Football Galaxy manterrà quest’area pronta quando saranno disponibili più dati.',
    errorSupport:
      "Controlla la connessione o l'API e riprova.",
    leader: 'Capolista',
    bestAttack: 'Miglior attacco',
    bestDefense: 'Miglior difesa',
    bestGoalDifference: 'Miglior differenza',
    pointsShort: 'pt',
    goalsScored: 'gol fatti',
    goalsConceded: 'gol subiti',
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
  return LANGUAGE_OPTIONS.find((option) => option.code === language)?.locale ?? 'en-GB'
}
