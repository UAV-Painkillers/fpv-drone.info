import type { Messages } from './en';

export const pl: Messages = {
  meta: {
    siteName: 'fpv-drone.info',
    tagline: 'Narzędzia do strojenia dronów FPV',
    description:
      'Darmowe narzędzia do strojenia FPV w przeglądarce: analizator blackboxa Betaflight, poradniki strojenia PID i filtrów oraz kalkulatory. Bez wysyłania plików, bez konta — wszystko działa na Twoim urządzeniu.',
  },
  nav: {
    home: 'Start',
    tools: 'Narzędzia',
    guides: 'Poradniki',
    analyzer: 'Analizator blackboxa',
    idleCalculator: 'Kalkulator Dynamic Idle',
    pidGuide: 'Poradnik strojenia PID',
    filterGuide: 'Poradnik strojenia filtrów',
    imprint: 'Impressum',
    dataPrivacy: 'Prywatność danych',
    discord: 'Discord',
    language: 'Język',
    toggleTheme: 'Przełącz tryb ciemny',
    openMenu: 'Otwórz menu',
  },
  footer: {
    owner: 'fpv-drone.info to projekt {{link}}',
    openSource: 'Zbudowane na open source: PID-Analyzer i blackbox-tools',
  },
  home: {
    title: 'Twoja skrzynka narzędziowa FPV',
    subtitle:
      'Analizuj logi blackboxa, stroj PID-y i filtry — prosto w przeglądarce, aż dron poleci jak po szynach.',
    analyzerCard: {
      title: 'Analizator blackboxa',
      body: 'Upuść log blackboxa z Betaflight i otrzymaj wykresy step response, szumów i opóźnień. Działa w 100% lokalnie.',
      cta: 'Analizuj log',
    },
    guidesCard: {
      title: 'Poradniki strojenia',
      body: 'Strojenie PID i filtrów krok po kroku. Pablo prowadzi początkujących przez każdy krok; zawodowcy idą prosto do wykresów.',
      cta: 'Zacznij strojenie',
    },
    calculatorCard: {
      title: 'Kalkulator Dynamic Idle',
      body: 'Właściwa wartość dyn_idle dla Twojego śmigła w kilka sekund.',
      cta: 'Oblicz',
    },
  },
  tools: {
    title: 'Narzędzia',
    subtitle: 'Wszystko działa w Twojej przeglądarce — bez wysyłania plików i kont.',
  },
  guides: {
    title: 'Poradniki',
    subtitle: 'Jak chcesz dziś stroić?',
    noob: {
      title: 'Jestem tu nowy',
      body: 'Magik Pablo poprowadzi Cię krok po kroku — bez żadnej wiedzy wstępnej.',
      cta: 'Złap mnie za rękę',
    },
    pro: {
      title: 'Wiem, co robię',
      body: 'Naukowczyni Chichi daje Ci surowe wykresy i nie wchodzi w drogę.',
      cta: 'Do analizatora',
    },
    steps: 'Kroki',
    stepOf: 'Krok {{current}} z {{total}}',
    previous: 'Wstecz',
    next: 'Dalej',
    finish: 'Zakończ',
    prerequisites: 'Wymagania wstępne',
    startGuide: 'Rozpocznij poradnik',
    backToOverview: 'Wróć do przeglądu',
  },
  analyzer: {
    title: 'Analizator blackboxa',
    description:
      'Analizuj logi blackboxa Betaflight bezpośrednio w przeglądarce: step response, mapy szumów, opóźnienie odpowiedzi i więcej.',
    openFileButton: {
      label: 'Kliknij, aby otworzyć plik blackboxa (.bbl), lub przeciągnij go tutaj',
      ariaLabel: 'Otwórz plik blackboxa do analizy',
    },
    addFileToCurrentAnalysis: 'Dodaj do bieżącej analizy',
    replaceCurrentAnalysis: 'Zastąp bieżącą analizę',
    loading: 'Ładowanie analizatora…',
    error: {
      logAnalyzation: 'Nie udało się przeanalizować pliku logu…',
      outOfMemory: 'Brak pamięci. Twój log jest prawdopodobnie za duży…',
      noLogs: 'Nie udało się odczytać żadnych logów z pliku.',
    },
    subLogError: 'Lot {{index}}: {{error}}',
    progress: {
      runningAnalysis: 'Analiza w toku',
      splittingLog: 'Dzielenie logu na loty',
      analyzingSubLog: 'Analizowanie lotu #{{flightIndex}}',
      readingHeaders: 'Odczytywanie nagłówków',
      decoding: 'Dekodowanie',
      readingDecodedLog: 'Odczytywanie zdekodowanego logu',
      exportingHeaders: 'Eksportowanie nagłówków',
      analyzingAxis: 'Analizowanie osi {{axis}}',
    },
    plotNavigation: {
      combinedLogs: 'Połączone logi ({{count}} / {{total}})',
      activeFlightLog: 'Aktywny log lotu #{{index}}',
      axis: { roll: 'Roll', pitch: 'Pitch', yaw: 'Yaw' },
    },
    downloadGate: {
      message:
        'Aby użyć analizatora, przeglądarka jednorazowo pobierze silnik analizy (ok. {{downloadSizeMB}} MB). Masz limit danych? Lepiej wiedzieć przed kliknięciem.',
      acceptButton: 'Rozumiem, pobierz {{downloadSizeMB}} MB',
    },
  },
  idleCalculator: {
    title: 'Kalkulator Dynamic Idle',
    description:
      'Oblicz zalecaną wartość dyn_idle Betaflight na podstawie średnicy śmigła.',
    propSizeLabel: 'Średnica śmigła (cale)',
    resultLabel: 'Wynikowe dynamic idle',
    hint: 'Ustaw tę wartość jako „Dynamic idle value" w zakładce PID tuning w Betaflight.',
  },
  donate: {
    button: 'Postaw mi szopa',
    cta: {
      title: 'Te narzędzia działają na przekąskach dla szopów',
      body: 'fpv-drone.info jest darmowe, bez reklam i bez śledzenia dla zysku. Jeśli uratowało Twój tune (albo nerwy), rzuć szopowi monetę.',
      button: 'Postaw mi szopa 🦝',
    },
    afterAnalysis: {
      title: 'Analiza gotowa — warta przekąski?',
      body: 'Jeśli wykresy pomogły, drobna wpłata utrzyma serwery (i szopy) w dobrej formie.',
    },
  },
  pwa: {
    installButton: 'Zainstaluj aplikację',
    installBanner: 'fpv-drone.info działa offline jako aplikacja',
    updateAvailable: 'Nowa wersja jest gotowa — odśwież, aby zaktualizować.',
    reload: 'Odśwież',
  },
  cache: {
    clearAndReload: 'Wyczyść pamięć podręczną i odśwież',
    offlineReady: 'Dostępne offline',
    downloadForOffline: 'Pobierz do użytku offline',
    downloading: 'Pobieranie… {{percent}}%',
  },
  languageBanner: {
    text: 'Chcesz zmienić język na {{language}}?',
    button: 'Zmień język',
  },
  notFound: {
    title: 'Ten szop niczego tu nie znalazł',
    body: 'Strona, której szukasz, nie istnieje (już).',
    backHome: 'Wróć na start',
  },
};
