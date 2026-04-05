/* ==========================================
   ESPAÇO AÇAÍ & GELATOS — JavaScript
   Premium Interactions & Animations
   ========================================== */

// ============ LOADING SCREEN ============
const hideLoader = () => {
  const loader = document.getElementById('loading-screen');
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
    document.documentElement.classList.remove('is-loading');
    document.body.classList.remove('is-loading');
  }
};

const windowLoadPromise = new Promise(resolve => {
  if (document.readyState === 'complete') {
    resolve();
  } else {
    window.addEventListener('load', resolve);
  }
});

const fontsLoadPromise = document.fonts ? document.fonts.ready : Promise.resolve();

Promise.all([windowLoadPromise, fontsLoadPromise]).then(() => {
  // Wait a brief moment to guarantee all browser paints are totally finished
  setTimeout(hideLoader, 200);
}).catch(() => {
  hideLoader();
});

// Fallback in case a resource hangs indefinitely
setTimeout(hideLoader, 7000);

document.addEventListener('DOMContentLoaded', () => {

  // ============ CLICK RIPPLE EFFECT (optimized: reuse pool, desktop only) ============
  const ripplePool = [];
  const MAX_RIPPLES = 3;
  for (let i = 0; i < MAX_RIPPLES; i++) {
    const r = document.createElement('div');
    r.className = 'click-ripple';
    r.style.display = 'none';
    document.body.appendChild(r);
    ripplePool.push(r);
  }
  let rippleIdx = 0;
  // Disable costly reflow-causing ripples on touch devices (mobile performance)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (!isTouchDevice) {
    document.addEventListener('click', (e) => {
      const ripple = ripplePool[rippleIdx % MAX_RIPPLES];
      rippleIdx++;
      ripple.style.display = 'none';
      // Force reflow to restart animation
      void ripple.offsetWidth;
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      ripple.style.display = '';
      ripple.style.animation = 'none';
      void ripple.offsetWidth;
      ripple.style.animation = '';
    });
  }

  // ============ HEADER SCROLL + ACTIVE NAV (consolidated, rAF-throttled) ============
  const header = document.getElementById('header');
  const headerNav = document.getElementById('header-nav');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = headerNav ? headerNav.querySelectorAll('a[href^="#"]') : [];
  
  let scrollTicking = false;

  const onScroll = () => {
    // Header effect
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active nav link
    const scrollPos = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });

    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  }, { passive: true });

  // Initial call
  onScroll();

  // ============ MOBILE MENU ============
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileLinks = mobileMenuOverlay ? mobileMenuOverlay.querySelectorAll('a') : [];

  if (mobileMenuBtn && mobileMenuOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      mobileMenuOverlay.classList.toggle('active');
      document.body.style.overflow = mobileMenuOverlay.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ============ SMOOTH SCROLL FOR ANCHOR LINKS ============
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#montar') return;
      
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const headerHeight = header.offsetHeight;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============ SCROLL REVEAL ANIMATIONS ============
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed', 'active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0,
    rootMargin: '-30px 0px 0px 0px' // FIXED: Was '1000px...' triggering all at once
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============ MENU CATEGORY FILTER ============
  const categoryBtns = document.querySelectorAll('.menu-cat-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;

      menuCards.forEach(card => {
        const cardCategory = card.dataset.category;
        
        if (category === 'todos' || cardCategory === category) {
          card.style.display = '';
          // Re-trigger animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ============ MENU SEARCH ============
  const menuSearch = document.getElementById('menu-search');

  if (menuSearch) {
    menuSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      // Reset category buttons
      categoryBtns.forEach(b => b.classList.remove('active'));
      if (query === '') {
        categoryBtns[0].classList.add('active');
      }

      menuCards.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const desc = (card.querySelector('.menu-card-desc')?.textContent || '').toLowerCase();
        
        if (name.includes(query) || desc.includes(query)) {
          card.style.display = '';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ============ STATUS DOT (Open/Closed based on time) ============
  const statusDot = document.querySelector('.status-dot');
  const headerStatus = document.getElementById('header-status');

  const checkOpenStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    
    // Open: 16:30 (990min) to 22:00 (1320min)
    const isOpen = timeInMinutes >= 990 && timeInMinutes <= 1320;
    
    if (statusDot) {
      statusDot.classList.toggle('open', isOpen);
    }
    if (headerStatus) {
      const statusText = headerStatus.querySelector('span:last-child');
      if (statusText) {
        statusText.textContent = isOpen ? 'Aberto · 16:30–22:00' : 'Fechado · 16:30–22:00';
      }
    }
  };

  checkOpenStatus();
  setInterval(checkOpenStatus, 60000);

  // ============ STATUS MODAL ON LOAD ============
  const statusOverlay = document.getElementById('status-modal-overlay');
  const statusClose = document.getElementById('status-modal-close');
  const statusOkBtn = document.getElementById('status-modal-ok');
  const statusTitle = document.getElementById('status-modal-title');
  const statusScheduleRows = document.querySelectorAll('.status-schedule-row');

  if (statusOverlay) {
    const initStatusModal = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeInMinutes = hours * 60 + minutes;
      
      // Open: 16:30 (990min) to 22:00 (1320min)
      const isOpen = timeInMinutes >= 990 && timeInMinutes <= 1320;
      
      if (isOpen) {
        statusTitle.textContent = 'Loja Aberta';
        statusTitle.className = 'status-modal-title open';
      } else {
        statusTitle.textContent = 'Loja Fechada';
        statusTitle.className = 'status-modal-title closed';
      }

      const todayIdx = now.getDay();
      statusScheduleRows.forEach(row => {
        if (parseInt(row.dataset.day) === todayIdx) {
          row.classList.add('today');
          const nameSpan = row.querySelector('.status-day-name');
          if (nameSpan && !nameSpan.textContent.includes('(Hoje)')) {
            nameSpan.textContent = nameSpan.textContent + ' (Hoje)';
          }
        }
      });

      // Show the modal
      statusOverlay.classList.add('active');
    };

    const closeStatusModal = () => {
      statusOverlay.classList.remove('active');
    };

    statusClose?.addEventListener('click', closeStatusModal);
    statusOkBtn?.addEventListener('click', closeStatusModal);
    statusOverlay.addEventListener('click', (e) => {
      if (e.target === statusOverlay) closeStatusModal();
    });

    // Run after a short delay so user sees the page load
    setTimeout(initStatusModal, 800);
  }

  // ============ PARALLAX ON HERO LEAVES — REMOVED ============
  // Parallax JS was conflicting with CSS @keyframes (floatLeaf1/2/3)
  // by overwriting transform on every scroll frame.
  // The CSS animations alone provide the intended visual effect.

  // ============ COUNTER ANIMATION (IntersectionObserver — runs once) ============
  const highlightNumbers = document.querySelectorAll('.story-highlight-number');

  if (highlightNumbers.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          highlightNumbers.forEach(el => {
            const finalText = el.textContent;
            const match = finalText.match(/(\d+)/);
            if (!match) return;
            
            const finalNum = parseInt(match[0]);
            const suffix = finalText.replace(match[0], '');
            let current = 0;
            const increment = Math.ceil(finalNum / 40);
            const duration = 1200;
            const stepTime = duration / (finalNum / increment);

            const counter = setInterval(() => {
              current += increment;
              if (current >= finalNum) {
                current = finalNum;
                clearInterval(counter);
              }
              el.textContent = current + suffix;
            }, stepTime);
          });
          observer.disconnect(); // One-shot: never runs again
        }
      });
    }, { threshold: 0.3 });

    const storySection = document.getElementById('historia');
    if (storySection) counterObserver.observe(storySection);
  }

  // ============ TILT EFFECT ON MENU CARDS (desktop only) ============
  
  if (!isTouchDevice) {
    const menuCardElements = document.querySelectorAll('.menu-card');
    menuCardElements.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -3;
        const rotateY = (x - centerX) / centerX * 3;
        
        card.style.transform = `translateY(-8px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) perspective(800px) rotateX(0) rotateY(0)';
      });
    });
  }

  // ============ AÇAÍ BUILDER ============
  const builderOverlay = document.getElementById('builder-overlay');
  const builderClose = document.getElementById('builder-close');
  const builderBtnBack = document.getElementById('builder-btn-back');
  const builderBtnNext = document.getElementById('builder-btn-next');
  const builderProgressFill = document.getElementById('builder-progress-fill');
  const builderStepLabel = document.getElementById('builder-step-label');
  const builderBody = document.getElementById('builder-body');

  if (builderOverlay) {
    let currentStep = 1;
    const totalSteps = 7;
    const orders = [];
    let currentOrder = {};
    let deliveryType = 'delivery';
    let selectedRegion = null;
    let selectedPayment = null;

    const stepLabels = {
      1: 'Escolha o formato',
      2: 'Selecione açaí e cremes',
      3: 'Gelatos (opcional)',
      4: 'Escolha as frutas',
      5: 'Complementos',
      6: 'Coberturas e caldas',
      7: 'Adicionais (opcional)',
      8: 'Resumo do pedido',
      9: 'Forma de entrega'
    };

    const stepKeys = { 1: 'formato', 2: 'acai', 3: 'gelatos', 4: 'frutas', 5: 'complementos', 6: 'coberturas', 7: 'adicionais' };

    // Open builder
    document.querySelectorAll('a[href="#montar"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        resetBuilder();
        builderOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close builder
    builderClose.addEventListener('click', () => {
      builderOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
    builderOverlay.addEventListener('click', (e) => {
      if (e.target === builderOverlay) {
        builderOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    function resetBuilder() {
      currentStep = 1;
      currentOrder = {};
      // Clear all selections
      builderBody.querySelectorAll('.builder-card.selected').forEach(c => c.classList.remove('selected'));
      const obs = document.getElementById('builder-obs');
      if (obs) obs.value = '';
      updateStepUI();
    }

    function updateStepUI() {
      // Show/hide steps
      builderBody.querySelectorAll('.builder-step').forEach(s => s.classList.remove('active'));
      const activeStep = builderBody.querySelector(`[data-builder-step="${currentStep}"]`);
      if (activeStep) activeStep.classList.add('active');

      // Progress
      const progressPct = currentStep <= 7 ? (currentStep / totalSteps) * 100 : 100;
      builderProgressFill.style.width = progressPct + '%';

      // Dots
      document.querySelectorAll('.builder-step-dot').forEach(dot => {
        const s = parseInt(dot.dataset.step);
        dot.classList.remove('active', 'done');
        if (s === currentStep && currentStep <= 7) dot.classList.add('active');
        else if (s < currentStep) dot.classList.add('done');
      });

      // Label
      builderStepLabel.textContent = stepLabels[currentStep] || '';

      // Buttons
      builderBtnBack.classList.toggle('hidden', currentStep === 1);
      builderBtnNext.classList.remove('whatsapp-btn');

      if (currentStep === 8) {
        builderBtnNext.innerHTML = 'Avançar para Entrega <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
        renderSummary();
      } else if (currentStep === 9) {
        builderBtnNext.classList.add('whatsapp-btn');
        builderBtnNext.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg> Enviar pedido pelo WhatsApp';
      } else {
        builderBtnNext.innerHTML = 'Avançar <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
      }

      // Progress bar visibility
      const progressBar = document.querySelector('.builder-progress');
      progressBar.style.display = currentStep > 7 ? 'none' : '';

      // Scroll body to top
      builderBody.scrollTop = 0;
    }

    // Card selection
    builderBody.addEventListener('click', (e) => {
      const card = e.target.closest('.builder-card');
      if (!card) return;

      const step = card.closest('.builder-step');
      if (!step) return;
      const stepNum = parseInt(step.dataset.builderStep);

      if (stepNum === 1) {
        // Single select
        step.querySelectorAll('.builder-card.selected').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      } else if (stepNum >= 2 && stepNum <= 7) {
        // Multi select
        card.classList.toggle('selected');
      }
    });

    // Region select (single)
    const regionOptions = document.getElementById('builder-region-options');
    if (regionOptions) {
      regionOptions.addEventListener('click', (e) => {
        const card = e.target.closest('.builder-card');
        if (!card) return;
        regionOptions.querySelectorAll('.builder-card.selected').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedRegion = { name: card.dataset.value, taxa: card.dataset.taxa };
      });
    }

    // Payment select (single)
    const paymentOptions = document.getElementById('builder-payment-options');
    if (paymentOptions) {
      paymentOptions.addEventListener('click', (e) => {
        const card = e.target.closest('.builder-card');
        if (!card) return;
        paymentOptions.querySelectorAll('.builder-card.selected').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedPayment = card.dataset.value;
      });
    }

    // Delivery toggle
    document.querySelectorAll('.builder-delivery-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.builder-delivery-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        deliveryType = btn.dataset.delivery;
        const deliveryFields = document.getElementById('builder-delivery-fields');
        deliveryFields.style.display = deliveryType === 'delivery' ? '' : 'none';
      });
    });

    // Next button
    builderBtnNext.addEventListener('click', () => {
      if (currentStep <= 7) {
        // Save selections
        const step = builderBody.querySelector(`[data-builder-step="${currentStep}"]`);
        const selected = [...step.querySelectorAll('.builder-card.selected')].map(c => c.dataset.value);

        if (currentStep === 1 && selected.length === 0) {
          shakeBtn(builderBtnNext);
          return;
        }

        currentOrder[stepKeys[currentStep]] = selected;

        if (currentStep === 7) {
          const obs = document.getElementById('builder-obs');
          currentOrder.observacao = obs ? obs.value.trim() : '';
          // Save and go to summary
          if (orders.length === 0 || orders[orders.length - 1]._saved) {
            orders.push({ ...currentOrder, _saved: true });
          } else {
            orders[orders.length - 1] = { ...currentOrder, _saved: true };
          }
        }

        currentStep++;
        updateStepUI();
      } else if (currentStep === 8) {
        currentStep = 9;
        updateStepUI();
      } else if (currentStep === 9) {
        sendWhatsApp();
      }
    });

    // Back button
    builderBtnBack.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });

    // Add another açaí
    document.getElementById('builder-add-another')?.addEventListener('click', () => {
      resetBuilderSelections();
      currentOrder = {};
      currentStep = 1;
      updateStepUI();
    });

    function resetBuilderSelections() {
      for (let i = 1; i <= 7; i++) {
        const step = builderBody.querySelector(`[data-builder-step="${i}"]`);
        if (step) step.querySelectorAll('.builder-card.selected').forEach(c => c.classList.remove('selected'));
      }
      const obs = document.getElementById('builder-obs');
      if (obs) obs.value = '';
    }

    function shakeBtn(btn) {
      btn.style.animation = 'shake 0.4s ease';
      btn.addEventListener('animationend', () => { btn.style.animation = ''; }, { once: true });
    }

    function renderSummary() {
      const list = document.getElementById('builder-summary-list');
      list.innerHTML = '';

      orders.forEach((order, i) => {
        const card = document.createElement('div');
        card.className = 'builder-summary-card';
        const rows = [];
        rows.push(`<div class="builder-summary-row"><span class="emoji">📦</span><span>Tamanho: <strong>${order.formato?.length ? order.formato.join(', ') : 'Nenhum'}</strong></span></div>`);
        rows.push(`<div class="builder-summary-row"><span class="emoji">🍨</span><span>Açaí: <strong>${order.acai?.length ? order.acai.join(', ') : 'Nenhum'}</strong></span></div>`);
        rows.push(`<div class="builder-summary-row"><span class="emoji">🍦</span><span>Gelatos: <strong>${order.gelatos?.length ? order.gelatos.join(', ') : 'Nenhum'}</strong></span></div>`);
        rows.push(`<div class="builder-summary-row"><span class="emoji">🍓</span><span>Frutas: <strong>${order.frutas?.length ? order.frutas.join(', ') : 'Nenhuma'}</strong></span></div>`);
        rows.push(`<div class="builder-summary-row"><span class="emoji">🍫</span><span>Complementos: <strong>${order.complementos?.length ? order.complementos.join(', ') : 'Nenhum'}</strong></span></div>`);
        rows.push(`<div class="builder-summary-row"><span class="emoji">🍫</span><span>Coberturas: <strong>${order.coberturas?.length ? order.coberturas.join(', ') : 'Nenhuma'}</strong></span></div>`);
        rows.push(`<div class="builder-summary-row"><span class="emoji">🥜</span><span>Adicionais: <strong>${order.adicionais?.length ? order.adicionais.join(', ') : 'Nenhum'}</strong></span></div>`);
        if (order.observacao) rows.push(`<div class="builder-summary-row"><span class="emoji">📝</span><span>Observação: <strong>${order.observacao}</strong></span></div>`);

        card.innerHTML = `
          <div class="builder-summary-card-header">
            <div class="builder-summary-card-title">Açaí ${i + 1} 🍧</div>
            <div class="builder-summary-card-actions">
              <button onclick="builderEditOrder(${i})">Editar</button>
              <button class="delete" onclick="builderDeleteOrder(${i})">Remover</button>
            </div>
          </div>
          ${rows.join('')}
        `;
        list.appendChild(card);
      });
    }

    // Global functions for edit/delete
    window.builderEditOrder = (index) => {
      currentOrder = { ...orders[index] };
      orders.splice(index, 1);
      // Restore selections in the UI
      resetBuilderSelections();
      Object.entries(stepKeys).forEach(([step, key]) => {
        const stepEl = builderBody.querySelector(`[data-builder-step="${step}"]`);
        if (stepEl && currentOrder[key]) {
          currentOrder[key].forEach(val => {
            const card = stepEl.querySelector(`.builder-card[data-value="${val}"]`);
            if (card) card.classList.add('selected');
          });
        }
      });
      if (currentOrder.observacao) {
        const obs = document.getElementById('builder-obs');
        if (obs) obs.value = currentOrder.observacao;
      }
      currentStep = 1;
      updateStepUI();
    };

    window.builderDeleteOrder = (index) => {
      orders.splice(index, 1);
      renderSummary();
    };

    function showToast(msg) {
      let toast = document.getElementById('custom-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'custom-toast';
        toast.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #E03131; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-family: ui-sans-serif, system-ui, sans-serif; box-shadow: 0 4px 16px rgba(224, 49, 49, 0.4); z-index: 10000; opacity: 0; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; pointer-events: none;';
        document.body.appendChild(toast);
      }
      toast.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ' + msg;
      
      requestAnimationFrame(() => {
        toast.style.top = '40px';
        toast.style.opacity = '1';
      });

      shakeBtn(builderBtnNext);

      clearTimeout(toast.timeoutId);
      toast.timeoutId = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.top = '20px';
      }, 3500);
    }

    function sendWhatsApp() {
      if (deliveryType === 'delivery') {
        if (!selectedRegion) { showToast('Selecione uma região para entrega.'); return; }
        if (!document.getElementById('b-bairro').value.trim()) { showToast('Preencha o seu bairro.'); return; }
        if (!document.getElementById('b-rua').value.trim()) { showToast('Preencha o nome da sua rua.'); return; }
        if (!document.getElementById('b-numero').value.trim()) { showToast('Preencha o número da residência.'); return; }
      }
      if (!selectedPayment) { showToast('Selecione a forma de pagamento.'); return; }

      let msg = `📋 *Resumo do seu pedido*\n`;

      orders.forEach((order, i) => {
        msg += `\n*Açaí ${i + 1}* 🍧\n`;
        msg += `📦 Tamanho: *${order.formato?.length ? order.formato.join(', ') : 'Nenhum'}*\n`;
        msg += `🍨 Açaí: *${order.acai?.length ? order.acai.join(', ') : 'Nenhum'}*\n`;
        msg += `🍦 Gelatos: *${order.gelatos?.length ? order.gelatos.join(', ') : 'Nenhum'}*\n`;
        msg += `🍓 Frutas: *${order.frutas?.length ? order.frutas.join(', ') : 'Nenhuma'}*\n`;
        msg += `🍫 Complementos: *${order.complementos?.length ? order.complementos.join(', ') : 'Nenhum'}*\n`;
        msg += `🍫 Coberturas: *${order.coberturas?.length ? order.coberturas.join(', ') : 'Nenhuma'}*\n`;
        msg += `🥜 Adicionais: *${order.adicionais?.length ? order.adicionais.join(', ') : 'Nenhum'}*\n`;
        if (order.observacao) {
          msg += `📝 Observação: *${order.observacao}*\n`;
        }
      });

      msg += `\n*Forma de entrega:* ${deliveryType === 'delivery' ? 'Delivery' : 'Retirada no Local'}\n`;

      if (deliveryType === 'delivery') {
        msg += `*Região:* ${selectedRegion.name} (Taxa: R$ ${selectedRegion.taxa})\n`;
        msg += `*Endereço de entrega:*\n`;
        msg += `Bairro: ${document.getElementById('b-bairro').value.trim()}\n`;
        msg += `Rua: ${document.getElementById('b-rua').value.trim()}\n`;
        msg += `Número: ${document.getElementById('b-numero').value.trim()}\n`;
        const comp = document.getElementById('b-complemento').value.trim();
        if (comp) msg += `Complemento: ${comp}\n`;
        const ref = document.getElementById('b-referencia').value.trim();
        if (ref) msg += `Ponto de Referência: ${ref}\n`;
      }

      msg += `\n*Forma de pagamento:* ${selectedPayment}\n`;
      msg += `\n_Aguardando pesagem para valor final._`;

      const encoded = encodeURIComponent(msg);
      window.open(`https://api.whatsapp.com/send?phone=5598985080705&text=${encoded}`, '_blank');
    }
  }

  // ============ INSTAGRAM SLIDER DRAG TO SCROLL & CONTINUOUS MARQUEE ============
  const slider = document.getElementById('instagram-slider');
  if (slider) {
    let isDown = false;
    let startX;
    let scrollLeftPos;
    let animationId;
    let sliderVisible = false;
    
    // Duplicate content using cloneNode (more efficient than innerHTML +=)
    const originalCards = [...slider.children];
    originalCards.forEach(card => {
      slider.appendChild(card.cloneNode(true));
    });

    const startAutoScroll = () => {
      // Opt-out of auto-scroll on mobile since hardware is weaker and users can swipe
      if (isTouchDevice || window.innerWidth <= 768) return;
      
      // Cancel any existing frame to prevent speed-up
      cancelAnimationFrame(animationId);
      
      const scrollStep = () => {
        if (!isDown && sliderVisible) {
          slider.scrollLeft += 1;
          
          if (slider.scrollLeft >= slider.scrollWidth / 2) {
            slider.scrollLeft = 0;
          }
        }
        // Only continue loop if slider is visible
        if (sliderVisible) {
          animationId = requestAnimationFrame(scrollStep);
        }
      };
      
      animationId = requestAnimationFrame(scrollStep);
    };

    const stopAutoScroll = () => cancelAnimationFrame(animationId);

    // Use IntersectionObserver to only run animation when visible
    const sliderObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        sliderVisible = entry.isIntersecting;
        if (sliderVisible && !isTouchDevice && window.innerWidth > 768) {
          startAutoScroll();
        } else {
          stopAutoScroll();
        }
      });
    }, { threshold: 0.1 });
    sliderObserver.observe(slider);

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      stopAutoScroll();
      slider.style.cursor = 'grabbing';
      startX = e.pageX - slider.offsetLeft;
      scrollLeftPos = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        slider.style.cursor = 'grab';
        if (sliderVisible) startAutoScroll();
      }
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.style.cursor = 'grab';
      if (sliderVisible) startAutoScroll();
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; 
      slider.scrollLeft = scrollLeftPos - walk;
    });

    // Pause on touch for mobile users
    slider.addEventListener('touchstart', stopAutoScroll, { passive: true });
    slider.addEventListener('touchend', () => { if (sliderVisible) startAutoScroll(); }, { passive: true });

    // Disable default image drag
    slider.querySelectorAll('img').forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });
  }

  // ============ CIRCULAR FAVICON GENERATOR ============
  const faviconLink = document.querySelector('link[rel="icon"]');
  if (faviconLink) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = faviconLink.href;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 128; // High resolution for crisp tab icon
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Draw circular mask
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // Fill white background in case of transparent PNG with dark logo, or to keep it clean
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      
      // Draw cropped image
      ctx.drawImage(img, 0, 0, size, size);
      
      // Update favicon
      faviconLink.href = canvas.toDataURL('image/png');
      
      // Fallback for Safari which sometimes needs a new node
      const newFavicon = document.createElement('link');
      newFavicon.id = 'dynamic-favicon';
      newFavicon.rel = 'shortcut icon';
      newFavicon.href = canvas.toDataURL('image/png');
      document.head.appendChild(newFavicon);
    };
  }

  // ============ MAPS LAZY LOAD ============
  const mapIframe = document.getElementById('visit-map-iframe');
  if (mapIframe) {
    const mapObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.src = entry.target.dataset.src;
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(mapIframe);
  }

  // ============ PRINT DEBUG INFO ============
  console.log('%c🍇 Espaço Açaí & Gelatos', 'font-size: 20px; font-weight: bold; color: #5B1A8A; text-shadow: 1px 1px 0 #2ECC40;');
  console.log('%cSite premium desenvolvido com carinho 💜', 'font-size: 12px; color: #7B2FB5;');

});
