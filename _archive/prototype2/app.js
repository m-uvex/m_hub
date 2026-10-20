// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  youtube: {
    channelId: 'UCrQimxeVxbL-CvxfXnBzYXw',
    apiKey: 'AIzaSyA-OvnPFauGNWHENhlfW4o2czyMMOS8K9Y',
  },
  links: {
    youtube: 'https://www.youtube.com/@2much_potato',
    instagram: 'https://www.instagram.com/2much_potato',
    tiktok: 'https://www.tiktok.com/@2much_potato',
    discord: null,
    discordServer: null,
    email: 'mailto:2muchpotato@example.com',
    suggestBuild: 'https://www.instagram.com/2much_potato',
  }
};

// Page accent colors
const PAGE_ACCENTS = {
  home: '#1a1a1a',
  potato: '#4a8c3f',
  about: '#b87333',
};

// Page order for navigation
const PAGE_ORDER = ['home', 'about', 'potato'];

// ============================================================
// YOUTUBE API CACHING
// ============================================================
const YOUTUBE_CACHE = {
  // Session storage (cleared when browser closes)
  sessionKey: 'youtube_feed_session',
  // Local storage (persists across sessions)
  localKey: 'youtube_feed_local',
  // Cache duration in milliseconds
  sessionDuration: 30 * 60 * 1000, // 30 minutes
  localDuration: 4 * 60 * 60 * 1000, // 4 hours
  // Last fetch timestamp
  lastFetch: 0,
  // Minimum time between fetches
  minFetchInterval: 5 * 60 * 1000, // 5 minutes
};

// Cache helper functions
const YoutubeCache = {
  // Get cached data from session storage
  getSession() {
    try {
      const cached = sessionStorage.getItem(YOUTUBE_CACHE.sessionKey);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp < YOUTUBE_CACHE.sessionDuration) {
        return data;
      }
      
      // Remove expired cache
      sessionStorage.removeItem(YOUTUBE_CACHE.sessionKey);
      return null;
    } catch (e) {
      console.warn('Failed to read session cache:', e);
      return null;
    }
  },
  
  // Get cached data from local storage
  getLocal() {
    try {
      const cached = localStorage.getItem(YOUTUBE_CACHE.localKey);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp < YOUTUBE_CACHE.localDuration) {
        return data;
      }
      
      // Remove expired cache
      localStorage.removeItem(YOUTUBE_CACHE.localKey);
      return null;
    } catch (e) {
      console.warn('Failed to read local cache:', e);
      return null;
    }
  },
  
  // Store data in both session and local storage
  set(data) {
    const now = Date.now();
    const cacheData = {
      ...data,
      timestamp: now
    };
    
    try {
      // Store in session storage
      sessionStorage.setItem(YOUTUBE_CACHE.sessionKey, JSON.stringify(cacheData));
      
      // Store in local storage
      localStorage.setItem(YOUTUBE_CACHE.localKey, JSON.stringify(cacheData));
      
      // Update last fetch timestamp
      YOUTUBE_CACHE.lastFetch = now;
      
      console.log('YouTube feed cached successfully');
    } catch (e) {
      console.warn('Failed to cache YouTube data:', e);
    }
  },
  
  // Check if we should fetch from API
  shouldFetch() {
    const now = Date.now();
    
    // If we fetched recently, don't fetch again
    if (now - YOUTUBE_CACHE.lastFetch < YOUTUBE_CACHE.minFetchInterval) {
      console.log('YouTube API recently called, using cache');
      return false;
    }
    
    return true;
  },
  
  // Get best available cached data
  getCached() {
    // Try session cache first (more recent)
    const sessionData = this.getSession();
    if (sessionData) {
      console.log('Using session cache for YouTube feed');
      return sessionData;
    }
    
    // Fall back to local cache
    const localData = this.getLocal();
    if (localData) {
      console.log('Using local cache for YouTube feed');
      return localData;
    }
    
    console.log('No cached YouTube data available');
    return null;
  }
};

// ============================================================
// THEME MANAGER
// ============================================================
const ThemeManager = {
  current: 'dark',
  
  init() {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.set(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.set(prefersDark ? 'dark' : 'light');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.set(e.matches ? 'dark' : 'light');
      }
    });
    
    // Setup toggle button
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  },
  
  set(theme) {
    if (this.current === theme) return;
    
    const oldTheme = this.current;
    this.current = theme;
    
    // Add transition class to body
    document.body.classList.add('theme-transitioning');
    
    // Switch theme immediately
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateIcon();
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 500);
  },
  
  toggle() {
    const newTheme = this.current === 'dark' ? 'light' : 'dark';
    this.set(newTheme);
  },
  
  updateIcon() {
    const icon = document.getElementById('theme-icon');
    if (icon) {
      if (this.current === 'dark') {
        // Sun icon for dark mode (to switch to light)
        icon.innerHTML = `
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        `;
      } else {
        // Moon icon for light mode (to switch to dark)
        icon.innerHTML = `
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        `;
      }
    }
  }
};

// ============================================================
// ROUTER
// ============================================================
let currentPage = 'home';

function navigateTo(pageId) {
  if (currentPage === pageId) return;
  
  const currentPageEl = document.getElementById('page-' + currentPage);
  const targetPage = document.getElementById('page-' + pageId);
  const navCard = document.querySelector(`.nav-card[data-page="${pageId}"]`);
  
  if (!targetPage) return;
  
  // Update nav cards immediately for responsive feedback
  document.querySelectorAll('.nav-card').forEach(c => c.classList.remove('active'));
  if (navCard) navCard.classList.add('active');
  
  // Update accent color with smooth transition
  const accent = PAGE_ACCENTS[pageId] || '#1a1a1a';
  document.documentElement.style.transition = '--accent-current 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  document.documentElement.style.setProperty('--accent-current', accent);
  
  // Reset transition after animation completes
  setTimeout(() => {
    document.documentElement.style.transition = '';
  }, 500);
  
  // Exit animation for current page
  if (currentPageEl) {
    currentPageEl.classList.add('exiting');
    currentPageEl.classList.remove('active');
    
    // Wait for exit animation to complete
    setTimeout(() => {
      currentPageEl.classList.remove('exiting');
      currentPageEl.style.display = 'none';
      
      // Enter animation for new page
      targetPage.style.display = 'block';
      targetPage.classList.add('active');
      currentPage = pageId;
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Trigger staggered reveal animations
      setTimeout(triggerReveals, 100);
    }, 400);
  } else {
    // No current page, just show target
    targetPage.style.display = 'block';
    targetPage.classList.add('active');
    currentPage = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(triggerReveals, 100);
  }
}

// ============================================================
// NAVIGATION
// ============================================================
function initNav() {
  const navCards = document.querySelectorAll('.nav-card');
  navCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const page = card.dataset.page;
      navigateTo(page);
      createRipple(card, e);
    });
  });

  // Scroll shrink effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

function createRipple(el, e) {
  const ripple = document.createElement('span');
  ripple.classList.add('nav-ripple');
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  if (e && e.clientX) {
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
  } else {
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
  }
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
}

// ============================================================
// SCROLL REVEAL
// ============================================================
function triggerReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  const reveals = document.querySelectorAll('.page.active .reveal');
  reveals.forEach((el, index) => {
    // Add staggered delay based on reveal class
    const delayClass = el.classList.contains('reveal-d1') ? 100 :
                      el.classList.contains('reveal-d2') ? 200 :
                      el.classList.contains('reveal-d3') ? 300 : 0;
    
    const totalDelay = delayClass + (index * 50);
    
    el.style.animationDelay = `${totalDelay}ms`;
    observer.observe(el);
    
    // Force-trigger for already-visible elements with delay
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setTimeout(() => {
        el.classList.add('visible');
      }, totalDelay);
    }
  });
}

// ============================================================
// YOUTUBE FEED
// ============================================================
async function loadYoutubeFeed() {
  const feed = document.getElementById('yt-feed');
  if (!feed) return;

  // Check cache first
  const cachedData = YoutubeCache.getCached();
  if (cachedData) {
    renderYoutubeFeed(feed, cachedData.videos);
    return;
  }

  // Check if we should fetch from API
  if (!YoutubeCache.shouldFetch()) {
    // If we shouldn't fetch but have no cache, show demo
    loadDemoFeed(feed);
    return;
  }

  // Update last fetch time to prevent repeated failed calls
  YOUTUBE_CACHE.lastFetch = Date.now();

  // Show skeletons
  feed.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const sk = document.createElement('div');
    sk.className = 'yt-skeleton' + (i % 3 === 0 ? ' long' : '');
    feed.appendChild(sk);
  }

  // Use demo mode if no API key
  if (!CONFIG.youtube.apiKey || CONFIG.youtube.apiKey === 'YOUR_YOUTUBE_API_KEY') {
    loadDemoFeed(feed);
    return;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CONFIG.youtube.channelId}&maxResults=10&order=date&type=video&key=${CONFIG.youtube.apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      loadDemoFeed(feed);
      return;
    }

    // Get video details
    const ids = data.items.map(i => i.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${ids}&key=${CONFIG.youtube.apiKey}`;
    const detRes = await fetch(detailsUrl);
    const detData = await detRes.json();

    // Process and cache the videos
    const videos = detData.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
      isShort: isShortVideo(video.contentDetails.duration)
    }));

    // Cache the results
    YoutubeCache.set({ videos });

    // Render the feed
    renderYoutubeFeed(feed, videos);

  } catch (err) {
    console.warn('YouTube API error, using demo mode:', err);
    loadDemoFeed(feed);
  }
}

// Helper function to render YouTube feed from data
function renderYoutubeFeed(feed, videos) {
  feed.innerHTML = '';

  videos.forEach(video => {
    const card = createVideoCard(
      video.id,
      video.title,
      video.thumbnail,
      video.isShort
    );
    feed.appendChild(card);
  });

  feed.appendChild(createFindMore());
}

function isShortVideo(duration) {
  // ISO 8601 duration — shorts are < 60s
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return false;
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  const total = h * 3600 + m * 60 + s;
  return total <= 62;
}

function createVideoCard(videoId, title, thumb, isShort) {
  const card = document.createElement('a');
  card.className = 'yt-card ' + (isShort ? 'short' : 'long');
  card.href = `https://www.youtube.com/watch?v=${videoId}`;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';

  card.innerHTML = `
    ${thumb ? `<img class="yt-card-bg" src="${thumb}" alt="${title}" loading="lazy">` : '<div class="yt-card-bg"></div>'}
    <div class="yt-card-play">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5,3 19,12 5,21 5,3"/>
      </svg>
    </div>
    <div class="yt-card-info">
      <div class="yt-card-title">${title}</div>
    </div>
  `;
  return card;
}

function createFindMore() {
  const el = document.createElement('a');
  el.className = 'yt-find-more';
  el.href = CONFIG.links.youtube;
  el.target = '_blank';
  el.rel = 'noopener noreferrer';
  el.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="5,3 19,12 5,21 5,3"/>
    </svg>
    <span>Find more</span>
  `;
  return el;
}

function loadDemoFeed(feed) {
  feed.innerHTML = '';
  const demos = [
    { id: 'demo1', title: 'Building a Medieval Watermill | Day 14', isShort: false },
    { id: 'demo2', title: 'Minecraft but every block is GRASS', isShort: true },
    { id: 'demo3', title: 'Medieval Blacksmith Build | Day 21', isShort: false },
    { id: 'demo4', title: 'POV: touching grass in Minecraft', isShort: true },
    { id: 'demo5', title: 'I built a WHOLE library in one day', isShort: false },
    { id: 'demo6', title: 'Villager reaction to my build', isShort: true },
    { id: 'demo7', title: 'The most satisfying build I\'ve made', isShort: false },
  ];

  demos.forEach(d => {
    const card = document.createElement('a');
    card.className = 'yt-card ' + (d.isShort ? 'short' : 'long');
    card.href = CONFIG.links.youtube;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.innerHTML = `
      <div class="yt-card-bg"></div>
      <div class="yt-card-play">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5,3 19,12 5,21 5,3"/>
        </svg>
      </div>
      <div class="yt-card-info">
        <div class="yt-card-title">${d.title}</div>
      </div>
    `;
    feed.appendChild(card);
  });

  feed.appendChild(createFindMore());
}

// ============================================================
// BUILDS CAROUSEL
// ============================================================
let buildsData = [];
let currentBuild = 0;
let buildsTimer = null;
let buildsHovered = false;

function initBuildsCarousel() {
  if (typeof getTodayBuilds !== 'function') return;
  buildsData = getTodayBuilds();

  const container = document.getElementById('builds-entries');
  const dotsContainer = document.getElementById('builds-dots');
  if (!container || !dotsContainer) return;

  // Render entries
  container.innerHTML = '';
  dotsContainer.innerHTML = '';

  buildsData.forEach((build, i) => {
    const entry = document.createElement('div');
    entry.className = 'build-entry' + (i === 0 ? ' active' : '');
    entry.innerHTML = `
      <div class="build-day">${build.day}</div>
      <div class="build-title">${build.title}</div>
      <div class="build-subtitle">${build.subtitle}</div>
      <p class="build-body">${build.body}</p>
    `;
    container.appendChild(entry);

    const dot = document.createElement('div');
    dot.className = 'builds-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToBuild(i));
    dotsContainer.appendChild(dot);
  });

  // Update image
  updateBuildImage(0);

  // Auto cycle
  startBuildsTimer();

  // Pause on hover
  const buildsEl = document.getElementById('builds-container');
  if (buildsEl) {
    buildsEl.addEventListener('mouseenter', () => {
      buildsHovered = true;
      clearInterval(buildsTimer);
    });
    buildsEl.addEventListener('mouseleave', () => {
      buildsHovered = false;
      startBuildsTimer();
    });
  }
}

function goToBuild(index) {
  const entries = document.querySelectorAll('.build-entry');
  const dots = document.querySelectorAll('.builds-dot');
  entries.forEach(e => e.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  entries[index]?.classList.add('active');
  dots[index]?.classList.add('active');
  currentBuild = index;
  updateBuildImage(index);
}

function updateBuildImage(index) {
  const imgEl = document.getElementById('builds-img');
  const placeholderEl = document.getElementById('builds-placeholder');
  const build = buildsData[index];
  if (!build) return;

  if (imgEl) {
    imgEl.src = build.image;
    imgEl.alt = build.title;
    imgEl.onerror = () => {
      imgEl.style.display = 'none';
      if (placeholderEl) placeholderEl.style.display = 'flex';
    };
    imgEl.onload = () => {
      imgEl.style.display = 'block';
      if (placeholderEl) placeholderEl.style.display = 'none';
    };
  }
}

function startBuildsTimer() {
  buildsTimer = setInterval(() => {
    if (!buildsHovered && buildsData.length > 0) {
      const next = (currentBuild + 1) % buildsData.length;
      goToBuild(next);
    }
  }, 4000);
}

// ============================================================
// HERO BUTTONS
// ============================================================
function initHeroButtons() {
  const suggestBtn = document.getElementById('btn-suggest');
  const moreBtn = document.getElementById('btn-more');

  if (suggestBtn) {
    suggestBtn.addEventListener('click', () => {
      document.getElementById('section-contact')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      document.getElementById('section-media')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// ============================================================
// HOME CARDS NAVIGATION
// ============================================================
function initHomeCards() {
  const potatoCard = document.getElementById('btn-learn-more-potato');
  const aboutCard = document.getElementById('btn-learn-more-about');

  if (potatoCard) {
    potatoCard.addEventListener('click', () => navigateTo('potato'));
  }

  if (aboutCard) {
    aboutCard.addEventListener('click', () => navigateTo('about'));
  }
}

// ============================================================
// GRADIENT MOUSE EFFECTS
// ============================================================
function initGradientMouseEffects() {
  const cards = document.querySelectorAll('.project-card--primary, .hero-card, .builds-container');
  const cols = 10;
  const cardData = new Map();
  
  function createGrid(card) {
    const rect = card.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    
    // Remove old grid if exists
    const oldGrid = card.querySelector('.pixel-grid');
    if (oldGrid) oldGrid.remove();
    
    const grid = document.createElement('div');
    grid.className = 'pixel-grid';
    
    const cellWidth = rect.width / cols;
    const rows = Math.ceil(rect.height / cellWidth);
    const totalCells = cols * rows;
    
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.dataset.index = i;
      cell.style.transition = 'background 0.3s ease-out';
      grid.appendChild(cell);
    }
    card.appendChild(grid);
    
    cardData.set(card, {
      grid,
      cells: grid.querySelectorAll('div'),
      rows,
      created: true,
      isHovered: false,
      idleTargets: [],
      mouseX: 50,
      mouseY: 50,
      targetX: 50,
      targetY: 50,
      cellBrightness: new Array(totalCells).fill(0.35) // Track individual cell brightness for trail effect
    });
    return true;
  }
  
  // Idle animation - ripple effect
  function updateIdleAnimation(card) {
    const data = cardData.get(card);
    if (!data || !data.created) return;
    
    const time = Date.now() * 0.001; // Time in seconds
    const { cells, rows } = data;
    const rect = card.getBoundingClientRect();
    const cellWidth = rect.width / cols;
    const cellHeight = cellWidth;
    
    // Center of the card
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    cells.forEach((cell, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cellCenterX = (col + 0.5) * cellWidth;
      const cellCenterY = (row + 0.5) * cellHeight;
      
      // Distance from center
      const distFromCenter = Math.sqrt(
        Math.pow(cellCenterX - centerX, 2) + 
        Math.pow(cellCenterY - centerY, 2)
      );
      
      // Ripple effect: sine wave based on distance and time
      const rippleSpeed = 150; // pixels per second
      const ripplePhase = (distFromCenter / rippleSpeed - time * 0.5) * Math.PI * 2;
      const ripple = Math.sin(ripplePhase) * 0.5 + 0.5; // 0 to 1
      
      // Smooth easing for softer ripples
      const smoothRipple = ripple * ripple * (3 - 2 * ripple); // smoothstep
      
      // Brightness range: 0 to 0.20
      const baseBrightness = smoothRipple * 0.20;
      
      // Store idle brightness for combination with mouse effect
      cell.dataset.idleBrightness = baseBrightness;
      
      // Only apply if not currently being affected by mouse
      if (!data.isHovered) {
        cell.style.background = `rgba(0, 0, 0, ${baseBrightness})`;
      }
    });
  }
  
  // Smooth mouse reaction with trail effect
  function updateMouseReaction(card) {
    const data = cardData.get(card);
    if (!data || !data.created) return;
    
    // Smoothly interpolate current position to target
    const smoothFactor = 0.15;
    data.mouseX += (data.targetX - data.mouseX) * smoothFactor;
    data.mouseY += (data.targetY - data.mouseY) * smoothFactor;
    
    const { cells, rows, cellBrightness } = data;
    const rect = card.getBoundingClientRect();
    const cellWidth = rect.width / cols;
    const cellHeight = cellWidth;
    
    cells.forEach((cell, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cellCenterX = (col + 0.5) * cellWidth;
      const cellCenterY = (row + 0.5) * cellHeight;
      
      const mouseX = (data.mouseX / 100) * rect.width;
      const mouseY = (data.mouseY / 100) * rect.height;
      
      const dist = Math.sqrt(
        Math.pow(mouseX - cellCenterX, 2) + 
        Math.pow(mouseY - cellCenterY, 2)
      );
      
      const maxDist = Math.max(rect.width, rect.height) * 0.4;
      
      // Calculate target brightness based on mouse proximity
      let targetBrightness;
      if (data.isHovered) {
        targetBrightness = Math.max(0.10, 0.35 - (1 - Math.min(dist / maxDist, 1)) * 0.25);
      } else {
        // When not hovered, decay to idle brightness
        const idleBrightness = parseFloat(cell.dataset.idleBrightness || 0.35);
        targetBrightness = idleBrightness;
      }
      
      // Smoothly decay current brightness toward target (trail effect)
      const decayFactor = data.isHovered ? 0.3 : 0.05;
      cellBrightness[index] += (targetBrightness - cellBrightness[index]) * decayFactor;
      
      cell.style.background = `rgba(0, 0, 0, ${cellBrightness[index]})`;
    });
    
    card.style.setProperty('--mouse-x', data.mouseX + '%');
    card.style.setProperty('--mouse-y', data.mouseY + '%');
  }
  
  // Create grids for all visible cards immediately
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      createGrid(card);
    }
    
    // Setup mouse events
    card.addEventListener('mousemove', (e) => {
      const data = cardData.get(card);
      if (!data || !data.created) {
        if (!createGrid(card)) return;
      }
      
      data.isHovered = true;
      const rect = card.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      data.targetX = (mouseX / rect.width) * 100;
      data.targetY = (mouseY / rect.height) * 100;
    });
    
    card.addEventListener('mouseleave', () => {
      const data = cardData.get(card);
      if (data) {
        data.isHovered = false;
        // Let the animation loop handle decay to idle brightness
      }
    });
  });
  
  // Start continuous animation loop for both idle and mouse effects
  function animationLoop() {
    cards.forEach(card => {
      const data = cardData.get(card);
      if (data && data.created) {
        // Always run idle animation for pulse effect
        updateIdleAnimation(card);
        // Run mouse reaction for trail effect (works even when not hovered for decay)
        updateMouseReaction(card);
      }
    });
    requestAnimationFrame(animationLoop);
  }
  
  // Start the animation loop
  animationLoop();
  
  // Recreate grid on resize
  const resizeObserver = new ResizeObserver(() => {
    cards.forEach(card => {
      const data = cardData.get(card);
      if (data && data.created) {
        createGrid(card);
      }
    });
    resizeObserver.observe(card);
  });
  
  // Create grids when cards become visible (page switches)
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const data = cardData.get(card);
        if (!data || !data.created) {
          createGrid(card);
        }
      }
    });
  }, { threshold: 0.1 });
  
  cards.forEach(card => visibilityObserver.observe(card));
}

// ============================================================
// KEYBOARD NAVIGATION
// ============================================================
function initKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    // Only navigate with arrow keys if not in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    const currentIndex = PAGE_ORDER.indexOf(currentPage);
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : PAGE_ORDER.length - 1;
      navigateTo(PAGE_ORDER[prevIndex]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = currentIndex < PAGE_ORDER.length - 1 ? currentIndex + 1 : 0;
      navigateTo(PAGE_ORDER[nextIndex]);
    }
  });
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  initNav();
  initKeyboardNav();
  
  // Ensure home page is visible immediately
  const homePage = document.getElementById('page-home');
  if (homePage) {
    homePage.style.display = 'block';
    homePage.classList.add('active');
    currentPage = 'home';
    setTimeout(triggerReveals, 100);
  }
  
  initHeroButtons();
  initHomeCards();
  initGradientMouseEffects();

  // Initialize potato page content when active
  const observer = new MutationObserver(() => {
    const potatoPage = document.getElementById('page-potato');
    if (potatoPage?.classList.contains('active')) {
      loadYoutubeFeed();
      initBuildsCarousel();
    }
    
    const aboutPage = document.getElementById('page-about');
    if (aboutPage?.classList.contains('active')) {
      initMatrix();
    }
  });

  const potatoPage = document.getElementById('page-potato');
  if (potatoPage) {
    observer.observe(potatoPage, { attributes: true, attributeFilter: ['class'] });
  }

  const aboutPage = document.getElementById('page-about');
  if (aboutPage) {
    observer.observe(aboutPage, { attributes: true, attributeFilter: ['class'] });
  }

  // Hash navigation
  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#', '');
    if (hash && PAGE_ACCENTS[hash]) navigateTo(hash);
  });

  if (location.hash) {
    const hash = location.hash.replace('#', '');
    if (PAGE_ACCENTS[hash]) navigateTo(hash);
  }

  // Matrix animation (Nothing Design style)
  let matrixIntervalId = null;

  const initMatrix = () => {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    const computed = getComputedStyle(document.body);
    
    // Get colors from CSS variables
    const textColor = computed.getPropertyValue('--text-secondary').trim() || 'rgba(255,255,255,0.5)';
    const accentColor = PAGE_ACCENTS.about || '#b87333';
    const bgColor = computed.getPropertyValue('--bg-elevated').trim() || '#1a1a1a';
    
    // Nothing Design character set - hex + katakana
    const chars = '0123456789ABCDEFGHIJKLMNOP';
    const colWidth = 14; // horizontal spacing (matches font size for proper aspect ratio)
    const fontSize = 14; // Bigger text
    let columns;
    let drops;

    const resetDrops = () => {
      columns = Math.floor(canvas.width / colWidth);
      drops = new Array(columns).fill(1);
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
      // Set CSS dimensions to match internal resolution to prevent stretching
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
      resetDrops();
    };
    resize();
    window.addEventListener('resize', resize);
    // Delayed resize to ensure parent has final dimensions after layout settles
    setTimeout(resize, 100);
    setTimeout(resize, 500);

    const draw = () => {
      // Fade effect with bg-elevated color (the card background we removed)
      ctx.fillStyle = bgColor + '44'; // more opaque for visible letter backgrounds
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        // Mix of text color and accent
        const isAccent = Math.random() > 0.7;
        ctx.fillStyle = isAccent ? accentColor : textColor;
        ctx.font = `${fontSize}px "Space Mono", monospace`;

        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * colWidth, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    // Adjust for resize
    const adjustColumns = () => {
      columns = Math.floor(canvas.width / colWidth);
      const newDrops = new Array(columns).fill(1);
      for (let i = 0; i < Math.min(drops.length, columns); i++) {
        newDrops[i] = drops[i];
      }
      drops = newDrops;
    };
    window.addEventListener('resize', adjustColumns);

    // Start immediately
    if (matrixIntervalId) clearInterval(matrixIntervalId);
    matrixIntervalId = setInterval(draw, 60);

    // Pause when page not visible (not just canvas)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(matrixIntervalId);
        matrixIntervalId = null;
      } else {
        if (!matrixIntervalId) matrixIntervalId = setInterval(draw, 60);
      }
    });

    // Draw initial frame immediately
    draw();
  };

  // AKA toggle functionality
  const akaToggle = document.getElementById('aka-toggle');
  const akaExpanded = document.getElementById('aka-expanded');
  const namesCard = document.getElementById('names-card');

  if (akaToggle && akaExpanded && namesCard) {
    akaToggle.addEventListener('click', () => {
      akaToggle.classList.toggle('expanded');
      akaExpanded.classList.toggle('visible');
      namesCard.classList.toggle('expanded');
    });
  }
});
