const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby1Afw6SyQfKIs7JssLGxyXXP3xW4pZw1iuJaW28lyq5Cq9fcAk0zwb3JaOKlHzQAkQ/exec';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const forms = document.querySelectorAll('[data-signup]');

async function submitEmailToSheets(email) {
  if (!SHEETS_WEBHOOK_URL || SHEETS_WEBHOOK_URL.includes('PASTE_YOUR_')) {
    throw new Error('missing-webhook');
  }

  // Apps Script web apps often do not return CORS headers for browser fetch.
  // `no-cors` still sends the request, but returns an opaque response.
  await fetch(SHEETS_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      email,
      source: 'kaplan-software-labs-landing-page',
      submittedAt: new Date().toISOString(),
    }),
  });
}

for (const form of forms) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const input = form.querySelector('input[type="email"]');
    const feedback = form.parentElement.querySelector('[data-feedback]');
    const button = form.querySelector('button[type="submit"]');
    if (!input || !feedback || !button) return;

    const email = input.value.trim();
    if (!EMAIL_REGEX.test(email)) {
      feedback.textContent = 'Please enter a valid email address.';
      feedback.classList.add('error');
      input.focus();
      return;
    }

    feedback.textContent = 'Submitting...';
    feedback.classList.remove('error');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');

    try {
      await submitEmailToSheets(email);
      feedback.textContent = 'Thanks. You are on the early access list.';
      feedback.classList.remove('error');
      form.reset();
    } catch (error) {
      if (error instanceof Error && error.message === 'missing-webhook') {
        feedback.textContent = 'Signup endpoint is not configured yet.';
      } else {
        feedback.textContent = 'Something went wrong. Please try again in a moment.';
      }
      feedback.classList.add('error');
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
}
