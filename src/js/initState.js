/* eslint-disable import/extensions */
import { proxy } from 'valtio/vanilla';

const initState = (defaultLanguage) => proxy({
  form: {
    status: 'filling',
    error: null,
    inputValue: '',
  },
  feeds: [],
  posts: [],
  ui: {
    lng: defaultLanguage,
    feedbackMessage: null,
    feedbackType: 'idle',
    touched: false,
  },
});

export default initState;
