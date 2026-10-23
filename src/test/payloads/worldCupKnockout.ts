/**
 * Real football-data.org v4 payloads (World Cup 2026 round of 32), trimmed to
 * the fields the mapper reads. Captured 2026-10-23 through the dev proxy.
 */
export const worldCupKnockoutMatches = {
  "shootout": {
    "id": 537415,
    "utcDate": "2026-06-29T20:30:00Z",
    "status": "FINISHED",
    "stage": "LAST_32",
    "group": null,
    "lastUpdated": "2026-08-02T20:20:11Z",
    "homeTeam": {
      "id": 759,
      "name": "Germany",
      "shortName": "Germany",
      "tla": "GER"
    },
    "awayTeam": {
      "id": 761,
      "name": "Paraguay",
      "shortName": "Paraguay",
      "tla": "PAR"
    },
    "score": {
      "winner": "AWAY_TEAM",
      "duration": "PENALTY_SHOOTOUT",
      "fullTime": {
        "home": 4,
        "away": 5
      },
      "halfTime": {
        "home": 0,
        "away": 1
      },
      "regularTime": {
        "home": 1,
        "away": 1
      },
      "extraTime": {
        "home": 0,
        "away": 0
      },
      "penalties": {
        "home": 3,
        "away": 4
      }
    }
  },
  "extraTime": {
    "id": 537422,
    "utcDate": "2026-07-01T20:00:00Z",
    "status": "FINISHED",
    "stage": "LAST_32",
    "group": null,
    "lastUpdated": "2026-08-02T20:20:11Z",
    "homeTeam": {
      "id": 805,
      "name": "Belgium",
      "shortName": "Belgium",
      "tla": "BEL"
    },
    "awayTeam": {
      "id": 804,
      "name": "Senegal",
      "shortName": "Senegal",
      "tla": "SEN"
    },
    "score": {
      "winner": "HOME_TEAM",
      "duration": "EXTRA_TIME",
      "fullTime": {
        "home": 3,
        "away": 2
      },
      "halfTime": {
        "home": 0,
        "away": 1
      },
      "regularTime": {
        "home": 2,
        "away": 2
      },
      "extraTime": {
        "home": 1,
        "away": 0
      }
    }
  },
  "regular": {
    "id": 537417,
    "utcDate": "2026-06-28T19:00:00Z",
    "status": "FINISHED",
    "stage": "LAST_32",
    "group": null,
    "lastUpdated": "2026-08-02T20:20:11Z",
    "homeTeam": {
      "id": 774,
      "name": "South Africa",
      "shortName": "South Africa",
      "tla": "RSA"
    },
    "awayTeam": {
      "id": 828,
      "name": "Canada",
      "shortName": "Canada",
      "tla": "CAN"
    },
    "score": {
      "winner": "AWAY_TEAM",
      "duration": "REGULAR",
      "fullTime": {
        "home": 0,
        "away": 1
      },
      "halfTime": {
        "home": 0,
        "away": 0
      }
    }
  }
} as const
