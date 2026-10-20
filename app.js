(function() {
  gsap.registerPlugin(ScrollTrigger);

  const heroLine1 = document.getElementById('heroLine1') || document.querySelector('.hero .line:nth-child(1)');
  const heroLine2 = document.getElementById('heroLine2') || document.querySelector('.hero .line:nth-child(2)');

  if (heroLine1 && heroLine2) {
    const prefixes = ['Lo', 'Hark', 'Alas', 'At last', 'Hear me'];
    const greetings = [
      { text: 'Hello', weight: 45 },
      { text: 'Welcome', weight: 30 },
      { text: 'Greetings', weight: 16 },
      { text: 'Hullo', weight: 8 },
      { text: 'Awaken', weight: 4 },
      { text: 'Witness', weight: 3 },
      { text: 'Hail', weight: 2 },
      { text: 'Speak', weight: 2 },
      { text: 'Arise', weight: 1 }
    ];
    const subjects = [
      { text: 'Stranger', weight: 35 },
      { text: 'Human', weight: 25 },
      { text: 'Passerby', weight: 18 },
      { text: 'Wanderer', weight: 16 },
      { text: 'Traveller', weight: 14 },
      { text: 'Seeker', weight: 10 },
      { text: 'Creature', weight: 6 },
      { text: 'Kin', weight: 5 },
      { text: 'Voyager', weight: 4 },
      { text: 'Anomaly', weight: 3 },
      { text: 'Nomad', weight: 3 },
      { text: 'Drifter', weight: 3 },
      { text: 'Entity', weight: 2 },
      { text: 'Wayfarer', weight: 2 }
    ];

    let lastGreeting = '';
    let lastSubject = '';
    try {
      lastGreeting = sessionStorage.getItem('lastGreeting') || '';
      lastSubject = sessionStorage.getItem('lastSubject') || '';
    } catch (e) {}

    function pickWeighted(pool, exclude) {
      const candidates = pool.filter(item => item.text !== exclude);
      const activePool = candidates.length > 0 ? candidates : pool;
      const totalWeight = activePool.reduce((sum, item) => sum + item.weight, 0);
      let r = Math.random() * totalWeight;
      for (const item of activePool) {
        if (r < item.weight) return item.text;
        r -= item.weight;
      }
      return activePool[0].text;
    }

    const chosenGreeting = pickWeighted(greetings, lastGreeting);
    const chosenSubject = pickWeighted(subjects, lastSubject);

    try {
      sessionStorage.setItem('lastGreeting', chosenGreeting);
      sessionStorage.setItem('lastSubject', chosenSubject);
    } catch (e) {}

    let displayGreeting = chosenGreeting;
    if (Math.random() < 0.12) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      displayGreeting = `${prefix}, ${chosenGreeting}`;
    }

    const displaySubject = chosenSubject.toLowerCase() + ',';

    function toWordsHtml(text) {
      return text.split(' ').filter(Boolean).map(word => {
        const charsHtml = word.split('').map(ch => `<span class="char">${ch}</span>`).join('');
        return `<div class="word">${charsHtml}</div>`;
      }).join('');
    }

    heroLine1.innerHTML = toWordsHtml(displayGreeting);
    heroLine2.innerHTML = toWordsHtml(displaySubject);
  }

  const world = document.getElementById('world');
  const gridBg = document.getElementById('gridBg');
  const chars = document.querySelectorAll('.char');
  
  let mouseX = -1000;
  let mouseY = -1000;
  let targetX = mouseX;
  let targetY = mouseY;
  
  // --- Canvas Grid Setup with Mouse Morphing & Accented Squares ---
  const canvas = document.getElementById('gridBg');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let cw, ch;
  
  function resizeCanvas() {
    if (!canvas) return;
    cw = window.innerWidth * 1.4;
    ch = window.innerHeight * 1.4;
    canvas.width = cw * window.devicePixelRatio;
    canvas.height = ch * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const CELL_SIZE = 60;
  const gridParallax = { x: 0, y: 0 };
  const rootStyles = getComputedStyle(document.documentElement);
  const gridAccentColor = rootStyles.getPropertyValue('--accent-dim').trim() || 'rgba(255, 77, 31, 0.06)';
  const gridLineColor = rootStyles.getPropertyValue('--line').trim() || 'rgba(237, 237, 240, 0.08)';
  
  function isAccentSquare(col, row) {
    let h = (col * 3242131 + row * 534563) ^ 0x5a3194;
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    const rand = ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    return rand < 0.04;
  }

  function getMorphedPoint(col, row, canvasMouseX, canvasMouseY) {
    let x = col * CELL_SIZE + gridParallax.x;
    let y = row * CELL_SIZE + gridParallax.y;
    
    const dx = x - canvasMouseX;
    const dy = y - canvasMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 220;
    
    if (dist < maxDist) {
      const force = Math.pow((maxDist - dist) / maxDist, 1.5) * 20; 
      const angle = Math.atan2(dy, dx);
      x += Math.cos(angle) * force;
      y += Math.sin(angle) * force;
    }
    return { x, y };
  }

  function drawGrid(canvasMouseX, canvasMouseY) {
    if (!ctx) return;
    ctx.clearRect(0, 0, cw, ch);
    
    const startCol = Math.floor(-gridParallax.x / CELL_SIZE) - 1;
    const endCol = startCol + Math.ceil(cw / CELL_SIZE) + 3;
    const startRow = Math.floor(-gridParallax.y / CELL_SIZE) - 1;
    const endRow = startRow + Math.ceil(ch / CELL_SIZE) + 3;

    // Draw accented squares
    ctx.fillStyle = gridAccentColor;
    for (let c = startCol; c < endCol; c++) {
      for (let r = startRow; r < endRow; r++) {
        if (isAccentSquare(c, r)) {
          const p1 = getMorphedPoint(c, r, canvasMouseX, canvasMouseY);
          const p2 = getMorphedPoint(c + 1, r, canvasMouseX, canvasMouseY);
          const p3 = getMorphedPoint(c + 1, r + 1, canvasMouseX, canvasMouseY);
          const p4 = getMorphedPoint(c, r + 1, canvasMouseX, canvasMouseY);
          
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Draw lines
    ctx.beginPath();
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1;
    
    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const p = getMorphedPoint(c, r, canvasMouseX, canvasMouseY);
        if (r === startRow) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
    }
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const p = getMorphedPoint(c, r, canvasMouseX, canvasMouseY);
        if (c === startCol) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
    }
    
    ctx.stroke();
  }

  let scrollProgress = 0;
  let lastScrollY = window.scrollY;
  let currentTilt = 0;
  
  // Initialize lerp targets on chars for Archivo variable morphing
  chars.forEach(char => {
    char._wdth = 100;
    char._wght = 700;
    char._scaleY = 1;
    char._skewX = 0;
  });
  
  function render() {
    // --- Scroll Physics ---
    const scrollY = window.scrollY;
    const velocity = scrollY - lastScrollY;
    lastScrollY = scrollY;
    
    // Tilt based on scroll velocity (max 15 degrees)
    const targetTilt = Math.min(Math.max(velocity * 0.25, -15), 15);
    currentTilt += (targetTilt - currentTilt) * 0.1;
    
    let tiltX = currentTilt;
    let tiltY = -currentTilt;

    if (scrollProgress < 1 / 3) {
      const p = scrollProgress / (1 / 3);
      tiltX = currentTilt;
      tiltY = -currentTilt * (1 - 0.7 * p);
    } else if (scrollProgress < 2 / 3) {
      const p = (scrollProgress - 1 / 3) / (1 / 3);
      tiltX = currentTilt;
      tiltY = currentTilt * Math.sin(p * Math.PI);
    } else {
      const p = (scrollProgress - 2 / 3) / (1 / 3);
      tiltX = currentTilt * 0.4 * (1 - p);
      tiltY = -currentTilt * (0.3 + 0.7 * p);
    }

    // --- Mouse Physics for Chars ---
    mouseX += (targetX - mouseX) * 0.15;
    mouseY += (targetY - mouseY) * 0.15;

    // --- Canvas Grid Updates (Mouse Pan, 3D Tilt, and Accurately Centered Cursor Morph) ---
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const mousePanX = (targetX - cx) * 0.015;
    const mousePanY = (targetY - cy) * 0.015;

    if (gridBg) {
      gridBg.style.transform = `translate(${mousePanX}px, ${mousePanY}px) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.25)`;
      
      const rect = gridBg.getBoundingClientRect();
      const canvasMouseX = (targetX - rect.left) * (cw / rect.width);
      const canvasMouseY = (targetY - rect.top) * (ch / rect.height);
      drawGrid(canvasMouseX, canvasMouseY);
    }
    
    chars.forEach(char => {
      const rect = char.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      const dx = targetX - cx;
      const dy = targetY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const maxDist = 350;
      
      let tWdth = 100;
      let tWght = 700;
      let tScaleY = 1;
      let tSkewX = 0;
      
      if (dist < maxDist) {
        const force = Math.pow((maxDist - dist) / maxDist, 1.5);
        
        // Shape Morphing Math for Archivo (wdth 62-125, wght 100-900)
        tWdth = 100 - (force * 38); // Squishes down to 62 width
        tWght = 700 + (force * 200); // Bulges up to 900 weight
        
        // Physical contortion
        tSkewX = (dx / maxDist) * force * -30; // Leans away from cursor
        tScaleY = 1 + (force * 0.4); // Stretches vertically
      }
      
      // Lerp for buttery smooth physics
      char._wdth += (tWdth - char._wdth) * 0.15;
      char._wght += (tWght - char._wght) * 0.15;
      char._scaleY += (tScaleY - char._scaleY) * 0.15;
      char._skewX += (tSkewX - char._skewX) * 0.15;
      
      // Apply exact shape mutations
      char.style.fontVariationSettings = `"wdth" ${char._wdth}, "wght" ${char._wght}`;
      char.style.transform = `scaleY(${char._scaleY}) skewX(${char._skewX}deg)`;
    });
    
    requestAnimationFrame(render);
  }
  
  document.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
  });
  
  requestAnimationFrame(render);

  // --- GSAP 2D CAMERA PAN & TERMINAL SEQUENCE ---
  const W = window.innerWidth;
  const H = window.innerHeight;
  const panEnd = window.innerWidth * 1.5;
  const endY = -2.25 * H;

  let isLocked = false;
  let hasExecuted = false;
  const typedTarget = document.getElementById("typedCommand");
  const hint = document.getElementById("termHint");
  const termWindow = document.getElementById("termWindow");

  // --- Scroll Indicator Controller (Show on load & after 10s idle) ---
  const scrollCue = document.getElementById("heroScrollCue");
  let idleTimeout = null;
  let isCueVisible = false;

  function showCue() {
    if (!scrollCue || isCueVisible) return;
    if (scrollProgress > 0.95) return; // Don't show at the very end of page
    isCueVisible = true;
    scrollCue.classList.remove("hidden");
    scrollCue.classList.add("visible");
  }

  function hideCue() {
    if (!scrollCue || !isCueVisible) return;
    isCueVisible = false;
    scrollCue.classList.remove("visible");
    scrollCue.classList.add("hidden");
  }

  function onUserScrollActivity() {
    hideCue();
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      showCue();
    }, 10000); // Reappear after 10 seconds of no scrolling
  }

  // Initial appearance on load (clean smooth reveal)
  setTimeout(() => {
    showCue();
  }, 800);

  window.addEventListener("scroll", onUserScrollActivity, { passive: true });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-track",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        if (isAltPathActive) return;

        scrollProgress = self.progress;

        // Hide cue when scrolling and reset 10s timer
        onUserScrollActivity();

        // Typing logic (approaching About Me: progress 0.18 to 0.30)
        const typeProg = Math.max(0, Math.min(1, (self.progress - 0.18) / 0.12));
        const text = "whoami";
        typedTarget.innerText = text.substring(0, Math.floor(typeProg * text.length));

        // Lock exactly at About Me (1/3 progress)
        if (self.progress >= 0.333 && !hasExecuted && !isLocked && self.direction === 1) {
          isLocked = true;
          const targetScroll = self.start + (self.end - self.start) * (1 / 3);
          window.scrollTo(0, targetScroll);
          
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";
          hint.style.opacity = 1;
        }
      }
    }
  });

  // --- PHASE 1: Hero (0, 0) -> About Me (-W, -H) ---
  // y moves linearly; x curves smoothly into -W (the exact prompt 1 curve!)
  tl.to(world, {
    y: -H,
    ease: "none",
    duration: 1
  }, 0);

  tl.to(world, {
    x: -W,
    ease: "sine.out",
    duration: 1
  }, 0);

  tl.to(gridParallax, {
    y: -H * 0.6,
    ease: "none",
    duration: 1
  }, 0);

  tl.to(gridParallax, {
    x: -W * 0.6,
    ease: "sine.out",
    duration: 1
  }, 0);

  // --- PHASE 2: About Me (-W, -H) -> Projects (0, -2H) ---
  // y moves linearly; x leaves About Me smoothly and curves smoothly into 0 (matching entrance curve!)
  tl.to(world, {
    y: -2 * H,
    ease: "none",
    duration: 1
  }, 1);

  tl.to(world, {
    x: 0,
    ease: "sine.inOut",
    duration: 1
  }, 1);

  tl.to(gridParallax, {
    y: -2 * H * 0.6,
    ease: "none",
    duration: 1
  }, 1);

  tl.to(gridParallax, {
    x: 0,
    ease: "sine.inOut",
    duration: 1
  }, 1);

  // --- PHASE 3: Projects (0, -2H) -> Other (-panEnd, -2.25H) ---
  // y dips slightly down then levels off; x swoops smoothly right (no sharp right!)
  tl.to(world, {
    y: endY,
    ease: "sine.out",
    duration: 1
  }, 2);

  tl.to(world, {
    x: -panEnd,
    ease: "sine.inOut",
    duration: 1
  }, 2);

  tl.to(gridParallax, {
    y: endY * 0.6,
    ease: "sine.out",
    duration: 1
  }, 2);

  tl.to(gridParallax, {
    x: -panEnd * 0.6,
    ease: "sine.inOut",
    duration: 1
  }, 2);

  // Execute About command
  function executeAbout() {
    if (hasExecuted) return;
    hasExecuted = true;
    isLocked = false;
    
    document.documentElement.style.overflow = "";
    document.body.style.overflow = ""; // Unlock scroll
    hint.style.opacity = 0;
    
    const aboutBento = document.getElementById("aboutBento");
    
    // Animate terminal away, then reveal bento
    gsap.to(termWindow, {
      scale: 0.8,
      opacity: 0,
      y: -50,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        termWindow.style.display = "none";
        aboutBento.style.display = "grid";
        
        gsap.fromTo(".bento-box", {
          scale: 0.9,
          opacity: 0,
          y: 40
        }, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.2)"
        });
        
        // Start shape cycling
        startShapeCycle();
      }
    });
  }

  // --- SHAPE CYCLING LOGIC ---
  const shapeIcons = [
    "ph-asterisk", "ph-hexagon", "ph-triangle", 
    "ph-square", "ph-diamond", "ph-star-four", "ph-circle"
  ];
  let shapeIdx = 0;
  let shapeTimer;
  const dynShape = document.getElementById("dynamicShape");
  const shapeBox = document.getElementById("shapeBox");

  function nextShape() {
    if (!dynShape) return;
    shapeIdx = (shapeIdx + 1) % shapeIcons.length;
    
    gsap.to(dynShape, {
      scale: 0,
      rotation: 90,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        shapeIcons.forEach(cls => dynShape.classList.remove(cls));
        dynShape.classList.add(shapeIcons[shapeIdx]);
        
        gsap.fromTo(dynShape, 
          { scale: 0, rotation: -90, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: "back.out(1.5)" }
        );
      }
    });
    
    resetShapeTimer();
  }

  function resetShapeTimer() {
    clearInterval(shapeTimer);
    shapeTimer = setInterval(nextShape, 2000);
  }

  function startShapeCycle() {
    resetShapeTimer();
    if (shapeBox) {
      shapeBox.addEventListener("click", nextShape);
    }
  }

  // --- ALTERNATE BRANCH CAMERA FLIGHT (m_uvex Trajectory) ---
  let isAltPathActive = false;
  let isAltTransitioning = false;
  let altPathTimeline = null;

  function enterAltPath() {
    if (isAltPathActive || isAltTransitioning) return;
    isAltPathActive = true;
    isAltTransitioning = true;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    hideCue();

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Trajectory curves out past the top-right of About Me
    const midX1 = -1.55 * w;
    const midY1 = -0.55 * h;
    const destX = -2.3 * w;
    const destY = -0.1 * h;

    if (altPathTimeline) altPathTimeline.kill();
    altPathTimeline = gsap.timeline({
      onComplete: () => {
        isAltTransitioning = false;
      }
    });

    altPathTimeline.to(world, {
      x: midX1,
      y: midY1,
      duration: 0.8,
      ease: "power2.in"
    }, 0);

    altPathTimeline.to(gridParallax, {
      x: midX1 * 0.6,
      y: midY1 * 0.6,
      duration: 0.8,
      ease: "power2.in"
    }, 0);

    altPathTimeline.to(world, {
      x: destX,
      y: destY,
      duration: 1.0,
      ease: "power2.out"
    }, 0.8);

    altPathTimeline.to(gridParallax, {
      x: destX * 0.6,
      y: destY * 0.6,
      duration: 1.0,
      ease: "power2.out"
    }, 0.8);

    altPathTimeline.fromTo(".alt-card", {
      scale: 0.9,
      opacity: 0,
      y: 30
    }, {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "back.out(1.2)"
    }, 1.1);
  }

  function exitAltPath() {
    if (!isAltPathActive || isAltTransitioning) return;
    isAltTransitioning = true;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const midX1 = -1.55 * w;
    const midY1 = -0.55 * h;
    const aboutX = -w;
    const aboutY = -h;

    if (altPathTimeline) altPathTimeline.kill();
    altPathTimeline = gsap.timeline({
      onComplete: () => {
        isAltPathActive = false;
        isAltTransitioning = false;
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    });

    altPathTimeline.to(world, {
      x: midX1,
      y: midY1,
      duration: 0.8,
      ease: "power2.in"
    }, 0);

    altPathTimeline.to(gridParallax, {
      x: midX1 * 0.6,
      y: midY1 * 0.6,
      duration: 0.8,
      ease: "power2.in"
    }, 0);

    altPathTimeline.to(world, {
      x: aboutX,
      y: aboutY,
      duration: 0.9,
      ease: "power2.out"
    }, 0.8);

    altPathTimeline.to(gridParallax, {
      x: aboutX * 0.6,
      y: aboutY * 0.6,
      duration: 0.9,
      ease: "power2.out"
    }, 0.8);
  }

  const identityTrigger = document.getElementById("identityTrigger");
  if (identityTrigger) {
    identityTrigger.addEventListener("click", () => {
      enterAltPath();
    });
  }

  const altReturnBtn = document.getElementById("altReturnBtn");
  if (altReturnBtn) {
    altReturnBtn.addEventListener("click", () => {
      exitAltPath();
    });
  }

  window.addEventListener("wheel", (e) => {
    if (isAltPathActive && !isAltTransitioning && e.deltaY < -40) {
      exitAltPath();
    }
  }, { passive: true });

  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && isAltPathActive) {
      e.preventDefault();
      exitAltPath();
    }
    if (e.key === "Enter" && isLocked) {
      e.preventDefault();
      executeAbout();
    }
  });

  if (termWindow) {
    termWindow.addEventListener("click", () => {
      if (isLocked) executeAbout();
    });
  }

})();
