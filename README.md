# StreamFlix

Plateforme de streaming, projet fil rouge EFREI.

## Branches

| Branche         | Contenu                                         |
| --------------- | ----------------------------------------------- |
| `main`          | Structure HTML sémantique                        |
| `cssNatif`      | Version en CSS natif (sans framework)            |
| `bootstrap-sass`| Migration Bootstrap 5.3 + SASS (architecture 7-1)|
| `javascript`    | J4 : premiers pas en JavaScript (DOM, événements) |

## Installation et compilation

```bash
npm install        # installe Sass et les sources de Bootstrap
npm run dev        # compile et surveille les fichiers .scss (compilation automatique)
npm run build      # compile une version minifiée pour la production
```

Le CSS compilé est écrit dans `css/style.css` (avec `css/style.css.map` pour
retrouver la ligne SCSS d'origine dans les outils du navigateur).

## Bootstrap

- **CSS** : compilé depuis les sources SASS de Bootstrap (`scss/vendors/_bootstrap-custom.scss`)
  pour personnaliser ses variables et n'importer que les composants utilisés
  (≈ 130 Ko minifié au lieu de 230 Ko pour `bootstrap.min.css`).
- **JavaScript** : chargé depuis le CDN jsDelivr (Bootstrap 5.3.8, Popper inclus).

Composants utilisés : navbar + collapse, dropdown, boutons, cards, badges,
modal, tooltips, formulaires avec validation, ScrollSpy.

## Architecture SASS 7-1

```
scss/
├── utils/        _variables.scss, _mixins.scss
├── vendors/      _bootstrap-custom.scss
├── base/         _reset.scss, _typography.scss
├── layout/       _header.scss, _hero.scss, _footer.scss
├── components/   _buttons.scss, _cards.scss, _navigation.scss
├── pages/        _home.scss
├── themes/       _theme.scss
└── style.scss    fichier principal (imports uniquement)
```

Mixins : `respond-to`, `hover-lift`, `overlay-gradient`, `line-clamp`,
`star-rating`, `button-reset`.

## JavaScript (J4)

`js/script.js` suit la structure demandée, un bloc commenté par exercice :

1. **Afficher/masquer** : bouton « Masquer » au-dessus de chaque rangée (`classList.toggle('hidden')`).
2. **Compteur** : « Catalogue : X films disponibles » ajouté dans le footer (`createElement` + `appendChild`).
3. **Film vu** : clic sur une carte → classe `.watched` et badge « ✓ Vu » (le clic sur le titre ou un bouton est ignoré grâce à `event.target`).
4. **Recherche** : saisie dans `#search` → filtrage par titre, rangées vides masquées, message « Aucun résultat ».
5. **Modale** : clic sur le titre d'un film (ou « Plus d'infos » du hero) → `openModal()` ; fermeture par ×, clic sur le fond ou Échap.
6. **Thème** (bonus) : bouton « Mode clair / Mode sombre » → classe `.dark-theme` sur `<body>`, choix mémorisé.
