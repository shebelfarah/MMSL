/* ============================================================
   MMSL — Careers Page
   Fetches data/careers.json and renders job listings
   ============================================================ */

(function () {
  // Update this to your raw GitHub URL after deploying:
  // const DATA_URL = 'https://raw.githubusercontent.com/shebelfarah/MMSL/main/data/careers.json';
  const DATA_URL = 'data/careers.json';

  const hiringBanner = document.getElementById('hiring-banner');
  const jobsContainer = document.getElementById('jobs-container');
  const noJobsMessage = document.getElementById('no-jobs');

  if (!jobsContainer) return;

  async function loadCareers() {
    try {
      const response = await fetch(DATA_URL + '?t=' + Date.now());
      if (!response.ok) throw new Error('Failed to load careers data');
      const data = await response.json();

      const activeJobs = (data.jobs || []).filter(job => job.active);

      if (data.hiringActive && activeJobs.length > 0) {
        if (hiringBanner) hiringBanner.style.display = 'block';
        renderJobs(activeJobs);
      } else {
        jobsContainer.innerHTML = '';
        if (noJobsMessage) noJobsMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Error loading careers:', error);
      jobsContainer.innerHTML = '';
      if (noJobsMessage) noJobsMessage.style.display = 'block';
    }
  }

  function renderJobs(jobs) {
    jobsContainer.innerHTML = jobs.map(job => `
      <div class="job-listing fade-in visible" data-job-id="${job.id}">
        <div class="job-listing__header" onclick="toggleJob('${job.id}')">
          <div class="job-listing__info">
            <h3>${job.title}</h3>
            <div class="job-listing__meta">
              <span><i class="fas fa-building"></i> ${job.department}</span>
              <span><i class="fas fa-clock"></i> ${job.type}</span>
              <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
              ${job.deadline ? `<span><i class="fas fa-calendar-alt"></i> Deadline: ${formatDate(job.deadline)}</span>` : ''}
            </div>
          </div>
          <button class="job-listing__toggle" id="toggle-${job.id}" aria-label="Expand job details">
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>
        <div class="job-listing__details" id="details-${job.id}">
          <p style="margin-bottom: 1rem; color: var(--color-mid-gray);">${job.description}</p>

          ${job.requirements && job.requirements.length > 0 ? `
            <h4>Requirements</h4>
            <ul>
              ${job.requirements.map(r => `<li>${r}</li>`).join('')}
            </ul>
          ` : ''}

          ${job.responsibilities && job.responsibilities.length > 0 ? `
            <h4>Responsibilities</h4>
            <ul>
              ${job.responsibilities.map(r => `<li>${r}</li>`).join('')}
            </ul>
          ` : ''}

          <div class="job-listing__apply">
            <h4>How to Apply</h4>
            <p style="color: var(--color-mid-gray); margin-bottom: 1rem;">
              Interested in this position? Send your CV and cover letter to
              <a href="mailto:info@maishamedicals.com?subject=Application: ${encodeURIComponent(job.title)}" style="color: var(--color-primary); font-weight: 600;">
                info@maishamedicals.com
              </a>
              with the subject line: <strong>"Application: ${job.title}"</strong>
            </p>
            <a href="mailto:info@maishamedicals.com?subject=Application: ${encodeURIComponent(job.title)}" class="btn btn--primary">
              <i class="fas fa-paper-plane"></i> Apply Now
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Toggle job details — global function for onclick
  window.toggleJob = function (jobId) {
    const details = document.getElementById('details-' + jobId);
    const toggle = document.getElementById('toggle-' + jobId);
    if (details && toggle) {
      details.classList.toggle('open');
      toggle.classList.toggle('open');
    }
  };

  loadCareers();
})();
