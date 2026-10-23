import type { Region } from './types'

export const GALAXY_REGIONS: Region[] = [
  {
    id: 'premier-league',
    name: 'Premier League',
    country: { de: 'England', en: 'England' },
    color: '#3d195b',
    entryLore: {
      de: 'Du trittst hinein in den Nebel von Nord-London, wo das Brüllen von 60.000 Kehlen den alten Beton erzittern lässt. Die Premier League ist mehr als ein Wettbewerb – sie ist eine Zermürbungsschlacht über eine ganze Saison, in der Helden stürzen und Außenseiter sich erheben. Jeder Spieltag schreibt die Geschichte neu.',
      en: 'You step into the fog of North London, where the roar of 60,000 voices shakes the old concrete. The Premier League is not just a competition — it is a season-long war of attrition, where heroes fall and underdogs rise. Every matchday rewrites history.',
    },
    completionLore: {
      de: 'Du hast jedes Stadion der englischen Eliteklasse betreten. Die Gesänge hallen noch immer in dir nach. Die Premier League hat Spuren hinterlassen – bei dir und in der ganzen Galaxie.',
      en: 'You have walked every ground in England\'s top flight. The chants still echo in your memory. The Premier League left its mark on you — and on the galaxy.',
    },
    milestones: [
      {
        nodesAtMinLevel: 2,
        minLevel: 1,
        title: { de: 'Erste Schritte in England', en: 'First Steps in England' },
        description: {
          de: 'Du hast deine ersten Knoten in der Premier League freigeschaltet.',
          en: 'You have unlocked your first nodes in the Premier League.',
        },
        bonusLabel: { de: '+10 % XP in der Premier League', en: '+10% XP in Premier League' },
        lore: {
          de: 'Das Drehkreuz klickt. Das Stadionheft knistert. Es riecht nach Rasen und Regen. Willkommen im englischen Fußball.',
          en: 'The turnstile clicks. The match programme crinkles. The smell of grass and rain. Welcome to English football.',
        },
      },
      {
        nodesAtMinLevel: 4,
        minLevel: 2,
        title: { de: 'Kampferprobt', en: 'Battle-Hardened' },
        description: {
          de: 'Vier Knoten auf Stufe 2 oder höher. Du kennst diese Liga.',
          en: 'Four nodes at level 2 or above. You know the league.',
        },
        bonusLabel: {
          de: '+20 % XP in der Premier League, Rivalitäts-Pfade freigeschaltet',
          en: '+20% XP in Premier League, unlock rivalry paths',
        },
        lore: {
          de: 'Man sagt, in der Premier League gebe es keine leichten Spiele. Wer in derselben Woche Abstiegskampf und Titelrennen überstanden hat, glaubt es sofort.',
          en: 'They say the Premier League has no easy games. After surviving relegation scraps and title races in the same week, you believe it.',
        },
      },
      {
        nodesAtMinLevel: 5,
        minLevel: 3,
        title: { de: 'Herr der Liga', en: 'League Master' },
        description: {
          de: 'Alle fünf Knoten auf Maximalstufe. England verneigt sich.',
          en: 'All five nodes at maximum level. England bows.',
        },
        bonusLabel: {
          de: '+30 % XP überall, exklusives Abzeichen „Three Lions“',
          en: '+30% XP everywhere, exclusive "Three Lions" badge',
        },
        lore: {
          de: 'Abpfiff in Wembley. Dein Name ist in jeder Kabine Englands ein Begriff. Die Galaxie hat einen neuen englischen Meister.',
          en: 'The final whistle blows at Wembley. Your name is known across every dressing room in England. The galaxy has a new English champion.',
        },
      },
    ],
    nodes: [
      {
        id: 'pl-top4-race',
        regionId: 'premier-league',
        title: { de: 'Kampf um die Top 4', en: 'Top 4 Race' },
        description: {
          de: 'Punkteverläufe, Tordifferenzen, Formkurven: Studiere alles, was das Rennen um die Champions-League-Plätze entscheidet.',
          en: 'Study the points charts, goal differences, and form runs that define the battle for Champions League football.',
        },
        type: 'challenge',
        maxLevel: 3,
        levelCosts: [100, 250, 500],
        levelRewards: [
          [{ type: 'xp', amount: 50 }],
          [{ type: 'xp', amount: 150 }, { type: 'lore', label: { de: 'Story-Eintrag „Top Four“', en: '"Top Four" lore entry' } }],
          [{ type: 'xp', amount: 300 }, { type: 'badge', label: { de: 'Abzeichen „Champions-League-Träumer“', en: 'Champions League Dreamer badge' } }],
        ],
        position: { col: 0, row: 0 },
      },
      {
        id: 'pl-title-showdown',
        regionId: 'premier-league',
        title: { de: 'Showdown um den Titel', en: 'Title Showdown' },
        description: {
          de: 'Tauche tief ein in die direkten Duelle der Titelanwärter – von gestern und heute.',
          en: 'Dive deep into the head-to-head records of the title contenders — past and present.',
        },
        type: 'rivalry',
        maxLevel: 3,
        levelCosts: [150, 350, 700],
        levelRewards: [
          [{ type: 'xp', amount: 75 }],
          [{ type: 'xp', amount: 200 }, { type: 'lore', label: { de: 'Story-Eintrag „Champions“', en: '"Champions" lore entry' } }],
          [{ type: 'xp', amount: 400 }, { type: 'badge', label: { de: 'Abzeichen „Meister“', en: 'Title Winner badge' } }],
        ],
        position: { col: 2, row: 0 },
      },
      {
        id: 'pl-golden-boot',
        regionId: 'premier-league',
        title: { de: 'Jagd auf den Golden Boot', en: 'Golden Boot Hunt' },
        description: {
          de: 'Analysiere das Rennen um die Torjägerkrone – Spiel für Spiel, Spieler für Spieler.',
          en: 'Analyse the top scorers race match by match and player by player.',
        },
        type: 'legend',
        maxLevel: 3,
        levelCosts: [120, 300, 600],
        levelRewards: [
          [{ type: 'xp', amount: 60 }],
          [{ type: 'xp', amount: 180 }],
          [{ type: 'xp', amount: 350 }, { type: 'badge', label: { de: 'Abzeichen „Golden Boot“', en: 'Golden Boot badge' } }],
        ],
        position: { col: 1, row: 1 },
      },
      {
        id: 'pl-relegation-zone',
        regionId: 'premier-league',
        title: { de: 'Abstiegskampf', en: 'Relegation Scrap' },
        description: {
          de: 'Überlebe in der Abstiegszone. Verstehe die Rechnerei, die Moral, den Wahnsinn.',
          en: 'Survive the bottom three. Understand the math, the morale, the madness.',
        },
        type: 'challenge',
        maxLevel: 3,
        levelCosts: [80, 200, 450],
        levelRewards: [
          [{ type: 'xp', amount: 40 }],
          [{ type: 'xp', amount: 120 }, { type: 'lore', label: { de: 'Story-Eintrag „Fallschirm“', en: '"Parachute" lore entry' } }],
          [{ type: 'xp', amount: 280 }, { type: 'badge', label: { de: 'Abzeichen „Überlebenskünstler“', en: 'Survivor badge' } }],
        ],
        position: { col: 0, row: 2 },
      },
      {
        id: 'pl-classic-rivalries',
        regionId: 'premier-league',
        title: { de: 'Klassische Rivalitäten', en: 'Classic Rivalries' },
        description: {
          de: 'Das Nordwest-Derby, das Nord-London-Derby, das Manchester-Derby. Finde heraus, was sie zur Legende macht.',
          en: 'The north-west derby, the north London derby, the Manchester clash. Study what makes them legendary.',
        },
        type: 'rivalry',
        maxLevel: 3,
        levelCosts: [200, 500, 1000],
        levelRewards: [
          [{ type: 'xp', amount: 100 }],
          [{ type: 'xp', amount: 300 }, { type: 'lore', label: { de: 'Story-Eintrag „Derbytag“', en: '"Derby Day" lore entry' } }],
          [{ type: 'xp', amount: 600 }, { type: 'badge', label: { de: 'Abzeichen „Derbykönig“', en: 'Derby King badge' } }],
        ],
        position: { col: 2, row: 2 },
      },
    ],
  },

  {
    id: 'la-liga',
    name: 'La Liga',
    country: { de: 'Spanien', en: 'Spain' },
    color: '#003f8f',
    entryLore: {
      de: 'Die Sonne brennt auf das Bernabéu und das Camp Nou. Zwei Giganten werfen seit Jahrzehnten ihre Schatten über den spanischen Fußball – doch neue Stimmen werden laut. Girona, Athletic, die baskischen Heißsporne. La Liga ist nicht nur El Clásico. La Liga ist eine ganze Fußballzivilisation.',
      en: 'The sun beats down on the Bernabéu and Camp Nou. Two giants have cast shadows over Spanish football for decades — but new voices are rising. Girona, Athletic, the Basque firebrands. La Liga is not just El Clásico. It is an entire civilisation of football.',
    },
    completionLore: {
      de: 'Spaniens Beste können dir nichts mehr beibringen. Du hast jede Tiki-Taka-Bewegung seziert, jedes Gegenpressing, jeden genialen Hackentrick im Strafraum. Die Galaxie ist dadurch reicher geworden.',
      en: 'Spain\'s finest have nothing left to teach you. You have dissected every tiki-taka movement, every counter-press, every genius flick in the penalty area. The galaxy is richer for it.',
    },
    milestones: [
      {
        nodesAtMinLevel: 2,
        minLevel: 1,
        title: { de: 'Bienvenido a España', en: 'Bienvenido a España' },
        description: {
          de: 'Zwei Knoten in La Liga freigeschaltet.',
          en: 'Two nodes unlocked in La Liga.',
        },
        bonusLabel: { de: '+10 % XP in La Liga', en: '+10% XP in La Liga' },
        lore: {
          de: 'Mosaikfliesen. Weiße Trikots. Das Klacken eines Rondos unter wolkenlosem Himmel.',
          en: 'Mosaic tiles. White shirts. The click of a rondo passing drill under a cloudless sky.',
        },
      },
      {
        nodesAtMinLevel: 4,
        minLevel: 2,
        title: { de: 'El Estilo', en: 'El Estilo' },
        description: {
          de: 'Vier Knoten auf Stufe 2 oder höher.',
          en: 'Four nodes at level 2+.',
        },
        bonusLabel: {
          de: '+20 % XP in La Liga, Clásico-Pfade freigeschaltet',
          en: '+20% XP in La Liga, unlock Clásico paths',
        },
      },
      {
        nodesAtMinLevel: 5,
        minLevel: 3,
        title: { de: 'El Maestro', en: 'El Maestro' },
        description: {
          de: 'Alle Knoten auf Maximalstufe. Der klügste Fußballkopf der Galaxie.',
          en: 'All nodes maxed. The galaxy\'s finest football mind.',
        },
        bonusLabel: {
          de: '+30 % XP überall, Titel-Abzeichen „Maestro“',
          en: '+30% XP everywhere, "Maestro" title badge',
        },
        lore: {
          de: 'Über das spanische Spiel schreibt man Sonette. Jetzt fällt dein Name in einem Atemzug mit den ganz Großen.',
          en: 'They write sonnets about the Spanish game. Now your name belongs in the same breath as the giants.',
        },
      },
    ],
    nodes: [
      {
        id: 'll-clasico',
        regionId: 'la-liga',
        title: { de: 'El Clásico', en: 'El Clásico' },
        description: {
          de: 'Das meistgesehene Vereinsspiel der Welt. Studiere seine Geschichte, sein Drama, seine prägenden Momente.',
          en: 'The most-watched club match on earth. Study its history, its drama, its defining moments.',
        },
        type: 'rivalry',
        maxLevel: 3,
        levelCosts: [200, 500, 1000],
        levelRewards: [
          [{ type: 'xp', amount: 100 }],
          [{ type: 'xp', amount: 300 }],
          [{ type: 'xp', amount: 600 }, { type: 'badge', label: { de: 'Abzeichen „Clásico-Veteran“', en: 'Clásico Veteran badge' } }],
        ],
        position: { col: 1, row: 0 },
      },
      {
        id: 'll-tiki-taka',
        regionId: 'la-liga',
        title: { de: 'Die Tiki-Taka-Ära', en: 'Tiki-Taka Era' },
        description: {
          de: 'Ballbesitz, Pressing, Positionsspiel. Die taktische Revolution, die den Weltfußball verändert hat.',
          en: 'Possession, pressing, positional play. The tactical revolution that changed the world.',
        },
        type: 'legend',
        maxLevel: 3,
        levelCosts: [150, 350, 700],
        levelRewards: [
          [{ type: 'xp', amount: 75 }],
          [{ type: 'xp', amount: 200 }, { type: 'lore', label: { de: 'Story-Eintrag „Ballbesitz“', en: '"Possession" lore entry' } }],
          [{ type: 'xp', amount: 400 }, { type: 'badge', label: { de: 'Abzeichen „Positionsspiel“', en: 'Positional Play badge' } }],
        ],
        position: { col: 0, row: 1 },
      },
      {
        id: 'll-golden-generation',
        regionId: 'la-liga',
        title: { de: 'Goldene Generation', en: 'Golden Generation' },
        description: {
          de: 'Folge den Galácticos, den Eigengewächsen und den Stars aus dem Ausland, die eine Ära geprägt haben.',
          en: 'Track the galácticos, the youth products, and the imports that defined an era.',
        },
        type: 'legend',
        maxLevel: 3,
        levelCosts: [120, 300, 600],
        levelRewards: [
          [{ type: 'xp', amount: 60 }],
          [{ type: 'xp', amount: 180 }],
          [{ type: 'xp', amount: 350 }, { type: 'badge', label: { de: 'Abzeichen „Galáctico“', en: 'Galáctico badge' } }],
        ],
        position: { col: 2, row: 1 },
      },
      {
        id: 'll-atletico-wall',
        regionId: 'la-liga',
        title: { de: 'Die Abwehrmauer', en: 'The Defensive Wall' },
        description: {
          de: 'Atléticos Meisterschaft aus Abwehrblock und Konter. Der dritte Riese, der einfach nicht fallen will.',
          en: 'Atlético\'s block-and-counter mastery. The third giant that refuses to fall.',
        },
        type: 'challenge',
        maxLevel: 3,
        levelCosts: [100, 250, 500],
        levelRewards: [
          [{ type: 'xp', amount: 50 }],
          [{ type: 'xp', amount: 150 }],
          [{ type: 'xp', amount: 300 }, { type: 'badge', label: { de: 'Abzeichen „Die Mauer“', en: 'The Wall badge' } }],
        ],
        position: { col: 0, row: 2 },
      },
      {
        id: 'll-basque-pride',
        regionId: 'la-liga',
        title: { de: 'Baskischer Stolz', en: 'Basque Pride' },
        description: {
          de: 'Athletic Bilbao und die Philosophie der Cantera. Nur Spieler aus der Region, totale Identität.',
          en: 'Athletic Bilbao and their cantera philosophy. Only local players, total identity.',
        },
        type: 'team',
        maxLevel: 3,
        levelCosts: [130, 320, 650],
        levelRewards: [
          [{ type: 'xp', amount: 65 }],
          [{ type: 'xp', amount: 190 }, { type: 'lore', label: { de: 'Story-Eintrag „Cantera“', en: '"Cantera" lore entry' } }],
          [{ type: 'xp', amount: 380 }, { type: 'badge', label: { de: 'Abzeichen „Euskadi“', en: 'Euskadi badge' } }],
        ],
        position: { col: 2, row: 2 },
      },
    ],
  },

  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: { de: 'Deutschland', en: 'Germany' },
    color: '#d3010c',
    entryLore: {
      de: 'Die Bundesliga pulsiert vor Gegenpressing-Energie. Das ist die Liga der Stehplätze, der Kurven, die aus voller Kehle singen, und der Vereine, die ihren Mitgliedern gehören. Der Fußball hier ist schnell, körperlich und spektakulär direkt.',
      en: 'The Bundesliga pulses with Gegenpressing energy. This is the league of standing sections, full-throated support, and clubs owned by their fans. The football here is fast, physical, and spectacularly direct.',
    },
    completionLore: {
      de: 'Du hast dir den Respekt jeder Kurve in Deutschland verdient. Die Choreo, die man dir zu Ehren entrollt, reicht von der Bayern-Kurve bis zur Gelben Wand in Dortmund.',
      en: 'You have earned the respect of every Kurve in Germany. The tifo that unfurls in your honour stretches from the Bayern block to the Yellow Wall of Dortmund.',
    },
    milestones: [
      {
        nodesAtMinLevel: 2,
        minLevel: 1,
        title: { de: 'Willkommen im Fußball', en: 'Willkommen im Fußball' },
        description: {
          de: 'Zwei Knoten in der Bundesliga freigeschaltet.',
          en: 'Two nodes unlocked in the Bundesliga.',
        },
        bonusLabel: { de: '+10 % XP in der Bundesliga', en: '+10% XP in Bundesliga' },
        lore: {
          de: 'Stehplätze, Bier im Stadion und Gegenpressing-Training um acht Uhr morgens. In Deutschland tickt der Fußball anders.',
          en: 'Standing sections, beer in the stadium, and a Gegenpressing drill at 8 AM. Germany does football differently.',
        },
      },
      {
        nodesAtMinLevel: 4,
        minLevel: 2,
        title: { de: 'Der Pressing-Meister', en: 'Das Pressing-Meister' },
        description: {
          de: 'Vier Knoten auf Stufe 2 oder höher.',
          en: 'Four nodes at level 2+.',
        },
        bonusLabel: {
          de: '+20 % XP in der Bundesliga, Pfade zur Gelben Wand freigeschaltet',
          en: '+20% XP in Bundesliga, unlock Yellow Wall paths',
        },
      },
      {
        nodesAtMinLevel: 5,
        minLevel: 3,
        title: { de: 'Rekordmeister', en: 'Rekordmeister' },
        description: {
          de: 'Alle Knoten der Bundesliga auf Maximalstufe.',
          en: 'All nodes maxed in the Bundesliga.',
        },
        bonusLabel: {
          de: '+30 % XP überall, Abzeichen „Rekordmeister“',
          en: '+30% XP everywhere, "Rekordmeister" badge',
        },
        lore: {
          de: 'Die Meisterschale gehört dir – nicht auf dem Rasen, sondern im Kopf. Deutschlands Fußballerbe fließt durch deine Adern.',
          en: 'The Meisterschale is yours — not on the pitch, but in the mind. Germany\'s football heritage runs through your veins.',
        },
      },
    ],
    nodes: [
      {
        id: 'bl-yellow-wall',
        regionId: 'bundesliga',
        title: { de: 'Die Gelbe Wand', en: 'The Yellow Wall' },
        description: {
          de: 'Die Südtribüne im Signal Iduna Park – 25.000 Stehplätze, die größte Stehtribüne Europas.',
          en: 'Signal Iduna Park\'s Südtribüne — 25,000 standing supporters, the largest terrace in Europe.',
        },
        type: 'legend',
        maxLevel: 3,
        levelCosts: [120, 300, 600],
        levelRewards: [
          [{ type: 'xp', amount: 60 }],
          [{ type: 'xp', amount: 180 }, { type: 'lore', label: { de: 'Story-Eintrag „Gelbe Wand“', en: '"Yellow Wall" lore entry' } }],
          [{ type: 'xp', amount: 360 }, { type: 'badge', label: { de: 'Abzeichen „Südtribüne“', en: 'Südtribüne badge' } }],
        ],
        position: { col: 0, row: 0 },
      },
      {
        id: 'bl-gegenpressing',
        regionId: 'bundesliga',
        title: { de: 'Die Gegenpressing-Bibel', en: 'Gegenpressing Bible' },
        description: {
          de: 'Von Klopps Dortmund bis zu Tuchels Bayern – das hochintensive Pressing, das die Landkarte des Weltfußballs neu gezeichnet hat.',
          en: 'From Klopp\'s Dortmund to Tuchel\'s Bayern — the high-intensity press that remapped world football.',
        },
        type: 'challenge',
        maxLevel: 3,
        levelCosts: [150, 380, 750],
        levelRewards: [
          [{ type: 'xp', amount: 75 }],
          [{ type: 'xp', amount: 225 }],
          [{ type: 'xp', amount: 450 }, { type: 'badge', label: { de: 'Abzeichen „Gegenpressing“', en: 'Gegenpressing badge' } }],
        ],
        position: { col: 2, row: 0 },
      },
      {
        id: 'bl-50plus1',
        regionId: 'bundesliga',
        title: { de: 'Die 50+1-Regel', en: '50+1 Rule' },
        description: {
          de: 'In deutschen Vereinen haben die Mitglieder das Sagen. Verstehe, was das für die Seele des Spiels bedeutet.',
          en: 'German clubs are majority-owned by their fans. Understand what this means for the soul of the game.',
        },
        type: 'team',
        maxLevel: 3,
        levelCosts: [100, 250, 500],
        levelRewards: [
          [{ type: 'xp', amount: 50 }],
          [{ type: 'xp', amount: 150 }, { type: 'lore', label: { de: 'Story-Eintrag „Mitgliederverein“', en: '"Fan Ownership" lore entry' } }],
          [{ type: 'xp', amount: 300 }, { type: 'badge', label: { de: 'Abzeichen „Die Fans“', en: 'Die Fans badge' } }],
        ],
        position: { col: 1, row: 1 },
      },
      {
        id: 'bl-wolf-pack',
        regionId: 'bundesliga',
        title: { de: 'Die Underdogs', en: 'The Underdogs' },
        description: {
          de: 'Freiburg, Union Berlin, Heidenheim – Klubs mit kleinem Budget, die weit über ihre Verhältnisse spielen.',
          en: 'Freiburg, Union Berlin, Heidenheim — clubs with tiny budgets punching above their weight.',
        },
        type: 'challenge',
        maxLevel: 3,
        levelCosts: [90, 230, 460],
        levelRewards: [
          [{ type: 'xp', amount: 45 }],
          [{ type: 'xp', amount: 135 }],
          [{ type: 'xp', amount: 270 }, { type: 'badge', label: { de: 'Abzeichen „Underdog“', en: 'Underdog badge' } }],
        ],
        position: { col: 0, row: 2 },
      },
      {
        id: 'bl-record-chaser',
        regionId: 'bundesliga',
        title: { de: 'Bayerns Vorherrschaft', en: 'Bayern Supremacy' },
        description: {
          de: 'Zehn Meisterschaften in Folge. Verstehe die Maschine, ihren Glanz und die Teams, die sie stoppen wollen.',
          en: 'Ten consecutive league titles. Understand the machine, its glory, and the teams that try to stop it.',
        },
        type: 'trophy',
        maxLevel: 3,
        levelCosts: [200, 500, 1000],
        levelRewards: [
          [{ type: 'xp', amount: 100 }],
          [{ type: 'xp', amount: 300 }],
          [{ type: 'xp', amount: 600 }, { type: 'badge', label: { de: 'Abzeichen „Meisterschale“', en: 'Meisterschale badge' } }],
        ],
        position: { col: 2, row: 2 },
      },
    ],
  },

  {
    id: 'serie-a',
    name: 'Serie A',
    country: { de: 'Italien', en: 'Italy' },
    color: '#009246',
    entryLore: {
      de: 'Calcio ist mehr als Fußball. Calcio ist Theater, Philosophie und Leidenschaft – verpackt in ein blaues Trikot und beim Espresso leidenschaftlich diskutiert. Die Serie A hat der Welt den Catenaccio geschenkt, die Mezzala und den Fußball als Kunstform.',
      en: 'Calcio is more than football. It is theatre, philosophy, and passion wrapped in a blue shirt and argued about over espresso. Serie A gave the world catenaccio, Mezzala, and football as art form.',
    },
    completionLore: {
      de: 'Du beherrschst die taktische Sprache des Calcio. Inter, Juventus, Napoli – jeder Klub hat dein Spielverständnis geprägt. Die Galaxie spricht jetzt Italienisch.',
      en: 'You have mastered the tactical language of Calcio. Inter, Juventus, Napoli — each left their mark on your understanding. The galaxy speaks Italian now.',
    },
    milestones: [
      {
        nodesAtMinLevel: 2,
        minLevel: 1,
        title: { de: 'Benvenuti nel Calcio', en: 'Benvenuti nel Calcio' },
        description: {
          de: 'Zwei Knoten in der Serie A freigeschaltet.',
          en: 'Two nodes unlocked in Serie A.',
        },
        bonusLabel: { de: '+10 % XP in der Serie A', en: '+10% XP in Serie A' },
        lore: {
          de: 'Die Curva explodiert. Der Schiedsrichter winkt die Proteste ab. Ein wunderschönes, chaotisches Theater beginnt.',
          en: 'The Curva erupts. The referee waves away the protests. A beautiful, chaotic theatre begins.',
        },
      },
      {
        nodesAtMinLevel: 4,
        minLevel: 2,
        title: { de: 'Il Professore', en: 'Il Professore' },
        description: {
          de: 'Vier Knoten auf Stufe 2 oder höher.',
          en: 'Four nodes at level 2+.',
        },
        bonusLabel: {
          de: '+20 % XP in der Serie A, taktische Tiefenanalysen freigeschaltet',
          en: '+20% XP in Serie A, unlock tactical deep-dives',
        },
      },
      {
        nodesAtMinLevel: 5,
        minLevel: 3,
        title: { de: 'Campione d\'Italia', en: 'Campione d\'Italia' },
        description: {
          de: 'Alle Knoten auf Maximalstufe.',
          en: 'All nodes maxed.',
        },
        bonusLabel: {
          de: '+30 % XP überall, Abzeichen „Scudetto“',
          en: '+30% XP everywhere, "Scudetto" badge',
        },
        lore: {
          de: 'Das goldene Scudetto-Wappen ist auf dein Trikot genäht. Campione d\'Italia.',
          en: 'The gold scudetto patch is sewn onto your shirt. Campione d\'Italia.',
        },
      },
    ],
    nodes: [
      {
        id: 'sa-catenaccio',
        regionId: 'serie-a',
        title: { de: 'Das Erbe des Catenaccio', en: 'Catenaccio Legacy' },
        description: {
          de: 'Das italienische Abwehrsystem, das den Weltfußball geprägt hat. Seine Entwicklung vom Riegel zur Philosophie.',
          en: 'The Italian defensive system that shaped world football. Its evolution from a chain to a philosophy.',
        },
        type: 'legend',
        maxLevel: 3,
        levelCosts: [120, 300, 600],
        levelRewards: [
          [{ type: 'xp', amount: 60 }],
          [{ type: 'xp', amount: 180 }, { type: 'lore', label: { de: 'Story-Eintrag „Der Riegel“', en: '"The Chain" lore entry' } }],
          [{ type: 'xp', amount: 360 }, { type: 'badge', label: { de: 'Abzeichen „Catenaccio“', en: 'Catenaccio badge' } }],
        ],
        position: { col: 0, row: 0 },
      },
      {
        id: 'sa-scudetto-race',
        regionId: 'serie-a',
        title: { de: 'Das Rennen um den Scudetto', en: 'Scudetto Race' },
        description: {
          de: 'Verfolge den italienischen Titelkampf – Inter, Juventus, Milan, Napoli – das ewige Karussell.',
          en: 'Follow the Italian title race — Inter, Juventus, Milan, Napoli — the eternal carousel.',
        },
        type: 'challenge',
        maxLevel: 3,
        levelCosts: [150, 375, 750],
        levelRewards: [
          [{ type: 'xp', amount: 75 }],
          [{ type: 'xp', amount: 225 }],
          [{ type: 'xp', amount: 450 }, { type: 'badge', label: { de: 'Abzeichen „Scudetto-Jäger“', en: 'Scudetto Tracker badge' } }],
        ],
        position: { col: 2, row: 0 },
      },
      {
        id: 'sa-derby-della-madonnina',
        regionId: 'serie-a',
        title: { de: 'Derby della Madonnina', en: 'Derby della Madonnina' },
        description: {
          de: 'Inter gegen den AC Milan. Eine Stadt, geteilt durch die Farbe eines Trikots.',
          en: 'Inter vs AC Milan. The city of Milan divided by the colour of a shirt.',
        },
        type: 'rivalry',
        maxLevel: 3,
        levelCosts: [180, 450, 900],
        levelRewards: [
          [{ type: 'xp', amount: 90 }],
          [{ type: 'xp', amount: 270 }, { type: 'lore', label: { de: 'Story-Eintrag „Madonnina“', en: '"Madonnina" lore entry' } }],
          [{ type: 'xp', amount: 540 }, { type: 'badge', label: { de: 'Abzeichen „Derby“', en: 'Derby badge' } }],
        ],
        position: { col: 1, row: 1 },
      },
      {
        id: 'sa-napoli-dream',
        regionId: 'serie-a',
        title: { de: 'Napolis Traum', en: 'Napoli\'s Dream' },
        description: {
          de: 'Der Süden erhebt sich. Napolis Scudetto nach 33 Jahren des Wartens – eine ganze Stadt in Tränen.',
          en: 'The south rises. Napoli\'s scudetto after 33 years of waiting — the whole city in tears.',
        },
        type: 'trophy',
        maxLevel: 3,
        levelCosts: [130, 320, 640],
        levelRewards: [
          [{ type: 'xp', amount: 65 }],
          [{ type: 'xp', amount: 195 }, { type: 'lore', label: { de: 'Story-Eintrag „Der Traum der Partenopei“', en: '"Partenopei Dream" lore entry' } }],
          [{ type: 'xp', amount: 390 }, { type: 'badge', label: { de: 'Abzeichen „Napoli 33“', en: 'Napoli 33 badge' } }],
        ],
        position: { col: 0, row: 2 },
      },
      {
        id: 'sa-atalanta-rise',
        regionId: 'serie-a',
        title: { de: 'Atalantas Aufstieg', en: 'Atalanta\'s Rise' },
        description: {
          de: 'Vom grauen Mittelfeld der Tabelle zu großen Champions-League-Nächten. Die Revolution des Gian Piero Gasperini.',
          en: 'From mid-table obscurity to Champions League nights. The Gasperini revolution.',
        },
        type: 'team',
        maxLevel: 3,
        levelCosts: [100, 250, 500],
        levelRewards: [
          [{ type: 'xp', amount: 50 }],
          [{ type: 'xp', amount: 150 }],
          [{ type: 'xp', amount: 300 }, { type: 'badge', label: { de: 'Abzeichen „La Dea“', en: 'La Dea badge' } }],
        ],
        position: { col: 2, row: 2 },
      },
    ],
  },

  {
    id: 'ligue-1',
    name: 'Ligue 1',
    country: { de: 'Frankreich', en: 'France' },
    color: '#091c3e',
    entryLore: {
      de: 'Paris ist eine Galaxie für sich. Doch jenseits der Hauptstadt brennt Marseille mit der weißglühenden Leidenschaft des Vélodrome, Monaco glitzert, und Lyon formt in aller Stille die nächste Generation französischer Talente. Die Ligue 1 wird unterschätzt – immer.',
      en: 'Paris is a galaxy unto itself. But beyond the capital, Marseille burns with the white-hot passion of the Vélodrome, Monaco glitters, and Lyon quietly builds the next generation of French talent. Ligue 1 is underestimated — always.',
    },
    completionLore: {
      de: 'Liberté, Égalité, Ballon. Frankreichs Fußballkultur gehört jetzt dir. Von den Akademien in Clairefontaine bis zum Parc des Princes – du hast alles gesehen.',
      en: 'Liberté, Égalité, Ballon. France\'s football culture is yours now. From the academies of Clairefontaine to the Parc des Princes, you have seen it all.',
    },
    milestones: [
      {
        nodesAtMinLevel: 2,
        minLevel: 1,
        title: { de: 'Bienvenue en France', en: 'Bienvenue en France' },
        description: {
          de: 'Zwei Knoten in der Ligue 1 freigeschaltet.',
          en: 'Two nodes unlocked in Ligue 1.',
        },
        bonusLabel: { de: '+10 % XP in der Ligue 1', en: '+10% XP in Ligue 1' },
        lore: {
          de: 'Das Baguette ist optional. Die Leidenschaft für Fußball nicht. Die Ligue 1 heißt dich willkommen.',
          en: 'The baguette is optional. The football passion is not. Ligue 1 welcomes you.',
        },
      },
      {
        nodesAtMinLevel: 4,
        minLevel: 2,
        title: { de: 'Le Créatif', en: 'Le Créatif' },
        description: {
          de: 'Vier Knoten auf Stufe 2 oder höher.',
          en: 'Four nodes at level 2+.',
        },
        bonusLabel: {
          de: '+20 % XP in der Ligue 1, Pariser Rivalitäts-Pfade freigeschaltet',
          en: '+20% XP in Ligue 1, unlock Paris rivalry paths',
        },
      },
      {
        nodesAtMinLevel: 5,
        minLevel: 3,
        title: { de: 'Champion de France', en: 'Champion de France' },
        description: {
          de: 'Alle Knoten auf Maximalstufe.',
          en: 'All nodes maxed.',
        },
        bonusLabel: {
          de: '+30 % XP überall, Abzeichen „Tricolore“',
          en: '+30% XP everywhere, "Tricolore" badge',
        },
        lore: {
          de: 'Die Trikolore weht aus jedem Fenster. Frankreich hat seinen Meister gefunden.',
          en: 'The tricolore waves from every window. France has found its champion.',
        },
      },
    ],
    nodes: [
      {
        id: 'l1-psg-empire',
        regionId: 'ligue-1',
        title: { de: 'Das PSG-Imperium', en: 'PSG Empire' },
        description: {
          de: 'Katarisches Geld, Weltklasse-Transfers und die Jagd auf die Champions League. Das Projekt, das den französischen Fußball umgekrempelt hat.',
          en: 'Qatar money, world-class signings, and the pursuit of the Champions League. The project that rewrote French football.',
        },
        type: 'team',
        maxLevel: 3,
        levelCosts: [180, 450, 900],
        levelRewards: [
          [{ type: 'xp', amount: 90 }],
          [{ type: 'xp', amount: 270 }],
          [{ type: 'xp', amount: 540 }, { type: 'badge', label: { de: 'Abzeichen „Ici c\'est Paris“', en: 'Ici c\'est Paris badge' } }],
        ],
        position: { col: 1, row: 0 },
      },
      {
        id: 'l1-marseille-passion',
        regionId: 'ligue-1',
        title: { de: 'Leidenschaft Marseille', en: 'Marseille Passion' },
        description: {
          de: 'Das Vélodrome in voller Lautstärke. OM gegen PSG – das Spiel, bei dem Frankreich stillsteht.',
          en: 'The Vélodrome at full roar. OM vs PSG — the match that stops France.',
        },
        type: 'rivalry',
        maxLevel: 3,
        levelCosts: [150, 375, 750],
        levelRewards: [
          [{ type: 'xp', amount: 75 }],
          [{ type: 'xp', amount: 225 }, { type: 'lore', label: { de: 'Story-Eintrag „Le Classique“', en: '"Le Classique" lore entry' } }],
          [{ type: 'xp', amount: 450 }, { type: 'badge', label: { de: 'Abzeichen „Le Classique“', en: 'Le Classique badge' } }],
        ],
        position: { col: 0, row: 1 },
      },
      {
        id: 'l1-academies',
        regionId: 'ligue-1',
        title: { de: 'Frankreichs Akademien', en: 'French Academies' },
        description: {
          de: 'Clairefontaine und die Talentschmiede des INF. Kein Land der Welt bringt mehr Fußballprofis hervor als Frankreich.',
          en: 'Clairefontaine and the INF pipeline. France produces more professional footballers than any country on earth.',
        },
        type: 'legend',
        maxLevel: 3,
        levelCosts: [120, 300, 600],
        levelRewards: [
          [{ type: 'xp', amount: 60 }],
          [{ type: 'xp', amount: 180 }, { type: 'lore', label: { de: 'Story-Eintrag „Clairefontaine“', en: '"Clairefontaine" lore entry' } }],
          [{ type: 'xp', amount: 360 }, { type: 'badge', label: { de: 'Abzeichen „Akademie-Meister“', en: 'Academy Master badge' } }],
        ],
        position: { col: 2, row: 1 },
      },
      {
        id: 'l1-monaco-glamour',
        regionId: 'ligue-1',
        title: { de: 'Glamour in Monaco', en: 'Monaco Glamour' },
        description: {
          de: 'Fürsten, Jachten und unmögliche Champions-League-Nächte. Der romantischste Klub im europäischen Fußball?',
          en: 'Princes, yachts, and impossible Champions League nights. The most romantic club in European football?',
        },
        type: 'team',
        maxLevel: 3,
        levelCosts: [130, 325, 650],
        levelRewards: [
          [{ type: 'xp', amount: 65 }],
          [{ type: 'xp', amount: 195 }],
          [{ type: 'xp', amount: 390 }, { type: 'badge', label: { de: 'Abzeichen „Fürstentum“', en: 'Principality badge' } }],
        ],
        position: { col: 0, row: 2 },
      },
      {
        id: 'l1-next-gen',
        regionId: 'ligue-1',
        title: { de: 'Die nächste Generation', en: 'Next Generation' },
        description: {
          de: 'Mbappé kam von hier. Benzemas Wurzeln liegen hier. Wer ist der Nächste, der aus französischem Boden hervorgeht?',
          en: 'Mbappé came from here. Benzema\'s roots are here. Who is next to emerge from French soil?',
        },
        type: 'challenge',
        maxLevel: 3,
        levelCosts: [140, 350, 700],
        levelRewards: [
          [{ type: 'xp', amount: 70 }],
          [{ type: 'xp', amount: 210 }, { type: 'lore', label: { de: 'Story-Eintrag „Talentfabrik der Bleus“', en: '"Les Bleus Factory" lore entry' } }],
          [{ type: 'xp', amount: 420 }, { type: 'badge', label: { de: 'Abzeichen „Pépite“', en: 'Pépite badge' } }],
        ],
        position: { col: 2, row: 2 },
      },
    ],
  },
]

export function getRegion(id: string): Region | undefined {
  return GALAXY_REGIONS.find((r) => r.id === id)
}

export function getNode(nodeId: string): { region: Region; node: Region['nodes'][0] } | undefined {
  for (const region of GALAXY_REGIONS) {
    const node = region.nodes.find((n) => n.id === nodeId)
    if (node) return { region, node }
  }
  return undefined
}
