const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby1Afw6SyQfKIs7JssLGxyXXP3xW4pZw1iuJaW28lyq5Cq9fcAk0zwb3JaOKlHzQAkQ/exec';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Video autoplay ──────────────────────────────────────────────────────────
const bgVideo = document.querySelector('.bg-video');
if (bgVideo) {
  const tryPlay = () => {
    bgVideo.play().then(() => {
      document.removeEventListener('mousemove', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('click', tryPlay);
    }).catch(() => {});
  };
  tryPlay();
  document.addEventListener('mousemove', tryPlay);
  document.addEventListener('touchstart', tryPlay);
  document.addEventListener('click', tryPlay);
}

// ── Shared submit ───────────────────────────────────────────────────────────
async function submitToSheets(payload) {
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

// ── Email signup form ───────────────────────────────────────────────────────
function initSignupForms() {
  for (const form of document.querySelectorAll('[data-signup]')) {
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
        await submitToSheets({
          email,
          source: 'kaplan-software-labs-landing-page',
          submittedAt: new Date().toISOString(),
        });
        feedback.textContent = 'Thanks. You are on the early access list.';
        feedback.classList.remove('error');
        form.reset();
      } catch (err) {
        feedback.textContent = err.message === 'missing-webhook'
          ? 'Signup endpoint is not configured yet.'
          : 'Something went wrong. Please try again in a moment.';
        feedback.classList.add('error');
      } finally {
        button.disabled = false;
        button.removeAttribute('aria-busy');
      }
    });
  }
}

// ── Beta feedback form ──────────────────────────────────────────────────────
function initFeedbackForm() {
  const form = document.querySelector('[data-feedback-form]');
  const status = document.querySelector('[data-feedback-message]');
  if (!form || !status) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const emailInput = form.querySelector('input[name="email"]');
    const feedbackInput = form.querySelector('textarea[name="feedback"]');
    if (!button || !emailInput || !feedbackInput) return;
    const feedback = feedbackInput.value.trim();
    if (!feedback || feedback.length < 8) {
      status.textContent = 'Please enter more detail before submitting.';
      status.classList.add('error');
      feedbackInput.focus();
      return;
    }
    status.textContent = 'Submitting...';
    status.classList.remove('error');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    try {
      await submitToSheets({
        entryType: 'feedback',
        email: emailInput.value.trim(),
        feedback,
        source: 'kaplansoftwarelabs.com/beta-feedback',
        submittedAt: new Date().toISOString(),
      });
      status.textContent = 'Thanks for the feedback. We received it.';
      status.classList.remove('error');
      form.reset();
    } catch (err) {
      status.textContent = err.message === 'missing-webhook'
        ? 'Feedback endpoint is not configured yet.'
        : 'Something went wrong. Please try again in a moment.';
      status.classList.add('error');
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
}

// ── Page init ───────────────────────────────────────────────────────────────
function initPage() {
  initSignupForms();
  initFeedbackForm();
}

// ── SPA router ──────────────────────────────────────────────────────────────
function swapPage(url, push = true) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newMain = doc.querySelector('main.shell');
      const currentMain = document.querySelector('main.shell');
      if (!newMain || !currentMain) { window.location.href = url; return; }
      document.title = doc.title;
      if (push) history.pushState({}, '', url);
      currentMain.replaceWith(newMain);
      window.scrollTo(0, 0);
      initPage();
    })
    .catch(() => { window.location.href = url; });
}

document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link || link.origin !== window.location.origin || link.target) return;
  e.preventDefault();
  if (link.href !== window.location.href) swapPage(link.href);
});

window.addEventListener('popstate', () => swapPage(location.href, false));

initPage();
