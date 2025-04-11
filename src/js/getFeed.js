import axios from 'axios';

const getFeed = (url) => axios
  .get(`https://allorigins.hexlet.app/raw?disableCache=true&url=${encodeURIComponent(url)}`, { timeout: 5000 })
  .then((response) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, 'application/xml');
    const errorDoc = doc.querySelector('parsererror');

    if (errorDoc) {
      throw new Error('errors.invalidRss');
    }

    return doc;
  })
  .catch((error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('errors.timeout');
    }

    throw new Error('errors.network');
  });

export default getFeed;
