// ============================================================
// CONFIG — Update these values
// ============================================================
const CONFIG = {
  youtube: {
    channelId: 'UCxxxxxxxxxxxxxxxxxxxxxx', // Replace with your channel ID
    apiKey: 'YOUR_YOUTUBE_API_KEY',         // Replace with your API key
    // Or set to null to use the demo/placeholder mode:
    // apiKey: null,
  },
  links: {
    youtube: 'https://www.youtube.com/@2much_potato',
    instagram: 'https://www.instagram.com/2much_potato',
    tiktok: 'https://www.tiktok.com/@2much_potato',
    discord: null, // Coming soon
    discordServer: null, // Coming soon
    email: 'mailto:2muchpotato@example.com', // Replace
    suggestBuild: 'https://www.instagram.com/2much_potato', // DM to suggest
  }
};

// ============================================================
// PAGE ACCENT COLORS per page
// ============================================================
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
  document.documentElement.style.setProperty('--page-accent', accent);

  // Scroll to top
  window.scrollTo({ top: 0 });

  // Trigger reveal animations
  setTimeout(triggerReveals, 80);
}

// ============================================================
// NAV SETUP
// ============================================================
function initNav() {
  const navCards = document.querySelectorAll('.nav-card');
  navCards.forEach(card => {
    card.addEventListener('click', () => {
      const page = card.dataset.page;
      navigateTo(page);
      rippleEffect(card, event);
    });
  });

  // Scroll shrink
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

function rippleEffect(el, e) {
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
  }
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
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
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.page.active .reveal').forEach(el => {
    observer.observe(el);
    // Force-trigger for already-visible elements
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
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

  if (!CONFIG.youtube.apiKey || CONFIG.youtube.apiKey === 'YOUR_YOUTUBE_API_KEY') {
    loadDemoFeed(feed);
    return;
  }

  try {
    // Fetch latest 10 videos
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CONFIG.youtube.channelId}&maxResults=10&order=date&type=video&key=${CONFIG.youtube.apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      loadDemoFeed(feed);
      return;
    }

    // Get video details (to determine shorts vs long)
    const ids = data.items.map(i => i.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${ids}&key=${CONFIG.youtube.apiKey}`;
    const detRes = await fetch(detailsUrl);
    const detData = await detRes.json();

    feed.innerHTML = '';

    detData.items.forEach(video => {
      const duration = video.contentDetails.duration;
      const isShort = isShortVideo(duration, video.snippet);
      const card = createVideoCard(
        video.id,
        video.snippet.title,
        video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
        isShort
      );
      feed.appendChild(card);
    });

    // Find more button
    const more = createFindMore();
    feed.appendChild(more);

  } catch (err) {
    console.warn('YouTube API error, using demo mode:', err);
    loadDemoFeed(feed);
  }
}

function isShortVideo(duration, snippet) {
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
  card.className = 'yt-video-card ' + (isShort ? 'short' : 'long');
  card.href = `https://www.youtube.com/watch?v=${videoId}`;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';

  card.innerHTML = `
    ${thumb ? `<img class="yt-thumb" src="${thumb}" alt="${title}" loading="lazy">` : ''}
    <div class="yt-play-overlay">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#333"><path d="M8 5v14l11-7z"/></svg>
    </div>
    <div class="yt-video-info">
      <div class="yt-video-title">${title}</div>
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
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.37 6.37 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.15 8.15 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/></svg>
    <span>Find more on YouTube</span>
  `;
  return el;
}

function loadDemoFeed(feed) {
  feed.innerHTML = '';
  // Demo placeholder cards
  const demos = [
    { id: 'demo1', title: 'Building a Medieval Watermill 🏗️ | Day 14', isShort: false },
    { id: 'demo2', title: 'Minecraft but every block is GRASS 😂', isShort: true },
    { id: 'demo3', title: 'Medieval Blacksmith Build | Day 21', isShort: false },
    { id: 'demo4', title: 'POV: touching grass in Minecraft', isShort: true },
    { id: 'demo5', title: 'I built a WHOLE library in one day | Day 28', isShort: false },
    { id: 'demo6', title: 'Villager reaction to my build 💀', isShort: true },
    { id: 'demo7', title: 'The most satisfying build I\'ve made | Day 35', isShort: false },
  ];

  demos.forEach(d => {
    const card = document.createElement('a');
    card.className = 'yt-video-card ' + (d.isShort ? 'short' : 'long');
    card.href = CONFIG.links.youtube;
    card.target = '_blank';
    card.style.background = d.isShort
      ? 'linear-gradient(135deg, #3d7a35, #2d5c25)'
      : 'linear-gradient(135deg, #2d5c25, #1a3a18)';
    card.innerHTML = `
      <div class="yt-play-overlay">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#333"><path d="M8 5v14l11-7z"/></svg>
      </div>
      <div class="yt-video-info">
        <div class="yt-video-title">${d.title}</div>
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
    buildsEl.addEventListener('mouseenter', () => { buildsHovered = true; clearInterval(buildsTimer); });
    buildsEl.addEventListener('mouseleave', () => { buildsHovered = false; startBuildsTimer(); });
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
  const placeholderEl = document.getElementById('builds-img-placeholder');
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
// PARALLAX on MC Skin
// ============================================================
function initParallax() {
  const hero = document.querySelector('.potato-hero-card');
  const skin = document.querySelector('.potato-skin-img');
  if (!hero || !skin) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    skin.style.transform = `translate(${dx * 18}px, ${dy * 12}px)`;
  });

  hero.addEventListener('mouseleave', () => {
    skin.style.transform = 'translate(0,0)';
  });
}

// ============================================================
// HERO BUTTON SCROLLING
// ============================================================
function initHeroScrollButtons() {
  const suggestBtn = document.getElementById('btn-suggest');
  const moreBtn = document.getElementById('btn-more');

  if (suggestBtn) {
    suggestBtn.addEventListener('click', () => {
      document.getElementById('section-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      document.getElementById('section-media')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

// Home card "Learn More" button
function initHomeCards() {
  const learnMoreBtn = document.getElementById('btn-learn-more-potato');
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => navigateTo('potato'));
  }
  const aboutBtn = document.getElementById('btn-learn-more-about');
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => navigateTo('about'));
  }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  navigateTo('home');
  initHeroScrollButtons();
  initHomeCards();

  // Load YT + builds when potato page is activated
  // (already active on first navigate if hash)
  const observer = new MutationObserver(() => {
    const potatoPage = document.getElementById('page-potato');
    if (potatoPage?.classList.contains('active')) {
      loadYoutubeFeed();
      initBuildsCarousel();
      initParallax();
    }
  });

  observer.observe(document.getElementById('page-potato'), { attributes: true, attributeFilter: ['class'] });

  // Also init if potato is default page
  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#', '');
    if (hash) navigateTo(hash);
  });

  if (location.hash) {
    navigateTo(location.hash.replace('#', ''));
  }
});
