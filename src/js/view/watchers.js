const handleForm = (elements, status) => {
  const { input, submitButton } = elements;

  switch (status) {
    case 'filling':
      submitButton.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      break;
    case 'success':
      input.classList.remove('is-invalid');
      input.value = '';
      input.focus();
      break;
    case 'error':
      submitButton.disabled = false;
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`Unknown form status: ${status}`);
  }
};

const handleFeedback = (elements, feedbackMessage, feedbackType) => {
  const { feedback } = elements;
  feedback.textContent = feedbackMessage;
  feedback.classList.remove('text-danger', 'text-success');

  switch (feedbackType) {
    case 'success':
      feedback.classList.add('text-success');
      break;
    case 'error':
      feedback.classList.add('text-danger');
      break;
    case 'idle':
      feedback.classList.add('text-danger');
      break;
    default:
      throw new Error(`Unknown feedback type: ${feedbackType}`);
  }
};

export { handleForm, handleFeedback };
