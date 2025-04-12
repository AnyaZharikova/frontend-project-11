const renderStaticText = (elements, i18next) => {
  const {
    title,
    header,
    input,
    label,
    submitButton,
  } = elements;

  title.textContent = i18next.t('header');
  header.textContent = i18next.t('header');
  input.placeholder = i18next.t('placeholder');
  label.textContent = i18next.t('placeholder');
  submitButton.textContent = i18next.t('submitButton');
};

export default renderStaticText;
