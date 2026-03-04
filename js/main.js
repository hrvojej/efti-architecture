/* ===== Main JavaScript — eFTI Architecture Website ===== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initParticles();
  initProcessAnimation();
  initFlowAnimation();
});

/* ===== Navbar scroll effect ===== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.mobile-toggle');
  const links = document.querySelector('.nav-links');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }
}

/* ===== Scroll Reveal (Intersection Observer) ===== */
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ===== Floating Particles ===== */
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (8 + Math.random() * 12) + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.width = (2 + Math.random() * 4) + 'px';
    particle.style.height = particle.style.width;
    particle.style.opacity = 0.1 + Math.random() * 0.3;
    container.appendChild(particle);
  }
}

/* ===== Process Step Auto-Animation ===== */
function initProcessAnimation() {
  const steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  let current = 0;

  function activateStep() {
    steps.forEach(s => s.classList.remove('active'));
    steps[current].classList.add('active');
    current = (current + 1) % steps.length;
  }

  // Observe when container becomes visible
  const container = steps[0].closest('.process-steps');
  if (!container) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activateStep();
        setInterval(activateStep, 2500);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(container);
}

/* ===== Animated Flow Highlight ===== */
function initFlowAnimation() {
  const flows = document.querySelectorAll('.flow-animated');
  if (!flows.length) return;

  flows.forEach(flow => {
    const nodes = flow.querySelectorAll('.flow-node');
    if (!nodes.length) return;

    let current = 0;

    function highlightNext() {
      nodes.forEach(n => n.classList.remove('active'));
      nodes[current].classList.add('active');
      current = (current + 1) % nodes.length;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          highlightNext();
          setInterval(highlightNext, 2000);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(flow);
  });
}

/* ===== Counter Animation ===== */
function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-counter'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(current);
    }, 16);
  });
}

// Trigger counters when visible
const counterSection = document.querySelector('.stats-row');
if (counterSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(counterSection);
}
