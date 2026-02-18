/* ============================================================
   MMSL — Careers Page
   Fetches data/careers.json and renders job listings
   Handles application form submission via Formspree
   ============================================================ */

(function () {
  var DATA_URL = 'data/careers.json';

  var hiringBanner = document.getElementById('hiring-banner');
  var jobsContainer = document.getElementById('jobs-container');
  var noJobsMessage = document.getElementById('no-jobs');
  var applyForm = document.getElementById('apply-form');
  var applySuccess = document.getElementById('apply-success');
  var applyPosition = document.getElementById('apply-position');
  var applySubmit = document.getElementById('apply-submit');

  if (!jobsContainer) return;

  async function loadCareers() {
    try {
      var response = await fetch(DATA_URL + '?t=' + Date.now());
      if (!response.ok) throw new Error('Failed to load careers data');
      var data = await response.json();

      var activeJobs = (data.jobs || []).filter(function (job) { return job.active; });

      if (data.hiringActive && activeJobs.length > 0) {
        if (hiringBanner) hiringBanner.style.display = 'block';
        renderJobs(activeJobs);
        populatePositions(activeJobs);
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
    jobsContainer.innerHTML = jobs.map(function (job) {
      return '<div class="job-listing fade-in visible" data-job-id="' + job.id + '">' +
        '<div class="job-listing__header" onclick="toggleJob(\'' + job.id + '\')">' +
        '<div class="job-listing__info">' +
        '<h3>' + job.title + '</h3>' +
        '<div class="job-listing__meta">' +
        '<span><i class="fas fa-building"></i> ' + job.department + '</span>' +
        '<span><i class="fas fa-clock"></i> ' + job.type + '</span>' +
        '<span><i class="fas fa-map-marker-alt"></i> ' + job.location + '</span>' +
        (job.deadline ? '<span><i class="fas fa-calendar-alt"></i> Deadline: ' + formatDate(job.deadline) + '</span>' : '') +
        '</div></div>' +
        '<button class="job-listing__toggle" id="toggle-' + job.id + '" aria-label="Expand job details">' +
        '<i class="fas fa-chevron-down"></i></button></div>' +
        '<div class="job-listing__details" id="details-' + job.id + '">' +
        '<p style="margin-bottom:1rem;color:var(--color-mid-gray);">' + job.description + '</p>' +
        (job.requirements && job.requirements.length > 0
          ? '<h4>Requirements</h4><ul>' + job.requirements.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul>'
          : '') +
        (job.responsibilities && job.responsibilities.length > 0
          ? '<h4>Responsibilities</h4><ul>' + job.responsibilities.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul>'
          : '') +
        '<div class="job-listing__apply">' +
        '<a href="#apply-section" class="btn btn--primary" onclick="selectPosition(\'' + job.title.replace(/'/g, "\\'") + '\')">' +
        '<i class="fas fa-paper-plane"></i> Apply for this Position</a>' +
        '</div></div></div>';
    }).join('');
  }

  function populatePositions(jobs) {
    if (!applyPosition) return;
    jobs.forEach(function (job) {
      var opt = document.createElement('option');
      opt.value = job.title;
      opt.textContent = job.title;
      applyPosition.appendChild(opt);
    });
  }

  // Global function to pre-select position from job listing
  window.selectPosition = function (title) {
    if (applyPosition) {
      applyPosition.value = title;
    }
  };

  function formatDate(dateStr) {
    var date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Toggle job details
  window.toggleJob = function (jobId) {
    var details = document.getElementById('details-' + jobId);
    var toggle = document.getElementById('toggle-' + jobId);
    if (details && toggle) {
      details.classList.toggle('open');
      toggle.classList.toggle('open');
    }
  };

  // Handle application form submission via AJAX
  if (applyForm) {
    applyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      applySubmit.disabled = true;
      applySubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

      var formData = new FormData(applyForm);

      fetch(applyForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            applyForm.style.display = 'none';
            applySuccess.classList.add('show');
            applyForm.reset();
          } else {
            throw new Error('Submission failed');
          }
        })
        .catch(function () {
          alert('Something went wrong. Please try again or email info@maishamedicals.com directly.');
          applySubmit.disabled = false;
          applySubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Application';
        });
    });
  }

  loadCareers();
})();
