/* eslint-disable import/extensions */
import * as yup from 'yup';
import { proxy, subscribe, snapshot } from 'valtio/vanilla';
import { handleForm, handleFeedback } from './view/watchers.js';
import '../scss/styles.scss';
// import * as bootstrap from 'bootstrap';

const renderStaticText = (elements, i18next) => {
  const { header, input, label, submitButton } = elements;

  header.textContent = i18next.t('header');
  input.placeholder = i18next.t('placeholder');
  label.textContent = i18next.t('placeholder');
  submitButton.textContent = i18next.t('submitButton');
};

const schema = yup.object({
  url: yup.string().url().required(),
});

const validate = async (value) => {
  try {
    await schema.validate({ url: value });
    return null;
  } catch (err) {
    return err.message; // 'errors.invalidUrl'
  }
};

const isDuplicateUrl = (newUrl, feeds) => feeds.some((feed) => feed.url === newUrl);

const handleSubmit = async (url, feeds) => {
  const error = await validate(url);
  if (error) {
    throw new Error(error);
  }

  if (isDuplicateUrl(url, feeds)) {
    throw new Error('errors.rssExists');
  }

  return {
    id: Date.now(),
    url,
  };
};

const app = (i18nI, defaultLanguage) => {
  const initialState = proxy({
    form: {
      status: 'filling',
      error: null,
      inputValue: '',
    },
    feeds: [],
    posts: [],
    ui: {
      lng: defaultLanguage,
      feedbackMessage: '',
      feedbackType: 'idle',
      touched: false,
    },
  });

  const elements = {
    header: document.getElementById('main-header'),
    form: document.querySelector('form'),
    input: document.getElementById('url-input'),
    label: document.querySelector('label'),
    submitButton: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
  };

  renderStaticText(elements, i18nI);

  subscribe(initialState.form, () => {
    const { status, error } = snapshot(initialState.form);
    handleForm(elements, status, error);
  });

  subscribe(initialState.ui, () => {
    const { feedbackMessage, feedbackType } = snapshot(initialState.ui);
    handleFeedback(elements, feedbackMessage, feedbackType);
  });

  elements.input.addEventListener('input', async (e) => {
    const { value } = e.target;
    initialState.form.inputValue = value;
    initialState.form.status = 'filling';
    initialState.ui.touched = true;

    const error = await validate(value);
    initialState.form.error = i18nI.t(error);
  });

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();
    initialState.form.status = 'sending';

    try {
      const newFeed = await handleSubmit(url, initialState.feeds);

      initialState.feeds.push(newFeed);
      initialState.form.inputValue = '';
      initialState.ui.feedbackMessage = i18nI.t('success.rssAdded');
      initialState.ui.feedbackType = 'success';
      initialState.form.status = 'success';
    } catch (err) {
      initialState.ui.feedbackMessage = i18nI.t(err.message);
      initialState.ui.feedbackType = 'error';
      initialState.form.status = 'error';
    }
  });
};

export default app;
