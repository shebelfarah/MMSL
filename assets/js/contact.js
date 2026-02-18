/* ============================================================
   MMSL — Contact Page
   Handles form submission success detection
   ============================================================ */

(function () {
  // Check if redirected back with success parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    if (form) form.style.display = 'none';
    if (success) success.classList.add('show');

    // Clean up URL
    window.history.replaceState({}, '', window.location.pathname);
  }
})();
