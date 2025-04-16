import uniqueId from 'lodash/uniqueId.js';
import getFeed from './getFeed.js';
import parseFeed from './parser.js';
import renderNewPost from './view/renderNewPost.js';

const updateFeeds = (postsContainer, state, i18n) => {
  const { feeds, posts } = state;
  feeds.forEach((feed) => {
    console.log(`[updateFeeds] Обновление фида: ${feed.url}`);
    getFeed(feed.url)
      .then((doc) => {
        console.log(`[updateFeeds] Успешно загружен фид: ${feed.url}`);
        return parseFeed(doc);
      })
      .then(({ posts: freshPosts }) => {
        const existingLinks = state.posts.map((post) => post.link);
        const newPosts = freshPosts
          .filter((post) => !existingLinks.includes(post.link))
          .map((post) => ({
            id: uniqueId(),
            feedId: feed.id,
            ...post,
          }));

        if (newPosts.length > 0) {
          posts.push(...newPosts);
          renderNewPost(postsContainer, newPosts, i18n);
        }
        console.log('New posts found:', newPosts);
      })
      .catch((err) => {
        console.error(`[updateFeeds] Ошибка при обновлении фида ${feed.url}:`, err.message);
        throw new Error('errors.updateFailed');
      });
  });

  setTimeout(() => updateFeeds(postsContainer, state, i18n), 5000);
};

export default updateFeeds;
