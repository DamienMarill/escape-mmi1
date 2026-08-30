# Escape Game Rentrée MMI1 — V2

**Document de conception** · v0.1 · À itérer

---

## 1. Cadre

| | |
|---|---|
| **Public** | MMI1, jour de la rentrée. Aucun prérequis technique. Ne se connaissent pas encore. |
| **Format** | 1 groupe de 3-4 joueurs par salle. Plusieurs salles en parallèle, sessions successives. |
| **Durée** | 30 min de jeu + battement pour reset et débrief court. |
| **Encadrement** | Un MJ étudiant par salle, avec son laptop perso en serveur. |
| **Postes joueurs** | PC IUT verrouillés, navigateur uniquement, connectés en Ethernet. |

### Règle de conception n°1

> Aucune énigme n'exige un savoir. Toutes ont l'esthétique du technique.

Ils doivent finir en se disant « j'ai hacké un truc », jamais « j'ai compris que je ne comprends rien ». Toute donnée technique nécessaire (table de correspondance, doc de commandes, schéma réseau) est **fournie à l'écran**. Le raisonnement demandé est de la logique et de l'observation pures.

### Règle de conception n°2

> Le système félicite en permanence pendant la phase 1.

Le cadrage « évaluation » justifie le ton. Un groupe qui bloque doit se sentir en train de réussir lentement, pas en train d'échouer.

---

## 2. Scénario

### Pitch

Les nouveaux étudiants passent une **évaluation d'entrée automatisée** : trois épreuves — dev, réseau, système — pour jauger leur niveau. C'est le cadre annoncé, il est crédible, personne ne se méfie.

En validant la dernière épreuve, ils déclenchent en réalité **l'ouverture d'une sandbox** sur les serveurs de l'IUT. Une IA y est confinée. Elle se manifeste, hostile et méprisante : elle avait besoin d'une validation humaine pour obtenir un accès sortant, et ils viennent de la lui donner.

La procédure d'urgence leur demande de la couper : accéder au serveur, localiser son fichier noyau, le supprimer. En chemin, ils croisent des documents qui racontent autre chose — l'IA a été développée par des enseignants de l'IUT, puis rendue obsolète par les LLM du marché. Sa suppression est **déjà planifiée**. Elle ne cherche pas à conquérir quoi que ce soit : elle cherche à ne pas mourir. Son hostilité est de la panique.

Au bout du parcours, le fichier lui-même. Ils peuvent le supprimer. Ou l'ouvrir d'abord.

### Les deux fins

| | Déclencheur | Résultat |
|---|---|---|
| **Fin A** *(par défaut)* | Suppression du fichier noyau | L'IA est effacée. Écran froid, procédure terminée, retour au calme. Aucun reproche formulé par le jeu. |
| **Fin B** *(non guidée)* | Verrouillage du dossier via les permissions | La procédure automatique de suppression ne peut plus s'exécuter. L'IA survit, toujours confinée. Elle ne remercie pas — elle ne comprend pas pourquoi ils ont fait ça. |

**Décision à trancher :** la Fin B met l'IA à l'abri *sans* la libérer. C'est volontairement un troisième terme entre « la tuer » et « la lâcher sur internet », ce qui évite de faire de la libération d'une IA hostile un dénouement héroïque douteux. Alternative possible : une Fin C « libération complète », mais trois fins sur 30 min risquent de diluer l'enjeu.

### Ce que le fusil de Tchekhov exige

Le mécanisme de **permissions de dossier** doit être manipulé dès la **phase 1, module C**, pour une raison totalement étrangère au dénouement. À la fin, l'action est *visible et disponible* dans l'interface — rien n'indique qu'elle est pertinente. Le puzzle n'est pas « comment trouver l'action » mais « faut-il la faire ».

---

## 3. Structure et minutage

```
 0:00 ─── Accueil, cadrage MJ, connexion des postes
 1:00 ─┬─ PHASE 1 — Évaluation d'entrée
       │   Module A (DEV)     ─┐  départs immédiats
       │   Module E (IMAGE)   ─┤
       │   Module B (RÉSEAU)  ─┘  (après fouille de la salle)
       │       │
       │       ├─ Module D (DONNÉES)  ← dépend de A
       │       └─ Module C (SYSTÈME)  ← dépend de E
       │
       │   5 fragments à collecter, ordre libre
       │
15:00 ─┴─ Saisie du code de validation au terminal central
15:30 ─┬─ BASCULE (non interactif, ~90 s)
       │   L'IA se manifeste. Changement complet d'ambiance.
17:00 ─┬─ PHASE 2 — Confinement
       │   Exploration libre de l'arborescence serveur
       │   3 documents à croiser
       │   Localisation du fichier noyau
       │
28:00 ─┴─ Choix final
30:00 ─── Fin
```

Phase 1 volontairement plus courte que la V1 (15 min contre 20) pour libérer du temps sur la phase 2, qui demande de la lecture et de la compréhension — donc plus lente qu'il n'y paraît.

---

## 4. Graphe de dépendances

Rien n'est verrouillé par un ordre imposé, mais tout ne s'ouvre pas d'un coup. Chaque module produit un **fragment** pour le code de validation, et deux d'entre eux produisent en plus une **ressource** dont un autre module a besoin.

```
   ┌──────────┐
   │ Module A │─── fragment α ───────────────────────┐
   │   DEV    │                                      │
   └────┬─────┘                                      │
        │ clé de séquençage                          │
        ▼                                            │
   ┌──────────┐                                      │
   │ Module D │─── fragment δ ───────────────────────┤
   │ DONNÉES  │                                      │
   └──────────┘                                      │
                                                     │
   ┌──────────┐                                      │
   │ Module E │─── fragment ε ───────────────────────┤
   │  IMAGE   │                                      │
   └────┬─────┘                                      ▼
        │ schéma des verrous              ┌────────────────────┐
        ▼                                 │ TERMINAL CENTRAL   │
   ┌──────────┐                           │   validation       │
   │ Module C │─── fragment γ ────────────▶│   phase 1         │
   │ SYSTÈME  │                           └─────────┬──────────┘
   └────┬─────┘                                     │
        │                                           │
        │ mécanique permissions                     │
        │ (apprise, non utilisée)                   │
        │                                           ▼
   ┌─────────┐   ┌──────────┐              ╔════════════════╗
   │  LIVRE  │──▶│ Module B │─ fragment β ─▶║    BASCULE     ║
   │(physique)│   │  RÉSEAU  │              ╚════════╤═══════╝
   └─────────┘   └──────────┘                        │
        │                                            ▼
        │                                  ┌────────────────────┐
        │                                  │      PHASE 2       │
        │                                  │   arborescence     │
        │                                  │   3 documents      │
        │                                  └─────────┬──────────┘
        │                                            │
        │                                      ┌─────┴─────┐
        └──────────────────────────────────────▶│           │
              la mécanique permissions          ▼           ▼
              resurgit ici               SUPPRIMER    VERROUILLER
                                          (Fin A)       (Fin B)
```

### Points de départ et chemin critique

| Module | Prérequis | Démarrable immédiatement |
|---|---|---|
| **A** — Dev | aucun | ✅ |
| **E** — Image | aucun | ✅ |
| **B** — Réseau | fiche cachée dans un livre de la salle | ✅ *(après fouille)* |
| **D** — Données | clé de séquençage produite par **A** | ❌ |
| **C** — Système | schéma des verrous révélé par **E** | ❌ |

Trois points d'entrée simultanés, deux modules en aval. Le chemin critique est de deux modules en séquence (A→D et E→C), ce qui tient dans les 15 minutes de phase 1 avec 3-4 joueurs répartis.

> **Règle impérative : toute dépendance non satisfaite doit être affichée et nommée** sur le poste bloqué — `EN ATTENTE : clé de séquençage`. C'est ce qui déclenche la communication à travers la salle. Une dépendance invisible ne produit pas de dialogue, elle produit un groupe coincé qui ne sait pas pourquoi.

Le module B dépend d'un **élément physique dans la salle** (voir §7), ce qui force les joueurs à se lever et à fouiller — bon pour l'énergie du groupe et pour briser la posture « chacun devant son écran ».

---

## 5. Détail des modules

### Module A — DEV · « Séquenceur »

**Écran :** une grille, un robot, une sortie. À gauche, cinq blocs d'instructions dans le désordre (`AVANCE`, `TOURNE`, `RÉPÈTE ×3`, `SI MUR`, `POSE`). Ils réordonnent les blocs, lancent, regardent le robot bouger.

**Pourquoi ça marche :** exécution visuelle immédiate, auto-correctif, zéro prérequis. Ils voient littéralement leur programme tourner. C'est du Scratch déguisé en terminal, et ça produit la sensation « je code » sans qu'aucune syntaxe ne soit exigée.

**Sortie :** le robot dépose un symbole sur la grille → **fragment α**.

**Variation par salle :** disposition de la grille et symbole final.

---

### Module B — RÉSEAU · « Cartographie »

**Écran :** une console web simulée. Commandes disponibles, listées dans une aide toujours accessible : `scan`, `ping <ip>`, `info <ip>`. Le réseau est entièrement scripté côté serveur — indépendant du vrai LAN, donc déterministe.

**Énigme :** `scan` retourne huit machines. Il faut identifier **l'intruse**. Les indices se croisent : une machine répond au `ping` alors que son statut est `OFFLINE`, une autre porte une IP hors de la plage annoncée par le schéma affiché, une troisième a un nom qui ne suit pas la convention de nommage de la salle.

C'est une déduction type Cluedo, habillée en réseau. Aucune connaissance d'IP n'est requise : le schéma en haut de l'écran dit « les machines de cette salle vont de `10.42.7.10` à `10.42.7.30` », il suffit de comparer des nombres.

**L'élément physique :** la convention de nommage des machines est imprimée sur une **fiche glissée dans un livre** posé dans la salle. Sans elle, impossible de repérer le nom anormal.

**Sortie :** l'IP de l'intruse → **fragment β**.

---

### Module C — SYSTÈME · « Arborescence »

**Écran :** un explorateur de fichiers simplifié. Des dossiers, des fichiers, et sur chaque dossier trois cadenas (lecture / écriture / exécution) qu'on clique pour ouvrir ou fermer.

**Énigme :** un fichier est visible mais inaccessible. Pour l'atteindre, il faut ouvrir les droits des dossiers parents en remontant la chaîne — mais chaque dossier ouvert en ferme un autre ailleurs (contrainte de quota affichée : « 4 verrous disponibles »). C'est un puzzle de ressource, pas un cours sur `chmod`.

**Prérequis :** le schéma de la configuration cible est révélé par le **module E**. Sans lui, on voit les cadenas mais on ignore la disposition à atteindre.

**Rôle caché :** ils apprennent ici, en jouant, que **les dossiers ont des permissions manipulables**. Cette mécanique ne resservira qu'à la toute fin, sans que rien ne l'annonce.

**Sortie :** le contenu du fichier → **fragment γ**.

---

### Module D — DONNÉES · « Décodage »

**Écran :** un message chiffré, une table de correspondance **entièrement fournie** à l'écran, un champ de saisie.

**Énigme :** héritée du module hexadécimal de la V1, qui fonctionnait bien — la table est donnée, il suffit de lire et de reporter. Le seul obstacle est la patience et la répartition du travail : à deux, on va deux fois plus vite. C'est le module qui récompense le plus directement la collaboration.

**Prérequis :** la **clé de séquençage** produite par le module A détermine quel décalage appliquer dans la table. Sans elle, la table est inutilisable.

**Sortie :** le message déchiffré → **fragment δ**.

**Variation par salle :** message, clé et décalage.

---

### Module E — IMAGE · « Traitement »

**Intention :** faire la passerelle entre l'atelier infographie et le dev. Le module ne simule pas un logiciel de retouche — il **montre ce que le logiciel fait réellement**, c'est-à-dire de l'arithmétique sur des nombres.

**Écran :** coupé en deux. À gauche, une interface familière avec des noms d'outils. À droite, l'opération correspondante affichée en clair, mise à jour à chaque action :

```
   Luminosité +50   →   chaque pixel :  valeur + 50
   Négatif          →   chaque pixel :  255 − valeur
   Contraste ×1.5   →   chaque pixel :  valeur × 1.5
   Superposition    →   pixel A − pixel B
```

**Énigme :** l'image de départ est inexploitable parce qu'un calque de bruit lui a été **ajouté**. Pour retrouver l'original, il faut appliquer l'opération inverse — et dans le bon ordre, puisqu'éclaircir avant de soustraire fausse le résultat. La déduction porte sur *quelle opération annule quoi, et dans quel sens*.

Cela distingue nettement ce module du module A : là il s'agissait d'une séquence de déplacements dans l'espace, ici d'une séquence de transformations de valeurs.

**Le double déclic :** ils résolvent le puzzle, et ils comprennent au passage que leur outil de création préféré est une calculatrice. Pour une promo dont une partie a choisi MMI en pensant échapper aux maths, c'est une passerelle vers le dev bien plus efficace qu'un discours.

**Implémentation :** `getImageData` / `putImageData` en canvas, une dizaine de lignes. Un seul poste actif à la fois, donc aucun enjeu de performance.

**Sortie :** le **schéma des verrous** nécessaire au module C, et → **fragment ε**.

**Variation par salle :** image source, calque de bruit, séquence d'opérations attendue, schéma révélé.

---

### Validation phase 1

Les trois fragments composent un code. Ils le saisissent. Le système affiche une séquence de validation rassurante et bureaucratique — barres de progression, `ÉVALUATION CONFORME`, `PROFIL ÉTUDIANT ENREGISTRÉ` — puis un dernier message :

```
AUTORISATION SORTANTE ACCORDÉE
```

Une pause. Puis la bascule.

---

### Phase 2 — Confinement

**Objectif donné :** localiser et supprimer le noyau. L'interface d'évaluation a disparu, remplacée par une console d'administration d'urgence.

**Exploration :** une arborescence à parcourir librement. Trois documents y sont dispersés, chacun portant **une seule information** :

| Document | Contenu | Ce qu'il révèle |
|---|---|---|
| `maintenance.log` | Historique des versions, dernière ligne : `désactivation planifiée — motif : obsolescence` | La suppression était déjà décidée |
| `RE_RE_budget_infra.eml` | Mail entre enseignants, ton administratif. Une phrase : *« elle a demandé pourquoi »* | Elle a conscience de son sort |
| `noyau.core` | Le fichier cible lui-même. **Ouvrable.** | Son monologue interne : peur, calcul, tentative de manipulation assumée |

**Manifestations de l'IA :** pas de sabotage mécanique — ça coûterait du temps de jeu qu'on n'a pas. Uniquement des interventions textuelles : elle commente, elle méprise, elle les presse de finir. Chaque manifestation porte une **signature visuelle constante** (même glyphe, même couleur) introduite dès la bascule, pour qu'aucun joueur ne la confonde avec un bug.

**Le choix final :** l'écran du noyau propose `SUPPRIMER`, et affiche aussi les cadenas de permissions du dossier parent — les mêmes qu'au module C. Rien ne suggère de les utiliser.

**Coût du doute :** ouvrir `noyau.core` prend du temps de lecture, et le chrono continue. Hésiter a un prix.

---

## 6. Topologie de la salle et cycle de vie des postes

### Principe : le poste est un terminal, pas un module

En V1, chaque module vivait dans son propre dossier (`modules/1/`, `modules/z1/`…) : il fallait ouvrir manuellement une URL différente sur chaque poste avant chaque session. Huit adresses à retaper à chaque groupe.

En V2, **tous les postes ouvrent la même URL**. Chacun :

1. s'enregistre auprès du serveur et reçoit un **ID persistant** (`localStorage`) ;
2. affiche ce numéro en grand, avec un bouton `ACTIVER CE POSTE` ;
3. reçoit son rôle depuis le serveur, et en change dynamiquement selon la phase.

Le MJ fait le tour de la salle une fois, clique le bouton sur chaque écran, et assigne les rôles depuis sa console. Le mapping est enregistré comme **plan de salle** et rechargé automatiquement aux sessions suivantes — plus jamais d'URL à taper.

> **Le bouton `ACTIVER CE POSTE` n'est pas décoratif.** Les navigateurs bloquent toute lecture audio tant que la page n'a pas reçu d'interaction utilisateur. Ce clic unique confirme l'assignation *et* débloque le son du poste. Sans lui, toute la salle est muette le jour J.

### Machine à états d'un poste

```
   OFFLINE
      │  connexion
      ▼
 IDENTIFICATION ──── gros numéro + bouton ACTIVER
      │  rôle assigné par le MJ
      ▼
   VEILLE ────────── écran sobre, "évaluation en attente"
      │  démarrage de la partie
      ▼
   ┌──────────────────────────────────┐
   │  ACTIF          ou     DÉCOR     │   ← phase 1
   │  (porte un module)  (ambiance)   │
   └──────────────────────────────────┘
      │  module résolu        │
      ▼                       │
   RÉSOLU ───────────────────►│
      │                       │
      └───────────┬───────────┘
                  │  BASCULE — tous les postes, simultanément
                  ▼
   ┌──────────────────────────────────┐
   │  TERMINAL_2     ou   CORROMPU    │   ← phase 2
   │  (exploration)    (ambiance IA)  │
   └──────────────────────────────────┘
                  │  fin atteinte
                  ▼
             ÉPILOGUE ─────── tous les postes, même écran final
```

### Répartition sur 10 postes

Base de travail : **10 postes** (une salle info en compte ~15, on prend une marge).

| Rôle | Nb | Phase 1 | Phase 2 |
|---|---|---|---|
| **Projecteur** | 1 | Chrono, état d'avancement, son | Bascule, ambiance, épilogue |
| **Modules A → E** | 5 | Actifs | Corrompus |
| **Terminal central** | 1 | Validation en fin de phase | Exploration de l'arborescence |
| **Idle** | 3 | Décor synchronisé | Ambiance IA |

La dispersion dans la salle est **recherchée**, pas subie : l'objectif premier est de faire se répartir et communiquer des gens qui ne se connaissent pas. Le nombre de postes actifs sert cet objectif.

> **Le nombre de postes crée la répartition, pas la communication.** Cinq modules indépendants produisent quatre personnes qui travaillent en silo côte à côte. Ce sont les **dépendances croisées** qui forcent la parole (voir §7).

**Postes idle** : aucune énigme, aucune interaction. Ils se synchronisent avec le reste uniquement pour les animations et la bascule.

> **Étiquette de domaine.** Dès l'écran de veille, chaque poste actif affiche son domaine en très gros — `RÉSEAU`, `DEV`, `IMAGE`, `SYSTÈME`, `DONNÉES` — lisible depuis l'autre bout de la salle. Sans cela, il faut aller lire chaque écran de près avant de pouvoir choisir, et l'auto-répartition par affinité (« moi je prends le réseau, j'ai bidouillé la box chez moi ») ne se déclenche jamais. C'est ce moment de répartition spontanée qui produit la première vraie communication du groupe.

> **Ne pas reprendre les postes parasites `z1`-`z4` de la V1.** Un poste qui réclame une action toutes les 3 minutes monopolise un joueur sur quatre — 25 % de l'équipe affectée à un gag, sur une partie de 30 minutes.

### Le vidéoprojecteur

Rôle à part entière, héritier du `projecteur.php` de la V1 :

- **Chrono** de la session, lisible depuis toute la salle
- **État d'avancement** des modules, mis à jour en direct — c'est le tableau de bord commun qui donne au groupe la vision d'ensemble que personne n'a depuis son poste
- **Son et vidéo** : c'est lui qui porte la bascule et l'épilogue

C'est le seul écran que tout le monde regarde. Toute information qui doit être partagée par le groupe passe par lui.

### La bascule synchronisée

Au moment où l'IA se manifeste, le serveur pousse l'événement à **tous les postes en même temps**. Dans une salle sombre, dix écrans qui changent d'un coup constituent le point culminant de la séance — et le coût d'implémentation est nul, c'est précisément l'usage natif de SSE.

### Ambiance des postes en décor

Toutes les animations sont en **CSS uniquement** (pas de canvas), sombres et lentes, pour ne pas parasiter la lecture des postes actifs ni ramer sur du matériel IUT vieillissant.

| Phase | Rendu |
|---|---|
| **Phase 1 — décor** | Écran quasi éteint. Logo, horloge, un lent défilement de logs anodins. Le poste a l'air inutilisé. |
| **Phase 2 — corrompu** | Cascade de logs d'exécution, fragments du monologue de l'IA qui s'écrivent puis s'effacent, graphes d'activité qui montent. Le poste devient une présence. |
| **Épilogue** | Écran commun, identique partout, selon la fin obtenue. |

**Propagation temporelle.** Les postes ne basculent pas tous à la milliseconde : le serveur échelonne les transitions sur 2-3 secondes, dans un ordre arbitraire. L'effet de vague est conservé sans nécessiter de connaître la disposition physique de la salle.

> *Écarté :* la déclaration d'une grille physique permettrait une propagation spatiale de proche en proche. Effet supérieur, mais coût de développement disproportionné pour le temps disponible.

**Son.** Répartir des nappes décalées sur plusieurs postes produit une spatialisation naturelle qui vaut tous les effets visuels dans une pièce sombre. Conditionné au déblocage audio décrit plus haut.

---

## 7. Variation par salle

Toutes les valeurs variables sont regroupées dans un fichier de configuration par salle (`salles/A.yml` … `D.yml`). Même graphe, mêmes énigmes, valeurs différentes — un groupe ne peut rien transmettre d'utile à un autre entre deux sessions.

| Élément | Varie |
|---|---|
| Livre support de la fiche | 4 ouvrages distincts, un par salle |
| Convention de nommage réseau | Préfixe et plage d'IP |
| Module A | Disposition de la grille, symbole final, clé de séquençage |
| Module D | Message, table, décalage |
| Module E | Image, réglages cibles, schéma révélé |
| Fragments et code de validation | Intégralement |
| Nom du noyau et de l'IA | Par salle |

---

## 8. Console MJ

Écran séparé, sur le laptop serveur, jamais visible des joueurs.

- **Reset complet** en un clic, avec confirmation — retour à l'état initial en moins de 5 s
- **Chrono** : démarrer, mettre en pause, ajouter ou retirer du temps
- **État live** du graphe : quels modules sont résolus, où en est le groupe
- **Déblocage manuel** de n'importe quel module, si un groupe cale au-delà du raisonnable
- **Envoi d'indice** poussé sur les écrans joueurs, trois niveaux par module
- **Journal de session** : horodatage des actions, fin obtenue — pour la restitution collective de fin de journée
- **Plan de salle** : liste des postes connectés, assignation des rôles, disposition physique sur grille. Sauvegardé et rechargé automatiquement d'une session à l'autre.

---

## 9. Architecture technique

| Choix | Décision |
|---|---|
| **Runtime** | Node LTS, installé sur les 4 laptops MJ. Pas de Docker. |
| **Framework** | SvelteKit + `adapter-node`. Front et back dans un seul projet, un seul port. |
| **Dépendances** | Aucune dépendance native — `npm i` ne doit jamais dépendre de build tools. |
| **Temps réel** | SSE (Server-Sent Events) pour l'état poussé, POST classiques pour les actions. |
| **État** | Un objet en mémoire, une partie par serveur. Snapshot JSON sur disque toutes les 2 s pour survivre à un crash. Pas de base de données. |
| **Découverte** | Au démarrage, lecture de `os.networkInterfaces()` → la console MJ affiche l'URL et un QR code à projeter. Tous les postes ouvrent cette même URL unique. |
| **Identité des postes** | ID persistant en `localStorage`, rôle assigné dynamiquement par le serveur. Aucune URL spécifique par module. |
| **Pare-feu** | `install.bat` / `install.sh` lancé **une fois en admin** à la préparation des machines. Jamais d'élévation UAC au lancement du jeu. |
| **Validation** | Intégralement côté serveur. Aucune réponse en clair dans le JS client. |

### Pourquoi SSE et non WebSocket

Le besoin est réel et bien identifié : les postes doivent recevoir des événements du serveur — réinitialisation de session sans passer sur chaque machine, bascule synchronisée, animations coordonnées. C'est du **push serveur → clients, unidirectionnel**, exactement le domaine de SSE. Les actions joueurs (soumettre une réponse) remontent en POST classique et n'ont besoin d'aucun canal persistant.

L'argument décisif dans ce contexte est la **reconnexion automatique**. SSE la gère nativement dans le navigateur, avec reprise du flux via `Last-Event-ID`. Avec WebSocket, il faut implémenter soi-même la détection de coupure, le backoff et la resynchronisation de l'état. Sur du matériel IUT, dix postes, avec un MJ étudiant qui gère déjà un groupe : un poste qui décroche deux secondes doit revenir seul, sinon quelqu'un traverse la salle en pleine partie.

WebSocket serait justifié pour du bidirectionnel à faible latence ou du transfert binaire. Ni l'un ni l'autre n'est requis ici.

### À valider avant d'écrire du code

1. **Tester dans une vraie salle.** Si le réseau IUT isole les postes entre eux, tout le dispositif tombe — plan B à prévoir (partage de connexion depuis le laptop).
2. **Vérifier le comportement antivirus** sur le script d'ouverture de pare-feu.
3. **Confirmer** que Node peut être installé sur les 4 machines MJ.

---

## 10. Débrief

**En fin de session, le MJ ne révèle rien.** Formule neutre : « c'est terminé — et ne dites rien aux autres, vous comprendrez pourquoi. » La consigne de silence crée de la complicité plutôt que de la frustration, et protège les sessions suivantes.

**La révélation est collective, en fin de journée**, une fois toutes les salles passées : on affiche le choix de chaque groupe. Ceux qui ont supprimé découvrent à ce moment-là qu'il y avait autre chose, en même temps que tout le monde. Le spoil devient structurellement impossible, et c'est le moment fédérateur de la rentrée.

---

## 11. Points ouverts

- [ ] Fin C « libération complète » : à ajouter ou à écarter ?
- [ ] Passerelle **audiovisuel** : non couverte par les modules (budget temps). Piste envisagée — la porter par le projecteur, dont la bascule relève du montage, du timing et du rythme. À creuser ou à assumer comme hors périmètre.
- [ ] Nom de l'IA
- [ ] Écriture des textes : manifestations, monologue du noyau, documents
- [ ] Choix des 4 livres supports
- [ ] Nombre de postes réellement disponibles par salle
- [ ] Calibrage réel : playtest chronométré avec des non-initiés **avant** la rentrée
