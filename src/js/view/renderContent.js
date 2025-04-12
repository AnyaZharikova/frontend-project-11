/* eslint-disable import/extensions */
import { snapshot } from 'valtio/vanilla';
import { makeFeed, makePost } from './makeElements.js';

// make closure!?!?!?
const renderFeeds = (elements, state, i18next) => {
  const { feeds } = snapshot(state);
  const { feeds: feedlsEl } = elements;

  if (feeds.length === 0) return;

  const hElFeeds = document.createElement('h2');
  hElFeeds.classList.add('feeds-title');
  hElFeeds.textContent = i18next.t('feedsTitle');
  feedlsEl.append(hElFeeds);
  const ulElFeeds = document.createElement('ul');
  feeds.forEach((feed) => ulElFeeds.append(makeFeed(feed)));
  feedlsEl.innerHTML = '';
  feedlsEl.append(hElFeeds, ulElFeeds);
};

const renderPosts = (elements, state, i18next) => {
  const { posts } = snapshot(state);
  const { posts: postsEl } = elements;

  if (posts.length === 0) return;

  const hElPosts = document.createElement('h2');
  hElPosts.classList.add('posts-title');
  hElPosts.textContent = i18next.t('postsTitle');
  postsEl.append(hElPosts);
  const ulElPosts = document.createElement('ul');
  posts.forEach((post) => ulElPosts.append(makePost(post, i18next)));
  postsEl.innerHTML = '';
  postsEl.append(hElPosts, ulElPosts);
};

const renderContent = (elements, state, i18next) => {
  renderFeeds(elements, state, i18next);
  renderPosts(elements, state, i18next);
};

export default renderContent;
