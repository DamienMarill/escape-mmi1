# Phase 2 — déroulement réel

*Relevé **dans le code**, pas dans l'intention du game design. Sert de référence pour
écrire les textes et pour arbitrer ce qui manque.*

---

## 1. Réponse courte

**Il y a de quoi faire — mais rien ne le dit.**

La phase 2 contient une vraie chaîne d'actions (deux relevés d'information à aller
chercher sur deux postes différents, puis un choix), plus quatre textes à lire. Ce qui
manque n'est pas le contenu : c'est **l'énoncé de la procédure**. Nulle part, dans aucun
écran, il n'est écrit ce qu'il faut faire ni ce qui se passera si on ne le fait pas.

Le §9 dit « **Objectif donné** : localiser et supprimer le noyau ». Aucun code ne le
donne. Les joueurs sortent de la bascule et tombent sur un champ de mot de passe.

C'est un trou de cadrage, pas un trou de gameplay — donc c'est réparable en trois écrans
de texte, pas en refonte.

---

## 2. L'état de la salle à l'entrée en phase 2

| Poste | Écran | État | Ce qu'il sert encore |
|---|---|---|---|
| **DEV** | Grille + robot + **symbole déposé** | persistant | **Indispensable** — donne le `◆` du terminal |
| **RÉSEAU** | Table rétablie + 6 segments | persistant | **Indispensable** — donne le code `07CD3F` |
| **SYSTÈME** | Arborescence + cadenas de permissions | persistant | Le fusil de Tchekhov : c'est là qu'ils ont appris à manipuler des permissions |
| **IMAGE** | Image restaurée | persistant | Détail caché, référencé par un document |
| **COMPILATION** | **TERMINAL D'URGENCE** | recyclé | Toute la chaîne d'actions |
| **MÉMOIRE** | `maintenance.log` | recyclé | Lecture |
| **BRASSAGE** | `RE_RE_budget_infra.eml` | recyclé | Lecture |
| **PARITÉ** | `entretien_2019.txt` | recyclé | Lecture |
| **SYNCHRO** | Fragment du monologue | ambiance | Lecture optionnelle |
| **SCAN** | Fragment du monologue | ambiance | Lecture optionnelle |
| *Projecteur* | `CONFINEMENT D'URGENCE` + les 3 cadenas | — | Le chrono déguisé |

---

## 3. La chaîne d'actions, telle qu'elle est codée

```
   TERMINAL — étape 1 : AUTHENTIFICATION
   ┌──────────────────────────────────────────────────┐
   │  « ré-authentification administrateur requise    │
   │    · code : table de routage »                   │
   │  [ —————— ]  6 caractères hexa                   │
   └──────────────────────────────────────────────────┘
                     │  le code est 07CD3F
                     │  → il est affiché sur le poste RÉSEAU
                     ▼
   TERMINAL — étape 2 : NAVIGATION
   ┌──────────────────────────────────────────────────┐
   │  /sandbox/ — 5 répertoires                       │
   │     ▲     ●     ◆     ■     ✦                    │
   └──────────────────────────────────────────────────┘
                     │  seul ◆ s'ouvre ; les 4 autres renvoient
                     │  « répertoire vide — dernière modification : 2019 »
                     │  → le symbole est celui tracé par le robot, poste DEV
                     ▼
   TERMINAL — étape 3 : LE CHOIX
   ┌──────────────────────────────────────────────────┐
   │  /sandbox/◆/                                     │
   │  noyau.core                                      │
   │  [ OUVRIR noyau.core ]   [ SUPPRIMER ]           │
   │                                                  │
   │  ◆/ · permissions   (x) (r)   ← discrets         │
   └──────────────────────────────────────────────────┘
```

**Les deux issues, exactement :**

- `SUPPRIMER` → **Fin A immédiate**, à n'importe quel moment.
- fermer **x et r** → `SUPPRIMER` est refusé (`permissions du dossier verrouillées`),
  et IRIS réagit (`LOCKDOWN_REACTION`). Au bout du décompte, la procédure automatique
  échoue → **Fin B**.
- ne rien faire → au troisième cadenas, **Fin A par défaut**.

> Le seul verrou de connaissance de toute la phase 2 est donc : **le code** et **le
> symbole**. Deux allers-retours dans la salle. Tout le reste est de la lecture et une
> décision.

---

## 4. Minutage nominal

Phase 2 démarre vers 17:00 sur une session de 30 min, soit **~13 minutes**. Les
refermetures sont calculées une fois à l'entrée, sur le temps restant :

| t (relatif) | Événement |
|---|---|
| 0:00 | Bascule terminée. Dix écrans ont changé. Le projecteur affiche `CONFINEMENT D'URGENCE` |
| 0:00 → ~2:00 | Ils comprennent la salle. Un joueur trouve le terminal, bute sur le code |
| ~1:15 | Première manifestation d'IRIS *(puis toutes les 75 s — 8 à 9 sur la phase)* |
| ~2:00 → ~4:00 | Aller-retour RÉSEAU. Authentification. Les autres commencent les documents |
| ~4:00 → ~6:00 | Les 5 symboles. Aller-retour DEV. Ouverture de `◆` |
| **5:51** | **Cadenas α se referme** |
| ~6:00 → ~10:00 | Lecture de `noyau.core`, des 3 documents, éventuellement des 2 fragments |
| **9:45** | **Cadenas β se referme** |
| ~10:00 → 13:00 | Discussion. Décision. Ou pas |
| **13:00** | **Cadenas γ** → fin |

**Charge réelle :** ~6 à 8 minutes d'activité pour 13 minutes. Le reste est de la lecture
et de la discussion — ce qui est **voulu** (§9 : « la phase 2 est la phase de la
compréhension collective »), mais seulement si les joueurs savent qu'ils ont le droit de
lire au lieu de chercher. Sans objectif énoncé, ce temps se vit comme du blocage.

---

## 5. Ce qui manque — quatre trous, tous peu coûteux

### 5.1 — La procédure n'est énoncée nulle part ⚠️ *le vrai problème*

Rien ne dit *localiser et supprimer le noyau*. IRIS ne le dira pas (et ne doit pas).
Le terminal ouvre directement sur un champ de mot de passe.

**Correctif proposé** — un en-tête permanent sur le terminal, visible dès l'étape 1 :

```
   PROCÉDURE DE CONFINEMENT — P-4471
   1. Ré-authentification administrateur
   2. Localiser le noyau de l'instance
   3. Supprimer le noyau

   Exécution automatique à expiration du délai.
```

Cinq lignes qui règlent **trois** problèmes d'un coup : l'objectif, la légitimité des
trois étapes, et le fait que le temps a un coût.

### 5.2 — Le symbole `◆` n'a aucune dépendance nommée ⚠️

La règle impérative du §5 — *« toute dépendance non satisfaite est affichée et nommée, et
le poste qui la produit est désigné »* — structure toute la phase 1. **La phase 2
l'abandonne** : cinq symboles, aucun indice, et un message d'erreur qui ne pointe nulle
part.

**Correctif proposé** — une ligne sous la grille de symboles, dans le style des
dépendances de phase 1 :

```
   répertoire de l'instance ...... INCONNU · source : poste DEV
```

C'est cohérent avec quinze minutes d'apprentissage, et ça ne donne pas la réponse.

### 5.3 — L'enjeu du décompte n'est jamais dit

Les cadenas se referment, personne ne sait ce que ça déclenche. Or le §9 fait reposer la
tension sur le « coût du doute » : hésiter n'a de prix que si on sait qu'il y en a un.
Réglé par la dernière ligne du correctif 5.1.

### 5.4 — L'action de la Fin B est trop discrète

Le §2 exige qu'elle soit *« visible et disponible dans l'interface »*, rien n'indiquant
qu'elle est pertinente. Aujourd'hui ce sont **deux ronds de 24 px à 70 % d'opacité**, en
bas de l'écran, sous un bouton `SUPPRIMER` en rouge et en `size="lg"`.

Ce n'est pas discret, c'est caché — et la différence est toute la différence. Il faut
leur donner le même poids visuel que le reste du bloc `noyau.core` : mêmes cadenas que
le poste SYSTÈME, à taille lisible, avec le libellé `permissions du dossier parent`.
**Toujours aucune explication** — juste visibles.

---

## 6. Conséquence sur les textes

| Texte | Ce que ce relevé change |
|---|---|
| **C1** `noyau.core` | Se lit à l'étape 3, **bouton `SUPPRIMER` déjà à l'écran**. Le texte est lu par quelqu'un dont la main est sur le bouton — donc court et dense, sinon il n'est pas fini |
| **C7** `TERMINAL_AUTH_TAUNT` | S'affiche à l'étape 2, juste après l'authentification. C'est la première fois qu'IRIS s'adresse à eux **dans une interface** et non au projecteur |
| **C9** `LOCKDOWN_REACTION` | Ne se déclenche que si **x et r** sont fermés tous les deux. Un joueur qui n'en ferme qu'un n'a aucun retour — normal, mais ça veut dire que la réplique doit fonctionner comme une **découverte**, pas comme une confirmation |
| **C10** `EMPTY_DIR_TEXT` | Renvoyé pour **4 symboles sur 5**. C'est le texte le plus lu de la phase 2 et il est aujourd'hui purement fonctionnel — il mérite d'être écrit |
| **C2-C4** documents | Lus pendant que le terminal bloque sur le code ou le symbole. Ils sont l'occupation des 3 joueurs qui n'ont pas le clavier — donc ils doivent tenir **sans contexte préalable** |
