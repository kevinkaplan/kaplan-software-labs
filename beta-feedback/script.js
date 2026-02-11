const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby1Afw6SyQfKIs7JssLGxyXXP3xW4pZw1iuJaW28lyq5Cq9fcAk0zwb3JaOKlHzQAkQ/exec';

const form = document.querySelector('[data-feedback-form]');
const statusMessage = document.querySelector('[data-feedback-message]');

async function submitFeedback(payload) {
  if (!SHEETS_WEBHOOK_URL || SHEETS_WEBHOOK_URL.includes('PASTE_YOUR_')) {
    throw new Error('missing-webhook');
  }

  await fetch(SHEETS_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
}

if (form && statusMessage) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const emailInput = form.querySelector('input[name="email"]');
    const feedbackInput = form.querySelector('textarea[name="feedback"]');
    if (!button || !emailInput || !feedbackInput) return;

    const email = emailInput.value.trim();
    const feedback = feedbackInput.value.trim();

    if (!feedback || feedback.length < 8) {
      statusMessage.textContent = 'Please enter more detail before submitting.';
      statusMessage.classList.add('error');
      feedbackInput.focus();
      return;
    }

    statusMessage.textContent = 'Submitting...';
    statusMessage.classList.remove('error');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');

    try {
      await submitFeedback({
        entryType: 'feedback',
        email,
        feedback,
        source: 'kaplansoftwarelabs.com/beta-feedback',
        submittedAt: new Date().toISOString(),
      });

      statusMessage.textContent = 'Thanks for the feedback. We received it.';
      statusMessage.classList.remove('error');
      form.reset();
    } catch (error) {
      if (error instanceof Error && error.message === 'missing-webhook') {
        statusMessage.textContent = 'Feedback endpoint is not configured yet.';
      } else {
        statusMessage.textContent = 'Something went wrong. Please try again in a moment.';
      }
      statusMessage.classList.add('error');
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
}
