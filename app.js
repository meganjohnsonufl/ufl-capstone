/* ==========================================================================
   APPLICATION LOGIC - Dog Sport Media Directory
   Features: Real-Time Multi-Filter Engine, Interactive Map (Leaflet.js),
             LocalStorage User Auth/Saved Events, and Flodesk Alert API Hook.
   ========================================================================== */

// Initial Dataset with GPS Coordinates for Map Plotting
const initialEvents = [
    {
      id: 1,
      title: "Steel Valley Cluster",
      sport: "FastCAT",
      photographer: "Megan Johnson Photography LLC",
      date: "2026-08-01",
      city: "Columbus",
      state: "OH",
      lat: 39.9612,
      lng: -82.9988,
      status: "Gallery Live",
      galleryUrl: "https://meganjohnsonphotographyllc.pixieset.com",
      description: "Full photo coverage of all runs plus video."
    },
    {
      id: 2,
      title: "Skyline Agility Trial",
      sport: "Agility",
      photographer: "The Spotted Tongue Photography",
      date: "2026-09-03",
      city: "Pittsburgh",
      state: "PA",
      lat: 40.4406,
      lng: -79.9959,
      status: "Proofing",
      galleryUrl: "https://www.thespottedtongue.com/",
      description: "Coverage for Ring 1 on Saturday and Ring 2 on Sunday with podium photos."
    },
    {
      id: 3,
      title: "Oneonta Kennel Club",
      sport: "Scent Work",
      photographer: "Charlotte With Dogs",
      date: "2026-10-24",
      city: "Buffalo",
      state: "NY",
      lat: 42.8864,
      lng: -78.8784,
      status: "Pre-Orders Open",
      galleryUrl: "https://charlottewithdogs.pixieset.com/",
      description: "Pre-orders open for for the upcoming scent work trials with Oneonta."
    },
    {
      id: 4,
      title: "Catahoula Leopard Dog Specialty",
      sport: "Conformation",
      photographer: "Megan Johnson Photography LLC",
      date: "2026-06-21",
      city: "Cleveland",
      state: "OH",
      lat: 41.4993,
      lng: -81.6944,
      status: "Gallery Live",
      galleryUrl: "https://meganjohnsonphotographyllc.pixieset.com",
      description: "Complete ringside candid and win photo coverage."
    },
  ];
  
  // App State Management
  let eventsState = [...initialEvents];
  let currentUser = JSON.parse(localStorage.getItem('dsm_user')) || null;
  let savedEventIds = JSON.parse(localStorage.getItem('dsm_saved_events')) || [];
  let showSavedOnly = false;
  let map = null;
  let mapMarkers = [];
  
  // DOM Element References
  const eventsGrid = document.getElementById('events-grid');
  const noResultsView = document.getElementById('no-results');
  const resultsCountEl = document.getElementById('results-count');
  const savedCountEl = document.getElementById('saved-count');
  const toggleViewBtn = document.getElementById('toggle-view-btn');
  
  // Filter Input References
  const searchTextInput = document.getElementById('search-text');
  const sportFilterSelect = document.getElementById('sport-filter');
  const statusFilterSelect = document.getElementById('status-filter');
  const stateFilterSelect = document.getElementById('state-filter');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  
  // Auth & Modal References
  const authBtn = document.getElementById('auth-btn');
  const viewSavedBtn = document.getElementById('view-saved-btn');
  const authModal = document.getElementById('auth-modal');
  const closeAuthModalBtn = document.getElementById('close-auth-modal');
  const loginForm = document.getElementById('login-form');
  
  const eventModal = document.getElementById('event-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const alertSignupBtn = document.getElementById('alert-signup-btn');
  
  const flodeskModal = document.getElementById('flodesk-modal');
  const closeFlodeskModalBtn = document.getElementById('close-flodesk-modal');
  const flodeskSubscribeForm = document.getElementById('flodesk-subscribe-form');
  const subscribeStatus = document.getElementById('subscribe-status');
  
  const submitModal = document.getElementById('submit-modal');
  const openSubmitBtn = document.getElementById('open-submit-btn');
  const closeSubmitModalBtn = document.getElementById('close-submit-modal');
  const submitForm = document.getElementById('submit-event-form');
  
  /* ==========================================================================
     Leaflet.js Geographic Map Initialization & Marker Updates
     ========================================================================== */
  
  function initMap() {
    const mapElement = document.getElementById('events-map');
    if (!mapElement) return;
  
    // Initialize Leaflet map centered over Midwest/Eastern US
    map = L.map('events-map').setView([40.0, -82.0], 5);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  
    updateMapMarkers(eventsState);
  }
  
  function updateMapMarkers(eventsToMap) {
    if (!map) return;
  
    // Clear existing markers
    mapMarkers.forEach(marker => map.removeLayer(marker));
    mapMarkers = [];
  
    eventsToMap.forEach(evt => {
      if (evt.lat && evt.lng) {
        const marker = L.marker([evt.lat, evt.lng]).addTo(map);
        marker.bindPopup(`
          <strong>${evt.title}</strong><br>
          <em>${evt.sport} (${evt.city}, ${evt.state})</em><br>
          <button onclick="openDetailModal(${evt.id})" class="btn btn-sm btn-primary" style="margin-top:0.5rem;">View Gallery Info</button>
        `);
        mapMarkers.push(marker);
      }
    });
  }
  
  /* ==========================================================================
     Real-Time Multi-Filter Search & Dynamic Grid Rendering
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
  
      const isSaved = savedEventIds.includes(evt.id);
  
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
          <button class="btn btn-secondary btn-sm save-event-btn" data-id="${evt.id}" aria-label="Save this event">
            ${isSaved ? '★ Saved' : '☆ Save'}
          </button>
          <a href="${evt.galleryUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" aria-label="Open gallery for ${evt.title}">
            Visit Gallery &rarr;
          </a>
        </div>
      `;
  
      eventsGrid.appendChild(card);
    });
  
    // Attach card action listeners
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => openDetailModal(parseInt(e.target.dataset.id, 10)));
    });
  
    document.querySelectorAll('.save-event-btn').forEach(btn => {
      btn.addEventListener('click', (e) => toggleSaveEvent(parseInt(e.target.dataset.id, 10)));
    });
  }
  
  function applyFilters() {
    const query = searchTextInput.value.toLowerCase().trim();
    const selectedSport = sportFilterSelect.value;
    const selectedStatus = statusFilterSelect.value;
    const selectedState = stateFilterSelect.value;
  
    const filtered = eventsState.filter(evt => {
      const matchesKeyword = 
        evt.title.toLowerCase().includes(query) ||
        evt.photographer.toLowerCase().includes(query) ||
        evt.city.toLowerCase().includes(query);
  
      const matchesSport = selectedSport === 'all' || evt.sport === selectedSport;
      const matchesStatus = selectedStatus === 'all' || evt.status === selectedStatus;
      const matchesState = selectedState === 'all' || evt.state === selectedState;
      const matchesSaved = !showSavedOnly || savedEventIds.includes(evt.id);
  
      return matchesKeyword && matchesSport && matchesStatus && matchesState && matchesSaved;
    });
  
    renderEvents(filtered);
    updateMapMarkers(filtered);
  }
  
  function resetFilters() {
    searchTextInput.value = '';
    sportFilterSelect.value = 'all';
    statusFilterSelect.value = 'all';
    stateFilterSelect.value = 'all';
    showSavedOnly = false;
    toggleViewBtn.textContent = 'Filter: All Events';
    applyFilters();
  }
  
  /* ==========================================================================
     User Auth & LocalStorage Saved Events Logic
     ========================================================================== */
  
  function updateAuthUI() {
    if (currentUser) {
      authBtn.textContent = `Logged in: ${currentUser.email.split('@')[0]}`;
      viewSavedBtn.classList.remove('hidden');
    } else {
      authBtn.textContent = 'Exhibitor Login';
      viewSavedBtn.classList.add('hidden');
    }
    savedCountEl.textContent = savedEventIds.length;
  }
  
  function toggleSaveEvent(eventId) {
    if (!currentUser) {
      authModal.classList.remove('hidden');
      return;
    }
  
    if (savedEventIds.includes(eventId)) {
      savedEventIds = savedEventIds.filter(id => id !== eventId);
    } else {
      savedEventIds.push(eventId);
    }
  
    localStorage.setItem('dsm_saved_events', JSON.stringify(savedEventIds));
    updateAuthUI();
    applyFilters();
  }
  
  /* ==========================================================================
     Flodesk API Integration Simulation
     ========================================================================== */
  
  function handleFlodeskSubscribe(e) {
    e.preventDefault();
    
    const name = document.getElementById('subscriber-name').value;
    const email = document.getElementById('subscriber-email').value;
    const eventId = document.getElementById('alert-event-id').value;
  
    subscribeStatus.classList.remove('hidden', 'success');
    subscribeStatus.textContent = "Connecting to Flodesk API...";
  
    // Simulated Flodesk API Webhook / Endpoint Request
    setTimeout(() => {
      subscribeStatus.classList.add('success');
      subscribeStatus.textContent = `Success! ${name} (${email}) subscribed for gallery release alerts.`;
      
      setTimeout(() => {
        flodeskModal.classList.add('hidden');
        flodeskSubscribeForm.reset();
        subscribeStatus.classList.add('hidden');
      }, 2000);
    }, 1000);
  }
  
  /* ==========================================================================
     Modals & Form Setup
     ========================================================================== */
  
  function openDetailModal(id) {
    const evt = eventsState.find(e => e.id === id);
    if (!evt) return;
  
    document.getElementById('modal-title').textContent = evt.title;
    document.getElementById('modal-sport').textContent = evt.sport;
    document.getElementById('modal-status').textContent = evt.status;
    document.getElementById('modal-photographer').textContent = evt.photographer;
    document.getElementById('modal-date').textContent = evt.date;
    document.getElementById('modal-location').textContent = `${evt.city}, ${evt.state}`;
    document.getElementById('modal-description').textContent = evt.description || 'No notes.';
    
    const galleryLink = document.getElementById('modal-gallery-link');
    galleryLink.href = evt.galleryUrl;
    
    document.getElementById('alert-event-id').value = evt.id;
    eventModal.classList.remove('hidden');
  }
  
  // Event Listeners Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    updateAuthUI();
    applyFilters();
  
    // Search Engine Inputs
    searchTextInput.addEventListener('keyup', applyFilters);
    sportFilterSelect.addEventListener('change', applyFilters);
    statusFilterSelect.addEventListener('change', applyFilters);
    stateFilterSelect.addEventListener('change', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
  
    toggleViewBtn.addEventListener('click', () => {
      showSavedOnly = !showSavedOnly;
      toggleViewBtn.textContent = showSavedOnly ? 'Filter: Saved Events Only' : 'Filter: All Events';
      applyFilters();
    });
  
    // Auth & Submissions
    authBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
    closeAuthModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));
  
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentUser = {
        email: document.getElementById('login-email').value,
        role: document.getElementById('login-role').value
      };
      localStorage.setItem('dsm_user', JSON.stringify(currentUser));
      updateAuthUI();
      authModal.classList.add('hidden');
    });
  
    closeModalBtn.addEventListener('click', () => eventModal.classList.add('hidden'));
  
    alertSignupBtn.addEventListener('click', () => {
      eventModal.classList.add('hidden');
      flodeskModal.classList.remove('hidden');
    });
  
    closeFlodeskModalBtn.addEventListener('click', () => flodeskModal.classList.add('hidden'));
    flodeskSubscribeForm.addEventListener('submit', handleFlodeskSubscribe);
  
    openSubmitBtn.addEventListener('click', () => submitModal.classList.remove('hidden'));
    closeSubmitModalBtn.addEventListener('click', () => submitModal.classList.add('hidden'));
  
    submitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newEvent = {
        id: Date.now(),
        title: document.getElementById('form-title').value.trim(),
        sport: document.getElementById('form-sport').value,
        photographer: document.getElementById('form-photographer').value.trim(),
        date: document.getElementById('form-date').value,
        city: document.getElementById('form-city').value.trim(),
        state: document.getElementById('form-state').value,
        lat: parseFloat(document.getElementById('form-lat').value) || 40.0,
        lng: parseFloat(document.getElementById('form-lng').value) || -82.0,
        status: document.getElementById('form-status').value,
        galleryUrl: document.getElementById('form-url').value.trim(),
        description: document.getElementById('form-desc').value.trim()
      };
  
      eventsState.unshift(newEvent);
      applyFilters();
      submitModal.classList.add('hidden');
      submitForm.reset();
    });
  });