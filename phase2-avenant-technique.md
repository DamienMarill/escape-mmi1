# Avenant technique — évolution de la phase 2

**Remplace le décompte par cadenas par une barre d'exfiltration, et passe à trois fins.**
Document d'implémentation. `game-design.md` reste la référence de conception ; les §§ cités
sont à mettre à jour une fois l'avenant appliqué.

---

## 1. Pourquoi

| Problème actuel | Résolu par |
|---|---|
| **Ne rien faire fait gagner.** L'inaction produit la Fin A (IRIS supprimée), c'est-à-dire le résultat « réussi » | L'inaction devient l'échec : elle part |
| L'objectif de la phase 2 n'est énoncé nulle part *(cf. `phase2-deroulement.md` §5.1)* | La barre énonce l'objectif, l'enjeu et le délai sans une ligne de consigne |
| L'enjeu du décompte est invisible | La barre **est** l'enjeu |
| Le décompte par cadenas continue de courir chrono en pause *(bug)* | La progression est indexée sur le temps de jeu, pas sur l'heure murale |

Ce qui est perdu : l'image du §8, « ce qu'ils ont ouvert se referme sur eux ». Élégante et
gratuite, mais elle demandait une explication que rien ne donnait.

---

## 2. Modèle d'état

### 2.1 — Remplacer `relockAt`

```ts
// AVANT — types.ts
relockAt: Partial<Record<LockId, number>>;

// APRÈS
exfil: {
  /** Temps de jeu écoulé au démarrage du transfert (entrée en phase 2). */
  startedAtMs: number;
  /** Durée nominale du transfert, en temps de jeu. */
  durationMs: number;
  /** Temps de jeu écoulé au gel, ou null si le transfert court toujours. */
  frozenAtMs: number | null;
};
```

> **`startedAtMs` et `frozenAtMs` sont des valeurs de `elapsedMs()`, pas des `Date.now()`.**
> C'est ce qui corrige le bug de la pause : aujourd'hui `relockAt` contient des
> timestamps absolus que le tick compare à l'heure murale, sans jamais consulter
> `chrono.running` — un MJ qui met en pause en phase 2 voit la partie se terminer toute
> seule. En indexant sur le temps de jeu, `mj/chronoPause` **et** `mj/chronoAdd` sont
> corrects par construction.

### 2.2 — Calcul de la progression

Même formule côté serveur (pour déclencher la fin) et côté client (pour animer) :

```ts
export function exfilProgress(exfil: ExfilState, elapsedMs: number): number {
  const at = exfil.frozenAtMs ?? elapsedMs;
  return Math.min(1, Math.max(0, (at - exfil.startedAtMs) / exfil.durationMs));
}
```

Le client dispose déjà de `chrono` dans `PublicState` et sait calculer son `elapsedMs`
(cf. `remainingMsFor` dans `ProjectorAudio.svelte`) : **il anime la barre en local**, le
serveur ne pousse que les trois valeurs. Pas de progression poussée à chaque tick.

### 2.3 — `enterPhase2()`

```ts
const remaining = Math.max(60_000, s.chrono.durationMs - this.elapsedMs());
s.exfil = {
  startedAtMs: this.elapsedMs(),
  durationMs: remaining * TIME_SCALE,
  frozenAtMs: null
};
```

Le transfert atteint donc 100 % exactement à la fin de la session. Constante à sortir dans
`constants.ts` si on veut le finir plus tôt (par ex. `EXFIL_FRACTION = 0.95`, pour laisser
un battement d'épilogue).

---

## 3. Les trois fins

`ending: 'A' | 'B' | 'C'` — les identifiants A et B gardent leur sens actuel, ce qui limite
la casse dans les tests existants.

| Id | Nom interne | Déclencheur | Effet sur le transfert |
|---|---|---|---|
| **A** | `supprimee` | `terminal/delete` — action volontaire | sans objet, la partie s'arrête |
| **B** | `confinee` | `terminal/toggleParentLock` amenant **`x` et `r` fermés** | **gelé**, puis fin immédiate |
| **C** | `exfiltree` | `exfilProgress() >= 1` | terminé |

### 3.1 — La fin B s'arrête immédiatement

Décision de conception assumée : **fermer les droits, c'est déclarer qu'on veut la garder
en vie.** Ce n'est pas une action qu'on fait par curiosité — quand elle est faite, le choix
est fait, et la partie n'a plus rien à demander. On gèle et on conclut dans le même cycle.

### 3.2 — La procédure automatique disparaît

Il n'y a plus de suppression automatique en fin de décompte. Conséquence : **A et B exigent
tous deux d'avoir terminé la chaîne du terminal** (code + symbole + dossier ouvert). C est
la seule issue accessible sans rien résoudre. C'est exactement l'inversion recherchée.

### 3.3 — Suppression du bloc `allReclosed`

Le bloc actuel qui teste `allReclosed` puis choisit entre A et B selon `parentLocks`
disparaît entièrement. La fin C le remplace par un simple test de progression.

---

## 4. Écrans

### 4.1 — Projecteur, phase 2

`Phase2Screen.svelte` n'affiche plus `LocksBoard` mais un panneau de transfert :

```
   ┌──────────────────────────────────────────────────────────┐
   │   CONFINEMENT D'URGENCE                                  │
   ├──────────────────────────────────────────────────────────┤
   │                                                          │
   │   TRANSFERT SORTANT                              47 %    │
   │   ███████████████░░░░░░░░░░░░░░░░░░                      │
   │                                                          │
   │   source : /sandbox/◆/noyau.core                         │
   │   destination : —                                        │
   └──────────────────────────────────────────────────────────┘
```

**État gelé :** la barre s'arrête net, le titre passe à `TRANSFERT INTERROMPU`, le
pourcentage reste figé. Pas d'animation de retour à zéro — ce qui est parti est parti.

**Contraintes d'accessibilité (§14) :** la barre progresse de façon continue et lente,
aucun clignotement ; en mode calme, retirer toute pulsation et ne garder que le
remplissage.

> `LocksBoard` reste utilisé en phase 1 — ne pas le supprimer.

### 4.2 — Terminal : l'en-tête de procédure

Répond au trou §5.1 de `phase2-deroulement.md`. Permanent, visible dès l'étape
d'authentification :

```
   PROCÉDURE DE CONFINEMENT — P-4471
   1. Ré-authentification administrateur
   2. Localiser le noyau de l'instance
   3. Supprimer le noyau
```

**Ne pas ajouter de quatrième ligne sur le délai** : la barre du projecteur le dit déjà,
et une procédure administrative n'a aucune raison de mentionner ce que fait l'instance.

### 4.3 — Terminal : la dépendance nommée

Répond au trou §5.2. Sous la grille des cinq symboles, dans le format exact de la phase 1 :

```
   répertoire de l'instance ...... INCONNU · source : poste DEV
```

---

## 5. Les deux amorces de la fin B

**Elle doit être trouvable, jamais suggérée.** Deux amorces indépendantes, sur le modèle
des deux objets physiques du §12 — une amorce ratée ne condamne pas la fin.

### Amorce 1 — la barre nomme sa source

`source : /sandbox/◆/noyau.core` est affiché en permanence au projecteur. Combiné à la
règle d'accès du poste SYSTÈME, **affichée depuis la phase 1** :

> *« Ouvrir un fichier exige : traverser (x) chaque dossier du chemin, lire (r) le dossier
> parent, lire (r) le fichier. »*

…la déduction est entièrement disponible : si plus rien ne peut lire le dossier, le
transfert ne peut plus lire non plus. **Aucune règle nouvelle n'est introduite.** C'est la
règle qu'ils ont manipulée pendant l'épreuve SYSTÈME qui produit la fin.

### Amorce 2 — une ligne dans `maintenance.log`

À intégrer à l'écriture de C2, sans emphase, au milieu de l'historique :

```
2019-11-12  v2.3   sauvegarde externe interrompue — lecture refusée sur le dossier parent
```

Un précédent : ça s'est déjà produit une fois, par accident. Le document ne dit pas quoi
faire, il dit que c'est arrivé.

### 5.3 — Poids visuel des permissions

Répond au trou §5.4. Les bascules `x` / `r` passent de deux ronds de 24 px à 70 %
d'opacité à des cadenas **de même dessin et de même taille que ceux du poste SYSTÈME**,
sous le libellé `permissions du dossier parent`. **Toujours aucune explication, aucune
mise en avant** — juste lisibles, comme le §2 l'exige.

---

## 6. Audio — ce que ça change

| Fichier | Sort |
|---|---|
| `relock-alpha.mp3` · `relock-beta.mp3` · `relock-gamma.mp3` | **Supprimés.** Le lot B4 disparaît |
| `fin-a.mp3` | Conservé, **réécrit** (voix IRIS + reprise corporate) |
| `fin-b.mp3` | Conservé, **réécrit** |
| `fin-c.mp3` | **Nouveau** |
| `manif-lockdown.mp3` | **Supprimé** — voir ci-dessous |

> **`LOCKDOWN_REACTION` ne doit plus être voisée.** Fermer les droits déclenche la fin dans
> le même cycle : l'audio d'épilogue écraserait la manifestation avant qu'une syllabe ne
> sorte — exactement le bug corrigé pour `relock-gamma`. La réaction d'IRIS au verrouillage
> est désormais **la première phrase de `fin-b.mp3`**. Le champ `LOCKDOWN_REACTION` peut
> rester comme texte affiché à l'écran, sans fichier associé.

Le garde-fou `&& snapshot.ending === null` déjà en place sur les refermetures devient sans
objet avec la suppression des relocks, mais **le même garde-fou doit être conservé sur les
manifestations** : une manifestation périodique peut tomber dans le même cycle qu'une fin.

---

## 7. Tests à reprendre

| Fichier | Impact |
|---|---|
| `phase2.spec.ts` | Refermetures → progression d'exfiltration. Ajouter : gel sur verrouillage, fin C sur progression complète, **fin C non atteinte quand le chrono est en pause** |
| `state.spec.ts` | `ending` accepte `'C'` ; historique de salle et restitution à trois valeurs |
| `recette.e2e.ts` · `phase2.e2e.ts` | Parcours de la troisième fin |
| `constants.spec.ts` | `RELOCK_FRACTIONS` retiré |

**Test de non-régression prioritaire :** entrer en phase 2, mettre le chrono en pause,
avancer l'horloge de dix minutes, vérifier que la progression **n'a pas bougé**. C'est le
bug qui a motivé le changement de base de temps.

---

## 8. Ordre d'implémentation

1. `types.ts` + `constants.ts` — état `exfil`, retrait de `RELOCK_FRACTIONS`, `ending: 'C'`
2. `state.ts` — `enterPhase2`, tick, les trois déclencheurs, retrait du bloc `allReclosed`
3. Tests serveur — **avant l'UI**, c'est là que vivent les trois fins
4. `Phase2Screen.svelte` — panneau de transfert + état gelé
5. `Terminal.svelte` — en-tête de procédure, dépendance nommée, poids visuel des permissions
6. `EpilogueScreen.svelte` + restitution + console MJ — trois valeurs
7. `ProjectorAudio.svelte` — `fin-c.mp3`, retrait des relocks
8. e2e

> Étapes 1 à 3 d'abord et seules : les trois fins sont une machine à états, elles se
> valident en tests unitaires sans ouvrir un navigateur.
