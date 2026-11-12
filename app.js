/* Merged business portfolio interactions: theme, scenes, moods, compare, form, filters. */
(function () {
  var prefersReduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* --- Work filters --- */
  var filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        b.classList.toggle('active', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      document.querySelectorAll('[data-cat]').forEach(function (card) {
        card.classList.toggle('hidden', button.dataset.filter !== 'all' && card.dataset.cat !== button.dataset.filter);
      });
    });
  });

  /* --- Remix the mood (palettes from ChatGPT's build) --- */
  var moods = [
    ['#e9e9df', '#552b25', '#efc29e', '#d8ef70'],
    ['#e4dfec', '#463557', '#f1d5bf', '#f4b191'],
    ['#d9e6e5', '#214a43', '#e8e5b4', '#e9c563']
  ];
  var mood = 0;
  var remixBtn = document.getElementById('remix');
  if (remixBtn) {
    remixBtn.addEventListener('click', function () {
      mood = (mood + 1) % moods.length;
      var m = moods[mood];
      var playground = document.querySelector('.playground');
      if (playground) playground.style.background = m[0];
      var tile = document.querySelector('.brand-tile');
      if (tile) { tile.style.background = m[1]; tile.style.color = m[2]; }
      var phone = document.querySelector('.phone');
      if (phone) phone.style.background = m[3];
    });
  }

  /* --- Lead form -> WhatsApp --- */
  var form = document.getElementById('lead-form');
  if (form) {
    var businessInput = document.getElementById('business');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var business = businessInput.value.trim();
      if (!business) {
        businessInput.setCustomValidity('Please enter your business name.');
        businessInput.reportValidity();
        return;
      }
      var service = document.getElementById('service').value;
      var link = document.getElementById('link').value.trim();
      var message = 'Hi Vijay! I\u2019d love a free design preview.\n\nBusiness: ' + business +
        '\nLooking for: ' + service +
        (link ? '\nWebsite / Instagram: ' + link : '') +
        '\n\nWhat would you suggest for my business?';
      window.location.href = 'https://wa.me/919041961669?text=' + encodeURIComponent(message);
    });
    businessInput.addEventListener('input', function (e) { e.target.setCustomValidity(''); });
  }

  /* --- Night / day theme --- */
  var themeButton = document.getElementById('theme-toggle');
  function syncTheme() {
    var night = document.documentElement.dataset.theme === 'night';
    themeButton.setAttribute('aria-pressed', String(night));
    themeButton.setAttribute('aria-label', night ? 'Switch to day view' : 'Switch to night view');
    themeButton.innerHTML = '<span aria-hidden="true">' + (night ? '\u2600' : '\u263E') + '</span> <span class="theme-label">' + (night ? 'Day' : 'Night') + '</span>';
  }
  if (themeButton) {
    syncTheme();
    themeButton.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'night' ? 'day' : 'night';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('vijay-theme', next); } catch (e) {}
      syncTheme();
    });
  }

  /* --- Hero design-loop scenes --- */
  var scenes = document.querySelectorAll('.scene');
  var sceneDots = document.querySelectorAll('[data-scene-btn]');
  var currentScene = 0;
  var sceneTimer = null;
  var scenePaused = false;
  function showScene(i) {
    currentScene = i;
    scenes.forEach(function (s) { s.classList.toggle('active', Number(s.dataset.scene) === i); });
    sceneDots.forEach(function (d) { d.classList.toggle('active', Number(d.dataset.sceneBtn) === i); });
  }
  function startSceneTimer() {
    stopSceneTimer();
    if (prefersReduced.matches || scenePaused) return;
    sceneTimer = setInterval(function () { showScene((currentScene + 1) % scenes.length); }, 3500);
  }
  function stopSceneTimer() { if (sceneTimer) { clearInterval(sceneTimer); sceneTimer = null; } }
  if (scenes.length) {
    sceneDots.forEach(function (d) {
      d.addEventListener('click', function () { showScene(Number(d.dataset.sceneBtn)); startSceneTimer(); });
    });
    var motionButton = document.getElementById('motion-toggle');
    if (motionButton) {
      motionButton.addEventListener('click', function () {
        scenePaused = !scenePaused;
        motionButton.textContent = scenePaused ? '\u25B6' : '\u2161';
        motionButton.setAttribute('aria-label', scenePaused ? 'Play design animation' : 'Pause design animation');
        if (scenePaused) stopSceneTimer(); else startSceneTimer();
      });
    }
    var loop = document.getElementById('design-loop');
    if (loop && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) startSceneTimer(); else stopSceneTimer();
      }).observe(loop);
    }
    startSceneTimer();
  }

  /* --- Before / after comparison --- */
  var canvas = document.getElementById('compare-canvas');
  var revealInput = document.getElementById('design-reveal');
  function setComparison(value) {
    revealInput.value = value;
    canvas.style.setProperty('--reveal', value + '%');
    revealInput.setAttribute('aria-valuetext', value + ' percent ordinary design, ' + (100 - value) + ' percent redesigned');
  }
  if (canvas && revealInput) {
    revealInput.addEventListener('input', function () { setComparison(Number(revealInput.value)); });
    document.querySelectorAll('[data-compare]').forEach(function (button) {
      button.addEventListener('click', function () { setComparison(Number(button.dataset.compare)); });
    });
  }

  /* --- Reading progress + chapter nav --- */
  var chapterLinks = Array.prototype.slice.call(document.querySelectorAll('[data-chapter]'));
  var readingFrame = 0;
  function updateReading() {
    readingFrame = 0;
    var max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--reading-progress', String(max > 0 ? scrollY / max : 0));
    var current = chapterLinks[0];
    chapterLinks.forEach(function (link) {
      var section = document.getElementById(link.dataset.chapter);
      if (section && section.getBoundingClientRect().top < innerHeight * 0.35) current = link;
    });
    chapterLinks.forEach(function (link) {
      var active = link === current;
      link.classList.toggle('current', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () {
    if (!readingFrame) readingFrame = requestAnimationFrame(updateReading);
  }, { passive: true });
  updateReading();

  /* --- Scroll reveal --- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  if (!prefersReduced.matches) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight) revealObserver.observe(el);
      else el.classList.add('in');
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
  /* Reveal fallback: never leave content hidden if JS ran but IO missed */
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
  }, 2500);

  /* --- Mobile CTA hides near the contact section --- */
  var sticky = document.getElementById('mobile-cta');
  var contact = document.getElementById('contact');
  if (sticky && contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { sticky.classList.toggle('hide', entry.isIntersecting); });
    }, { threshold: 0.05 }).observe(contact);
  }

  /* --- Back to top + year --- */
  var backTop = document.getElementById('back-top');
  if (backTop) {
    backTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReduced.matches ? 'instant' : 'smooth' });
    });
  }
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
