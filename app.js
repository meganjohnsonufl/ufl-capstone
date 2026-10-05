const initialEvents = [
    {
      id: 1,
      title: "Steel Valley Cluster",
      sport: "FastCAT",
      photographer: "Megan Johnson Photography LLC",
      date: "2026-08-01",
      city: "Columbus",
      state: "OH",
      status: "Gallery Live",
      galleryUrl: "https://example.com/galleries/svc",
      description: "Full action coverage of all days and runs. High-speed action shots available."
    },
    {
      id: 2,
      title: "Loyalhanna Agility Club",
      sport: "Agility",
      photographer: "Apex Visuals",
      date: "2026-09-19",
      city: "Latrobe",
      state: "PA",
      status: "Proofing",
      galleryUrl: "https://example.com/galleries/lac",
      description: "Coverage for Rings 1 & 2 across Friday through Sunday runs."
    },
    {
      id: 3,
      title: "Tri-State Beagle AKC Scent Work Trials",
      sport: "Scent Work",
      photographer: "Paws to Pose",
      date: "2026-09-28",
      city: "New York",
      state: "NY",
      status: "Pre-Orders Open",
      galleryUrl: "https://example.com/galleries/tri-state-scent",
      description: "Pre-orders open for this event and will close 48 hours prior to the event start."
    },
    {
      id: 4,
      title: "W3PO Summits 2026",
      sport: "Weight Pull",
      photographer: "Megan Johnson Photography LLC",
      date: "2026-06-01",
      city: "Toledo",
      state: "OH",
      status: "Gallery Live",
      galleryUrl: "https://example.com/galleries/w3po-summits",
      description: "Complete coverage of all weight classes and podium awards."
    },
    {
      id: 5,
      title: "Butler County Kennel Club Autumn Classic",
      sport: "Conformation",
      photographer: "Ring Legend Photos",
      date: "2026-09-20",
      city: "Butler",
      state: "PA",
      status: "Gallery Live",
      galleryUrl: "https://example.com/galleries/bckc-barkfest",
      description: "Ringside candids and all requests were honored."
    }
  ];
  
  let eventsState = [...initialEvents];
  
  // DOM Element References
  const eventsGrid = document.getElementById('events-grid');
  const noResultsView = document.getElementById('no-results');
  const resultsCountEl = document.getElementById('results-count');
  
  // Filter Input Elements
  const searchTextInput = document.getElementById('search-text');
  const sportFilterSelect = document.getElementById('sport-filter');
  const statusFilterSelect = document.getElementById('status-filter');
  const stateFilterSelect = document.getElementById('state-filter');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  
  // Modal Elements
  const eventModal = document.getElementById('event-modal');
  const closeEventModalBtn = document.getElementById('close-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalSport = document.getElementById('modal-sport');
  const modalStatus = document.getElementById('modal-status');
  const modalPhotographer = document.getElementById('modal-photographer');
  const modalDate = document.getElementById('modal-date');
  const modalLocation = document.getElementById('modal-location');
  const modalDescription = document.getElementById('modal-description');
  const modalGalleryLink = document.getElementById('modal-gallery-link');
  
  // Submission Modal Elements
  const submitModal = document.getElementById('submit-modal');
  const openSubmitBtn = document.getElementById('open-submit-btn');
  const closeSubmitModalBtn = document.getElementById('close-submit-modal');
  const submitForm = document.getElementById('submit-event-form');
  
  /* ==========================================================================
     Filtering & Rendering Logic
     ========================================================================== */
  
  function renderEvents(events) {
    eventsGrid.innerHTML = '';
  
    if (events.length === 0) {
      noResultsView.classList.remove('hidden');
      resultsCountEl.textContent = 'Showing 0 events';
      return;
    }
  
    noResultsView.classList.add('hidden');
    resultsCountEl.textContent = `Showing ${events.length} event${events.length === 1 ? '' : 's'}`;
  
    events.forEach(evt => {
      const card = document.createElement('article');
      card.className = 'event-card';
  
      let statusClass = 'badge-live';
      if (evt.status === 'Pre-Orders Open') statusClass = 'badge-preorder';
      if (evt.status === 'Proofing') statusClass = 'badge-proofing';
  
      card.innerHTML = `
        <div class="card-header">
          <span class="badge ${statusClass}">${evt.status}</span>
          <span class="sport-tag">${evt.sport}</span>
        </div>
        <h3 class="card-title">${evt.title}</h3>
        <p class="card-meta"><strong>Photographer:</strong> ${evt.photographer}</p>
        <p class="card-meta"><strong>Location:</strong> ${evt.city}, ${evt.state}</p>
        <p class="card-meta"><strong>Date:</strong> ${evt.date}</p>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm view-details-btn" data-id="${evt.id}">View Details</button>
          <a href="${evt.galleryUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">View Gallery</a>
        </div>
      `;
  
      eventsGrid.appendChild(card);
    });
  
    // Attach event listeners to View Details buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const eventId = parseInt(e.target.getAttribute('data-id'), 10);
        openDetailModal(eventId);
      });
    });
  }
  
  // Real-time filtering calc
  function applyFilters() {
    const query = searchTextInput.value.toLowerCase().trim();
    const selectedSport = sportFilterSelect.value;
    const selectedStatus = statusFilterSelect.value;
    const selectedState = stateFilterSelect.value;
  
    const filtered = eventsState.filter(evt => {
      // Keyword match on Title, Photographer, or City
      const matchesKeyword = 
        evt.title.toLowerCase().includes(query) ||
        evt.photographer.toLowerCase().includes(query) ||
        evt.city.toLowerCase().includes(query);
  
      const matchesSport = selectedSport === 'all' || evt.sport === selectedSport;
      const matchesStatus = selectedStatus === 'all' || evt.status === selectedStatus;
      const matchesState = selectedState === 'all' || evt.state === selectedState;
  
      return matchesKeyword && matchesSport && matchesStatus && matchesState;
    });
  
    renderEvents(filtered);
  }
  
  function resetFilters() {
    searchTextInput.value = '';
    sportFilterSelect.value = 'all';
    statusFilterSelect.value = 'all';
    stateFilterSelect.value = 'all';
    applyFilters();
  }
  
  /* ==========================================================================
     Modal Controls
     ========================================================================== */
  
  function openDetailModal(id) {
    const evt = eventsState.find(e => e.id === id);
    if (!evt) return;
  
    modalTitle.textContent = evt.title;
    modalSport.textContent = evt.sport;
    modalStatus.textContent = evt.status;
    modalPhotographer.textContent = evt.photographer;
    modalDate.textContent = evt.date;
    modalLocation.textContent = `${evt.city}, ${evt.state}`;
    modalDescription.textContent = evt.description || 'No additional details provided.';
    modalGalleryLink.href = evt.galleryUrl;
  
    eventModal.classList.remove('hidden');
  }
  
  function closeDetailModal() {
    eventModal.classList.add('hidden');
  }
  
  function openSubmitModalHandler() {
    submitModal.classList.remove('hidden');
  }
  
  function closeSubmitModalHandler() {
    submitModal.classList.add('hidden');
    submitForm.reset();
  }
  
  /* ==========================================================================
     Event Registration and Form Submission
     ========================================================================== */
  
  function handleFormSubmit(e) {
    e.preventDefault();
  
    const newEvent = {
      id: Date.now(),
      title: document.getElementById('form-title').value.trim(),
      sport: document.getElementById('form-sport').value,
      photographer: document.getElementById('form-photographer').value.trim(),
      date: document.getElementById('form-date').value,
      city: document.getElementById('form-city').value.trim(),
      state: document.getElementById('form-state').value,
      status: document.getElementById('form-status').value,
      galleryUrl: document.getElementById('form-url').value.trim(),
      description: document.getElementById('form-desc').value.trim()
    };
  
    eventsState.unshift(newEvent);
  
    resetFilters();
    closeSubmitModalHandler();
  }
  
  /* ==========================================================================
     Event Listeners Setup
     ========================================================================== */
  
  searchTextInput.addEventListener('keyup', applyFilters);
  sportFilterSelect.addEventListener('change', applyFilters);
  statusFilterSelect.addEventListener('change', applyFilters);
  stateFilterSelect.addEventListener('change', applyFilters);
  resetFiltersBtn.addEventListener('click', resetFilters);
  
  closeEventModalBtn.addEventListener('click', closeDetailModal);
  openSubmitBtn.addEventListener('click', openSubmitModalHandler);
  closeSubmitModalBtn.addEventListener('click', closeSubmitModalHandler);
  submitForm.addEventListener('submit', handleFormSubmit);
  
  window.addEventListener('click', (e) => {
    if (e.target === eventModal) closeDetailModal();
    if (e.target === submitModal) closeSubmitModalHandler();
  });
  
  document.addEventListener('DOMContentLoaded', () => {
    renderEvents(eventsState);
  });