const i18next = require('i18next');
const i18nextHttpMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');
const path = require('path');

// Initialize i18next
i18next
  .use(Backend)
  .use(i18nextHttpMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    fallbackLng: 'en',
    preload: ['en', 'pt'],
    ns: ['common', 'auth', 'files', 'goals', 'reports', 'notifications', 'users', 'errors'],
    defaultNS: 'common',
    detection: {
      order: ['header', 'querystring', 'cookie'],
      lookupHeader: 'accept-language',
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      caches: ['cookie']
    },
    interpolation: {
      escapeValue: false
    }
  });

module.exports = {
  i18next,
  t: i18next.t.bind(i18next),
  tMiddleware: i18nextHttpMiddleware.handle(i18next),
  // Helper function to get translations
  translate: (key, options = {}) => {
    return i18next.t(key, options);
  },
  // Helper function to get translations with fallback
  translateWithFallback: (key, fallback, options = {}) => {
    const translation = i18next.t(key, options);
    return translation === key ? fallback : translation;
  }
}; 