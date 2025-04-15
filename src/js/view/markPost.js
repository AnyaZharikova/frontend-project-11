const markPostAsRead = (postId, postContainer) => {
  const postLink = postContainer.querySelector(`a[data-id="${postId}"]`);
  if (postLink) {
    postLink.classList.remove('fw-bold');
    postLink.classList.add('fw-normal');
  }
};

export default markPostAsRead;
