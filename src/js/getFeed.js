import axios from 'axios';

const getFeed = (url) => axios
  .get(`https://allorigins.hexlet.app/raw?disableCache=true&url=${encodeURIComponent(url)}`, { timeout: 5000 })
  .then((response) => {
    console.log('[getFeed] Ответ получен, статус:', response.status);
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, 'application/xml');
    const errorDoc = doc.querySelector('parsererror');

    if (errorDoc) {
      console.error('[getFeed] Ошибка парсинга XML:', errorDoc.textContent);
      throw new Error('errors.invalidRss');
    }

    return doc;
  })
  .catch((error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('[getFeed] Таймаут запроса:', error.message);
      throw new Error('errors.timeout');
    }

    console.error('[getFeed] Сетевая ошибка:', error.message, error.response?.status, error.response?.data);
    throw new Error('errors.network');
  });

export default getFeed;
