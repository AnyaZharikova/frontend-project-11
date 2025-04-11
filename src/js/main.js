/* eslint-disable import/extensions */
import * as yup from 'yup';
import _ from 'lodash';
import { proxy, subscribe, snapshot } from 'valtio/vanilla';
import { handleForm, handleFeedback } from './view/watchers.js';
import getFeed from './getFeed.js';
import parseFeed from './parser.js';
import '../scss/styles.scss';
// import * as bootstrap from 'bootstrap';

const renderStaticText = (elements, i18next) => {
  const {
    header,
    input,
    label,
    submitButton,
  } = elements;

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

const makeElementsWithClasses = (tag, classList = []) => {
  const element = document.createElement(tag);
  element.classList.add(...classList);
  return element;
};

const makeFeed = (feed) => {
  const liEl = makeElementsWithClasses('li', ['list-group-item']);
  const hEl = makeElementsWithClasses('h3', ['h6', 'm-0']);
  hEl.textContent = feed.title;

  const pEl = makeElementsWithClasses('p', ['m-0', 'small', 'text-black-50']);
  pEl.textContent = feed.description;

  liEl.append(hEl, pEl);
  return liEl;
};

const makePost = (post, i18next) => {
  const liEl = makeElementsWithClasses('li', ['list-group-item']);

  const aEl = document.createElement('a');
  aEl.setAttribute('href', post.link);
  aEl.setAttribute('data-id', post.id);
  aEl.textContent = post.title;

  const viewButton = makeElementsWithClasses('button', ['btn', 'btn-outline-primary', 'btn-sm']);
  viewButton.setAttribute('type', 'button');
  viewButton.setAttribute('data-id', post.id);
  viewButton.textContent = i18next.t('viewButton');

  liEl.append(aEl, viewButton);
  return liEl;
};

const renderContent = (elements, state, i18next) => {
  const { feeds, posts } = snapshot(state);
  const { feeds: feedlsEl, posts: postsEl } = elements;

  if (feeds.length === 0) return;

  const hElFeeds = document.createElement('h2');
  hElFeeds.classList.add('feeds-title');
  hElFeeds.textContent = i18next.t('feedsTitle');
  feedlsEl.append(hElFeeds);
  const ulElFeeds = document.createElement('ul');
  feeds.forEach((feed) => ulElFeeds.append(makeFeed(feed)));
  feedlsEl.innerHTML = '';
  feedlsEl.append(hElFeeds, ulElFeeds);

  const hElPosts = document.createElement('h2');
  hElPosts.classList.add('posts-title');
  hElPosts.textContent = i18next.t('postsTitle');
  postsEl.append(hElPosts);
  const ulElPosts = document.createElement('ul');
  posts.forEach((post) => ulElPosts.append(makePost(post, i18next)));
  postsEl.innerHTML = '';
  postsEl.append(hElPosts, ulElPosts);
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
