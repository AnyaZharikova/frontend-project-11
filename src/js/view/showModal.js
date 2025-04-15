import { Modal } from 'bootstrap';

const showModal = (post, modalElements, i18n) => {
  const {
    container,
    title,
    body,
    link,
    buttonClose,
  } = modalElements;

  title.textContent = post.title;
  body.textContent = post.description;
  link.href = post.link;
  link.textContent = i18n.t('modal.btnLink');
  buttonClose.textContent = i18n.t('modal.btnClose');

  const modal = new Modal(container);
  modal.show();
};

export default showModal;
