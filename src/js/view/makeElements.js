import makeElementsWithClasses from './utils.js';

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

export { makeFeed, makePost };
