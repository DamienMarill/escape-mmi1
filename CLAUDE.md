# Escape Game Rentrée MMI1

Escape game de 30 min pour la rentrée MMI1 : 10 postes navigateur + 1 vidéoprojecteur + 1 console MJ, **un serveur par salle** (laptop MJ). Conception complète dans `game-design.md` (v0.2) — le document fait autorité sur toute décision de gameplay.

## Architecture (app/)

- **SvelteKit 2 + Svelte 5 (runes forcées) + adapter-node** — config SvelteKit dans `vite.config.ts` (pas de svelte.config.js). Tailwind v4, shadcn-svelte (`$lib/components/ui/`).
- **État** : un singleton `Game` en mémoire (`src/lib/server/game/state.ts`, reducer `apply(action)` + `tick()` pour les séquences chronométrées), snapshot JSON toutes les 2 s (`persist.ts`), **pas de BDD**. Un seul état initial figé, zéro tirage (§11 du design).
- **Transport** : SSE `GET /api/events` (état complet à chaque mutation, seq monotone — « l'état est la vérité ») + `POST /api/action`. Console MJ protégée par cookie (`/mj?key=…`, `MJ_KEY` env, défaut `brassens`).
- **Secrets** : toutes les solutions vivent sous `src/lib/server/game/` (jamais importable côté client). Les données d'affichage partagées sont dans `src/lib/{tasks-data,dev-sim,image-data,systeme-data,phase2-data}.ts`. `tests/audit-bundle.mjs` grep le bundle client contre une liste de chaînes sentinelles serveur — l'étendre à chaque nouveau message serveur.
- **Couche de surcharge** (`+layout.svelte`) : 2 couches (bloquante/événementielle), jamais `display:none`, thème par `data-phase`, classe `no-transition` 1 frame à la resync, mode calme + `prefers-reduced-motion` partout.
- **Bascule** : `displayPhase` locale décalée par poste (`basculeDelays`), glitch CSS pur. Un poste qui se (re)connecte en cours s'installe dans l'état courant **sans** rejouer d'animation.

## Vérification

`pnpm run verify` = svelte-check + eslint/prettier + Vitest + Playwright (**contre le build `node build`**, jamais vite dev, `workers: 1` car état serveur partagé) + audit anti-fuite. `TIME_SCALE=0.05` compresse validation/bascule/refermetures/lockouts en e2e (prod = 1).

## Pièges connus

- **Svelte 5** : ne jamais nommer une variable locale `state` dans un composant qui utilise des runes (collision `$state`) — convention : `pub` ou `publicState`. Ne jamais lire ET écrire la même rune dans un `$effect` (boucle infinie → gel du thread, déjà vécu).
- Un mini résolu garde son écran (segment en très gros) jusqu'à la bascule — règle n°4 : rien de ce qui peut servir ne disparaît.
- Choix documenté divergent du §5 (coquille du doc) : `SYNCHRO` débloque **Contraste**, `SCAN` débloque **Négatif** (cohérent avec §6).

## Assets

Tout ce qui est dans `static/assets/` et les textes de `texts.ts`/`phase2-data.ts` sont des **placeholders** — Damien produit les définitifs (voir `plan-production-assets.md`). Remplacer les fichiers/chaînes suffit, ne pas toucher au code.
