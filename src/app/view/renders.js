/* eslint-disable import/extensions */
import { snapshot } from 'valtio/vanilla';
import { Modal } from 'bootstrap';

// Used to update static UI elements when switching languages
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

// Updates button availability and visual error indicators
const handleForm = (elements, status) => {
  const { input, submitButton } = elements;

  switch (status) {
    case 'filling':
      submitButton.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      break;
    case 'success':
      input.classList.remove('is-invalid');
      input.value = '';
      input.focus();
      break;
    case 'error':
      submitButton.disabled = false;
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`Unknown form status: ${status}`);
  }
};

// Applies translation and styles depending on the message type.
const handleFeedback = (elements, feedbackKey, feedbackType, i18next) => {
  const { feedback } = elements;

  if (!feedbackKey || !feedback) return;

  feedback.textContent = i18next.t(feedbackKey);
  feedback.classList.remove('text-danger', 'text-success');

  switch (feedbackType) {
    case 'success':
      feedback.classList.add('text-success');
      break;
    case 'error':
    case 'idle':
      feedback.classList.add('text-danger');
      break;
    default:
      throw new Error(`Unknown feedback type: ${feedbackType}`);
  }
};

// Makes a DOM-element with a given tag and a list of CSS classes
const makeElementsWithClasses = (tag, classList = []) => {
  const element = document.createElement(tag);
  element.classList.add(...classList);
  return element;
};

// Generates a list (li) DOM element for one feed.
const makeFeed = (feed) => {
  const liEl = makeElementsWithClasses('li', ['list-group-item']);
  const hEl = makeElementsWithClasses('h3', ['h6', 'm-0']);
  hEl.textContent = feed.title;

  const pEl = makeElementsWithClasses('p', ['m-0', 'small', 'text-black-50']);
  pEl.textContent = feed.description;

  liEl.append(hEl, pEl);
  return liEl;
};

// Generates a list (li) DOM element for one post.
// And creates a link to the article and a "View" button (for the modal window).
const makePost = (post, i18next) => {
  const liEl = makeElementsWithClasses('li', ['list-group-item', 'gap-2', 'post-item']);

  const aEl = document.createElement('a');
  aEl.classList.add('fw-bold');
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

// Renders the entire list of feeds.
// Adds the title and each feed to the feeds container.
const renderFeeds = (elements, state, i18next) => {
  const snap = snapshot(state.feeds);
  const { feeds: feedsEl } = elements;

  if (snap.renderedFeeds.length === 0) return;

  const hElFeeds = document.createElement('h2');
  hElFeeds.classList.add('feeds-title');
  hElFeeds.textContent = i18next.t('feedsTitle');
  feedsEl.innerHTML = '';
  feedsEl.append(hElFeeds);

  const ulElFeeds = document.createElement('ul');
  snap.renderedFeeds.forEach((feed) => ulElFeeds.append(makeFeed(feed)));
  feedsEl.append(hElFeeds, ulElFeeds);
};

// Renders the entire list of posts.
// Adds the title and each post to the posts container.
const renderPosts = (elements, state, i18next) => {
  const snap = snapshot(state.posts);
  const { posts: postsEl } = elements;

  if (snap.renderedPosts.length === 0) return;

  const hElPosts = document.createElement('h2');
  hElPosts.classList.add('posts-title');
  hElPosts.textContent = i18next.t('postsTitle');
  postsEl.innerHTML = '';
  postsEl.append(hElPosts);

  const ulElPosts = document.createElement('ul');
  snap.renderedPosts.forEach((post) => ulElPosts.append(makePost(post, i18next)));
  postsEl.append(hElPosts, ulElPosts);
};

// Adds one new feed to the top of the list without redrawing the entire block.
const renderNewFeed = (feedsContainer, newFeed) => {
  const ulEl = feedsContainer.querySelector('ul');

  if (!ulEl) return;

  const newFeedEl = makeFeed(newFeed);
  ulEl.prepend(newFeedEl);
};

// Adds new posts to the top of the list without redrawing the entire block.
const renderNewPost = (postsContainer, newPosts, i18n) => {
  const ulEl = postsContainer.querySelector('ul');

  if (!ulEl) return;

  newPosts.forEach((post) => {
    const newPostEl = makePost(post, i18n);
    ulEl.prepend(newPostEl);
  });
};

// Combines feed- and post-rendering functionality into one entry point
const renderContent = (elements, state, i18next) => {
  renderFeeds(elements, state, i18next);
  renderPosts(elements, state, i18next);
};

const showModal = (post, modalElements, i18n) => {
  const {
    container,
    title,
    body,
    link,
    buttonClose,
  } = modalElements;

  title.textContent = post.title;
  body.textContent = post.description;
  link.href = post.link;
  link.textContent = i18n.t('modal.btnLink');
  buttonClose.textContent = i18n.t('modal.btnClose');

  const modal = new Modal(container);
  modal.show();
};

export {
  renderStaticText,
  handleForm,
  handleFeedback,
  renderNewFeed,
  renderNewPost,
  renderContent,
  showModal,
};
