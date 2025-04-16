/* eslint-disable import/extensions */
import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import { subscribe, snapshot } from 'valtio/vanilla';
import initState from './initState.js';
import initElements from './initElements.js';
import { handleForm, handleFeedback } from './view/watchers.js';
import renderStaticText from './view/staticText.js';
import renderContent from './view/renderContent.js';
import updateFeeds from './updater.js';
import getFeed from './getFeed.js';
import parseFeed from './parser.js';
import showModal from './view/showModal.js';
import markPostAsRead from './view/markPost.js';
import applyLocale from './utils/changeLang.js';
import '../scss/styles.scss';
// import * as bootstrap from 'bootstrap';

const schema = yup.object({
  url: yup.string().url().required(),
});

const validate = (value) => {
  if (!value.includes('.')) {
    return Promise.resolve('errors.invalidRss');
  }

  return schema.validate({ url: value })
    .then(() => null)
    .catch(() => 'errors.invalidUrl');
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
      id: uniqueId(),
      title: feed.title,
      description: feed.description,
      url,
    };

    const newPosts = posts.map((post) => ({
      id: uniqueId(),
      feedId: newFeed.id,
      title: post.title,
      description: post.description,
      link: post.link,
      read: false,
    }));

    return { newFeed, newPosts };
  });

const app = (i18nInstance, defaultLanguage) => {
  const initialState = initState(defaultLanguage);
  const elements = initElements();

  renderStaticText(elements, i18nInstance);

  subscribe(initialState.form, () => {
    const { status, error } = snapshot(initialState.form);
    handleForm(elements, status, error);
  });

  subscribe(initialState.ui, () => {
    const { feedbackMessage, feedbackType } = snapshot(initialState.ui);
    handleFeedback(elements, feedbackMessage, feedbackType, i18nInstance);
  });

  elements.input.addEventListener('input', (e) => {
    const { value } = e.target;
    initialState.form.inputValue = value;
    initialState.form.status = 'filling';
    initialState.ui.touched = true;

    validate(value)
      .then((error) => {
        initialState.form.error = error;
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
        initialState.ui.feedbackMessage = 'success.rssAdded';
        initialState.ui.feedbackType = 'success';
        initialState.form.status = 'success';

        renderContent(elements, initialState, i18nInstance);
        updateFeeds(elements.posts, initialState, i18nInstance);
      })
      .catch((err) => {
        initialState.ui.feedbackMessage = err.message;
        initialState.ui.feedbackType = 'error';
        initialState.form.status = 'error';
      });
  });

  renderContent(elements, initialState, i18nInstance);

  elements.posts.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.id) {
      const postId = e.target.dataset.id;
      const post = initialState.posts.find((p) => p.id === postId);
      post.read = true;

      markPostAsRead(postId, elements.posts);
      showModal(post, elements.modal, i18nInstance);
    }
  });

  elements.switchLang.addEventListener('click', (e) => {
    const { switchLang } = elements;
    const { feedbackMessage, feedbackType } = snapshot(initialState.ui);
    const currentLang = e.target.dataset.switchLang;
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    i18nInstance.changeLanguage(newLang).then(() => {
      initialState.ui.lng = newLang;
      switchLang.dataset.switchLang = newLang;

      applyLocale(elements, initialState, i18nInstance);
      handleFeedback(elements, feedbackMessage, feedbackType, i18nInstance);
    });
  });
};

export default app;
