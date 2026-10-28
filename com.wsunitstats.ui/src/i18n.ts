import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { LOCALIZATION_REGEX } from '@/utils/utils';

// 'files' - game localization (exported), 'static' - site labels (public/static/localization)
i18n.use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    ns: ['files', 'static'],
    defaultNS: 'files',
    fallbackNS: 'static',
    // react escapes rendered values itself
    interpolation: { escapeValue: false },
    parseMissingKeyHandler: (key) => {
      // game localization token that is not found is rendered as empty string
      LOCALIZATION_REGEX.lastIndex = 0;
      return LOCALIZATION_REGEX.test(key) ? '' : key;
    },
    backend: {
      loadPath: '/{{ns}}/localization/{{lng}}.json'
    }
  });

export default i18n;
