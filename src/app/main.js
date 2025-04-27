/* eslint-disable import/extensions */
import * as yup from 'yup';
import uniqueId from 'lodash/uniqueId.js';
import { subscribe, snapshot } from 'valtio/vanilla';
import { initState, initElements } from './state.js';
import * as render from './view/renders.js';
import { getFeed, parseFeed, updateFeeds } from './feeds.js';
import '../scss/styles.scss';
// import * as bootstrap from 'bootstrap';

const schema = yup.object({
  url: yup.string().url().required(),
});

const validate = (value, feeds) => schema.validate({ url: value })
  .catch(() => {
    throw new Error('errors.invalidUrl');
  })
  .then(({ url }) => {
    const isDuplicate = feeds.some((feed) => feed.url === url);
    if (!isDuplicate) {
      return null;
    }

    throw new Error('errors.rssExists');
  });

const handleSubmit = (url, feeds) => validate(url, feeds)
  .then(() => getFeed(url))
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

const setupFormHandlers = (el, state) => {
  const inputElement = el.input;
  const {
    form,
    ui,
    feeds,
    posts,
  } = state;

  el.input.addEventListener('input', (e) => {
    const { value } = e.target;

    form.status = 'filling';
    ui.touched = true;

    validate(value)
      .then(() => {
        form.error = null;
      })
      .catch((error) => {
        form.error = error;
      });
  });

  el.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = inputElement.value.trim();
    form.status = 'sending';

    handleSubmit(url, state.feeds)
      .then(({ newFeed, newPosts }) => {
        feeds.unshift(newFeed);
        posts.unshift(...newPosts);

        ui.feedbackKey = 'success.rssAdded';
        ui.feedbackType = 'success';

        form.inputValue = '';
        form.status = 'success';
      })
      .catch((err) => {
        ui.feedbackKey = err.message; // Save the translation key
        ui.feedbackType = 'error';
        form.status = 'error';
      });
  });
};

const setupPostHandlers = (el, state) => {
  el.posts.addEventListener('click', (e) => {
    const { ui } = state;

    const isButton = e.target.tagName === 'BUTTON';
    const { id: postId } = e.target.dataset;

    if (!isButton || !postId) return;

    if (!ui.readPostsId.includes(postId)) {
      ui.readPostsId.push(postId);
    }

    ui.modal.postId = postId;
  });
};

const initModalCloseHandler = (modalElements, state) => {
  const { modal } = state.ui;
  modalElements.container.addEventListener('hidden.bs.modal', () => {
    modal.postId = null;
  });
};

const setupLanguageHandlers = (el, state) => {
  const { ui } = state;
  el.switchLang.addEventListener('click', (e) => {
    const { switchLang } = el;
    const currentLang = e.target.dataset.switchLang;
    const newLang = currentLang === 'ru' ? 'en' : 'ru';

    ui.lng = newLang;
    switchLang.dataset.switchLang = newLang;
  });
};

const setupFormSubscribe = (el, state) => {
  subscribe(state.form, () => {
    const snapForm = snapshot(state.form);
    render.handleForm(el, snapForm);
  });
};

const setupUiSubscribe = (el, state, i18nI) => {
  subscribe(state.ui, () => {
    const snapUi = snapshot(state.ui);
    const {
      lng,
      feedbackKey,
      feedbackType,
      modal: { postId },
    } = snapUi;
    const { modal } = el;

    if (lng !== i18nI.language) {
      i18nI.changeLanguage(lng).then(() => {
        render.renderStaticText(el, i18nI);
        render.renderContent(el, state, i18nI);
        render.handleFeedback(el, feedbackKey, feedbackType, i18nI);
      });
    } else {
      render.handleFeedback(el, feedbackKey, feedbackType, i18nI);
    }

    if (postId) {
      const post = snapshot(state.posts).find((p) => p.id === postId);

      if (post) {
        render.showModal(post, modal, i18nI);
      }
    }
  });
};

const setupContentSubscribe = (el, state, i18nI) => {
  subscribe(state, () => {
    const snapState = snapshot(state);
    const { feeds, posts, ui } = snapState;
    const postContainer = el.posts;

    render.renderContent(el, state, i18nI);

    feeds.forEach((feed) => {
      const isRendered = document.querySelector(`[data-id="${feed.id}"]`);
      if (!isRendered) {
        render.renderNewFeed(el.feeds, feed);
      }
    });

    posts.forEach((post) => {
      const isRendered = document.querySelector(`[data-id="${post.id}"]`);
      if (!isRendered) {
        render.renderNewPost(el.posts, post, i18nI);
      }
    });

    ui.readPostsId.forEach((id) => {
      const postLink = postContainer.querySelector(`a[data-id="${id}"]`);

      if (postLink) {
        postLink.classList.remove('fw-bold');
        postLink.classList.add('fw-normal');
      }
    });
  });
};

const app = (i18nInstance) => {
  const initialState = initState();
  const elements = initElements();

  render.renderStaticText(elements, i18nInstance);

  setupFormHandlers(elements, initialState);
  setupPostHandlers(elements, initialState, i18nInstance);
  setupLanguageHandlers(elements, initialState);
  initModalCloseHandler(elements.modal, initialState);

  setupFormSubscribe(elements, initialState);
  setupUiSubscribe(elements, initialState, i18nInstance);
  setupContentSubscribe(elements, initialState, i18nInstance);

  updateFeeds(initialState);
};

export default app;
