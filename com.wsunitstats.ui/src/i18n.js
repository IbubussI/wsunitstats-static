import i18n from 'i18next';
import * as Utils from 'utils/utils';
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
    parseMissingKeyHandler: (key) => {
      if (key.match(Utils.LOCALIZATION_REGEX)) {
        // return this string in case of the key is game localization token and it is not found
        return "?";
      }
      return key;
    },
    backend: {
      loadPath: '/{{ns}}/localization//{{lng}}.json'
    }
  });

export default i18n;