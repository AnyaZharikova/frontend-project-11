import 'bootstrap';
import i18n from 'i18next';
import app from './js/main.js';
import resources from './js/locales/index.js';
import applyLocale from './js/locales/locale.js';
import './scss/styles.scss';

const runApp = async () => {
  const defaultLanguage = 'en';
  const i18nextInstance = i18n.createInstance();

  await i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  });

  applyLocale();
  app(i18nextInstance, defaultLanguage);
};

runApp();
