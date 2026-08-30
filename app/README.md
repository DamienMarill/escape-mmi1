# Escape Game Rentrée MMI1

Implémentation du jeu décrit dans [`../game-design.md`](../game-design.md) (v0.2).
SvelteKit 2 + Svelte 5 + adapter-node · Tailwind v4 + shadcn-svelte · SSE · aucun état hors mémoire (snapshot JSON).

## Lancement MJ (jour J)

```bash
# 1. préparation machine (UNE fois, en admin) : ouvre le pare-feu
./install.bat        # Windows  (ou sudo ./install.sh)

# 2. build (une fois, ou après mise à jour)
pnpm install && pnpm run build

# 3. lancement du serveur de salle
node build
```

Au démarrage, le serveur affiche :

- l'URL à ouvrir sur les **10 postes joueurs** et le **vidéoprojecteur** (`/projector`) ;
- l'URL de la **console MJ** (`/mj?key=…`).

Reset entre deux sessions : bouton **RESET** de la console MJ (affiche la checklist physique : fiche dans le manga, battant du tableau, plan lisible).

## Variables d'environnement

| Variable        | Défaut     | Rôle                                                         |
| --------------- | ---------- | ------------------------------------------------------------ |
| `PORT`          | `3000`     | Port du serveur                                              |
| `MJ_KEY`        | `brassens` | Clé d'accès console MJ                                       |
| `GAME_DATA_DIR` | `data/`    | Dossier des snapshots (état survit à un crash)               |
| `TIME_SCALE`    | `1`        | **Tests uniquement** — compresse les séquences chronométrées |

## Remplacer les placeholders (assets & textes)

| Quoi                                         | Où                                                               |
| -------------------------------------------- | ---------------------------------------------------------------- |
| Vidéos (intro, bascule)                      | `static/assets/video/*.mp4`                                      |
| Annonces & SFX                               | `static/assets/audio/*.mp3` (un fichier par annonce, mêmes noms) |
| Textes phase 2 (monologue, manifestations)   | `src/lib/server/game/texts.ts`                                   |
| Documents & fragments d'ambiance             | `src/lib/phase2-data.ts`                                         |
| Image du poste IMAGE (source + détail caché) | `drawOriginal()` dans `src/lib/image-data.ts`                    |

## Tester à plusieurs postes sur une seule machine

L'identité d'un poste vit dans le `localStorage` (partagé entre les onglets d'un
même navigateur) : deux onglets ordinaires comptent donc pour **un seul** poste —
c'est le comportement voulu sur les machines de l'IUT. Pour simuler plusieurs
postes en local, ouvrir chaque onglet avec un numéro distinct :

```
http://localhost:3000/?poste=1
http://localhost:3000/?poste=2
http://localhost:3000/?poste=3
```

(ou utiliser des fenêtres de navigation privée / des profils différents).

⚠️ **Maximum ~5 onglets de postes par profil navigateur.** Chaque poste garde un
flux SSE ouvert en permanence, et Chrome plafonne à 6 connexions HTTP/1.1
simultanées par hôte : au-delà, les onglets suivants chargent indéfiniment.
Pour simuler plus de postes : navigation privée, autre profil, autre navigateur
(chacun apporte son propre pool de 6 connexions). **Aucun impact le jour J** :
une machine physique = un navigateur = son propre pool.

## Développement

```bash
pnpm run dev          # serveur de dev
pnpm run verify       # check + lint + unit + e2e + audit anti-fuite
pnpm run test:unit    # Vitest (logique serveur)
pnpm run test:e2e     # Playwright contre le build node (comme le jour J)
```

Toute la validation des énigmes est **côté serveur** (`src/lib/server/game/`) ;
`tests/audit-bundle.mjs` vérifie qu'aucune chaîne serveur ne fuite dans le bundle client.
