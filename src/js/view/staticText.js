const renderStaticText = (elements, i18next) => {
  const {
    title,
    header,
    slogan,
    input,
    label,
    example,
    submitButton,
  } = elements;

  title.textContent = i18next.t('header');
  header.textContent = i18next.t('header');
  slogan.textContent = i18next.t('slogan');
  input.placeholder = i18next.t('placeholder');
  label.textContent = i18next.t('placeholder');
  example.textContent = i18next.t('example');
  submitButton.textContent = i18next.t('submitButton');
};

export default renderStaticText;
