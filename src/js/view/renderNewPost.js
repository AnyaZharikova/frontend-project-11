import { makePost } from './makeElements.js';

const renderNewPost = (postsContainer, newPosts, i18n) => {
  const ulEl = postsContainer.querySelector('ul');

  newPosts.forEach((post) => {
    const newPostEl = makePost(post, i18n);
    ulEl.prepend(newPostEl);
  });
};

export default renderNewPost;
