/* ============================================================
   TravelWorld – script.js
   Features:
   · Modal management (Login / Signup / Booking / Contact)
   · Form submissions via Fetch API → Express backend
   · Smooth-scroll navigation
   · Scroll-reveal animations (IntersectionObserver)
   · Active nav-link highlighting on scroll
   · Hamburger mobile menu
   · Session / navbar state management
   · Like-button toggle
   · Toast notifications
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── DOM refs ─────────────────────────────────────────────
  const mobileMenuBtn       = document.getElementById('mobile-menu-btn');
  const navbar              = document.getElementById('navbar');
  const authButtonsContainer= document.getElementById('auth-buttons');

  // Modals
  const loginModal   = document.getElementById('login-modal');
  const signupModal  = document.getElementById('signup-modal');
  const bookingModal = document.getElementById('booking-modal');
  const contactModal = document.getElementById('contact-modal');

  // Nav modal triggers
  const loginNavBtn  = document.getElementById('login-nav-btn');
  const signupNavBtn = document.getElementById('signup-nav-btn');

  // Hero buttons
  const heroContactBtn = document.getElementById('hero-contact-btn');
  const heroBookingBtn = document.getElementById('hero-booking-btn');

  // Destination "Book Now" buttons
  const destBookBtns = document.querySelectorAll('.dest-book-btn');

  // Thailand trip card
  const thailandCard = document.querySelector('.booking-card');

  // Close buttons
  const closeLogin   = document.getElementById('close-login');
  const closeSignup  = document.getElementById('close-signup');
  const closeBooking = document.getElementById('close-booking');
  const closeContact = document.getElementById('close-contact');

  // Switch links
  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToLogin  = document.getElementById('switch-to-login');

  // Forms
  const loginForm     = document.getElementById('login-form');
  const signupForm    = document.getElementById('signup-form');
  const bookingForm   = document.getElementById('booking-form');
  const contactForm   = document.getElementById('contact-form');
  const subscribeForm = document.getElementById('subscribe-form');

  // Toast container
  const toastContainer = document.getElementById('toast-container');

  // ── Session ───────────────────────────────────────────────
  let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

  /* =========================================================
     TOAST NOTIFICATIONS
     ========================================================= */
  function showToast(message, type = 'success') {
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icon}</span><div>${message}</div>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
  }

  /* =========================================================
     MODAL HELPERS
     ========================================================= */
  function openModal(modal) {
    if (!modal) return;
    if (modal === bookingModal && currentUser) {
      const n = document.getElementById('booking-name');
      const e = document.getElementById('booking-email');
      if (n) n.value = currentUser.name;
      if (e) e.value = currentUser.email;
    }
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    // Focus first focusable element for a11y
    setTimeout(() => {
      const first = modal.querySelector('input, select, textarea, button:not(.close-btn)');
      if (first) first.focus();
    }, 150);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  // Close on backdrop click
  [loginModal, signupModal, bookingModal, contactModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  // Escape key closes active modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      [loginModal, signupModal, bookingModal, contactModal].forEach(m => {
        if (m && m.classList.contains('show')) closeModal(m);
      });
    }
  });

  /* =========================================================
     NAV / SESSION STATE
     ========================================================= */
  function updateNavbar() {
    if (currentUser) {
      authButtonsContainer.innerHTML = `
        <div class="user-menu">
          <button class="user-menu-btn">
            <span class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</span>
            <span>${currentUser.name}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="user-menu-dropdown">
            <a href="#" id="view-bookings-btn">📋 My Bookings</a>
            <a href="#" id="logout-btn">🚪 Logout</a>
          </div>
        </div>`;

      document.getElementById('logout-btn').addEventListener('click', e => {
        e.preventDefault(); logout();
      });
      document.getElementById('view-bookings-btn').addEventListener('click', async e => {
        e.preventDefault(); await fetchUserBookings();
      });
    } else {
      authButtonsContainer.innerHTML = `
        <a href="#" id="login-nav-btn">Login</a>
        <a href="#" class="sign-btn" id="signup-nav-btn">Sign Up</a>`;

      document.getElementById('login-nav-btn').addEventListener('click', e => {
        e.preventDefault(); openModal(loginModal);
      });
      document.getElementById('signup-nav-btn').addEventListener('click', e => {
        e.preventDefault(); openModal(signupModal);
      });
    }
  }

  function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateNavbar();
    showToast('Logged out successfully', 'success');
  }

  /* =========================================================
     BUTTON WIRING – Modal triggers
     ========================================================= */
  // Nav
  if (loginNavBtn)  loginNavBtn.addEventListener('click',  e => { e.preventDefault(); openModal(loginModal);  });
  if (signupNavBtn) signupNavBtn.addEventListener('click', e => { e.preventDefault(); openModal(signupModal); });

  // Hero section
  if (heroContactBtn) heroContactBtn.addEventListener('click', () => openModal(contactModal));
  if (heroBookingBtn) heroBookingBtn.addEventListener('click', () => openModal(bookingModal));

  // Destination cards "Book Now"
  destBookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const destination = btn.getAttribute('data-destination');
      const sel = document.getElementById('booking-destination');
      if (sel) sel.value = destination;
      openModal(bookingModal);
    });
  });

  // Thailand trip card
  if (thailandCard) {
    thailandCard.style.cursor = 'pointer';
    thailandCard.addEventListener('click', e => {
      if (e.target.closest('.like-btn')) return;
      const sel = document.getElementById('booking-destination');
      if (sel) sel.value = 'Thailand';
      openModal(bookingModal);
    });
  }

  // Close buttons
  if (closeLogin)   closeLogin.addEventListener('click',   () => closeModal(loginModal));
  if (closeSignup)  closeSignup.addEventListener('click',  () => closeModal(signupModal));
  if (closeBooking) closeBooking.addEventListener('click', () => closeModal(bookingModal));
  if (closeContact) closeContact.addEventListener('click', () => closeModal(contactModal));

  // Modal switcher links
  if (switchToSignup) switchToSignup.addEventListener('click', e => {
    e.preventDefault(); closeModal(loginModal); openModal(signupModal);
  });
  if (switchToLogin) switchToLogin.addEventListener('click', e => {
    e.preventDefault(); closeModal(signupModal); openModal(loginModal);
  });

  /* =========================================================
     MOBILE HAMBURGER MENU
     ========================================================= */
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navbar.classList.toggle('open');
      mobileMenuBtn.classList.toggle('active');
      const expanded = mobileMenuBtn.classList.contains('active');
      mobileMenuBtn.setAttribute('aria-expanded', expanded);
    });
  }

  // Close menu on nav link click
  document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('open');
      mobileMenuBtn?.classList.remove('active');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (navbar && mobileMenuBtn &&
        !navbar.contains(e.target) &&
        !mobileMenuBtn.contains(e.target) &&
        navbar.classList.contains('open')) {
      navbar.classList.remove('open');
      mobileMenuBtn.classList.remove('active');
    }
  });

  /* =========================================================
     SMOOTH SCROLL for nav anchor links
     ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerOffset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')) || 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =========================================================
     ACTIVE NAV LINK on scroll (highlight current section)
     ========================================================= */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar a[href^="#"]');

  function setActiveNavLink() {
    const headerH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')) || 80;
    let current = '';
    sections.forEach(sec => {
      if (window.pageYOffset >= sec.offsetTop - headerH - 60) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active-link');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active-link');
      }
    });
  }

  window.addEventListener('scroll', setActiveNavLink, { passive: true });

  /* =========================================================
     HEADER – shadow on scroll
     ========================================================= */
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  /* =========================================================
     SCROLL-REVEAL ANIMATIONS (IntersectionObserver)
     ========================================================= */
  const revealElements = document.querySelectorAll(
    '.service-card, .destination-card, .step-item, .booking-card, ' +
    '.section-title, .hero-content, .hero-image, .newsletter-container, ' +
    '.footer-brand, .footer-links, .footer-app-store'
  );

  // Assign stagger directions based on element type
  revealElements.forEach((el, i) => {
    if (!el.dataset.reveal) {
      if (el.classList.contains('service-card') || el.classList.contains('destination-card')) {
        el.dataset.reveal = 'up';
        el.style.transitionDelay = `${(i % 4) * 0.1}s`;
      } else if (el.classList.contains('hero-content')) {
        el.dataset.reveal = 'left';
      } else if (el.classList.contains('hero-image')) {
        el.dataset.reveal = 'right';
      } else if (el.classList.contains('step-item')) {
        el.dataset.reveal = 'left';
        el.style.transitionDelay = `${(i % 3) * 0.15}s`;
      } else {
        el.dataset.reveal = 'up';
      }
    }
    el.classList.add('reveal');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => revealObserver.observe(el));

  /* =========================================================
     COUNTING ANIMATION for stats (optional future use)
     ========================================================= */
  function animateCount(el, end, duration = 1500) {
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      el.textContent = Math.floor(progress * end).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* =========================================================
     FORM SUBMISSIONS (Fetch API)
     ========================================================= */
  function setLoadingState(btn, loading) {
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Please wait…';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || btn.textContent;
    }
  }

  // 1. Register
  signupForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = signupForm.querySelector('button[type="submit"]');
    setLoadingState(btn, true);

    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateNavbar();
        closeModal(signupModal);
        signupForm.reset();
      } else {
        showToast(data.error || 'Registration failed.', 'error');
      }
    } catch {
      showToast('Network error — please try again.', 'error');
    } finally {
      setLoadingState(btn, false);
    }
  });

  // 2. Login
  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    setLoadingState(btn, true);

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateNavbar();
        closeModal(loginModal);
        loginForm.reset();
      } else {
        showToast(data.error || 'Login failed.', 'error');
      }
    } catch {
      showToast('Network error — please try again.', 'error');
    } finally {
      setLoadingState(btn, false);
    }
  });

  // 3. Contact form → POST /api/contact
  contactForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    setLoadingState(btn, true);

    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message || 'Message sent!', 'success');
        closeModal(contactModal);
        contactForm.reset();
      } else {
        showToast(data.error || 'Submission failed.', 'error');
      }
    } catch {
      showToast('Network error — please try again.', 'error');
    } finally {
      setLoadingState(btn, false);
    }
  });

  // 4. Booking form → POST /api/bookings
  bookingForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = bookingForm.querySelector('button[type="submit"]');
    setLoadingState(btn, true);

    const name        = document.getElementById('booking-name').value.trim();
    const email       = document.getElementById('booking-email').value.trim();
    const destination = document.getElementById('booking-destination').value;
    const date        = document.getElementById('booking-date').value;
    const travelers   = document.getElementById('booking-travelers').value;

    try {
      const res  = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, destination, date, travelers })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message || 'Booking confirmed! 🎉', 'success');
        closeModal(bookingModal);
        bookingForm.reset();
      } else {
        showToast(data.error || 'Booking failed.', 'error');
      }
    } catch {
      showToast('Network error — please try again.', 'error');
    } finally {
      setLoadingState(btn, false);
    }
  });

  // 5. Newsletter → POST /api/subscribe
  subscribeForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = subscribeForm.querySelector('button[type="submit"]');
    setLoadingState(btn, true);

    const email = document.getElementById('subscribe-email').value.trim();

    try {
      const res  = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');
        subscribeForm.reset();
      } else {
        showToast(data.error || 'Subscription failed.', 'error');
      }
    } catch {
      showToast('Network error — please try again.', 'error');
    } finally {
      setLoadingState(btn, false);
    }
  });

  /* =========================================================
     MY BOOKINGS (fetch and display)
     ========================================================= */
  async function fetchUserBookings() {
    try {
      const res      = await fetch(`/api/bookings?email=${encodeURIComponent(currentUser.email)}`);
      const bookings = await res.json();

      if (!res.ok) { showToast('Failed to fetch bookings.', 'error'); return; }

      if (bookings.length === 0) {
        showToast("You don't have any bookings yet.", 'info');
      } else {
        // Build a friendly popup (replace with a proper modal in production)
        const list = bookings.map(b =>
          `• ${b.destination} — ${new Date(b.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })} (${b.travelers} traveler${b.travelers > 1 ? 's' : ''})`
        ).join('\n');
        alert(`📋 Your Bookings\n\n${list}`);
      }
    } catch {
      showToast('Network error fetching bookings.', 'error');
    }
  }

  /* =========================================================
     LIKE BUTTON
     ========================================================= */
  const likeBtn = document.querySelector('.like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', e => {
      e.stopPropagation();
      likeBtn.classList.toggle('liked');
      const img = likeBtn.querySelector('img');
      if (likeBtn.classList.contains('liked')) {
        img.style.filter = 'hue-rotate(300deg) saturate(3)';
        showToast('Thailand trip added to favourites! ❤️', 'success');
      } else {
        img.style.filter = '';
        showToast('Removed from favourites.', 'info');
      }
    });
  }

  /* =========================================================
     INIT
     ========================================================= */
  updateNavbar();
  setActiveNavLink();
});
