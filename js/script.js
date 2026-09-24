/* ==========================================================================
   StreamFlix — script.js
   Les comportements de base (menu hamburger, menu profil, modale, suivi de
   la section visible) sont fournis par Bootstrap via les attributs
   data-bs-*. Ce fichier ajoute :
   1. Navbar opaque au scroll
   2. Mise à jour d'aria-current avec le ScrollSpy + fermeture du menu mobile
   3. Tooltips
   4. Modale de détails remplie selon le film cliqué
   5. Thème sombre / clair mémorisé
   6. Boutons "Ma Liste"
   7. Validation du formulaire d'inscription
   ========================================================================== */

(() => {
  'use strict';

  // Données affichées dans la modale "détails" (une entrée par film)
  const MOVIES = {
    'inception': {
      title: 'Inception', year: 2010, duration: '2h28', rating: 4.5,
      genres: ['Sci-Fi', 'Thriller'], director: 'Christopher Nolan',
      synopsis: "Un voleur qui s'infiltre dans les rêves des autres pour voler leurs secrets découvre qu'il doit réaliser l'impossible : planter une idée plutôt que de la voler.",
    },
    'dark-knight': {
      title: 'The Dark Knight', year: 2008, duration: '2h32', rating: 4.8,
      genres: ['Action', 'Crime', 'Drama'], director: 'Christopher Nolan',
      synopsis: "Batman, le lieutenant Gordon et le procureur Harvey Dent s'allient pour démanteler la pègre de Gotham. Mais un criminel imprévisible, le Joker, entraîne la ville dans le chaos.",
    },
    'interstellar': {
      title: 'Interstellar', year: 2014, duration: '2h49', rating: 4.7,
      genres: ['Sci-Fi', 'Drama'], director: 'Christopher Nolan',
      synopsis: "Alors que la Terre se meurt, un ancien pilote rejoint une expédition qui traverse un trou de ver à la recherche d'une nouvelle planète habitable.",
    },
    'pulp-fiction': {
      title: 'Pulp Fiction', year: 1994, duration: '2h34', rating: 4.6,
      genres: ['Crime', 'Drama'], director: 'Quentin Tarantino',
      synopsis: "Deux tueurs à gages, un boxeur, la femme d'un gangster et deux braqueurs : des histoires croisées dans le Los Angeles des bas-fonds.",
    },
    'matrix': {
      title: 'The Matrix', year: 1999, duration: '2h16', rating: 4.5,
      genres: ['Action', 'Sci-Fi'], director: 'Lana et Lilly Wachowski',
      synopsis: "Un hacker découvre que le monde qu'il connaît n'est qu'une simulation, et qu'il pourrait être celui qui libérera l'humanité.",
    },
    'forrest-gump': {
      title: 'Forrest Gump', year: 1994, duration: '2h22', rating: 4.4,
      genres: ['Drama', 'Romance'], director: 'Robert Zemeckis',
      synopsis: "Assis sur un banc, Forrest raconte sa vie : une traversée de trente ans d'histoire américaine, portée par sa simplicité et son amour pour Jenny.",
    },
  };

  const root = document.documentElement;

  /* 1. NAVBAR OPAQUE AU SCROLL ------------------------------------------- */
  const navbar = document.querySelector('.sf-navbar');
  const updateNavbar = () => navbar.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* 2. SCROLLSPY ET MENU MOBILE ---------------------------------------------
     Bootstrap ajoute la classe .active au lien de la section visible ;
     on synchronise aria-current pour les lecteurs d'écran. */
  const menu = document.getElementById('main-menu');
  const navLinks = menu.querySelectorAll('.nav-link');

  window.addEventListener('activate.bs.scrollspy', () => {
    navLinks.forEach((link) => {
      if (link.classList.contains('active')) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  });

  // Sur mobile, le menu se referme après un clic sur un lien
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  /* 3. TOOLTIPS (désactivés par défaut dans Bootstrap) --------------------- */
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    new bootstrap.Tooltip(el);
  });

  /* 4. MODALE DE DÉTAILS ----------------------------------------------------
     L'événement show.bs.modal fournit le bouton cliqué (relatedTarget),
     qui porte l'identifiant du film dans data-movie. */
  const modal = document.getElementById('movie-modal');

  modal.addEventListener('show.bs.modal', (event) => {
    const movie = MOVIES[event.relatedTarget?.dataset.movie];
    if (!movie) return;
    const id = event.relatedTarget.dataset.movie;
    const ratingText = String(movie.rating).replace('.', ',');

    modal.querySelector('#movie-modal-title').textContent = movie.title;
    modal.querySelector('#movie-modal-meta').textContent = `${movie.year} · ${movie.duration}`;
    modal.querySelector('#movie-modal-synopsis').textContent = movie.synopsis;
    modal.querySelector('#movie-modal-director').textContent = `Réalisé par ${movie.director}`;

    const rating = modal.querySelector('#movie-modal-rating');
    rating.style.setProperty('--rating', movie.rating);
    rating.setAttribute('aria-label', `Note : ${ratingText} sur 5`);

    const poster = modal.querySelector('#movie-modal-poster');
    poster.src = `images/films/${id}-400.jpg`;
    poster.alt = `Affiche du film ${movie.title}`;

    const genres = movie.genres.map((genre) => {
      const li = document.createElement('li');
      li.className = 'badge rounded-pill sf-badge';
      li.textContent = genre;
      return li;
    });
    modal.querySelector('#movie-modal-genres').replaceChildren(...genres);
  });

  /* 5. THÈME SOMBRE / CLAIR --------------------------------------------------
     Bootstrap 5.3 change toutes ses couleurs selon data-bs-theme. */
  const themeToggle = document.getElementById('theme-toggle');
  const themeTooltip = bootstrap.Tooltip.getInstance(themeToggle);
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const applyTheme = (theme) => {
    const isLight = theme === 'light';
    root.setAttribute('data-bs-theme', theme);
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.querySelector('.sf-theme-icon').textContent = isLight ? '☾' : '☀';
    themeMeta.setAttribute('content', isLight ? '#f5f5f1' : '#141414');
    themeTooltip?.setContent({
      '.tooltip-inner': isLight ? 'Passer au thème sombre' : 'Passer au thème clair',
    });
  };

  applyTheme(root.getAttribute('data-bs-theme') || 'dark');

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem('streamflix-theme', next);
    } catch (e) { /* navigation privée : choix non mémorisé */ }
  });

  /* 6. BOUTONS "MA LISTE" ----------------------------------------------------- */
  document.querySelectorAll('.sf-list-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const added = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(added));
      button.querySelector('.sf-list-icon').textContent = added ? '✓' : '+';
      bootstrap.Tooltip.getInstance(button)?.setContent({
        '.tooltip-inner': added ? 'Retirer de ma liste' : 'Ajouter à ma liste',
      });
    });
  });

  /* 7. VALIDATION DU FORMULAIRE (modèle Bootstrap .needs-validation) -------- */
  const form = document.querySelector('.needs-validation');
  const password = document.getElementById('signup-password');
  const confirm = document.getElementById('signup-password-confirm');

  const checkPasswords = () => {
    confirm.setCustomValidity(confirm.value !== password.value ? 'Les mots de passe ne correspondent pas.' : '');
  };
  password.addEventListener('input', checkPasswords);
  confirm.addEventListener('input', checkPasswords);

  form.addEventListener('submit', (event) => {
    checkPasswords();
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      form.querySelector(':invalid')?.focus();
    }
    form.classList.add('was-validated');
  });
})();
