// ---- Respect reduced-motion preference ----
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Scroll progress bar ----
const progressBar = document.getElementById('progressBar');
function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = percent + '%';
}
window.addEventListener('scroll', updateProgressBar, { passive: true });
updateProgressBar();

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('#navLinks a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(section => navObserver.observe(section));

// ---- Staggered reveal delays for cards inside the same grid ----
// Gives grouped items (stats, gallery, team) a slight cascade instead of popping in together.
document.querySelectorAll('.stat-grid, .gallery, .team-grid').forEach(group => {
  const items = group.querySelectorAll('.reveal');
  items.forEach((item, i) => {
    item.style.setProperty('--reveal-delay', (i * 90) + 'ms');
  });
});

// ---- Scroll reveal ----
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));
}

// ---- Count-up stat figures ----
// Parses the leading number out of values like "43.4%", "20th", "16.7M", "25+ yrs"
// and animates it, keeping the rest of the text (suffix) fixed.
function animateFigure(el) {
  const raw = el.getAttribute('data-value');
  const match = raw.match(/^([\d.]+)(.*)$/);

  if (!match) {
    el.textContent = raw;
    return;
  }

  const target = parseFloat(match[1]);
  const suffix = match[2];
  const decimals = match[1].includes('.') ? 1 : 0;

  if (prefersReducedMotion) {
    el.textContent = raw;
    return;
  }

  const duration = 1300;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = target * eased;
    el.textContent = current.toFixed(decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = raw;
    }
  }

  requestAnimationFrame(tick);
}

const figures = document.querySelectorAll('.figure[data-value], .hero-figure[data-value]');
const figureObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateFigure(entry.target);
      figureObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

figures.forEach(fig => figureObserver.observe(fig));

// ---- Back to top button ----
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});