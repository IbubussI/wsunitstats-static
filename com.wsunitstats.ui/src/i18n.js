import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n.use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    ns: ['files', 'static'],
    defaultNS: 'files',
    fallbackNS: 'static',
    backend: {
      loadPath: '/{{ns}}/localization//{{lng}}.json'
    }
  });

export default i18n;