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

// ============================================================
// ROUTER
// ============================================================
let currentPage = 'home';

function navigateTo(pageId) {
  // Deactivate all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-card').forEach(c => c.classList.remove('active'));

  // Activate target
  const page = document.getElementById('page-' + pageId);
  const navCard = document.querySelector(`.nav-card[data-page="${pageId}"]`);
  if (page) page.classList.add('active');
  if (navCard) navCard.classList.add('active');

  currentPage = pageId;

  // Update accent color
  const accent = PAGE_ACCENTS[pageId] || '#1a1a1a';
  document.documentElement.style.setProperty('--accent-current', accent);

  // Scroll to top
  window.scrollTo({ top: 0 });

  // Trigger reveal animations
  setTimeout(triggerReveals, 50);
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

  document.querySelectorAll('.page.active .reveal').forEach(el => {
    observer.observe(el);
    // Force-trigger for already-visible elements
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
    }
  });
}

// ============================================================
// YOUTUBE FEED
// ============================================================
async function loadYoutubeFeed() {
  const feed = document.getElementById('yt-feed');
  if (!feed) return;

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

    feed.innerHTML = '';

    detData.items.forEach(video => {
      const duration = video.contentDetails.duration;
      const isShort = isShortVideo(duration);
      const card = createVideoCard(
        video.id,
        video.snippet.title,
        video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
        isShort
      );
      feed.appendChild(card);
    });

    feed.appendChild(createFindMore());

  } catch (err) {
    console.warn('YouTube API error, using demo mode:', err);
    loadDemoFeed(feed);
  }
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#333"><polygon points="5 3 19 12 5 21 5 3"/></svg>
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#333"><polygon points="5 3 19 12 5 21 5 3"/></svg>
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
      grid.appendChild(cell);
    }
    card.appendChild(grid);
    
    cardData.set(card, {
      grid,
      cells: grid.querySelectorAll('div'),
      rows,
      created: true
    });
    return true;
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
      
      const currentData = cardData.get(card);
      const { cells } = currentData;
      const rect = card.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const cellWidth = rect.width / cols;
      const cellHeight = cellWidth;
      
      cells.forEach((cell, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const cellCenterX = (col + 0.5) * cellWidth;
        const cellCenterY = (row + 0.5) * cellHeight;
        
        const dist = Math.sqrt(
          Math.pow(mouseX - cellCenterX, 2) + 
          Math.pow(mouseY - cellCenterY, 2)
        );
        
        const maxDist = Math.max(rect.width, rect.height) * 0.4;
        const brightness = Math.max(0.15, 0.35 - (1 - Math.min(dist / maxDist, 1)) * 0.2);
        cell.style.background = `rgba(0, 0, 0, ${brightness})`;
      });
      
      const x = ((mouseX / rect.width) * 100);
      const y = ((mouseY / rect.height) * 100);
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
    
    card.addEventListener('mouseleave', () => {
      const data = cardData.get(card);
      if (data && data.cells.length > 0) {
        data.cells.forEach(cell => {
          cell.style.background = 'rgba(0, 0, 0, 0.35)';
        });
      }
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
    
    // Recreate grid on resize
    const resizeObserver = new ResizeObserver(() => {
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
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  navigateTo('home');
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
  });

  const potatoPage = document.getElementById('page-potato');
  if (potatoPage) {
    observer.observe(potatoPage, { attributes: true, attributeFilter: ['class'] });
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
});
