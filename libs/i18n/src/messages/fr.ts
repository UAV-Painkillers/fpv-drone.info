import type { Messages } from './en';

export const fr: Messages = {
  meta: {
    siteName: 'fpv-drone.info',
    tagline: 'Outils de réglage pour drones FPV',
    description:
      "Outils de réglage FPV gratuits dans le navigateur : analyseur de blackbox Betaflight, guides de réglage PID et filtres, calculateurs. Pas d'upload, pas de compte — tout s'exécute sur votre appareil.",
  },
  nav: {
    home: 'Accueil',
    tools: 'Outils',
    guides: 'Guides',
    analyzer: 'Analyseur de blackbox',
    idleCalculator: 'Calculateur de Dynamic Idle',
    pidGuide: 'Guide de réglage PID',
    filterGuide: 'Guide de réglage des filtres',
    imprint: 'Mentions légales',
    dataPrivacy: 'Confidentialité',
    discord: 'Discord',
    language: 'Langue',
    toggleTheme: 'Basculer le mode sombre',
    openMenu: 'Ouvrir le menu',
  },
  footer: {
    owner: 'fpv-drone.info est un projet {{link}}',
    openSource: 'Construit sur de l\'open source : PID-Analyzer et blackbox-tools',
  },
  home: {
    title: 'Votre boîte à outils de réglage FPV',
    subtitle:
      'Analysez vos logs blackbox, réglez PID et filtres, et faites voler votre drone comme sur des rails — directement dans le navigateur.',
    analyzerCard: {
      title: 'Analyseur de blackbox',
      body: 'Déposez un log blackbox Betaflight et obtenez des graphiques de step response, de bruit et de délai. 100 % local.',
      cta: 'Analyser un log',
    },
    guidesCard: {
      title: 'Guides de réglage',
      body: 'Réglage PID et filtres pas à pas. Pablo accompagne les débutants à chaque étape ; les pros vont droit aux graphiques.',
      cta: 'Commencer le réglage',
    },
    calculatorCard: {
      title: 'Calculateur de Dynamic Idle',
      body: 'La bonne valeur dyn_idle pour votre hélice en quelques secondes.',
      cta: 'Calculer',
    },
  },
  tools: {
    title: 'Outils',
    subtitle: 'Tout s\'exécute dans votre navigateur — pas d\'upload, pas de compte.',
  },
  guides: {
    title: 'Guides',
    subtitle: 'Comment voulez-vous régler aujourd\'hui ?',
    noob: {
      title: 'Je débute',
      body: 'Pablo le magicien vous guide pas à pas — aucune connaissance requise.',
      cta: 'Prenez ma main',
    },
    pro: {
      title: 'Je sais ce que je fais',
      body: 'Chichi la scientifique vous donne les graphiques bruts et vous laisse faire.',
      cta: "Vers l'analyseur",
    },
    steps: 'Étapes',
    stepOf: 'Étape {{current}} sur {{total}}',
    previous: 'Précédent',
    next: 'Suivant',
    finish: 'Terminer',
    prerequisites: 'Prérequis',
    startGuide: 'Commencer le guide',
    backToOverview: "Retour à l'aperçu",
  },
  analyzer: {
    title: 'Analyseur de blackbox',
    description:
      'Analysez les logs blackbox Betaflight directement dans votre navigateur : step response, cartes de bruit, response delay et plus.',
    openFileButton: {
      label: 'Cliquez pour ouvrir un fichier blackbox (.bbl) ou glissez-le ici',
      ariaLabel: 'Ouvrir un fichier blackbox à analyser',
    },
    addFileToCurrentAnalysis: "Ajouter à l'analyse en cours",
    replaceCurrentAnalysis: "Remplacer l'analyse en cours",
    loading: "Chargement de l'analyseur…",
    error: {
      logAnalyzation: "Impossible d'analyser le fichier de log…",
      outOfMemory: 'Mémoire insuffisante. Votre log est probablement trop volumineux…',
      noLogs: "Impossible de lire un log dans ce fichier.",
    },
    subLogError: 'Vol {{index}} : {{error}}',
    progress: {
      runningAnalysis: 'Analyse en cours',
      splittingLog: 'Découpage du log en vols',
      analyzingSubLog: 'Analyse du vol #{{flightIndex}}',
      readingHeaders: 'Lecture des en-têtes',
      decoding: 'Décodage',
      readingDecodedLog: 'Lecture du log décodé',
      exportingHeaders: 'Export des en-têtes',
      analyzingAxis: 'Analyse de {{axis}}',
    },
    plotNavigation: {
      combinedLogs: 'Logs combinés ({{count}} / {{total}})',
      activeFlightLog: 'Log de vol actif #{{index}}',
      axis: { roll: 'Roll', pitch: 'Pitch', yaw: 'Yaw' },
    },
    downloadGate: {
      message:
        "Pour utiliser l'analyseur, votre navigateur télécharge une fois le moteur d'analyse (environ {{downloadSizeMB}} Mo). Forfait data limité ? Mieux vaut le savoir avant de cliquer.",
      acceptButton: "J'ai compris, télécharger {{downloadSizeMB}} Mo",
    },
  },
  idleCalculator: {
    title: 'Calculateur de Dynamic Idle',
    description:
      "Calculez la valeur dyn_idle recommandée de Betaflight à partir du diamètre de votre hélice.",
    propSizeLabel: "Diamètre de l'hélice (pouces)",
    resultLabel: 'Dynamic idle résultant',
    hint: 'Renseignez cette valeur comme « Dynamic idle value » dans l\'onglet PID tuning de Betaflight.',
  },
  donate: {
    button: 'Offrez-moi un raton laveur',
    cta: {
      title: 'Ces outils carburent aux snacks de raton laveur',
      body: "fpv-drone.info est gratuit, sans pub et sans tracking lucratif. Si ça a sauvé votre réglage (ou vos nerfs), lancez une pièce à votre raton laveur.",
      button: 'Offrez-moi un raton laveur 🦝',
    },
    afterAnalysis: {
      title: 'Analyse terminée — ça vaut bien un snack ?',
      body: 'Si les graphiques vous ont aidé, un petit don garde les serveurs (et les ratons laveurs) nourris.',
    },
  },
  pwa: {
    installButton: "Installer l'app",
    installBanner: 'fpv-drone.info fonctionne hors ligne comme une app',
    updateAvailable: 'Nouvelle version disponible — rechargez pour mettre à jour.',
    reload: 'Recharger',
  },
  cache: {
    clearAndReload: 'Vider le cache et recharger',
    offlineReady: 'Disponible hors ligne',
    downloadForOffline: 'Télécharger pour un usage hors ligne',
    downloading: 'Téléchargement… {{percent}} %',
  },
  languageBanner: {
    text: 'Voulez-vous passer la langue en {{language}} ?',
    button: 'Changer de langue',
  },
  notFound: {
    title: "Ce raton laveur n'a rien trouvé ici",
    body: "La page que vous cherchez n'existe pas (ou plus).",
    backHome: "Retour à l'accueil",
  },
};
