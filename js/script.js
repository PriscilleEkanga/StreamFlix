/* ==========================================================================
   StreamFlix — script.js
   J4 : premiers pas en JavaScript (manipulation du DOM et événements)

   Exercice 1 : afficher / masquer les sections de films
   Exercice 2 : compteur de films dans le footer
   Exercice 3 : marquer un film comme "vu"
   Exercice 4 : recherche de films
   Exercice 5 : modale de détails
   Exercice 6 : changement de thème (bonus)
   + Autres fonctionnalités (navbar, menu, "Ma Liste", formulaire)

   Le script est chargé avec l'attribut "defer" : il s'exécute une fois le
   HTML entièrement lu, tous les éléments existent donc déjà.
   ========================================================================== */


// ===================================
// EXERCICE 1 : Afficher/masquer sections
// ===================================

// Chaque bouton "Masquer" indique, dans son attribut aria-controls,
// l'id de la liste de films qu'il contrôle (ex : "tendances-list").
const toggleButtons = document.querySelectorAll('.toggle-section');

toggleButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const listId = button.getAttribute('aria-controls');
    const list = document.querySelector('#' + listId);

    // toggle() ajoute la classe si elle est absente, la retire sinon.
    // Il renvoie true si la classe est présente après l'appel.
    const isHidden = list.classList.toggle('hidden');

    button.textContent = isHidden ? 'Afficher' : 'Masquer';
    // Pour les lecteurs d'écran : la liste est-elle dépliée ?
    button.setAttribute('aria-expanded', String(!isHidden));
  });
});


// ===================================
// EXERCICE 2 : Compteur de films
// ===================================

// Chaque carte de film est un <article> (le hero et le reste de la page n'en
// contiennent pas). Remarque : un même film peut apparaître dans plusieurs
// rangées, il est alors compté plusieurs fois.
const filmArticles = document.querySelectorAll('article');

const counter = document.createElement('p');
counter.className = 'mt-3 mb-0 fw-semibold';
counter.textContent = 'Catalogue : ' + filmArticles.length + ' films disponibles';

document.querySelector('#footer-brand').appendChild(counter);


// ===================================
// EXERCICE 3 : Films vus
// ===================================

const movieCards = document.querySelectorAll('.sf-movie-card');

movieCards.forEach(function (card) {
  card.addEventListener('click', function (event) {
    // event.target est l'élément exact sur lequel on a cliqué.
    // Si c'est un bouton (titre → modale, "Lecture", "Ma Liste") ou un
    // élément à l'intérieur d'un bouton, on laisse le bouton faire son
    // action et on ne marque pas le film.
    if (event.target.closest('button')) {
      return;
    }

    card.classList.toggle('watched'); // le badge "✓ Vu" est géré en CSS
  });
});


// ===================================
// EXERCICE 4 : Recherche
// ===================================

const searchInput = document.querySelector('#search');
const noResult = document.querySelector('#no-result');

searchInput.addEventListener('input', function () {
  const searchTerm = this.value.toLowerCase().trim();
  const articles = document.querySelectorAll('article');
  let visibleCount = 0;

  articles.forEach(article => {
    const title = article.querySelector('h3').textContent.toLowerCase();

    // On masque la colonne Bootstrap (<li>) qui contient la carte, et non
    // la carte seule : sinon la grille garderait un emplacement vide.
    const column = article.closest('li');

    if (title.includes(searchTerm)) {
      column.style.display = ''; // '' = on revient à l'affichage normal
      visibleCount++;
    } else {
      column.style.display = 'none';
    }
  });

  // Une rangée dont tous les films sont masqués disparaît aussi
  const rows = document.querySelectorAll('.sf-row__list');
  rows.forEach(list => {
    const columns = Array.from(list.children);
    const hasVisibleFilm = columns.some(column => column.style.display !== 'none');
    list.closest('section').style.display = hasVisibleFilm ? '' : 'none';
  });

  // Message "Aucun résultat"
  if (visibleCount === 0) {
    noResult.textContent = 'Aucun résultat pour « ' + this.value + ' »';
    noResult.classList.remove('hidden');
  } else {
    noResult.textContent = '';
    noResult.classList.add('hidden');
  }
});

// Touche Entrée : pas de rechargement de la page, on descend vers les résultats
searchInput.form.addEventListener('submit', function (event) {
  event.preventDefault();
  noResult.parentElement.scrollIntoView({ behavior: 'smooth' });
});


// ===================================
// EXERCICE 5 : Modal
// ===================================

const modal = document.querySelector('#modal');
const closeButton = modal.querySelector('.close');
let lastFocusedElement = null; // pour rendre le focus au bon bouton à la fermeture

// Ouvre la modale et y affiche les informations du film reçu en paramètre
function openModal(film) {
  const modalBody = document.querySelector('#modal-body');

  modalBody.innerHTML = `
    <div class="modal-film">
      <img class="modal-film__poster" src="${film.poster}" alt="Affiche du film ${film.title}" width="400" height="600">
      <div>
        <h2 class="modal-film__title" id="modal-title">${film.title}</h2>
        <p class="modal-film__meta mb-2">${film.meta}</p>
        <p class="d-flex align-items-center gap-2 mb-2">
          <span class="sf-rating sf-rating--lg" style="--rating: ${film.rating}" role="img" aria-label="Note : ${film.rating} sur 5"></span>
          <span class="fw-bold" aria-hidden="true">${film.rating}/5</span>
        </p>
        <p class="modal-film__meta">Genres : ${film.genres}</p>
        ${film.description ? `<p>${film.description}</p>` : ''}
        <button type="button" class="btn btn-primary"><span aria-hidden="true">▶</span> Lecture</button>
      </div>
    </div>
  `;

  lastFocusedElement = document.activeElement;
  modal.style.display = 'block';
  closeButton.focus(); // le clavier se place dans la modale
}

function closeModal() {
  modal.style.display = 'none';

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

// Récupère les informations d'un film à partir de sa carte (<article>)
function getFilmInfo(card) {
  const genreBadges = card.querySelectorAll('.sf-badge');
  const genres = Array.from(genreBadges).map(badge => badge.textContent).join(', ');

  return {
    title: card.querySelector('h3').textContent.trim(),
    poster: card.querySelector('img').src,
    // lastChild = le texte "2008 · 2h32" (sans le badge "Nouveau" éventuel)
    meta: card.querySelector('.sf-movie-card__meta').lastChild.textContent.trim(),
    rating: card.querySelector('.sf-rating + span').textContent.trim(),
    genres: genres,
  };
}

// Clic sur le titre d'une carte → modale avec les infos de ce film
const titleButtons = document.querySelectorAll('.sf-movie-card__title-btn');

titleButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const card = button.closest('article');
    openModal(getFilmInfo(card));
  });
});

// Bouton "Plus d'infos" du hero → modale du film à la une
document.querySelector('#hero-info-btn').addEventListener('click', function () {
  const hero = document.querySelector('.sf-hero');
  const genreBadges = hero.querySelectorAll('.sf-badge');

  openModal({
    title: hero.querySelector('h1').textContent,
    poster: hero.querySelector('.sf-hero__poster').src,
    meta: hero.querySelector('.text-body-secondary').textContent,
    rating: '4.5',
    genres: Array.from(genreBadges).map(badge => badge.textContent).join(', '),
    description: hero.querySelector('.sf-hero__desc').textContent,
  });
});

// Fermeture : bouton ×, clic sur le fond sombre, ou touche Échap
closeButton.addEventListener('click', closeModal);

modal.addEventListener('click', function (event) {
  // Le fond sombre est l'élément #modal lui-même (pas son contenu)
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});


// ===================================
// EXERCICE 6 : Changement de thème (bonus)
// ===================================

// La classe .dark-theme sur <body> indique le thème actif.
// Les couleurs de la page viennent de Bootstrap, qui lit l'attribut
// data-bs-theme sur <html> : on met donc les deux à jour ensemble.
const themeButton = document.querySelector('#theme-toggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(isDark) {
  document.body.classList.toggle('dark-theme', isDark);
  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');

  // Le bouton propose toujours le thème inverse
  themeButton.querySelector('.theme-label').textContent = isDark ? 'Mode clair' : 'Mode sombre';
  themeButton.querySelector('.sf-theme-icon').textContent = isDark ? '☀' : '☾';
  themeColorMeta.setAttribute('content', isDark ? '#141414' : '#f5f5f1');
}

// Au chargement : le script du <head> a déjà appliqué le thème mémorisé
applyTheme(document.documentElement.getAttribute('data-bs-theme') !== 'light');

themeButton.addEventListener('click', function () {
  const isDark = !document.body.classList.contains('dark-theme');
  applyTheme(isDark);

  // Mémorise le choix pour la prochaine visite
  try {
    localStorage.setItem('streamflix-theme', isDark ? 'dark' : 'light');
  } catch (error) {
    // navigation privée : le choix ne sera simplement pas mémorisé
  }
});


// ===================================
// AUTRES FONCTIONNALITÉS
// ===================================

// --- Navbar opaque dès que l'on fait défiler la page ---
const navbar = document.querySelector('.sf-navbar');

function updateNavbar() {
  navbar.classList.toggle('is-scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', updateNavbar);
updateNavbar();

// --- Menu : lien actif (ScrollSpy Bootstrap) et fermeture sur mobile ---
const menu = document.querySelector('#main-menu');
const navLinks = menu.querySelectorAll('.nav-link');

// Bootstrap ajoute la classe .active au lien de la section visible ;
// on met à jour aria-current pour les lecteurs d'écran.
window.addEventListener('activate.bs.scrollspy', function () {
  navLinks.forEach(function (link) {
    if (link.classList.contains('active')) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
});

navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    if (menu.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  });
});

// --- Tooltips Bootstrap (ils doivent être activés en JavaScript) ---
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (element) {
  new bootstrap.Tooltip(element);
});

// --- Boutons "Ma Liste" ---
document.querySelectorAll('.sf-list-toggle').forEach(function (button) {
  button.addEventListener('click', function () {
    const added = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(added));
    button.querySelector('.sf-list-icon').textContent = added ? '✓' : '+';

    const tooltip = bootstrap.Tooltip.getInstance(button);
    if (tooltip) {
      tooltip.setContent({ '.tooltip-inner': added ? 'Retirer de ma liste' : 'Ajouter à ma liste' });
    }
  });
});

// --- Formulaire d'inscription (validation Bootstrap) ---
const signupForm = document.querySelector('.needs-validation');
const password = document.querySelector('#signup-password');
const passwordConfirm = document.querySelector('#signup-password-confirm');

function checkPasswords() {
  const message = passwordConfirm.value !== password.value ? 'Les mots de passe ne correspondent pas.' : '';
  passwordConfirm.setCustomValidity(message);
}

password.addEventListener('input', checkPasswords);
passwordConfirm.addEventListener('input', checkPasswords);

signupForm.addEventListener('submit', function (event) {
  checkPasswords();

  if (!signupForm.checkValidity()) {
    event.preventDefault();
    const firstInvalidField = signupForm.querySelector(':invalid');
    if (firstInvalidField) {
      firstInvalidField.focus();
    }
  }

  signupForm.classList.add('was-validated');
});
