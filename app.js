// =========================================================
// KASARIAN — interactions
// All motion respects prefers-reduced-motion.
// =========================================================
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

// ---- Era navigator: jump to a timeline entry + highlight it ----
const eraButtons = document.querySelectorAll('.era-nav button');
const eraEntries = document.querySelectorAll('#timeline .entry');

eraButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.getAttribute('data-era'), 10);
    const entry = eraEntries[idx];
    if (!entry) return;
    entry.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    entry.classList.remove('flash');
    // restart the highlight animation
    void entry.offsetWidth;
    entry.classList.add('flash');
    eraButtons.forEach(b => b.classList.toggle('current', b === btn));
  });
});

// Mark era button as current when its entry is in view
if (eraEntries.length && eraButtons.length) {
  const eraObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(eraEntries).indexOf(entry.target);
        eraButtons.forEach((b, i) => b.classList.toggle('current', i === idx));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  eraEntries.forEach(e => eraObserver.observe(e));
}

// ---- Staggered reveal delays inside grids ----
document.querySelectorAll('.stat-grid, .gallery, .team-grid, .voices-grid, .flip-grid').forEach(group => {
  group.querySelectorAll('.reveal').forEach((item, i) => {
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

// ---- Split bar animation on reveal ----
const splitWrap = document.querySelector('.split-bar-wrap');
if (splitWrap) {
  const splitObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        splitWrap.classList.add('split-bar-anim');
        splitObserver.unobserve(splitWrap);
      }
    });
  }, { threshold: 0.5 });
  splitObserver.observe(splitWrap);
}

// ---- Count-up stat figures ----
function animateFigure(el) {
  const raw = el.getAttribute('data-value');
  const match = raw.match(/^([\d.]+)(.*)$/);
  if (!match) { el.textContent = raw; return; }

  const target = parseFloat(match[1]);
  const suffix = match[2];
  const decimals = match[1].includes('.') ? 1 : 0;

  if (prefersReducedMotion) { el.textContent = raw; return; }

  const duration = 1300;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = raw;
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

// ---- Laws accordion ----
document.querySelectorAll('.law-item').forEach(item => {
  const toggle = item.querySelector('.law-toggle');
  const panel = item.querySelector('.law-panel');
  toggle.addEventListener('click', () => {
    const isOpen = item.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : '0px';
    // close siblings for a clean single-open accordion
    if (isOpen) {
      document.querySelectorAll('.law-item').forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          other.querySelector('.law-toggle').setAttribute('aria-expanded', 'false');
          other.querySelector('.law-panel').style.maxHeight = '0px';
        }
      });
    }
  });
});

// ---- Myth / Fact flip cards ----
document.querySelectorAll('.flip-card').forEach(card => {
  const toggle = () => {
    card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', card.classList.contains('flipped'));
  };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
});

// ---- Quiz ----
(function initQuiz() {
  const quizData = [
    {
      q: 'Bago dumating ang mga Espanyol, sino ang mga pinunong espirituwal at tagapagpagaling ng maraming komunidad?',
      opts: ['Ang Datu', 'Ang Babaylan', 'Ang Principalia', 'Ang Ilustrado'],
      answer: 1,
      why: 'Ang babaylan ang tagapag-ingat ng kaalaman sa pagpapagaling, agrikultura, at siyensya — at kadalasang kababaihan.'
    },
    {
      q: 'Ilang babae ang bumoto ng OO sa plebisito ng 1937 na nagbigay sa kanila ng karapatang bumoto?',
      opts: ['44,307', 'Eksaktong 300,000', '447,725', '1,000,000'],
      answer: 2,
      why: '447,725 na OO laban sa 44,307 na HINDI — halos doble sa kinakailangang 300,000.'
    },
    {
      q: 'Ang GABRIELA, isa sa pinakamalaking alyansa ng kababaihan sa bansa, ay pinangalanan kay...',
      opts: ['Gabriela Silang', 'Maria Clara', 'Tandang Sora', 'Corazon Aquino'],
      answer: 0,
      why: 'Si Gabriela Silang ang namuno ng rebolusyon sa Ilocos noong 1763 matapos mapatay ang kaniyang asawa.'
    },
    {
      q: 'Alin sa mga batas na ito ang HINDI PA napapasa hanggang ngayon?',
      opts: ['Magna Carta of Women (2009)', 'Anti-VAWC Act (2004)', 'SOGIE Equality Bill', 'RH Act (2012)'],
      answer: 2,
      why: 'Unang inihain noong 2000, ang SOGIE Equality Bill ay paulit-ulit na naisasaulo sa bawat Kongreso — ngunit hindi pa batas.'
    },
    {
      q: 'Ayon sa World Economic Forum (2025), anong ranggo ng Pilipinas sa Global Gender Gap Index?',
      opts: ['1st', '20th', '50th', '100th'],
      answer: 1,
      why: 'Ika-20 sa 148 bansa — ang pinakamataas sa Asya, ngunit may malalim na agwat pa rin sa trabaho at pulitika.'
    }
  ];

  const live = document.getElementById('quizLive');
  const result = document.getElementById('quizResult');
  if (!live || !result) return;

  const qEl = document.getElementById('quizQ');
  const optsEl = document.getElementById('quizOpts');
  const feedbackEl = document.getElementById('quizFeedback');
  const countEl = document.getElementById('quizCount');
  const fillEl = document.getElementById('quizFill');
  const nextBtn = document.getElementById('quizNext');
  const restartBtn = document.getElementById('quizRestart');
  const againBtn = document.getElementById('quizAgain');
  const scoreEl = document.getElementById('quizScore');
  const verdictEl = document.getElementById('quizVerdict');

  let current = 0;
  let score = 0;
  let answered = false;

  function renderQuestion() {
    answered = false;
    const item = quizData[current];
    qEl.textContent = item.q;
    countEl.textContent = 'Tanong ' + (current + 1) + ' ng ' + quizData.length;
    fillEl.style.width = ((current / quizData.length) * 100) + '%';
    feedbackEl.textContent = '';
    feedbackEl.className = 'quiz-feedback';
    nextBtn.disabled = true;

    optsEl.innerHTML = '';
    item.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.type = 'button';
      btn.textContent = opt;
      btn.addEventListener('click', () => answer(btn, i));
      optsEl.appendChild(btn);
    });
  }

  function answer(btn, i) {
    if (answered) return;
    answered = true;
    const item = quizData[current];
    const buttons = optsEl.querySelectorAll('.quiz-opt');

    buttons.forEach((b, bi) => {
      b.disabled = true;
      if (bi === item.answer) b.classList.add('correct');
    });

    if (i === item.answer) {
      score++;
      feedbackEl.textContent = 'Tama! ' + item.why;
      feedbackEl.className = 'quiz-feedback good';
    } else {
      btn.classList.add('wrong');
      feedbackEl.textContent = 'Hindi. ' + item.why;
      feedbackEl.className = 'quiz-feedback bad';
    }

    fillEl.style.width = (((current + 1) / quizData.length) * 100) + '%';
    nextBtn.disabled = false;
    nextBtn.textContent = current === quizData.length - 1 ? 'Tingnan ang iskor' : 'Susunod na tanong';
  }

  nextBtn.addEventListener('click', () => {
    if (current === quizData.length - 1) {
      scoreEl.innerHTML = score + '<small> / ' + quizData.length + '</small>';
      let verdict;
      if (score === quizData.length) verdict = 'Perpekto! Alam na alam mo ang kasaysayan at katotohanan ng kasarian sa Pilipinas.';
      else if (score >= 3) verdict = 'Magaling! Malakas ang pundasyon mo — balikan ang timeline para sa mga detalye.';
      else verdict = 'Simula pa lang ito. Ikot muli sa site — lahat ng sagot ay naririto.';
      verdictEl.textContent = verdict;
      live.classList.add('hidden');
      result.classList.remove('hidden');
    } else {
      current++;
      renderQuestion();
    }
  });

  function reset() {
    current = 0;
    score = 0;
    result.classList.add('hidden');
    live.classList.remove('hidden');
    renderQuestion();
  }

  restartBtn.addEventListener('click', reset);
  againBtn.addEventListener('click', reset);

  renderQuestion();
})();

// ---- Back to top ----
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});
