/* eslint-disable import/extensions */
import * as yup from 'yup';
import _ from 'lodash';
import { proxy, subscribe, snapshot } from 'valtio/vanilla';
import { handleForm, handleFeedback } from './view/watchers.js';
import renderStaticText from './view/staticText.js';
import renderContent from './view/renderContent.js';
import updateFeeds from './updater.js';
import getFeed from './getFeed.js';
import parseFeed from './parser.js';
import '../scss/styles.scss';
// import * as bootstrap from 'bootstrap';

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

const handleSubmit = (url, feeds) => validate(url)
  .then((error) => {
    if (error) {
      throw new Error(error);
    }

    if (isDuplicateUrl(url, feeds)) {
      throw new Error('errors.rssExists');
    }

    return getFeed(url);
  })
  .then((doc) => {
    const { feed, posts } = parseFeed(doc);

    const newFeed = {
      id: _.uniqueId(),
      title: feed.title,
      description: feed.description,
      url,
    };

    const newPosts = posts.map((post) => ({
      id: _.uniqueId(),
      feedId: newFeed.id,
      title: post.title,
      link: post.link,
    }));

    return { newFeed, newPosts };
  });

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
    title: document.querySelector('title'),
    header: document.getElementById('main-header'),
    form: document.querySelector('form'),
    input: document.getElementById('url-input'),
    label: document.querySelector('label'),
    submitButton: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.getElementById('feeds'),
    posts: document.getElementById('posts'),
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

  elements.input.addEventListener('input', (e) => {
    const { value } = e.target;
    initialState.form.inputValue = value;
    initialState.form.status = 'filling';
    initialState.ui.touched = true;

    validate(value)
      .then((error) => {
        initialState.form.error = i18nI.t(error);
      });
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();
    initialState.form.status = 'sending';

    handleSubmit(url, initialState.feeds)
      .then(({ newFeed, newPosts }) => {
        initialState.feeds.push(newFeed);
        initialState.posts.push(...newPosts);

        initialState.form.inputValue = '';
        initialState.ui.feedbackMessage = i18nI.t('success.rssAdded');
        initialState.ui.feedbackType = 'success';
        initialState.form.status = 'success';

        renderContent(elements, initialState, i18nI);
        updateFeeds(elements.posts, initialState, i18nI);
      })
      .catch((err) => {
        initialState.ui.feedbackMessage = i18nI.t(err.message);
        initialState.ui.feedbackType = 'error';
        initialState.form.status = 'error';
      });
  });

  renderContent(elements, initialState, i18nI);
};

export default app;
