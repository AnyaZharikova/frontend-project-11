const makeElementsWithClasses = (tag, classList = []) => {
  const element = document.createElement(tag);
  element.classList.add(...classList);
  return element;
};

export default makeElementsWithClasses;
