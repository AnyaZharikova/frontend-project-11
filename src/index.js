import 'bootstrap';
import i18n from 'i18next';
import app from './app/main.js';
import resources from './app/locales/index.js';
import applyLocale from './app/locales/locale.js';
import './scss/styles.scss';

const runApp = async () => {
  const i18nextInstance = i18n.createInstance();

  await i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  applyLocale();
  app(i18nextInstance);
};

runApp();
