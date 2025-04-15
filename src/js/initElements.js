const initElements = () => ({
  title: document.querySelector('title'),
  header: document.getElementById('main-header'),
  slogan: document.getElementById('slogan'),
  form: document.querySelector('form'),
  input: document.getElementById('url-input'),
  label: document.querySelector('label'),
  submitButton: document.querySelector('[type="submit"]'),
  example: document.getElementById('example'),
  feedback: document.querySelector('.feedback'),
  feeds: document.getElementById('feeds-container'),
  posts: document.getElementById('posts-container'),
  switchLang: document.querySelector('[data-switch-lang]'),
  modal: {
    container: document.getElementById('preview-modal'),
    title: document.querySelector('.modal-title'),
    body: document.querySelector('.modal-body'),
    link: document.querySelector('.modal-link'),
    buttonClose: document.querySelector('.btn-secondary'),
  },
});

export default initElements;
