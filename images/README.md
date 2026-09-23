# Images

Les affiches d'origine sont dans `../StreamFlix/`. Les fichiers de ce dossier en
sont dérivés (recadrage 2:3, redimensionnement) pour servir des images
responsives via `<picture>` + `srcset` :

```
images/
├── logo.svg / favicon.svg
├── hero-bg-768.(webp|jpg)    fond flouté du hero (Inception)
├── hero-bg-1280.(webp|jpg)
└── films/
    └── <film>-200.(webp|jpg), <film>-400.(webp|jpg)
```

Le navigateur choisit le WebP s'il le supporte, sinon le JPG, et la largeur
adaptée à l'écran (200w ou 400w) grâce à l'attribut `sizes`.
