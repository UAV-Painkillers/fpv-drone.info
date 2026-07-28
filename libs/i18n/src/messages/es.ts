import type { Messages } from './en';

export const es: Messages = {
  meta: {
    siteName: 'fpv-drone.info',
    tagline: 'Herramientas de tuning para drones FPV',
    description:
      'Herramientas gratuitas de tuning FPV en el navegador: analizador de blackbox de Betaflight, guías de ajuste de PID y filtros, y calculadoras. Sin subidas, sin cuenta: todo se ejecuta en tu dispositivo.',
  },
  nav: {
    home: 'Inicio',
    tools: 'Herramientas',
    guides: 'Guías',
    analyzer: 'Analizador de Blackbox',
    idleCalculator: 'Calculadora de Dynamic Idle',
    pidGuide: 'Guía de tuning de PID',
    filterGuide: 'Guía de tuning de filtros',
    imprint: 'Aviso legal',
    dataPrivacy: 'Privacidad de datos',
    discord: 'Discord',
    language: 'Idioma',
    toggleTheme: 'Cambiar modo oscuro',
    openMenu: 'Abrir menú',
  },
  footer: {
    owner: 'fpv-drone.info es un proyecto de {{link}}',
    openSource: 'Basado en código abierto: PID-Analyzer y blackbox-tools',
  },
  home: {
    title: 'Tu caja de herramientas de tuning FPV',
    subtitle:
      'Analiza logs de blackbox, ajusta PIDs y filtros, y consigue que tu dron vuele sobre raíles — directamente en el navegador.',
    analyzerCard: {
      title: 'Analizador de Blackbox',
      body: 'Suelta un log de blackbox de Betaflight y obtén gráficas de step response, ruido y delay. Funciona 100 % en local.',
      cta: 'Analizar un log',
    },
    guidesCard: {
      title: 'Guías de tuning',
      body: 'Tuning de PID y filtros paso a paso. Pablo acompaña a los principiantes en cada paso; los pros van directos a las gráficas.',
      cta: 'Empezar a tunear',
    },
    calculatorCard: {
      title: 'Calculadora de Dynamic Idle',
      body: 'El valor correcto de dyn_idle para tu hélice en segundos.',
      cta: 'Calcular',
    },
  },
  tools: {
    title: 'Herramientas',
    subtitle: 'Todo se ejecuta en tu navegador: sin subidas ni cuentas.',
  },
  guides: {
    title: 'Guías',
    subtitle: '¿Cómo quieres tunear hoy?',
    noob: {
      title: 'Soy nuevo en esto',
      body: 'Pablo el mago te guía paso a paso — sin conocimientos previos.',
      cta: 'Toma mi mano',
    },
    pro: {
      title: 'Sé lo que hago',
      body: 'Chichi la científica te da las gráficas en bruto y no se interpone.',
      cta: 'Al analizador',
    },
    steps: 'Pasos',
    stepOf: 'Paso {{current}} de {{total}}',
    previous: 'Anterior',
    next: 'Siguiente',
    finish: 'Terminar',
    prerequisites: 'Requisitos previos',
    startGuide: 'Empezar la guía',
    backToOverview: 'Volver al resumen',
  },
  analyzer: {
    title: 'Analizador de Blackbox',
    description:
      'Analiza logs de blackbox de Betaflight directamente en tu navegador: step response, mapas de calor de ruido, response delay y más.',
    openFileButton: {
      label: 'Haz clic para abrir un archivo de blackbox (.bbl) o arrástralo aquí',
      ariaLabel: 'Abrir un archivo de blackbox para analizar',
    },
    addFileToCurrentAnalysis: 'Añadir al análisis actual',
    replaceCurrentAnalysis: 'Reemplazar el análisis actual',
    loading: 'Cargando el analizador…',
    error: {
      logAnalyzation: 'No se pudo analizar el archivo de log…',
      outOfMemory: 'Sin memoria. Probablemente tu log es demasiado grande…',
      noLogs: 'No se pudo leer ningún log del archivo.',
    },
    subLogError: 'Vuelo {{index}}: {{error}}',
    progress: {
      runningAnalysis: 'Análisis en curso',
      splittingLog: 'Dividiendo el log en vuelos',
      analyzingSubLog: 'Analizando vuelo #{{flightIndex}}',
      readingHeaders: 'Leyendo cabeceras',
      decoding: 'Decodificando',
      readingDecodedLog: 'Leyendo el log decodificado',
      exportingHeaders: 'Exportando cabeceras',
      analyzingAxis: 'Analizando {{axis}}',
    },
    plotNavigation: {
      combinedLogs: 'Logs combinados ({{count}} / {{total}})',
      activeFlightLog: 'Log de vuelo activo #{{index}}',
      axis: { roll: 'Roll', pitch: 'Pitch', yaw: 'Yaw' },
    },
    downloadGate: {
      message:
        'Para usar el analizador, tu navegador descarga una vez el motor de análisis (unos {{downloadSizeMB}} MB). ¿Datos limitados? Mejor saberlo antes de tocar.',
      acceptButton: 'Entendido, descargar {{downloadSizeMB}} MB',
    },
  },
  idleCalculator: {
    title: 'Calculadora de Dynamic Idle',
    description:
      'Calcula el valor recomendado de dyn_idle de Betaflight a partir del diámetro de tu hélice.',
    propSizeLabel: 'Diámetro de la hélice (pulgadas)',
    resultLabel: 'Dynamic idle resultante',
    hint: 'Ponlo como "Dynamic idle value" en la pestaña de PID tuning de Betaflight.',
  },
  donate: {
    button: 'Invítame a un mapache',
    cta: {
      title: 'Estas herramientas funcionan con snacks de mapache',
      body: 'fpv-drone.info es gratis, sin anuncios y sin rastreo con fines de lucro. Si salvó tu tune (o tu cordura), lanza una moneda a tu mapache.',
      button: 'Invítame a un mapache 🦝',
    },
    afterAnalysis: {
      title: 'Análisis listo — ¿merece un snack?',
      body: 'Si las gráficas te ayudaron, una pequeña donación mantiene alimentados los servidores (y los mapaches).',
    },
  },
  pwa: {
    installButton: 'Instalar la app',
    installBanner: 'fpv-drone.info funciona sin conexión como app',
    updateAvailable: 'Hay una versión nueva: recarga para actualizar.',
    reload: 'Recargar',
  },
  cache: {
    clearAndReload: 'Vaciar caché y recargar',
    offlineReady: 'Disponible sin conexión',
    downloadForOffline: 'Descargar para uso sin conexión',
    downloading: 'Descargando… {{percent}} %',
  },
  languageBanner: {
    text: '¿Quieres cambiar el idioma a {{language}}?',
    button: 'Cambiar idioma',
  },
  notFound: {
    title: 'Este mapache no encontró nada aquí',
    body: 'La página que buscas no existe (ya).',
    backHome: 'Volver al inicio',
  },
};
