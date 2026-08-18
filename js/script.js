
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // Mobile navigation
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? '×' : '☰';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        // If clicking a dropdown toggle, don't close the menu
        const dropdown = link.closest('.nav-dropdown');
        if (dropdown && link === dropdown.querySelector('a')) {
          e.preventDefault();
          dropdown.classList.toggle('active');
          return;
        }

        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.textContent = '☰';
      });
    });
  }

  // Active page navigation
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('active');
  });

  // Reveal-on-scroll
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  // Animated statistics
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        
        // Optional: remove dataset.done check if you want it to recount every time it enters view
        if (entry.target.dataset.done) return;
        entry.target.dataset.done = 'true';

        const target = Number(entry.target.dataset.count || 0);
        const suffix = entry.target.dataset.suffix || '+';
        const duration = 2000; // Increased duration for better effect
        let start = null;

        const tick = now => {
          if (!start) start = now;
          const progress = Math.min((now - start) / duration, 1);
          // Ease out expo
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          entry.target.textContent = Math.floor(target * eased) + suffix;
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            entry.target.textContent = target + suffix;
          }
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.1 }); // Lowered threshold so it triggers earlier

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // Product filtering
  const filters = document.querySelectorAll('.filter');
  const products = document.querySelectorAll('[data-category]');

  if (filters.length && products.length) {
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');

        const category = filter.dataset.filter;
        products.forEach(product => {
          const show = category === 'all' || product.dataset.category === category;
          product.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // Product details modal
  const modal = document.querySelector('.modal');
  const modalTitle = document.querySelector('[data-modal-title]');
  const modalDescription = document.querySelector('[data-modal-description]');
  const modalSpecs = document.querySelector('[data-modal-specs]');

  const productData = {
    'CNC Precision Machine': {
      description: 'High-accuracy production equipment designed for repeatable machining and demanding industrial workflows.',
      specs: [['Application', 'Precision machining'], ['Control', 'CNC / PLC'], ['Build', 'Heavy duty'], ['Configuration', 'Customizable']]
    },
    'Hydraulic Press': {
      description: 'Robust hydraulic pressing equipment engineered for controlled force, repeatability and long service life.',
      specs: [['Capacity', 'Up to 500 Ton'], ['Operation', 'Hydraulic'], ['Control', 'PLC'], ['Application', 'Industrial forming']]
    },
    'Processing System': {
      description: 'Configurable processing equipment for material preparation, movement and production-line integration.',
      specs: [['Application', 'Processing'], ['Drive', 'Industrial motor'], ['Build', 'Heavy duty'], ['Configuration', 'Modular']]
    },
    'PLC Automation Panel': {
      description: 'Industrial automation and control solution supporting PLC, HMI, sensors and machine integration.',
      specs: [['Control', 'PLC / HMI'], ['Integration', 'Sensors / drives'], ['Application', 'Automation'], ['Configuration', 'Project based']]
    },
    'Conveyor System': {
      description: 'Modular material-handling system designed for reliable movement of products and materials across industrial facilities.',
      specs: [['Type', 'Modular conveyor'], ['Application', 'Material handling'], ['Drive', 'Electric'], ['Configuration', 'Custom length']]
    },
    'Industrial Gearbox': {
      description: 'Industrial transmission equipment selected for reliable torque transfer and demanding operating environments.',
      specs: [['Application', 'Power transmission'], ['Duty', 'Industrial'], ['Configuration', 'Multiple ratios'], ['Support', 'Technical selection']]
    }
  };

  function openModal(name) {
    if (!modal) return;
    const data = productData[name] || {
      description: 'Please contact our engineering team for product specifications, configuration and availability.',
      specs: [['Application', 'Industrial'], ['Configuration', 'Custom'], ['Support', 'Technical consultation'], ['Enquiry', 'Available']]
    };

    if (modalTitle) modalTitle.textContent = name;
    if (modalDescription) modalDescription.textContent = data.description;
    if (modalSpecs) {
      modalSpecs.innerHTML = data.specs.map(item =>
        `<div class="spec"><small>${item[0]}</small><strong>${item[1]}</strong></div>`
      ).join('');
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('no-scroll');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('no-scroll');
  }

  document.querySelectorAll('[data-product]').forEach(button => {
    button.addEventListener('click', () => openModal(button.dataset.product));
  });

  document.querySelectorAll('[data-close-modal]').forEach(button => {
    button.addEventListener('click', closeModal);
  });

  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Quote form
  const form = document.querySelector('#quoteForm');
  const toast = document.querySelector('.toast');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const required = form.querySelectorAll('[required]');
      let valid = true;

      required.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#bd6d32';
          valid = false;
        }
      });

      if (!valid) {
        showToast('Please complete all required fields.');
        return;
      }

      const name = form.querySelector('[name="name"]')?.value || 'there';
      showToast(`Thank you, ${name}. Your enquiry is ready to be reviewed.`);
      form.reset();
    });
  }

  // Smooth anchor offset for fixed navbar
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const navOffset = 95;
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Small navbar shadow change while scrolling
  const nav = document.querySelector('.nav-inner');
  if (nav) {
    const updateNav = () => {
      nav.style.boxShadow = window.scrollY > 30
        ? '0 16px 45px rgba(23,25,28,.13)'
        : '0 12px 35px rgba(23,25,28,.08)';
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // Hero Auto-Slider & Typewriter effect
  const heroTitle = document.querySelector('.hero h1');
  const heroBgs = document.querySelectorAll('.hero-slider-bg .hero-bg-img');
  const heroDots = document.querySelectorAll('.hero-dot');
  
  if (heroTitle && heroBgs.length > 0) {
    const slides = [
      { text1: "Engineering solutions ", text2: "built for industry." },
      { text1: "Advanced machinery ", text2: "for modern scale." },
      { text1: "Next-gen robotics ", text2: "powering automation." }
    ];
    
    let currentSlide = 0;
    let slideTimeout;
    let animationId = 0;
    
    function playSlide(index) {
      if (index !== undefined) {
        currentSlide = index;
      }
      
      animationId++;
      const currentAnimationId = animationId;
      clearTimeout(slideTimeout);

      // Switch background and dots
      heroBgs.forEach((bg, idx) => {
        bg.classList.toggle('active', idx === currentSlide);
      });
      heroDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
      
      const { text1, text2 } = slides[currentSlide];
      
      let i = 0;
      let j = 0;
      let isPart2 = false;
      
      function render(showCursor = true) {
        const v1 = text1.substring(0, i);
        const h1 = text1.substring(i);
        const v2 = text2.substring(0, j);
        const h2 = text2.substring(j);
        
        const cursor = showCursor ? `<span style="color: var(--accent); font-weight: 400;">|</span>` : '';
        
        let html = '';
        if (!isPart2) {
          html += `${v1}${cursor}<span style="visibility: hidden; color: inherit;">${h1}</span><br>`;
          html += `<span style="visibility: hidden; color: var(--accent);">${text2}</span>`;
        } else {
          html += `${text1}<br>`;
          html += `<span style="color: var(--accent);">${v2}</span>${cursor}<span style="visibility: hidden; color: var(--accent);">${h2}</span>`;
        }
        heroTitle.innerHTML = html;
      }
      
      render(true);
      
      function typeWriter() {
        if (currentAnimationId !== animationId) return;

        if (!isPart2 && i < text1.length) {
          i++;
          render(true);
          slideTimeout = setTimeout(typeWriter, 50); 
        } else if (!isPart2 && i === text1.length) {
          isPart2 = true;
          render(true);
          slideTimeout = setTimeout(typeWriter, 300); 
        } else if (isPart2 && j < text2.length) {
          j++;
          render(true);
          slideTimeout = setTimeout(typeWriter, 50);
        } else {
          render(false); // Typing finished
          
          // Wait a bit, then move to next slide
          slideTimeout = setTimeout(() => {
            if (currentAnimationId !== animationId) return;
            currentSlide = (currentSlide + 1) % slides.length;
            playSlide();
          }, 3000); // Wait 3 seconds before next slide
        }
      }
      
      slideTimeout = setTimeout(typeWriter, 400); // Start typing shortly after slide starts
    }
    
    heroDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        playSlide(index);
      });
    });

    playSlide();
  }
});
