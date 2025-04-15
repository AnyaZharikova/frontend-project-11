import renderStaticText from '../view/staticText.js';
import renderContent from '../view/renderContent.js';

const applyLocale = (elements, state, i18next) => {
  renderStaticText(elements, i18next);
  renderContent(elements, state, i18next);
};

export default applyLocale;
