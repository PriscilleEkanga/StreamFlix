/* ==========================================================================
   StreamFlix — script.js
   Amélioration progressive : la page reste lisible et navigable sans
   JavaScript. Le script ajoute ce que le CSS ne peut pas faire seul
   (mémoriser un choix, mesurer des hauteurs, mettre à jour l'ARIA) et
   fournit des solutions de repli aux navigateurs qui ne gèrent pas encore
   les scroll-driven animations.

   1. Thèmes (défi 2)
   2. Menu mobile et menu profil
   3. Header au scroll + parallax du hero (fallbacks, défis 3 et 4)
   4. Scroll-spy, indicateur de navigation, fil d'Ariane (défi 3)
   5. Grille masonry avec animation FLIP (défi 1)
   6. Onglets de filtrage (défi 3)
   7. Apparition en cascade + skeleton screens (défi 4)
   8. Petits comportements : Ma Liste, confirmation du mot de passe
   ========================================================================== */

(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

  /* ------------------------------------------------------------------------
     1. THÈMES
     Le thème enregistré est déjà appliqué par le script inline du <head>
     (avant le premier rendu). Ici on synchronise les boutons radio et on
     mémorise chaque nouveau choix.
     ------------------------------------------------------------------------ */
  const THEME_KEY = 'streamflix-theme';

  function initThemes() {
    const radios = document.querySelectorAll('input[name="theme"]');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    const updateMetaColor = () => {
      const color = getComputedStyle(root).getPropertyValue('--theme-color').trim();
      if (metaThemeColor && color) metaThemeColor.setAttribute('content', color);
    };

    const current = root.getAttribute('data-theme') || 'dark';
    radios.forEach((radio) => {
      radio.checked = radio.value === current;
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        root.setAttribute('data-theme', radio.value);
        try {
          localStorage.setItem(THEME_KEY, radio.value);
        } catch (e) { /* navigation privée : le thème ne sera pas mémorisé */ }
        updateMetaColor();
      });
    });
    updateMetaColor();
  }

  /* ------------------------------------------------------------------------
     2. MENU MOBILE ET MENU PROFIL
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('main-menu');
    if (!toggle || !menu) return;
    const label = toggle.querySelector('.sr-only');

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation';
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()));
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (isOpen() && !event.target.closest('.main-nav')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function initProfileMenu() {
    const dropdown = document.querySelector('.profile-dropdown');
    if (!dropdown) return;

    document.addEventListener('click', (event) => {
      if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
    });
    dropdown.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && dropdown.open) {
        dropdown.open = false;
        dropdown.querySelector('summary').focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. HEADER AU SCROLL + PARALLAX (fallbacks)
     Chrome/Edge/Safari récents font tout en CSS (animation-timeline).
     Pour les autres, un seul écouteur de scroll, limité à une exécution
     par frame avec requestAnimationFrame.
     ------------------------------------------------------------------------ */
  function initScrollEffects() {
    const header = document.querySelector('.site-header');
    const hero = document.querySelector('.hero');
    const needsHeaderFallback = !CSS.supports('animation-timeline: scroll()');
    const needsParallaxFallback = !CSS.supports('animation-timeline: view()');

    // Hauteur du header exposée au CSS (scroll-padding-top des ancres)
    const measureHeader = () => {
      root.style.setProperty('--header-h', `${header.offsetHeight}px`);
    };
    measureHeader();
    window.addEventListener('resize', measureHeader);

    if (!needsHeaderFallback && !needsParallaxFallback) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (needsHeaderFallback) header.classList.toggle('is-scrolled', y > 40);
      if (needsParallaxFallback && hero && !reducedMotion.matches) {
        const progress = Math.min(1, Math.max(0, y / hero.offsetHeight));
        hero.style.setProperty('--hero-progress', progress.toFixed(3));
      }
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------------
     4. SCROLL-SPY, INDICATEUR ET FIL D'ARIANE
     IntersectionObserver surveille une fine bande au milieu de l'écran :
     la section qui la traverse devient la section "courante".
     Chaque section déclare dans son HTML le lien de menu associé (data-nav)
     et sa rubrique (data-crumb) ; le fil d'Ariane est construit à partir de
     ces attributs et du titre h2 de la section.
     ------------------------------------------------------------------------ */
  const breadcrumb = {
    list: document.getElementById('breadcrumb-list'),
    key: '',
    current: null,
  };

  function moveIndicator(container, target) {
    if (!container || !target) return;
    container.style.setProperty('--indicator-x', `${target.offsetLeft}px`);
    container.style.setProperty('--indicator-w', `${target.offsetWidth}px`);
  }

  function renderBreadcrumb(section) {
    if (!breadcrumb.list || !section) return;
    breadcrumb.current = section;

    const trail = [{ label: 'StreamFlix', href: '#main-content' }];
    const crumb = section.dataset.crumb;
    const heading = section.querySelector('h2');
    const leaf = section.dataset.crumbLeaf || (heading && heading.textContent.trim());

    if (leaf && leaf !== crumb) {
      trail.push({ label: crumb, href: section.dataset.nav });
      trail.push({ label: leaf });
    } else {
      trail.push({ label: crumb });
    }

    // On ne reconstruit la liste que si le chemin a réellement changé
    const key = trail.map((item) => item.label).join('>');
    if (key === breadcrumb.key) return;
    breadcrumb.key = key;

    const items = trail.map((item) => {
      const li = document.createElement('li');
      if (item.href) {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        li.append(a);
      } else {
        const span = document.createElement('span');
        span.setAttribute('aria-current', 'location');
        span.textContent = item.label;
        li.append(span);
      }
      return li;
    });
    breadcrumb.list.replaceChildren(...items);
  }

  function initScrollSpy() {
    const navList = document.querySelector('.nav-list');
    const links = [...document.querySelectorAll('.nav-list a')];
    const sections = [...document.querySelectorAll('main [data-nav]')];
    if (!navList || !sections.length) return;

    const setActive = (section) => {
      const href = section.dataset.nav;
      links.forEach((link) => {
        if (link.getAttribute('href') === href) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      moveIndicator(navList, navList.querySelector('[aria-current]'));
      renderBreadcrumb(section);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => observer.observe(section));

    // Les largeurs des liens changent avec la police et le point de rupture
    const refresh = () => moveIndicator(navList, navList.querySelector('[aria-current]'));
    window.addEventListener('resize', refresh);
    document.fonts.ready.then(refresh);
    refresh();
  }

  /* ------------------------------------------------------------------------
     5. GRILLE MASONRY + ANIMATION FLIP
     Simulation : chaque carte occupe "span N" rangées de 8px, N étant
     calculé d'après sa hauteur réelle.
     Animation de repositionnement (technique FLIP : First, Last, Invert,
     Play) : on mémorise la position de chaque carte, on laisse la grille se
     réorganiser, puis on anime chaque carte de son ancienne position vers la
     nouvelle avec un simple transform (fluide, calculé par le GPU).
     ------------------------------------------------------------------------ */
  function createMasonry(grid) {
    const items = [...grid.children];
    const nativeMasonry = CSS.supports('grid-template-rows', 'masonry');
    const positions = new Map();
    let initialized = false;

    function setSpans() {
      if (nativeMasonry) return;
      const rowHeight = parseFloat(getComputedStyle(grid).gridAutoRows) || 8;
      // Toutes les lectures d'abord, puis toutes les écritures : évite de
      // forcer un recalcul de la mise en page à chaque carte.
      const heights = items.map((item) => (item.hidden ? 0 : item.offsetHeight));
      items.forEach((item, i) => {
        if (!item.hidden) item.style.setProperty('--span', Math.ceil(heights[i] / rowHeight));
      });
    }

    function layout() {
      setSpans();
      const animate = initialized && !reducedMotion.matches;

      items.forEach((item) => {
        if (item.hidden) {
          positions.delete(item);
          return;
        }
        const last = { x: item.offsetLeft, y: item.offsetTop };
        const first = positions.get(item);
        positions.set(item, last);
        if (!animate) return;

        // Carte qui réapparaît (filtre) : fondu + léger zoom
        if (!first) {
          item.animate(
            [{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'none' }],
            { duration: 400, easing: EASE_OUT }
          );
          return;
        }

        const dx = first.x - last.x;
        const dy = first.y - last.y;
        if (!dx && !dy) return;

        // Si une animation est déjà en cours (redimensionnement continu),
        // on repart de la position affichée pour éviter tout saut.
        const current = new DOMMatrixReadOnly(getComputedStyle(item).transform);
        item.getAnimations().forEach((animation) => animation.cancel());
        item.animate(
          [
            { transform: `translate(${dx + current.m41}px, ${dy + current.m42}px)` },
            { transform: 'translate(0, 0)' },
          ],
          { duration: 500, easing: EASE_OUT }
        );
      });
      initialized = true;
    }

    // On observe les cartes (et non la grille) : leur largeur change à chaque
    // changement de colonnes, leur hauteur au chargement des polices.
    // Le recalcul est reporté à la frame suivante (et regroupé) : modifier la
    // grille pendant le callback peut redimensionner d'autres cartes et
    // déclencher l'erreur "ResizeObserver loop".
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    });
    items.forEach((item) => observer.observe(item.firstElementChild));

    return { items, layout };
  }

  /* ------------------------------------------------------------------------
     6. ONGLETS DE FILTRAGE
     Motif ARIA "tabs" : flèches gauche/droite, Début/Fin, un seul onglet
     dans l'ordre de tabulation (roving tabindex).
     ------------------------------------------------------------------------ */
  function initTabs(masonry) {
    const tablist = document.querySelector('.tabs');
    const panel = document.getElementById('catalogue-panel');
    const status = document.getElementById('catalogue-status');
    const section = document.getElementById('catalogue');
    if (!tablist || !panel) return;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];

    function select(tab, moveFocus) {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      if (moveFocus) tab.focus();
      panel.setAttribute('aria-labelledby', tab.id);
      moveIndicator(tablist, tab);

      const filter = tab.dataset.filter;
      let count = 0;
      masonry.items.forEach((item) => {
        const visible = filter === 'all' || item.dataset.genres.split(' ').includes(filter);
        item.hidden = !visible;
        if (visible) count += 1;
      });
      masonry.layout();

      status.textContent = `${count} titre${count > 1 ? 's' : ''} affiché${count > 1 ? 's' : ''}`;
      section.dataset.crumbLeaf = filter === 'all' ? '' : tab.textContent.trim();
      if (breadcrumb.current === section) renderBreadcrumb(section);
    }

    tablist.addEventListener('click', (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (tab) select(tab, false);
    });

    tablist.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      const targets = {
        ArrowRight: tabs[(index + 1) % tabs.length],
        ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length],
        Home: tabs[0],
        End: tabs[tabs.length - 1],
      };
      const next = targets[event.key];
      if (!next) return;
      event.preventDefault();
      select(next, true);
    });

    const refresh = () => moveIndicator(tablist, tablist.querySelector('[aria-selected="true"]'));
    window.addEventListener('resize', refresh);
    document.fonts.ready.then(refresh);
    refresh();
  }

  /* ------------------------------------------------------------------------
     7. APPARITION EN CASCADE + SKELETON SCREENS
     ------------------------------------------------------------------------ */
  function initReveal() {
    const targets = document.querySelectorAll('.movie-section, .catalogue');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    targets.forEach((target) => observer.observe(target));
  }

  function initSkeletons() {
    document.querySelectorAll('.movie-poster img').forEach((img) => {
      if (img.complete && img.naturalWidth) return;
      const poster = img.closest('.movie-poster');
      poster.classList.add('is-loading');
      const done = () => poster.classList.remove('is-loading');
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  /* ------------------------------------------------------------------------
     8. PETITS COMPORTEMENTS
     ------------------------------------------------------------------------ */
  function initToggleButtons() {
    document.querySelectorAll('button[aria-pressed]').forEach((button) => {
      button.addEventListener('click', () => {
        const pressed = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', String(!pressed));
      });
    });
  }

  function initSignupValidation() {
    const password = document.getElementById('signup-password');
    const confirm = document.getElementById('signup-password-confirm');
    if (!password || !confirm) return;
    const check = () => {
      const mismatch = confirm.value && confirm.value !== password.value;
      confirm.setCustomValidity(mismatch ? 'Les mots de passe ne correspondent pas.' : '');
    };
    password.addEventListener('input', check);
    confirm.addEventListener('input', check);
  }

  /* ------------------------------------------------------------------------
     INITIALISATION
     ------------------------------------------------------------------------ */
  initThemes();
  initMobileNav();
  initProfileMenu();
  initScrollEffects();
  initScrollSpy();
  initSkeletons();
  initReveal();

  const masonryGrid = document.querySelector('.masonry');
  if (masonryGrid) initTabs(createMasonry(masonryGrid));

  initToggleButtons();
  initSignupValidation();
})();
