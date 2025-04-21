/* eslint-disable import/extensions */
import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import { subscribe, snapshot } from 'valtio/vanilla';
import { initialState, elements } from './state.js';
import * as render from './view/renders.js';
import { getFeed, parseFeed, updateFeeds } from './feeds.js';
import '../scss/styles.scss';
// import * as bootstrap from 'bootstrap';

const schema = yup.object({
  url: yup.string().url().required(),
});

const validate = (value) => schema.validate({ url: value })
  .then(() => null)
  .catch(() => {
    throw new Error('errors.invalidUrl');
  });

const isDuplicateUrl = (newUrl, feeds) => feeds.some((feed) => feed.url === newUrl);

const handleSubmit = (url, feeds) => validate(url)
  .then(() => {
    if (isDuplicateUrl(url, feeds)) {
      throw new Error('errors.rssExists');
    }

    return getFeed(url);
  })
  .then((contents) => {
    const { feed, posts } = parseFeed(contents);

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
  })
  .catch((err) => {
    throw new Error(err.message);
  });

const app = (i18nInstance) => {
  render.renderStaticText(elements, i18nInstance);

  subscribe(initialState.form, (form) => {
    const { status = 'filling' } = form;
    render.handleForm(elements, status);
  });

  subscribe(initialState.ui, () => {
    const { feedbackKey, feedbackType } = snapshot(initialState.ui);
    render.handleFeedback(elements, feedbackKey, feedbackType, i18nInstance);
  });

  subscribe(initialState, () => {
    render.renderContent(elements, initialState, i18nInstance);
  });

  updateFeeds(initialState);

  elements.input.addEventListener('input', (e) => {
    const { value } = e.target;
    initialState.form.inputValue = value;
    initialState.form.status = 'filling';
    initialState.ui.touched = true;

    validate(value)
      .then(() => {
        initialState.form.error = null;
      })
      .catch((error) => {
        initialState.form.error = error;
        initialState.form.status = 'error';
      });
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();
    initialState.form.status = 'sending';

    handleSubmit(url, initialState.feeds.renderedFeeds)
      .then(({ newFeed, newPosts }) => {
        initialState.feeds.newFeeds = [newFeed, ...initialState.feeds.newFeeds];
        initialState.posts.newPosts = [...newPosts, ...initialState.posts.newPosts];

        initialState.form.inputValue = '';
        elements.input.value = '';

        initialState.ui.feedbackKey = 'success.rssAdded';
        initialState.ui.feedbackType = 'success';
        initialState.form.status = 'success';
      })
      .catch((err) => {
        initialState.ui.feedbackKey = err.message; // Save the translation key
        initialState.ui.feedbackType = 'error';
        initialState.form.status = 'error';
      });
  });

  subscribe(initialState.feeds, () => {
    const { newFeeds } = snapshot(initialState.feeds);

    if (newFeeds.length === 0) return;

    newFeeds.forEach((feed) => {
      render.renderNewFeed(elements.feeds, feed);
    });

    initialState.feeds.renderedFeeds = [
      ...newFeeds,
      ...initialState.feeds.renderedFeeds,
    ];

    initialState.feeds.newFeeds = [];
  });

  subscribe(initialState.posts, () => {
    const { newPosts } = snapshot(initialState.posts);

    if (newPosts.length === 0) return;

    render.renderNewPost(elements.posts, newPosts, i18nInstance);

    initialState.posts.renderedPosts = [
      ...newPosts,
      ...initialState.posts.renderedPosts,
    ];

    initialState.posts.newPosts = [];
  });

  elements.posts.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.id) {
      const postId = e.target.dataset.id;
      const allPosts = [
        ...initialState.posts.newPosts,
        ...initialState.posts.renderedPosts,
      ];
      const post = allPosts.find((p) => p.id === postId);

      if (post) {
        post.read = true;
        render.showModal(post, elements.modal, i18nInstance);
      }
    }
  });

  subscribe(initialState.posts.renderedPosts, () => {
    const { renderedPosts } = snapshot(initialState.posts);
    renderedPosts
      .filter((post) => post.read)
      .forEach((post) => {
        const postContainer = elements.posts;
        const postLink = postContainer.querySelector(`a[data-id="${post.id}"]`);
        if (postLink) {
          postLink.classList.remove('fw-bold');
          postLink.classList.add('fw-normal');
        }
      });
  });

  elements.switchLang.addEventListener('click', (e) => {
    const { switchLang } = elements;
    const currentLang = e.target.dataset.switchLang;
    const newLang = currentLang === 'ru' ? 'en' : 'ru';

    initialState.ui.lng = newLang;
    switchLang.dataset.switchLang = newLang;
  });

  subscribe(initialState.ui, () => {
    const { lng, feedbackKey, feedbackType } = snapshot(initialState.ui);

    if (lng !== i18nInstance.language) {
      i18nInstance.changeLanguage(lng).then(() => {
        render.renderStaticText(elements, i18nInstance);
        render.renderContent(elements, initialState, i18nInstance);
        render.handleFeedback(elements, feedbackKey, feedbackType, i18nInstance);
      });
    }
  });
};

export default app;
