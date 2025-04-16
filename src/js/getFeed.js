import axios from 'axios';

const getFeed = (url) => axios
  .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`, { timeout: 5000 })
  .then((response) => {
    const { contents } = response.data;
    const parser = new DOMParser();
    const doc = parser.parseFromString(contents, 'application/xml');

    const errorDoc = doc.querySelector('parsererror');
    if (errorDoc) {
      throw new Error('errors.invalidRss');
    }

    const isRss = doc.querySelector('rss');
    if (!isRss) {
      throw new Error('errors.invalidRss');
    }

    return doc;
  })
  .catch((error) => {
    if (error.message === 'errors.invalidRss') {
      throw error;
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('errors.timeout');
    }

    throw new Error('errors.network');
  });

export default getFeed;
