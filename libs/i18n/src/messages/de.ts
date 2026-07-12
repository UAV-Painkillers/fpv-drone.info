import type { Messages } from './en';

export const de: Messages = {
  meta: {
    siteName: 'fpv-drone.info',
    tagline: 'FPV-Drohnen-Tuning-Tools',
    description:
      'Kostenlose FPV-Tuning-Tools im Browser: Betaflight-Blackbox-Analyzer, PID- & Filter-Tuning-Guides und Rechner. Kein Upload, kein Account — alles läuft auf deinem Gerät.',
  },
  nav: {
    home: 'Start',
    tools: 'Tools',
    guides: 'Guides',
    analyzer: 'Blackbox-Analyzer',
    idleCalculator: 'Dynamic-Idle-Rechner',
    pidGuide: 'PID-Tuning-Guide',
    filterGuide: 'Filter-Tuning-Guide',
    imprint: 'Impressum',
    dataPrivacy: 'Datenschutz',
    discord: 'Discord',
    language: 'Sprache',
    toggleTheme: 'Dark Mode umschalten',
    openMenu: 'Menü öffnen',
  },
  footer: {
    owner: 'fpv-drone.info ist ein {{link}} Projekt',
    openSource: 'Basiert auf Open Source: PID-Analyzer & blackbox-tools',
  },
  home: {
    title: 'Dein FPV-Tuning-Werkzeugkasten',
    subtitle:
      'Blackbox-Logs analysieren, PIDs und Filter tunen — direkt im Browser, bis dein Copter wie auf Schienen fliegt.',
    analyzerCard: {
      title: 'Blackbox-Analyzer',
      body: 'Zieh ein Betaflight-Blackbox-Log rein und erhalte Step-Response-, Noise- und Delay-Plots. Läuft zu 100 % lokal.',
      cta: 'Log analysieren',
    },
    guidesCard: {
      title: 'Tuning-Guides',
      body: 'PID- und Filter-Tuning Schritt für Schritt. Pablo führt Einsteiger durch jeden Schritt; Profis springen direkt zu den Plots.',
      cta: 'Los geht\'s',
    },
    calculatorCard: {
      title: 'Dynamic-Idle-Rechner',
      body: 'Der richtige dyn_idle-Wert für deine Propellergröße — in Sekunden.',
      cta: 'Berechnen',
    },
  },
  tools: {
    title: 'Tools',
    subtitle: 'Alles läuft in deinem Browser — keine Uploads, keine Accounts.',
  },
  guides: {
    title: 'Guides',
    subtitle: 'Wie möchtest du heute tunen?',
    noob: {
      title: 'Ich bin neu hier',
      body: 'Pablo der Magier führt dich Schritt für Schritt — ganz ohne Vorwissen.',
      cta: 'Nimm meine Hand',
    },
    pro: {
      title: 'Ich weiß, was ich tue',
      body: 'Chichi die Wissenschaftlerin gibt dir die rohen Plots und lässt dich machen.',
      cta: 'Zum Analyzer',
    },
    steps: 'Schritte',
    stepOf: 'Schritt {{current}} von {{total}}',
    previous: 'Zurück',
    next: 'Weiter',
    finish: 'Fertig',
    prerequisites: 'Voraussetzungen',
    startGuide: 'Guide starten',
    backToOverview: 'Zurück zur Übersicht',
  },
  analyzer: {
    title: 'Blackbox-Analyzer',
    description:
      'Analysiere Betaflight-Blackbox-Logs direkt im Browser: Step Response, Noise-Heatmaps, Response Delay und mehr.',
    openFileButton: {
      label: 'Klicke, um eine Blackbox-Datei (.bbl) zu öffnen, oder ziehe sie hierher',
      ariaLabel: 'Blackbox-Datei zur Analyse öffnen',
    },
    addFileToCurrentAnalysis: 'Zur aktuellen Analyse hinzufügen',
    replaceCurrentAnalysis: 'Aktuelle Analyse ersetzen',
    loading: 'Analyzer wird geladen…',
    error: {
      logAnalyzation: 'Log-Datei konnte nicht analysiert werden…',
      outOfMemory: 'Zu wenig Speicher. Dein Log ist vermutlich zu groß…',
      noLogs: 'Aus der Datei konnten keine Logs gelesen werden.',
    },
    subLogError: 'Flug {{index}}: {{error}}',
    progress: {
      runningAnalysis: 'Analyse läuft',
      splittingLog: 'Log wird in Flüge aufgeteilt',
      analyzingSubLog: 'Analysiere Flug #{{flightIndex}}',
      readingHeaders: 'Header werden gelesen',
      decoding: 'Dekodieren',
      readingDecodedLog: 'Dekodiertes Log wird gelesen',
      exportingHeaders: 'Header werden exportiert',
      analyzingAxis: 'Analysiere {{axis}}',
    },
    plotNavigation: {
      combinedLogs: 'Kombinierte Logs ({{count}} / {{total}})',
      activeFlightLog: 'Aktives Flug-Log #{{index}}',
      axis: { roll: 'Roll', pitch: 'Pitch', yaw: 'Yaw' },
    },
    downloadGate: {
      message:
        'Für den Analyzer lädt dein Browser einmalig die Analyse-Engine herunter (ca. {{downloadSizeMB}} MB). Mit begrenztem Datenvolumen gut zu wissen, bevor du tippst.',
      acceptButton: 'Verstanden, {{downloadSizeMB}} MB herunterladen',
    },
  },
  idleCalculator: {
    title: 'Dynamic-Idle-Rechner',
    description:
      'Berechne den empfohlenen Betaflight-dyn_idle-Wert aus deinem Propellerdurchmesser.',
    propSizeLabel: 'Propellerdurchmesser (Zoll)',
    resultLabel: 'Empfohlenes Dynamic Idle',
    hint: 'Trage den Wert als „Dynamic idle value" im Betaflight-PID-Tuning-Tab ein.',
  },
  donate: {
    button: 'Buy me a raccoon',
    cta: {
      title: 'Diese Tools laufen auf Waschbär-Snacks',
      body: 'fpv-drone.info ist kostenlos, werbefrei und ohne Tracking-Geschäftsmodell. Wenn es deinen Tune (oder deine Nerven) gerettet hat: Wirf dem Waschbären eine Münze zu.',
      button: 'Buy me a raccoon 🦝',
    },
    afterAnalysis: {
      title: 'Analyse fertig — einen Snack wert?',
      body: 'Wenn die Plots geholfen haben, hält eine kleine Spende Server (und Waschbären) am Laufen.',
    },
  },
  pwa: {
    installButton: 'App installieren',
    installBanner: 'fpv-drone.info funktioniert offline als App',
    updateAvailable: 'Eine neue Version ist bereit — neu laden zum Aktualisieren.',
    reload: 'Neu laden',
  },
  cache: {
    clearAndReload: 'Cache leeren und neu laden',
    offlineReady: 'Offline verfügbar',
    downloadForOffline: 'Für Offline-Nutzung herunterladen',
    downloading: 'Wird heruntergeladen… {{percent}} %',
  },
  languageBanner: {
    text: 'Möchtest du die Sprache auf {{language}} umstellen?',
    button: 'Sprache wechseln',
  },
  notFound: {
    title: 'Dieser Waschbär hat hier nichts gefunden',
    body: 'Die gesuchte Seite existiert nicht (mehr).',
    backHome: 'Zurück zum Start',
  },
};
