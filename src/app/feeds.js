import axios from 'axios'
import uniqueId from 'lodash/uniqueId.js'

// Gets RSS-feed from specified URL via AllOrigins proxy server
const getFeed = (link) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/get')
  proxyUrl.searchParams.set('disableCache', 'true')
  proxyUrl.searchParams.set('url', link)
  return axios
    .get(proxyUrl.toString(), { timeout: 5000 })
    .then(response => response.data.contents)
    .catch((error) => {
      if (error.code === 'ECONNABORTED') {
        throw new Error('errors.timeout')
      }

      throw new Error('errors.network')
    })
}

// Parses the contents of an RSS feed in XML format
// and extracts information about the feed and posts
const parseFeed = (contents) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(contents, 'application/xml')

  const errorDoc = doc.querySelector('parsererror')
  const isRss = doc.querySelector('rss')

  if (errorDoc || !isRss) {
    throw new Error('errors.invalidRss')
  }

  const feed = {
    title: doc.querySelector('channel > title')?.textContent || 'No title',
    description: doc.querySelector('channel > description')?.textContent || 'No description',
  }

  const items = doc.querySelectorAll('item')
  const posts = Array.from(items).map(item => ({
    title: item.querySelector('title')?.textContent || 'No title',
    link: item.querySelector('link')?.textContent || 'No link',
    description: item.querySelector('description')?.textContent || 'No description',
  }))

  return { feed, posts }
}

// Periodically updates posts for all saved feeds
// Receives new posts, compares with current ones, adds only new ones.
const updateFeeds = (state) => {
  const { feeds, posts } = state

  const feedsPromises = feeds.map(feed => getFeed(feed.url)
    .then((doc) => {
      const { posts: freshPosts } = parseFeed(doc)
      const existingLinks = posts.map(post => post.link)
      const newPosts = freshPosts
        .filter(post => !existingLinks.includes(post.link))
        .map(post => ({
          id: uniqueId(),
          feedId: feed.id,
          ...post,
          read: false,
        }))

      if (newPosts.length > 0) {
        state.posts.unshift(...newPosts)
      }
    })
    .catch((err) => {
      console.error(`[updateFeeds] Ошибка при обновлении фида: ${feed.url}`, err.message)
    }))

  Promise.all(feedsPromises)
    .then(() => {
      setTimeout(() => updateFeeds(state), 5000)
    })
    .catch((e) => {
      console.warn('Feed update error', e)
    })
}

export { getFeed, parseFeed, updateFeeds }
