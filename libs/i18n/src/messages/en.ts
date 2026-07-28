/**
 * English UI strings — the source of truth. All other locales are typed as
 * `Messages = typeof en`, so a missing or extra key fails the build.
 *
 * Interpolation placeholders use {{name}} and are resolved by format().
 */
export const en = {
  meta: {
    siteName: 'fpv-drone.info',
    tagline: 'FPV drone tuning tools',
    description:
      'Free in-browser FPV drone tuning tools: Betaflight blackbox analyzer, PID & filter tuning guides and calculators. No upload, no account — everything runs on your device.',
  },
  nav: {
    home: 'Home',
    tools: 'Tools',
    guides: 'Guides',
    analyzer: 'Blackbox Analyzer',
    idleCalculator: 'Dynamic Idle Calculator',
    pidGuide: 'PID Tuning Guide',
    filterGuide: 'Filter Tuning Guide',
    imprint: 'Imprint',
    dataPrivacy: 'Data Privacy',
    discord: 'Discord',
    language: 'Language',
    toggleTheme: 'Toggle dark mode',
    openMenu: 'Open menu',
  },
  footer: {
    owner: 'fpv-drone.info is a {{link}} project',
    openSource: 'Built on open source: PID-Analyzer & blackbox-tools',
  },
  home: {
    title: 'Your FPV tuning toolbox',
    subtitle:
      'Analyze blackbox logs, tune PIDs and filters, and get your quad flying like on rails — right here in the browser.',
    analyzerCard: {
      title: 'Blackbox Analyzer',
      body: 'Drop a Betaflight blackbox log and get step response, noise and delay plots. Runs 100% locally.',
      cta: 'Analyze a log',
    },
    guidesCard: {
      title: 'Tuning Guides',
      body: 'Step-by-step PID and filter tuning. Pablo walks beginners through every step; pros go straight to the plots.',
      cta: 'Start tuning',
    },
    calculatorCard: {
      title: 'Dynamic Idle Calculator',
      body: 'Get the right dyn_idle value for your prop size in seconds.',
      cta: 'Calculate',
    },
  },
  tools: {
    title: 'Tools',
    subtitle: 'Everything runs in your browser — no uploads, no accounts.',
  },
  guides: {
    title: 'Guides',
    subtitle: 'How do you want to tune today?',
    noob: {
      title: "I'm new to this",
      body: 'Pablo the magician guides you step by step — no prior knowledge needed.',
      cta: 'Take my hand',
    },
    pro: {
      title: 'I know what I\'m doing',
      body: 'Chichi the scientist hands you the raw plots and gets out of your way.',
      cta: 'To the analyzer',
    },
    steps: 'Steps',
    stepOf: 'Step {{current}} of {{total}}',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
    prerequisites: 'Prerequisites',
    startGuide: 'Start the guide',
    backToOverview: 'Back to overview',
  },
  analyzer: {
    title: 'Blackbox Analyzer',
    description:
      'Analyze Betaflight blackbox logs directly in your browser: step response, noise heatmaps, response delay and more.',
    openFileButton: {
      label: 'Click to open a blackbox file (.bbl) or drag & drop it here',
      ariaLabel: 'Open a blackbox file for analysis',
    },
    addFileToCurrentAnalysis: 'Add to current analysis',
    replaceCurrentAnalysis: 'Replace current analysis',
    loading: 'Loading analyzer…',
    error: {
      logAnalyzation: 'Could not analyze the log file…',
      outOfMemory: 'Out of memory. Your log file is probably too large…',
      noLogs: 'Unable to parse any logs from the file.',
    },
    subLogError: 'Flight {{index}}: {{error}}',
    progress: {
      runningAnalysis: 'Analysis is running',
      splittingLog: 'Splitting log into flights',
      analyzingSubLog: 'Analyzing flight #{{flightIndex}}',
      readingHeaders: 'Reading headers',
      decoding: 'Decoding',
      readingDecodedLog: 'Reading decoded log',
      exportingHeaders: 'Exporting headers',
      analyzingAxis: 'Analyzing {{axis}}',
    },
    plotNavigation: {
      combinedLogs: 'Combined logs ({{count}} / {{total}})',
      activeFlightLog: 'Active flight log #{{index}}',
      axis: { roll: 'Roll', pitch: 'Pitch', yaw: 'Yaw' },
    },
    downloadGate: {
      message:
        'To use the analyzer, your browser downloads the analysis engine (about {{downloadSizeMB}} MB) once. On a limited data plan? Good to know before you tap.',
      acceptButton: 'I understand, download {{downloadSizeMB}} MB',
    },
  },
  idleCalculator: {
    title: 'Dynamic Idle Calculator',
    description:
      'Calculate the recommended Betaflight dyn_idle value from your prop diameter.',
    propSizeLabel: 'Prop diameter (inches)',
    resultLabel: 'Resulting dynamic idle',
    hint: 'Set this as "Dynamic idle value" in the Betaflight PID tuning tab.',
  },
  donate: {
    button: 'Buy me a raccoon',
    cta: {
      title: 'These tools run on raccoon snacks',
      body: 'fpv-drone.info is free, has no ads and no tracking-for-profit. If it saved your tune (or your sanity), consider tossing a coin to your raccoon.',
      button: 'Buy me a raccoon 🦝',
    },
    afterAnalysis: {
      title: 'Analysis done — worth a snack?',
      body: 'If the plots helped, a small donation keeps the servers (and raccoons) fed.',
    },
  },
  pwa: {
    installButton: 'Install app',
    installBanner: 'fpv-drone.info works offline as an app',
    updateAvailable: 'A new version is ready — reload to update.',
    reload: 'Reload',
  },
  cache: {
    clearAndReload: 'Clear cache and reload',
    offlineReady: 'Available offline',
    downloadForOffline: 'Download for offline use',
    downloading: 'Downloading… {{percent}}%',
  },
  languageBanner: {
    text: 'Do you want to switch the language to {{language}}?',
    button: 'Switch language',
  },
  notFound: {
    title: 'This raccoon found nothing here',
    body: 'The page you were looking for does not exist (anymore).',
    backHome: 'Back to start',
  },
};

export type Messages = typeof en;
