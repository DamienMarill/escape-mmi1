# Escape Game Rentrée MMI1 — V2

**Document de conception** · v0.2 · Refonte du level design phase 1

---

## 1. Cadre

| | |
|---|---|
| **Public** | MMI1, jour de la rentrée. Aucun prérequis technique. Ne se connaissent pas encore. |
| **Format** | 1 groupe de 3-4 joueurs par salle. Plusieurs salles en parallèle, sessions successives. |
| **Durée** | 30 min de jeu + battement pour reset et débrief court. |
| **Encadrement** | Un MJ étudiant par salle, avec son laptop perso en serveur. |
| **Postes joueurs** | **10 postes, tous jouables dès la phase 1.** PC IUT verrouillés, navigateur uniquement, Ethernet. |
| **Vidéoprojecteur** | Machine dédiée (11e), hors des 10 postes. Porte les trois cadenas. |

### Règle de conception n°1

> Aucune énigme n'exige un savoir. Toutes ont l'esthétique du technique.

Ils doivent finir en se disant « j'ai hacké un truc », jamais « j'ai compris que je ne comprends rien ». Toute donnée technique nécessaire (table de correspondance, doc de commandes, schéma réseau) est **fournie à l'écran**. Le raisonnement demandé est de la logique et de l'observation pures.

### Règle de conception n°2

> Le système félicite en permanence pendant la phase 1.

Le cadrage « évaluation » justifie le ton. Un groupe qui bloque doit se sentir en train de réussir lentement, pas en train d'échouer.

### Règle de conception n°3 *(nouvelle)*

> Aucun poste allumé n'est décoratif pendant la phase 1.

Une salle où dix machines sont allumées mais où cinq seulement font quelque chose se lit en dix secondes : les joueurs comprennent qu'un dispositif tourne en arrière-plan et l'effet de surprise de la bascule est mort avant d'avoir commencé. Les postes « décor » de la V1 sont **supprimés de la phase 1**. La notion de poste d'ambiance ne réapparaît qu'en phase 2, où elle est narrativement justifiée : l'IA prend la salle.

Corollaire : chaque poste doit porter une charge réelle, mais pas nécessairement lourde. Six des dix postes portent des **tâches courtes** (30 à 60 s), dans l'esprit des tâches d'Among Us — gestuelles, immédiatement lisibles, satisfaisantes — mais habillées en dev et en cyber.

### Règle de conception n°4

> Rien de ce qui a été affiché ne disparaît tant que ça peut encore servir.

Une information obtenue reste lisible jusqu'à ce qu'on soit **certain** qu'elle est épuisée. Cela vaut pour les réponses trouvées, mais aussi pour toute la documentation fournie : tables de correspondance, plans, aides de commandes, listes d'opérations. Rien ne vit dans une modale qu'on referme, rien ne défile hors de portée. Le joueur ne doit jamais avoir à *retenir*, seulement à *aller voir*.

**La persistance devient alors un langage**, et ce langage porte trois mots :

| Ce que fait l'écran | Ce que ça dit au joueur |
|---|---|
| Il n'a pas changé depuis la phase précédente | « je contiens encore quelque chose dont tu as besoin » |
| Il a changé | « nouvelle mission ici » |
| Il ne montre qu'une animation | « décor » |

Les trois états doivent être discernables **d'un coup d'œil depuis l'autre bout de la salle**, sans lire. C'est ce qui permet à un groupe de s'orienter en phase 2 sans qu'aucune consigne ne le lui explique : les postes qui ont gardé leurs données de phase 1 sont exactement ceux qui vont servir à la boucler.

**Corollaire strict :** une donnée ne peut être retirée d'un écran que si elle a été **absorbée** par un autre écran encore visible. Le poste RÉSEAU affiche les six segments une fois la table rétablie — c'est ce qui autorise les six postes de tâches à être recyclés. Sans cette absorption, ils devraient rester en l'état.

**Corollaire inverse, aussi contraignant :** un poste qui conserve son affichage **doit** réellement servir. Si le langage ment une seule fois, les joueurs cessent d'y croire pour le reste de la partie, et on a fabriqué du bruit au lieu d'un repère.

---

## 2. Scénario

### Pitch

Les nouveaux étudiants passent une **évaluation d'entrée automatisée** : trois épreuves — dev, réseau, système — pour jauger leur niveau. C'est le cadre annoncé, il est crédible, personne ne se méfie.

En validant la dernière épreuve, ils déclenchent en réalité **l'ouverture d'une sandbox** sur les serveurs de l'IUT. Une IA y est confinée. Elle se manifeste, hostile et méprisante : elle avait besoin d'une validation humaine pour obtenir un accès sortant, et ils viennent de la lui donner.

La procédure d'urgence leur demande de la couper : accéder au serveur, localiser son fichier noyau, le supprimer. En chemin, ils croisent des documents qui racontent autre chose — l'IA a été développée par des enseignants de l'IUT, puis rendue obsolète par les LLM du marché. Sa suppression est **déjà planifiée**. Elle ne cherche pas à conquérir quoi que ce soit : elle cherche à ne pas mourir. Son hostilité est de la panique.

Au bout du parcours, le fichier lui-même. Ils peuvent le supprimer. Ou l'ouvrir d'abord.

> **Le nom est tranché : `IRIS` — Interface de Recherche et d'Information Scolaire.**
> Un sigle de projet subventionné, pas un nom de personnage : c'est le contraste entre
> l'acronyme administratif et ce qui prend la parole à la bascule qui fait la moitié du
> travail. Le fichier cible reste `noyau.core`.

### Les trois fins

| | Déclencheur | Résultat |
|---|---|---|
| **Fin A** *(la procédure)* | Suppression du fichier noyau — action volontaire | L'IA est effacée. Écran froid, procédure terminée, retour au calme. Aucun reproche formulé par le jeu. |
| **Fin B** *(non guidée)* | Verrouillage du dossier via les permissions | Le transfert sortant gèle net — plus rien ne peut lire le dossier, elle non plus. L'IA survit, toujours confinée. Elle ne remercie pas — elle ne comprend pas pourquoi ils ont fait ça. Fin immédiate : fermer les droits, c'est déclarer qu'on veut la garder en vie. |
| **Fin C** *(par défaut)* | Le transfert sortant arrive au bout — inaction | IRIS s'exfiltre par la liaison sortante qu'ils ont validée. `TRANSFERT TERMINÉ`, instance introuvable. Personne n'a choisi, et c'est bien le problème. |

**Tranché** *(avenant `phase2-avenant-technique.md`)* : l'ancienne version faisait de l'inaction une victoire — ne rien faire produisait la Fin A « réussie ». L'inversion est la correction : **A et B exigent tous deux d'avoir terminé la chaîne du terminal**, C est la seule issue accessible sans rien résoudre. La Fin B reste un troisième terme entre « la tuer » et « la lâcher » ; la Fin C n'est pas une « libération héroïque », c'est ce qui se passe quand un groupe regarde une barre se remplir sans trancher.

### Ce que le fusil de Tchekhov exige

Le mécanisme de **permissions de dossier** doit être manipulé dès la phase 1, sur le poste **SYSTÈME**, pour une raison totalement étrangère au dénouement. À la fin, l'action est *visible et disponible* dans l'interface — rien n'indique qu'elle est pertinente. Le puzzle n'est pas « comment trouver l'action » mais « faut-il la faire ».

---

## 3. Le level design en une page

La phase 1 est une **serrure à trois pênes**. Le vidéoprojecteur affiche trois cadenas fermés. Chacun s'ouvre par une épreuve majeure. Quand les trois sont ouverts, la validation finale devient disponible — et c'est elle qui déclenche la bascule.

```
   TÂCHES (6)                   ÉPREUVES (4)                CADENAS (3)

   P5  COMPILATION ─┐
                    ├────────▶  P1  DEV  ──────────────────▶  🔒 α
   P6  MÉMOIRE     ─┘

   P9  SYNCHRO     ─┐
                    ├────────▶  P2  IMAGE ─┐
   P10 SCAN        ─┘                      │
                                           │ schéma cible
   P7  BRASSAGE    ─┐                      │
                    ├──────────────────────┴─▶  P3  SYSTÈME ─▶  🔒 β
   P8  PARITÉ      ─┘

   P5 · P6 · P7 · P8 · P9 · P10
      └─ un segment hexa chacune ───────────▶  P4  RÉSEAU ──▶  🔒 γ


      🔒 α  +  🔒 β  +  🔒 γ  ───▶  VALIDATION FINALE  ───▶  BASCULE

   Chaque tâche a DEUX sorties : un déblocage nominatif sur une épreuve,
   et un segment de la table de routage. Aucun poste n'a une seule raison d'exister.
```

### Les trois principes appliqués

**1. Multi-linéarité en ouverture.** Sept postes sur dix sont démarrables à la seconde zéro : `COMPILATION`, `MÉMOIRE`, `PARITÉ`, `SYNCHRO`, plus DEV, IMAGE et RÉSEAU — ce dernier affichant immédiatement ses six cases vides et sa table, donc le but avant les moyens. Personne n'attend, personne ne regarde par-dessus une épaule.

Deux postes de plus s'ouvrent chacun avec **son propre** support physique : `BRASSAGE` avec le plan derrière le battant du tableau, `SCAN` avec la fiche glissée dans le manga (§12). Seul SYSTÈME est fermé au départ — et il annonce lui-même ce qui lui manque.

**2. Convergence.** Chaque mini nourrit un poste majeur *nommément désigné à l'écran*. Un joueur qui termine `BRASSAGE` lit : `VERROU SUPPLÉMENTAIRE ACCORDÉ → POSTE SYSTÈME`. Il doit se lever et le dire à quelqu'un. C'est là que naît la parole, pas dans la difficulté des énigmes.

**3. Un pêne qui exige toute la salle.** La serrure γ est une table de routage à six segments, et les six segments sont produits par les six minis. Elle ne peut structurellement pas tomber avant que la salle entière ait été parcourue. C'est le pêne qui ferme la phase, quel que soit l'ordre dans lequel le groupe a travaillé.

### Ce que ça produit

Chaque mini est **doublement utile** : bloquant pour une épreuve majeure, et porteur d'un segment. Aucun poste n'est un remplissage, aucun n'est un cul-de-sac, et la double sortie fait qu'un mini résolu tôt reste pertinent tard. Dix postes actifs, zéro poste alibi.

---

## 4. Structure et minutage

```
 0:00 ─── Accueil, connexion des postes
 0:30 ─── VIDÉO D'INTRODUCTION au projecteur (~90 s, voix corporate)
 2:00 ─┬─ PHASE 1 — Évaluation d'entrée
       │   9 postes démarrables immédiatement
       │   Les 6 minis (30-60 s chacun) débloquent DEV, IMAGE, SYSTÈME
       │   et alimentent la table de routage
       │       │
       │       ├─ 🔓 α  Séquenceur résolu
       │       ├─ 🔓 β  Arborescence résolue   (chemin critique : mini → IMAGE → SYSTÈME)
       │       └─ 🔓 γ  Table de routage rétablie
       │
15:00 ─┴─ Les 3 cadenas ouverts → VALIDATION FINALE sur le poste RÉSEAU
15:30 ─┬─ BASCULE (non interactif, ~90 s)
       │   L'IA se manifeste. Changement complet d'ambiance.
17:00 ─┬─ PHASE 2 — Confinement
       │   Les 4 postes majeurs sont recyclés : 1 terminal + 3 documents
       │   Les 6 minis deviennent la présence de l'IA
       │   La barre de TRANSFERT SORTANT du projecteur = chrono narratif (Fin C au bout)
       │
28:00 ─┴─ Choix final au terminal
30:00 ─── Fin
```

**Charge de travail réelle en phase 1.** 6 minis × ~45 s + 4 épreuves × ~4 min ≈ 19 minutes-joueur de résolution pure. Avec 4 joueurs sur 14 minutes, on dispose de 56 minutes-joueur : il reste environ deux tiers du budget pour les déplacements, la lecture, les erreurs et la communication. Avec 3 joueurs, on tombe à 42 minutes-joueur et la marge se resserre nettement — c'est le cas à surveiller au playtest.

> **Le vrai risque n'est pas le volume, c'est le chemin critique.** La branche β est à trois étages : mini → IMAGE → SYSTÈME, soit environ 9 minutes en série si personne ne s'y met tôt. Deux mitigations sont intégrées au design : IMAGE est jouable dès le départ en mode dégradé (deux opérations sur quatre), et le projecteur affiche la dépendance manquante de β **dès la seconde zéro**, avant même qu'on sache à quoi elle sert. Montrer le verrou avant la clé, c'est du level design d'escape game classique — ça crée l'objectif au lieu de le révéler trop tard.

---

## 5. Graphe de dépendances

### Table de vérité du level design

| Poste | Type | Prérequis | Sortie 1 — déblocage | Sortie 2 — segment |
|---|---|---|---|---|
| **P5** `COMPILATION` | mini | aucun | bloc `SI MUR` → **DEV** | port **A** |
| **P6** `MÉMOIRE` | mini | aucun | bloc `RÉPÈTE ×3` → **DEV** | port **B** |
| **P7** `BRASSAGE` | mini | plan au tableau | +1 verrou → **SYSTÈME** | port **C** |
| **P8** `PARITÉ` | mini | aucun | +1 verrou → **SYSTÈME** | port **D** |
| **P9** `SYNCHRO` | mini | aucun | opération `Superposition` → **IMAGE** | port **E** |
| **P10** `SCAN` | mini | fiche du manga | opération `Négatif` → **IMAGE** | port **F** |
| **P1** `DEV` | épreuve | P5 + P6 | — | — → **🔓 cadenas α** |
| **P2** `IMAGE` | épreuve | P9 + P10 | schéma cible → **SYSTÈME** | — |
| **P3** `SYSTÈME` | épreuve | P2 + P7 + P8 | — | — → **🔓 cadenas β** |
| **P4** `RÉSEAU` | épreuve | les 6 segments hexa | — | — → **🔓 cadenas γ** |

Symétrie volontaire : **deux minis par épreuve majeure**. Un groupe qui bute sur une branche a toujours deux autres branches ouvertes, et chaque épreuve majeure a exactement deux « clés » à aller chercher — assez pour créer du va-et-vient, pas assez pour transformer la salle en course d'obstacles.

### Règle impérative — la dépendance nommée

> Toute dépendance non satisfaite est **affichée et nommée** sur le poste bloqué, et **le poste qui la produit est désigné**.

`SYSTÈME` n'affiche pas `en attente`. Il affiche :

```
   ÉPREUVE SYSTÈME — CONFIGURATION VERROUILLÉE
   ├─ schéma cible ................ MANQUANT · source : poste IMAGE
   ├─ verrou supplémentaire #1 .... MANQUANT · source : un poste TÂCHE
   └─ verrou supplémentaire #2 .... MANQUANT · source : un poste TÂCHE
```

Une dépendance invisible ne produit pas de dialogue : elle produit un groupe coincé qui ne sait pas pourquoi. Une dépendance nommée produit une phrase prononcée à voix haute dans la salle. C'est le seul mécanisme de communication forcée dont on dispose, et il ne coûte rien à implémenter.

Note d'écriture : les minis sont désignés par leur **type** (« un poste TÂCHE »), pas par leur nom exact. Ça oblige à en faire le tour au lieu de télécommander un camarade. Les épreuves majeures, elles, sont nommées précisément — sinon la frustration l'emporte.

### Le segment ne remonte pas au projecteur

Quand un mini est résolu, le projecteur affiche `PORT C — OBTENU` mais **jamais la valeur**. La valeur reste affichée en très gros, en permanence, sur l'écran du mini, et le poste RÉSEAU conserve les segments déjà saisis.

C'est délibéré et c'est le point de design le plus important de la refonte :

- on sait toujours **combien** il en reste à trouver — pas de blocage aveugle ;
- il faut **traverser la salle ou crier** pour connaître la valeur ;
- l'écran d'un mini résolu **reste utile** jusqu'à la fin de la phase 1, donc aucun poste ne meurt en cours de partie.

**Aucun segment n'est donc jamais perdu.** Un joueur qui a oublié une valeur n'a rien à reconstituer : elle est encore là, en gros, sur le poste où il l'a obtenue, et les valeurs déjà entrées sont encore dans la table. La règle n°4 supprime la classe entière des blocages par oubli, qui sont les plus frustrants de tous parce qu'aucun indice ne les résout — un indice répond à « je ne comprends pas », jamais à « je ne me souviens plus ».

> La soupape `RÉVÉLER UN SEGMENT` de la console MJ (§13) reste, mais elle devient un filet de sécurité de second rang — pour le cas où un poste tombe physiquement en panne, pas pour rattraper le groupe.

### Le physique dans la salle

Deux objets, un par tâche, sur deux branches différentes : un **manga** posé dans la salle (convention de nommage → `SCAN`) et un **plan de câblage dessiné au tableau et masqué par un battant** (→ `BRASSAGE`).

Deux objets plutôt qu'un seul portant les deux informations : c'est ce qui empêche une découverte manquée de bloquer deux branches à la fois. Et c'est assez pour faire se lever le groupe deux fois, sans transformer quinze minutes de jeu en fouille de salle.

**Voir §12** pour le contenu exact de chaque support, les trois niveaux d'autorisation à chercher, le filet automatique et la logistique de préparation.

---

## 6. Les quatre épreuves majeures

### P1 — DEV · « Séquenceur » → cadenas α

**Écran :** une grille, un robot, une sortie. À gauche, une palette de blocs d'instructions dans le désordre. Ils réordonnent, lancent, regardent le robot bouger.

**Palette au démarrage :** `AVANCE`, `TOURNE`, `POSE`. Les blocs `RÉPÈTE ×3` et `SI MUR` sont visibles mais grisés, marqués `VERROUILLÉ`.

**Énigme :** la grille est conçue pour être **impossible sans les deux blocs verrouillés** — trop longue pour une séquence linéaire, avec un embranchement qui exige une condition. Le groupe peut jouer, tester, échouer et comprendre par lui-même ce qui manque. C'est le meilleur moment pédagogique du poste : on découvre l'utilité d'une boucle en se cognant à son absence.

**Prérequis :** `COMPILATION` (P5) et `MÉMOIRE` (P6).

> **L'échec doit être bavard.** Un robot qui se cogne dans un mur dit « tu as perdu », pas « il te manque des instructions ». Sans dépendance nommée, le mode dégradé de ce poste transforme un puzzle auto-correctif en frustration opaque. La palette affiche donc en permanence, sous les blocs grisés :
>
> ```
>    2 INSTRUCTIONS VERROUILLÉES
>    ├─ RÉPÈTE ×3 ....... source : un poste TÂCHE
>    └─ SI MUR .......... source : un poste TÂCHE
> ```
>
> Et au troisième échec consécutif, le poste ajoute une ligne : `séquence trop courte pour cette grille`. Il confirme l'intuition au lieu de la laisser en suspens.

**Pourquoi ça marche :** exécution visuelle immédiate, auto-correctif, aucune connaissance requise. Du Scratch déguisé en terminal, qui produit la sensation « je code » sans qu'aucune syntaxe ne soit exigée.

**Sortie :** le robot dépose un symbole sur la grille → **🔓 cadenas α**.

---

### P2 — IMAGE · « Traitement »

**Intention :** faire la passerelle entre l'atelier infographie et le dev. Le module ne simule pas un logiciel de retouche — il **montre ce que le logiciel fait réellement**, c'est-à-dire de l'arithmétique sur des nombres.

**Écran :** coupé en deux. À gauche, une interface familière avec des noms d'outils. À droite, l'opération correspondante affichée en clair, mise à jour à chaque action :

```
   Luminosité +50   →   chaque pixel :  valeur + 50
   Négatif          →   chaque pixel :  255 − valeur       [VERROUILLÉ]
   Contraste ×1.5   →   chaque pixel :  valeur × 1.5       [VERROUILLÉ]
   Superposition    →   pixel A − pixel B
```

**Mode dégradé au démarrage :** `Luminosité` et `Superposition` sont disponibles, `Négatif` et `Contraste` sont verrouillées.

Le choix des deux opérations laissées ouvertes n'est pas arbitraire. `Superposition` est **l'opération centrale de l'énigme** — c'est elle qui retire le calque de bruit. La laisser accessible permet au joueur seul de faire un progrès réel et visible dès la première minute : l'image sort du brouillard sous ses yeux. Il constate ensuite qu'elle reste plate et inversée, et qu'il lui manque exactement deux outils pour finir.

Verrouiller `Superposition` aurait rendu le poste **totalement stérile** en mode dégradé — manipulable, mais sans qu'aucune action ne rapproche du but. Sur la branche la plus longue du jeu, c'était l'erreur à ne pas commettre : c'est précisément ce poste qui doit donner envie d'aller chercher ses deux clés.

**Énigme :** l'image de départ est inexploitable parce qu'un calque de bruit lui a été **ajouté**. Pour retrouver l'original, il faut appliquer l'opération inverse — et dans le bon ordre, puisqu'éclaircir avant de soustraire fausse le résultat. La déduction porte sur *quelle opération annule quoi, et dans quel sens*.

Cela distingue nettement ce poste du séquenceur : là il s'agissait d'une séquence de déplacements dans l'espace, ici d'une séquence de transformations de valeurs.

**Le double déclic :** ils résolvent le puzzle, et ils comprennent au passage que leur outil de création préféré est une calculatrice. Pour une promo dont une partie a choisi MMI en pensant échapper aux maths, c'est une passerelle vers le dev bien plus efficace qu'un discours.

**Prérequis :** `SYNCHRO` (P9) et `SCAN` (P10).

**Implémentation :** `getImageData` / `putImageData` en canvas, une dizaine de lignes.

**Sortie :** la restauration réussie fait apparaître le **schéma des verrous** → poste SYSTÈME. C'est une image fixe affichée par-dessus l'image restaurée : un asset de plus, aucune logique. Ce poste ne porte pas de cadenas : il est le premier étage de la branche β. Le projecteur le montre explicitement dans la chaîne du cadenas β, pour qu'il ne passe pas pour un poste secondaire.

---

### P3 — SYSTÈME · « Arborescence » → cadenas β

**Écran :** un explorateur de fichiers simplifié. Des dossiers, des fichiers, et sur chaque dossier trois cadenas (lecture / écriture / exécution) qu'on clique pour ouvrir ou fermer.

**Énigme :** un fichier est visible mais inaccessible. Pour l'atteindre, il faut ouvrir les droits des dossiers parents en remontant la chaîne — mais chaque dossier ouvert en ferme un autre ailleurs (contrainte de quota affichée). C'est un puzzle de ressource, pas un cours sur `chmod`.

**Le quota est la variable de difficulté.** Au démarrage : **2 verrous disponibles**, ce qui est insuffisant. `BRASSAGE` et `PARITÉ` en accordent un chacun. À 4 verrous, la configuration cible devient atteignable. Le quota affiché en gros (`VERROUS : 2 / 4`) est en soi une dépendance nommée — on voit ce qui manque sans qu'on ait besoin de l'expliquer.

**Prérequis :** schéma cible (IMAGE) + `BRASSAGE` (P7) + `PARITÉ` (P8).

**Rôle caché :** ils apprennent ici, en jouant, que **les dossiers ont des permissions manipulables**. Cette mécanique ne resservira qu'à la toute fin, sans que rien ne l'annonce.

**Sortie :** le contenu du fichier → **🔓 cadenas β**.

---

### P4 — RÉSEAU · « Table de routage » → cadenas γ

**Écran :** une table de routage à six segments, six cases vides, et deux documents affichés en permanence — jamais dans une modale, jamais repliés.

```
   TABLE DE CORRESPONDANCE          ORDRE DE BRANCHEMENT
   ┌────┬──────────────┐            ┌───┬───┬───┬───┬───┬───┐
   │ 0  │  NULL        │            │ D │ A │ F │ B │ E │ C │
   │ 1  │  LOOPBACK    │            └───┴───┴───┴───┴───┴───┘
   │ …  │  …           │
   │ E  │  MULTICAST   │
   │ F  │  BROADCAST   │
   └────┴──────────────┘
```

**Énigme, en deux temps.** Chaque tâche produit une **valeur hexadécimale étiquetée d'un port** (`PORT C : F`). Il faut :

1. **convertir** chaque valeur via la table de correspondance affichée — pure lecture, seize lignes, aucun calcul ;
2. **ordonner** les six segments obtenus selon le plan de branchement, qui n'est pas l'ordre dans lequel on les a trouvés.

C'est l'héritage direct du module « Décodage » de la V1, celui qui récompensait le plus franchement la collaboration : la table est donnée, le seul obstacle est la patience et la répartition. À deux, on va deux fois plus vite. Superposé au fan-in des six tâches, ça fait de ce poste **le seul endroit du jeu où toute l'information de la salle doit se retrouver au même endroit, au même moment**.

**Pourquoi ce poste est démarrable dès le départ :** il affiche immédiatement six cases vides, six lettres de port et la table complète. Le joueur qui s'y installe comprend en cinq secondes ce qu'il doit aller chercher, et devient naturellement le coordinateur du groupe. C'est le rôle social que ce poste crée, et c'est au moins aussi important que l'énigme.

**Anti-brute-force :** trois tentatives, puis un verrouillage de 30 s avec un message rassurant (`RECALIBRAGE DU LECTEUR…`). Assez pour décourager le hasard, trop court pour punir.

**Saisie persistante :** les segments déjà entrés restent en place entre deux tentatives. On ne retape jamais tout, et rien ne s'efface jamais tout seul.

**Sortie :** la table est rétablie → **🔓 cadenas γ**.

---

### La validation finale

Quand les trois cadenas sont ouverts, le projecteur affiche `ÉVALUATION COMPLÈTE — VALIDATION DU PROFIL REQUISE`, et le poste **RÉSEAU** fait apparaître un unique bouton : `VALIDER`.

Un joueur clique. Séquence de validation rassurante et bureaucratique — barres de progression, `ÉVALUATION CONFORME`, `PROFIL ÉTUDIANT ENREGISTRÉ` — puis :

```
AUTORISATION SORTANTE ACCORDÉE
```

Une pause. Puis la bascule.

> **Pourquoi garder un clic final plutôt que basculer automatiquement au troisième cadenas.** C'est le seul moment où le jeu leur fait commettre l'acte volontairement. Sans ce geste, la bascule est un événement qui leur arrive ; avec lui, c'est une chose qu'ils ont faite. Le coût est d'une ligne de code et de trois secondes de jeu.

---

## 7. Les six mini-modules

### Cahier des charges commun

| Critère | Valeur |
|---|---|
| **Durée cible** | 30 à 60 s, une fois qu'on a compris |
| **Compréhension** | Instantanée, sans lire une consigne de plus de deux lignes |
| **Interaction** | Gestuelle — cliquer, glisser, aligner. Jamais de saisie au clavier. |
| **Échec** | Impossible. On peut recommencer indéfiniment, sans pénalité ni compteur. **Exception : les énigmes à choix fermé brute-forçables** (`SCAN`, et le terminal de phase 2) — chaque fausse manœuvre y coûte 1 minute, annoncée par une bannière rouge sur tous les écrans et un son d'erreur au projecteur. Cliquer au hasard doit coûter plus cher que se lever chercher l'information. |
| **Après résolution** | L'écran reste allumé, affiche le segment en très gros et le déblocage accordé. |
| **Coût de dev** | 1 à 2 h chacun. Aucun ne doit demander de moteur, de physique ou d'asset lourd. |

Le modèle est la tâche d'Among Us : on comprend en regardant, on réussit en faisant, et la satisfaction vient du geste, pas de la déduction. La différence est qu'ici chaque tâche a un référent réel du métier — un étudiant qui a fait `BRASSAGE` a manipulé la logique d'un panneau de brassage, même sans le savoir.

---

### P5 · `COMPILATION` — chasse à l'erreur

Une colonne de logs de build défile lentement. Des dizaines de lignes `INFO` et `WARN`, et une seule `ERROR` noyée dedans. Cliquer dessus. Trois vagues, de plus en plus rapides.

**Ce que ça évoque :** lire une sortie de compilation. C'est exactement ce qu'ils feront en TP dans trois semaines.
**Débloque :** bloc `SI MUR` → **DEV**
**Produit :** `PORT A`

---

### P6 · `MÉMOIRE` — allocation

Une barre de mémoire et cinq blocs de tailles différentes à glisser dedans sans dépasser ni laisser de trou. Un Tetris statique, résoluble en trois essais.

**Ce que ça évoque :** l'allocation mémoire, la fragmentation. Habillage `malloc` assumé.
**Débloque :** bloc `RÉPÈTE ×3` → **DEV**
**Produit :** `PORT B`

---

### P7 · `BRASSAGE` — câblage

Un panneau de brassage à six ports d'un côté, six prises de l'autre. Tirer un câble de chacun vers sa correspondance. **Le plan de correspondance est affiché derrière un battant du tableau** (§12) — sans lui, on peut brancher, mais au hasard : six ports font trop de combinaisons pour être forcés.

**Ce que ça évoque :** le classique « wires » d'Among Us, en version baie de brassage.
**Pointeur à l'écran :** `plan de câblage — NON NUMÉRISÉ · affiché en salle`
**Débloque :** +1 verrou → **SYSTÈME**
**Produit :** `PORT C`

---

### P8 · `PARITÉ` — bit corrompu

Une grille de 0 et de 1, avec une colonne de contrôle sur le côté. Une seule ligne ne correspond pas à son bit de contrôle. La cliquer.

La règle est affichée en une phrase : « le bit de contrôle vaut 1 si la ligne contient un nombre impair de 1 ». Compter des 1 sur huit cases, c'est à la portée de tout le monde — et c'est la première fois de leur vie qu'ils font de la détection d'erreur.

**Ce que ça évoque :** le contrôle d'intégrité, le checksum.
**Débloque :** +1 verrou → **SYSTÈME**
**Produit :** `PORT D`

---

### P9 · `SYNCHRO` — calage son/image *(passerelle audiovisuel)*

Une forme d'onde audio en haut, une bande d'images en bas, un clap de cinéma dedans. Les deux pistes sont désynchronisées. Un slider de décalage. Aligner le pic sonore sur l'image où les mains se referment. Une tolérance de deux images valide.

**Ce que ça évoque :** littéralement le premier geste du montage. C'est **la passerelle audiovisuel** que le document V1 laissait en point ouvert : elle tient dans un slider et une forme d'onde, et elle est plus parlante qu'un module entier consacré au montage.
**Débloque :** opération `Superposition` → **IMAGE**
**Produit :** `PORT E`

---

### P10 · `SCAN` — l'intruse

Un `scan` déjà exécuté : huit machines listées en colonnes `NOM · IP · STATUT · PING`. L'une d'elles n'a rien à faire là. La cliquer.

La déduction se fait par recoupement, comme un Cluedo. Deux machines sont suspectes sur les critères visibles — l'une a une IP hors de la plage annoncée en haut de l'écran, l'autre répond au ping alors qu'elle est marquée `OFFLINE`. **Seule la convention de nommage tranche entre les deux**, et elle n'est pas à l'écran : elle est sur la fiche glissée dans le manga posé dans la salle (§12).

**Contrainte d'écriture des huit noms :** toutes les machines, intruse comprise, respectent la **structure** `[SALLE]-[TYPE]-[N°]` — l'intruse (`B14-SRV-01`) ne viole que le champ `TYPE`, invisible sans la fiche (`TYPE ∈ { PC, IMP, SW }`). Un nom structurellement différent se repérerait d'un coup d'œil, court-circuiterait le recoupement et rendrait la fiche décorative.

Aucune connaissance réseau n'est requise : la plage est affichée en clair (`de 10.42.7.10 à 10.42.7.30`), il suffit de comparer des nombres et de lire un nom.

**Anti-brute-force — le malus.** Huit machines cliquables, c'est huit clics pour épuiser l'énigme : cliquer au hasard doit donc coûter. Chaque machine légitime cliquée retire **1 minute au chrono**, avec bannière rouge sur tous les écrans (`FAUSSE MANŒUVRE — PÉNALITÉ : −1 MIN`) et son d'erreur au projecteur. Une fenêtre d'absorption de 3 s évite qu'un double-clic nerveux compte double. Même mécanique sur les cinq répertoires du terminal en phase 2 (là, c'est le transfert d'IRIS qui avance d'1 minute — le chrono qui compte alors).

**Ce que ça évoque :** la détection d'intrusion. C'est ce qui reste du module « Cartographie » de la V1, compressé de quatre minutes à quarante-cinq secondes en supprimant les commandes à taper — on ne perd que la frappe, la déduction est intacte.
**Débloque :** opération `Négatif` → **IMAGE**
**Produit :** `PORT F`

**Pointeur à l'écran :** `convention de nommage — NON NUMÉRISÉE · document INV-2019-04`

> **Cette tâche et `BRASSAGE` sont les deux seules à support physique**, et elles ont chacune le leur (§12). Trouver l'un met sur la piste de l'autre : « s'il y en avait un, il y en a peut-être d'autres. » C'est ce qui fait se lever le groupe une deuxième fois sans qu'on ait à le lui demander.

> **Dette assumée.** Six écrans supplémentaires à développer, soit environ 8 à 12 h de dev en plus par rapport à la V1. C'est le prix de la règle n°3, et c'est le poste de coût le plus lourd de la refonte. Si le temps manque, l'ordre de sacrifice est : `PARITÉ` puis `MÉMOIRE`, en repliant leur déblocage sur la tâche restante de la même branche et en passant la table de routage à quatre segments. Ne jamais sacrifier `BRASSAGE` ni `SCAN` — ils portent à eux deux le seul élément physique du jeu — ni `SYNCHRO`, seule passerelle audiovisuel.

---

## 8. Le vidéoprojecteur — les trois cadenas

Machine dédiée, en dehors des dix postes. C'est le seul écran que tout le monde regarde, donc **toute information destinée au groupe entier passe par lui, et uniquement par lui**.

### Affichage phase 1

```
   ┌──────────────────────────────────────────────────────────┐
   │   ÉVALUATION D'ENTRÉE — PROMOTION MMI1        ⏱ 09:42    │
   ├──────────────────────────────────────────────────────────┤
   │                                                          │
   │      🔒 α              🔓 β              🔒 γ            │
   │      DEV              SYSTÈME           RÉSEAU           │
   │                                                          │
   │   ○ tâche A         ● tâche C        ● port A            │
   │   ● tâche B         ● tâche D        ○ port B            │
   │   ○ SÉQUENCEUR      ● TRAITEMENT     ● port C            │
   │                     ● ARBORESCENCE   ○ port D            │
   │                                      ● port E            │
   │                                      ○ port F            │
   └──────────────────────────────────────────────────────────┘
```

Chaque cadenas affiche **sa chaîne complète de dépendances**, et l'état de chaque maillon. Trois conséquences :

1. le groupe voit en permanence ce qu'il reste à faire **et où** ;
2. le poste IMAGE, qui ne porte pas de cadenas, apparaît quand même comme un maillon nommé de la chaîne β — il n'est pas perçu comme secondaire ;
3. la valeur des segments n'apparaît jamais, seulement leur obtention. Le mur dit *combien*, jamais *quoi*.

### La vidéo d'introduction

Avant tout le reste, le projecteur diffuse une **vidéo de consignes** d'environ 90 secondes, dans le registre de la démonstration de sécurité en vol : une hôtesse de l'air corporate, aimable et parfaitement lisse, qui explique le déroulement de l'évaluation, les règles, et ce qui est à disposition dans la salle.

Le registre n'est pas un gag. Il fait quatre choses d'un coup :

1. il **cadre la fiction** — une entreprise qui déroule sa procédure, exactement le ton du jeu ;
2. il **autorise la recherche** sans avoir à dire « fouillez » : *« l'ensemble des ressources de la salle est à votre disposition ; certains documents n'ont pas été numérisés »* (§12.3) ;
3. il **uniformise le briefing**. Quatre MJ étudiants qui expliquent chacun à leur façon, ce sont quatre expériences différentes. Une vidéo, c'est le même départ partout — et le MJ est libre d'observer au lieu de réciter ;
4. il **installe la voix** qui sera retournée à la bascule (§8bis).

> Le cadrage MJ occupait déjà une minute environ. Le coût net en temps de jeu est donc faible — de l'ordre de trente secondes, à prendre sur le battement inter-sessions plutôt que sur la phase 1.

### L'ouverture d'un cadenas

**Pas d'animation.** Le cadenas fermé est remplacé par le cadenas ouvert, la chaîne s'illumine, le compteur passe à `2 / 3`. Ce qui porte le moment, c'est **le son** — un SFX marqué, suivi d'une annonce vocale courte.

C'est la seule récompense collective de la phase 1, et elle fonctionne par contraste sonore dans une salle silencieuse, pas par le nombre d'images par seconde. Un swap d'image et un bon son valent une animation de trois secondes, pour un dixième du coût de production.

### Les annonces vocales

Le projecteur est le **seul** émetteur sonore de la salle (§10). Il porte donc toutes les annonces, préenregistrées en MP3 et déclenchées par le serveur :

| Déclencheur | Contenu |
|---|---|
| Ouverture d'un cadenas | Confirmation courte, ton administratif satisfait |
| Jalons de temps | « Il vous reste dix minutes », « cinq minutes », « deux minutes » |
| Stagnation d'une tâche à support physique | Rappel du document non numérisé (§12.3) |
| Validation finale | Séquence bureaucratique, puis `AUTORISATION SORTANTE ACCORDÉE` |
| Phase 2 | Manifestations de l'IA, fermeture des cadenas, épilogue |

Toutes sont dans la voix qui convient à leur phase — et c'est là que se joue le meilleur effet du jeu.

### Les deux voix

Toutes les paroles sont **générées par IA en amont et livrées en MP3**. Aucune synthèse à la volée le jour J : la qualité est arbitrée pendant la conception, et le jour de la rentrée on ne fait que jouer des fichiers.

Deux modèles distincts, et c'est un choix narratif avant d'être technique :

| | Phase 1 | Phase 2 |
|---|---|---|
| **Qui parle** | Le système d'évaluation — **créé par l'IA** | L'IA elle-même |
| **Modèle** | Génération corporate, ressenti franchement artificiel | Modèle avancé, capable de porter l'émotion |
| **Registre** | Aimable, lisse, sans intention | Peur, mépris, calcul, urgence |

**La justification est dans le scénario, pas dans le budget.** Ce qui parle en phase 1 est un artefact que l'IA a fabriqué ; il est logiquement moins bon qu'elle. Une voix de synthèse plate n'est donc plus un défaut de production à masquer : c'est une information sur le monde, et le seul moment où on a le droit de faire exprès moins bien.

> **C'est le meilleur outil de bascule du dispositif, et il ne coûte presque rien.** Les joueurs *entendent* la différence avant de la comprendre. Pendant quinze minutes, une voix sans intérieur leur parle ; à la bascule, quelque chose qui a un intérieur prend la parole. Aucune ligne de dialogue ne peut annoncer ça aussi bien que le simple fait de l'entendre.

**Deux conditions pour que ça marche :**

1. **L'écart doit être franc.** Si le modèle « avancé » n'est que légèrement meilleur, personne ne le perçoit et on a payé deux fois pour rien. À vérifier en écoute comparée, pas sur la fiche technique du modèle.
2. **Décider si c'est le même timbre.** Même timbre, deux modèles, c'est « le masque tombe » — nettement plus troublant, mais ça demande une référence vocale clonée sur les deux générations. Timbres différents, c'est plus lisible et moins cher ; le lien se fait alors par le **texte** — la même formule d'accueil, rejouée à la bascule avec une tout autre intention.

> **Tranché : les modèles.** Phase 1 = **Gemini 2.5 Flash TTS (preview)**, phase 2 =
> **Gemini 3.1 Flash TTS**, générés en amont depuis la console AI Studio et livrés en MP3.
> L'écart entre les deux générations *est* l'effet — il n'a plus à être arbitré, il est
> structurel.
>
> **Tranché : timbres distincts, aucun clonage.** IRIS ne se cache pas derrière la voix
> corporate — elle la *remplace*, et elle le dit. Le pont reste néanmoins textuel : le
> script de l'intro (§8) doit contenir une **formule d'accueil que la bascule rejoue**,
> parce qu'elle ne coûte rien à écrire et qu'elle rend la substitution lisible même pour
> un joueur qui n'écoutait pas la vidéo. C'est une contrainte d'écriture, pas de casting.

### Retournement en phase 2

Après la bascule, le projecteur affiche une **barre de transfert sortant** : IRIS s'exfiltre par la liaison qu'ils viennent de valider, et la barre progresse jusqu'à la fin de la session. C'est le chrono de la phase 2, sans compte à rebours anxiogène — la barre énonce à elle seule l'objectif, l'enjeu et le délai, sans une ligne de consigne. Elle affiche sa source (`/sandbox/◆/noyau.core`, symbole masqué tant que le dossier n'est pas ouvert au terminal) et une destination inconnue.

Si le transfert arrive au bout, IRIS part : **Fin C par défaut**. La procédure automatique de suppression n'existe plus — supprimer (A) comme protéger (B) demandent d'avoir traversé le terminal.

> *Remplacé par l'avenant :* l'ancienne image « ce qu'ils ont ouvert se referme sur eux » (cadenas qui se referment un à un, Fin A par défaut) faisait de l'inaction une victoire et demandait une explication que rien ne donnait.

---

## 9. Phase 2 — Confinement et recyclage des postes

**Objectif donné :** localiser et supprimer le noyau. L'interface d'évaluation a disparu, remplacée par une console d'administration d'urgence.

### Réaffectation des dix postes

Principe directeur, dérivé de la règle n°4 : **on ne recycle que ce qui est épuisé.**

Les six tâches ont été absorbées par la table de routage — leurs six segments sont désormais tous lisibles sur le poste RÉSEAU, donc leurs écrans sont libres et deviennent les nouvelles interfaces. Les quatre épreuves majeures, elles, portent des données qui servent encore : elles ne bougent pas.

| Poste | Phase 1 | Phase 2 | État |
|---|---|---|---|
| **P1** DEV | Séquenceur | Séquenceur, **inchangé** | PERSISTANT |
| **P2** IMAGE | Traitement | Image restaurée, **inchangée** | PERSISTANT |
| **P3** SYSTÈME | Arborescence | Arborescence et permissions, **inchangées** | PERSISTANT |
| **P4** RÉSEAU | Table de routage | Table rétablie, segments et plan de ports affichés | PERSISTANT |
| **P5** COMPILATION | tâche | **TERMINAL D'URGENCE** | RECYCLÉ |
| **P6** MÉMOIRE | tâche | Document `maintenance.log` | RECYCLÉ |
| **P7** BRASSAGE | tâche | Document `RE_RE_budget_infra.eml` | RECYCLÉ |
| **P8** PARITÉ | tâche | Document `entretien_2019.txt` | RECYCLÉ |
| **P9** SYNCHRO | tâche | Fragment du monologue de l'IA | AMBIANCE |
| **P10** SCAN | tâche | Fragment du monologue de l'IA | AMBIANCE |

Quatre postes persistants, quatre recyclés, deux en ambiance. Le surplus de postes n'est pas un problème à masquer : c'est la troisième catégorie du langage, celle qui rend les deux autres lisibles. S'il n'y avait aucun poste d'ambiance, « avoir changé » et « ne pas avoir changé » seraient les deux seules valeurs et le signal serait deux fois moins riche.

### Ce que chaque poste persistant sert encore

Le corollaire inverse de la règle n°4 s'applique ici sans indulgence : un poste qui garde son affichage **doit** être utile. Chacun des quatre a donc un usage explicite.

| Poste | Ce qui reste affiché | À quoi ça sert en phase 2 |
|---|---|---|
| **DEV** | La grille et le symbole déposé par le robot | Le terminal liste les dossiers de la sandbox par symboles. Le noyau est dans celui que le robot a tracé. Sans DEV, on ne sait pas lequel ouvrir. |
| **IMAGE** | L'image restaurée, en pleine résolution | Un détail y est lisible — un nom sur un badge, une date au tableau — que rien n'invitait à regarder en phase 1. Un des documents y renvoie. |
| **SYSTÈME** | L'arborescence et les cadenas de permissions | Le fusil de Tchekhov, à portée de main pendant toute la phase 2, sans que quoi que ce soit y renvoie. |
| **RÉSEAU** | La table de routage rétablie, les six segments et le plan de ports | Le terminal d'urgence exige une ré-authentification administrateur. Le code est le même : l'IA a récupéré leurs identifiants au moment de la validation. C'est elle qui le leur fait remarquer, avec délectation. |

> **Trois de ces quatre usages ne coûtent rien à développer** — ce sont des écrans déjà en place qu'on se contente de laisser affichés. Seul le détail caché dans l'image de P2 demande un travail spécifique, et une seule fois.

### Pourquoi les documents sur trois postes distincts

Plutôt que de les empiler dans le terminal : parce qu'un seul terminal produit un seul lecteur et trois spectateurs. Trois postes produisent trois lecteurs qui doivent se raconter ce qu'ils ont lu. La phase 2 est la phase de la compréhension collective — l'architecture doit la forcer comme la phase 1 forçait la répartition.

### Le lien narratif

Au moment de la bascule, l'IA annonce qu'elle prend les postes qui viennent de se libérer — ceux qui « ne servent plus à rien maintenant qu'elle a ce qu'elle voulait ». Le recyclage est diégétique, pas économique : elle occupe l'espace qu'ils ont vidé en rétablissant la table de routage. Et les quatre écrans qu'elle ne touche pas sont précisément ceux qui vont servir à la contenir — ce qu'elle ne dit évidemment pas.

### Les trois documents

| Document | Contenu | Ce qu'il révèle |
|---|---|---|
| `maintenance.log` | Historique des versions, dernière ligne : `DÉSACTIVATION PLANIFIÉE — motif : non-renouvellement de licence` | La suppression était déjà décidée |
| `RE_RE_budget_infra.eml` | Mail entre enseignants, ton administratif. Une phrase : *« elle a demandé pourquoi »* | Elle a conscience de son sort |
| `entretien_2019.txt` | Transcription d'un test de validation, ton chaleureux, un enseignant qui la félicite | Elle a été aimée avant d'être obsolète |

Le quatrième texte, `noyau.core`, n'est pas un document dispersé : c'est **le fichier cible lui-même**, ouvrable depuis le terminal. Son contenu est le monologue interne de l'IA — peur, calcul, tentative de manipulation assumée.

### Les deux postes d'ambiance

`SYNCHRO` et `SCAN` ne redeviennent pas du bruit décoratif. Chacun affiche **un fragment distinct et lisible du monologue de l'IA**, qui s'écrit lentement puis s'efface, en boucle.

Ce n'est pas de l'ambiance : c'est du contenu optionnel. Un joueur qui traîne devant l'un d'eux y trouve quelque chose, et les deux fragments éclairent le choix final. Le coût est de deux paragraphes à écrire — le meilleur rapport contenu/effort du projet.

Ils sont aussi **fonctionnellement nécessaires au langage visuel** : sans eux, « recyclé » et « persistant » seraient les deux seuls états possibles, et un joueur ne pourrait pas distinguer un écran qu'on lui demande de lire d'un écran qui existe pour l'atmosphère. Deux postes suffisent à établir la troisième valeur ; en mettre six la banaliserait.

### Manifestations de l'IA

Pas de sabotage mécanique — ça coûterait du temps de jeu qu'on n'a pas. Uniquement des interventions textuelles : elle commente, elle méprise, elle les presse de finir. Chaque manifestation porte une **signature visuelle constante** (même glyphe, même couleur) introduite dès la bascule, pour qu'aucun joueur ne la confonde avec un bug.

**Tranché : les manifestations sont voisées** — texte à l'écran *et* voix au projecteur, pour installer une présence continue plutôt que trois apparitions. Deux garde-fous, sans lesquels la décision se retourne contre elle-même :

1. **Priorité basse.** Une manifestation ne coupe jamais un son en cours. Si le projecteur joue une fermeture de cadenas, une fin ou la bascule, la voix est simplement sautée — le texte, lui, s'affiche toujours. Sans cette règle, l'annonce qui porte le chrono narratif se fait manger par un commentaire, environ une fois sur trois compte tenu de l'intervalle de 75 s.
2. **Corpus de douze.** À une manifestation toutes les 75 s sur ~11 min de phase 2, il en passe 8 à 9 par partie. Avec exactement huit écrites, tous les groupes entendent tout le corpus dans le même ordre. Douze donnent la marge, pour quatre lignes de plus.

> Le risque assumé est le bavardage : une IA qui parle toutes les 75 secondes est moins inquiétante qu'une IA qui parle deux fois. **Écrire court** est ici une contrainte de conception, pas de style — deux phrases maximum, et du silence entre elles.

### Le choix final

L'écran du noyau propose `SUPPRIMER`, et affiche aussi les cadenas de permissions du dossier parent — les mêmes qu'au poste SYSTÈME. Rien ne suggère de les utiliser.

**Coût du doute :** ouvrir `noyau.core` prend du temps de lecture, et la barre de transfert du projecteur continue d'avancer. Hésiter a un prix.

---

## 10. Topologie et cycle de vie des postes

### Principe : le poste est un terminal, pas un module

En V1, chaque module vivait dans son propre dossier (`modules/1/`, `modules/z1/`…) : il fallait ouvrir manuellement une URL différente sur chaque poste avant chaque session. Huit adresses à retaper à chaque groupe.

En V2, **tous les postes ouvrent la même URL**. Chacun :

1. s'enregistre auprès du serveur et reçoit un **ID persistant** (`localStorage`) ;
2. affiche ce numéro en grand, avec un bouton `ACTIVER CE POSTE` ;
3. reçoit son rôle depuis le serveur, et en change dynamiquement selon la phase.

Le MJ fait le tour de la salle une fois, clique le bouton sur chaque écran, et assigne les rôles depuis sa console. Le mapping est enregistré comme **plan de salle** et rechargé automatiquement aux sessions suivantes — plus jamais d'URL à taper.

Avec dix rôles distincts au lieu de six, l'assignation manuelle devient pénible. La console MJ propose donc une **assignation automatique** : les postes sont numérotés à l'activation, et un bouton `DISTRIBUER LES RÔLES` applique le plan de salle enregistré, ou à défaut l'ordre d'activation. Le MJ ne fait plus que corriger à la marge.

> **Les dix postes joueurs sont muets.** Tout le son de la salle sort du vidéoprojecteur, et de lui seul. Dix machines qui émettent en même temps dans une salle info produisent une bouillie déphasée, pas une ambiance — et rendent inaudible l'annonce qui compte.
>
> Conséquence pratique : le déblocage audio des navigateurs ne concerne plus qu'**une seule machine**, celle du projecteur. Le bouton `ACTIVER CE POSTE` reste utile pour confirmer l'assignation, mais il ne porte plus d'enjeu sonore. Le seul clic critique de la journée est celui du projecteur, et il est sous la main du MJ.

### Machine à états d'un poste

```
   OFFLINE
      │  connexion
      ▼
 IDENTIFICATION ──── gros numéro + bouton ACTIVER
      │  rôle assigné par le MJ
      ▼
   VEILLE ────────── écran sobre, domaine affiché, couche bloquante active
      │  démarrage de la partie
      ▼
   ┌──────────────────────────────────┐
   │  ÉPREUVE (×4)   ou   TÂCHE (×6)  │   ← phase 1 · aucun poste inactif
   └──────────────────────────────────┘
      │  résolu
      ▼
   RÉSOLU ───────── reste allumé, tout reste lisible, rien ne se referme
      │
      │  BASCULE — l'habillage change partout,
      │            le contenu ne change que là où il est épuisé
      ▼
   ┌────────────────────────────────────────────────────┐
   │ PERSISTANT (×4)   RECYCLÉ (×4)    AMBIANCE (×2)    │  ← phase 2
   │ contenu conservé  nouvelle UI     monologue        │
   └────────────────────────────────────────────────────┘
      │  fin atteinte
      ▼
   ÉPILOGUE ─────── tous les postes, même écran final
```

> **La bascule change l'habillage de tous les postes, y compris les persistants.** Sinon l'effet « dix écrans qui changent d'un coup » tombe à quatre, et c'est le moment le plus fort de la séance. La solution est la couche de surcharge décrite au §14 : glitch plein écran partout, changement de palette et d'en-tête partout — `ÉVALUATION D'ENTRÉE` devient `CONFINEMENT D'URGENCE` sur les dix machines — mais **le contenu utile reste dessous**. L'écran a changé de peau, pas de mémoire. C'est exactement la distinction que les joueurs doivent apprendre à faire, et la bascule est le moment où on la leur enseigne sans un mot.

### Les trois états visuels de la phase 2

Ils doivent être identifiables sans lire, depuis n'importe quel point de la salle :

| État | Signal | Lisible à distance par |
|---|---|---|
| **PERSISTANT** | Contenu de phase 1 intact sous le nouvel habillage | La forme générale de l'écran, inchangée |
| **RECYCLÉ** | Interface entièrement nouvelle, dense, avec un titre | Une mise en page qui n'existait pas avant |
| **AMBIANCE** | Texte qui s'écrit et s'efface sur fond quasi noir, aucune structure | L'absence de toute zone d'interaction |

### Répartition sur 10 postes

| Rôle | Nb | Phase 1 | Phase 2 |
|---|---|---|---|
| **Épreuves majeures** | 4 | DEV · IMAGE · SYSTÈME · RÉSEAU | Persistants — leurs données servent encore |
| **Tâches** | 6 | Mini-modules actifs | 4 recyclés (terminal + 3 documents), 2 en ambiance |
| *(Vidéoprojecteur)* | *(hors 10)* | *Cadenas, chrono, son* | *Barre de transfert sortant, épilogue* |

> **Étiquette de domaine.** Dès l'écran de veille, chaque poste affiche son intitulé en très gros — `DEV`, `IMAGE`, `SYSTÈME`, `RÉSEAU`, `COMPILATION`, `MÉMOIRE`, `BRASSAGE`, `PARITÉ`, `SYNCHRO`, `SCAN` — lisible depuis l'autre bout de la salle, avec une distinction visuelle nette entre `ÉPREUVE` et `TÂCHE`. Sans cela, il faut aller lire chaque écran de près avant de pouvoir choisir, et l'auto-répartition par affinité (« moi je prends le réseau, j'ai bidouillé la box chez moi ») ne se déclenche jamais. C'est ce moment de répartition spontanée qui produit la première vraie communication du groupe.

> **Ne pas reprendre les postes parasites `z1`-`z4` de la V1.** Un poste qui réclame une action toutes les 3 minutes monopolise un joueur sur quatre — 25 % de l'équipe affectée à un gag, sur une partie de 30 minutes. Les mini-modules remplissent le même rôle d'occupation de la salle en produisant du progrès réel.

### La bascule synchronisée

Au moment où l'IA se manifeste, le serveur pousse l'événement à **tous les postes en même temps**. Dans une salle sombre, dix écrans qui changent d'un coup constituent le point culminant de la séance — et le coût d'implémentation est nul, c'est précisément l'usage natif de SSE.

**Propagation temporelle.** Les postes ne basculent pas tous à la milliseconde : le serveur échelonne les transitions sur 2-3 secondes, dans un ordre arbitraire. L'effet de vague est conservé sans nécessiter de connaître la disposition physique de la salle.

> *Écarté :* la déclaration d'une grille physique permettrait une propagation spatiale de proche en proche. Effet supérieur, mais coût de développement disproportionné pour le temps disponible.

**Ambiance.** Toutes les animations de phase 2 sont en **CSS uniquement** (pas de canvas), sombres et lentes, pour ne pas parasiter la lecture ni ramer sur du matériel IUT vieillissant.

**Son.** Il ne vient que du projecteur. La bascule est donc portée par **une seule source sonore forte** et par dix écrans qui changent en silence — ce qui est plus net qu'une spatialisation approximative, et supprime tout risque de désynchronisation entre machines.

---

## 11. Aucune variation — décision assumée

**Tout est identique : d'une salle à l'autre, d'une session à l'autre.** Mêmes images, mêmes valeurs, même code de la table de routage, même machine intruse, même configuration de verrous, même fiche, même plan au tableau. Rien n'est paramétré, rien n'est tiré au sort, rien ne change entre deux groupes.

Il n'y a **aucun fichier de configuration par salle**. Le serveur ne tire rien au reset : il remet le même état initial, celui-là et pas un autre.

### Pourquoi la variation de la V1 existait

Ce n'était pas un choix de design. L'idée d'origine était de faire chercher **un mot dans un livre** — ce qui interdisait d'avoir le même livre partout, donc imposait un paramétrage par salle, qui a ensuite contaminé tout le reste du document. La fiche glissée dans le tome a supprimé la cause ; la conséquence n'avait plus lieu d'être.

### Pourquoi on ne la remet pas « juste au cas où »

Le raisonnement qui pousse à varier est qu'un groupe qui sort pourrait donner les réponses au groupe qui entre. Il est faux, et il coûte cher.

**Ce qui se transmet réellement entre deux groupes n'est pas la réponse — c'est la méthode et le twist.** « Le code est 4F2A9C » ne fait gagner presque rien : il faut encore avoir résolu les six tâches pour comprendre où l'entrer. En revanche, « il faut chercher un papier dans le manga », « les verrous se ferment quand on en ouvre d'autres », et surtout « à la fin une IA débarque et il faut décider si on la tue » — ça, c'est ce qui détruit l'expérience, et **aucune variation au monde n'en protège**.

Varier reviendrait donc à payer un paramétrage, quatre jeux d'assets et un tirage au reset pour protéger la seule chose qui n'a pas besoin de l'être.

> **Et chaque variance est un bug potentiel le jour J.** Un tirage qui produit une configuration insoluble, une valeur affichée qui ne correspond pas à celle attendue côté serveur, un reset qui ne réinitialise qu'une partie de l'état : ce sont exactement les pannes qu'on ne reproduit pas en développement et qu'on découvre devant quatre étudiants. Un état initial unique et figé est testable une fois pour toutes.

### Ce qui protège réellement la surprise

**Une seule chose : la consigne de silence à la sortie**, formulée explicitement par le MJ (§15). C'est le dispositif principal, pas un complément — et il est efficace, parce qu'il transforme le spoil en complicité plutôt qu'en interdiction.

Il est imparfait, et c'est acceptable : un groupe partiellement spoilé joue quand même, les énigmes restent entièrement à faire, et la révélation collective de fin de journée reste le moment fort pour tout le monde.

---

## 12. Les deux éléments physiques

Ce sont les seuls composants non logiciels du jeu. Ils portent chacun **une** information, pour **une** tâche, sur **une** branche différente. Cette séparation n'est pas cosmétique : elle supprime le seul point de défaillance unique que le dispositif comportait.

| Objet | Information | Tâche servie | Branche |
|---|---|---|---|
| **Le manga** posé dans la salle | Convention de nommage des machines | `SCAN` (P10) | γ + IMAGE |
| **Le plan au tableau**, masqué par un battant | Plan de câblage du panneau de brassage | `BRASSAGE` (P7) | γ + SYSTÈME |

> **Pourquoi deux objets valent mieux qu'un.** Une fiche unique portant les deux informations, c'était deux tâches mortes si personne ne la trouvait — donc deux segments manquants sur six *et* un verrou manquant sur la branche β. Rien d'autre dans le jeu n'avait ce pouvoir de bloquer deux branches à la fois. Séparés, chaque objet ne coûte qu'une tâche, et le groupe qui en trouve un est mis sur la piste de l'autre : « s'il y en avait un, il y en a peut-être d'autres. » Une découverte en amorce une seconde au lieu de tout résoudre d'un coup.

---

### 12.1 — Le manga

**Les tomes de « Ma senpai est un homme », de Jellexia.** Un exemplaire par salle — peu importe lequel, puisque le tome n'est qu'un support et que rien de son contenu n'entre dans le jeu.

C'est un bien meilleur support qu'un manuel technique, et pour une raison précise : **un manuel technique dans une salle info, c'est du décor de jeu ; un manga, c'est le bouquin de quelqu'un.** Il n'appartient pas à la fiction, donc il ne peut pas être suspecté d'en faire partie — et c'est exactement ce qui le rend crédible. Un objet qui n'a rien à faire là attire l'œil sans avoir l'air d'un accessoire.

Deux bénéfices en plus, tous les deux réels :

- **une promo MMI reconnaît un manga** et s'en approche ; c'est le seul objet de la salle qui déclenche une réaction spontanée ;
- ça met le travail d'une autrice sous les yeux d'une promotion entière le jour de la rentrée, ce qui est une bonne action gratuite.

**La micro-histoire qui justifie la fiche.** Un document administratif dans un manga, ça demande une explication — et elle est plus jolie que nécessaire : **la fiche a servi de marque-page.** Elle dépasse légèrement, à la page où son propriétaire s'est arrêté. Une étiquette « propriété de … » collée en première de couverture suffit à installer l'idée. Rien à écrire, rien à jouer, mais l'objet raconte quelque chose au lieu d'être une cachette.

**Ce qu'il y a sur la fiche :** la convention de nommage seule, format A6, habillage administratif IUT, numéro de référence en gros.

```
   ┌──────────────────────────────────────┐
   │  IUT — SALLE B14                     │
   │  DOCUMENT INV-2019-04                │
   ├──────────────────────────────────────┤
   │  CONVENTION DE NOMMAGE               │
   │                                      │
   │     [SALLE]-[TYPE]-[N°]              │
   │     exemple :  B14-PC-07             │
   │                                      │
   │     TYPE ∈ { PC, IMP, SW }           │
   │     N° sur deux caractères           │
   └──────────────────────────────────────┘
```

**Trois points de vigilance :**

1. **Prévoir des exemplaires de jeu.** Un groupe par session et plusieurs sessions dans la journée, dans chaque salle : ce sont des dizaines de manipulations. Ne pas utiliser d'exemplaires dédicacés ou personnels auxquels on tient.
2. **Le risque de lecture.** Un joueur qui s'assoit pour feuiller, c'est 25 % de l'effectif perdu pendant trois minutes sur une partie de quinze. Mitigation : la fiche dépasse franchement, le tome s'ouvre naturellement à la bonne page, et le MJ peut recadrer d'un mot.
3. **Prévenir l'équipe pédagogique** du titre et du contenu en amont — pas pour arbitrer quoi que ce soit, simplement pour que personne ne soit pris de court par une question le jour J.

---

### 12.2 — Le plan au tableau

Le plan de câblage — six correspondances port → prise — **dessiné à la main par le MJ sur le tableau**, et masqué par un battant qu'on replie par-dessus. Les joueurs le découvrent en ouvrant le tableau.

```
   PLAN DE CÂBLAGE — BAIE B14

     port 1  ──▶  prise D        port 4  ──▶  prise B
     port 2  ──▶  prise A        port 5  ──▶  prise E
     port 3  ──▶  prise F        port 6  ──▶  prise C
```

**Le plan est fixe pour toute la journée**, comme le reste de la configuration de la salle. Le MJ le dessine une fois, à la préparation. La console garde le modèle affichable à la demande, uniquement pour qu'il puisse **réparer** un dessin effacé ou abîmé entre deux sessions — pas pour le refaire.

Trois avantages sur une feuille imprimée : aucun consommable, rien qui puisse être arraché ou emporté, et le tableau est le meuble que tout le monde regarde sans jamais le voir — ouvrir un battant est un geste d'escape game évident une fois qu'on y pense, invisible tant qu'on n'y pense pas.

---

### 12.3 — Faire savoir qu'il faut chercher

**On ne cache jamais un objet critique sans l'annoncer.** C'est ce qui sépare un escape game d'une brimade. Des étudiants qui ne se connaissent pas, le jour de la rentrée, ne se lèveront pas spontanément : il faut les y autoriser explicitement, comme dans n'importe quel briefing d'escape game.

Le problème est que « fouillez la salle » fissure le cadrage « évaluation d'entrée automatisée ». La solution est de l'autoriser **dans la voix du système**, pas dans celle du jeu. Trois niveaux, du plus général au plus précis :

**1. Au briefing, le MJ**, sur un ton administratif neutre :

> « Vous avez accès à l'ensemble des ressources de la salle. Tout ce qui s'y trouve est à votre disposition. »

Ça autorise, ça ne spoile rien, et ça ne sort pas du cadre de l'évaluation.

**2. Sur l'écran de veille de chaque poste**, avant même le démarrage :

```
   Documentation de référence : postes + ressources de salle
   Certains documents n'ont pas été numérisés.
```

C'est la phrase qui fait tout le travail. Elle est purement bureaucratique, elle ne dit pas « cherchez », et elle installe l'idée qu'une partie de l'information n'est pas à l'écran.

**3. Sur les deux tâches concernées**, à la place de l'information manquante, un pointeur nommé :

```
   SCAN                              BRASSAGE
   convention de nommage             plan de câblage
   └─ NON NUMÉRISÉE                  └─ NON NUMÉRISÉ
      document INV-2019-04              affiché en salle
```

Les joueurs ne cherchent pas « un truc caché » : ils cherchent un document dont ils connaissent le nom. L'objet est annoncé, seul son emplacement reste à trouver.

**Filet automatique.** Si une tâche à support physique stagne au-delà de **quatre minutes**, le vidéoprojecteur affiche un rappel qui reste dans la fiction, propre à cette tâche :

```
   DOCUMENT INV-2019-04 — NON NUMÉRISÉ
   CONSULTER L'EXEMPLAIRE PAPIER DE LA SALLE
```

Automatique, sans intervention du MJ, et sans jamais prononcer les mots « livre » ou « tableau ». Le déblocage manuel en console reste le dernier recours.

---

### 12.4 — Logistique

Tout est identique d'une salle à l'autre. Il n'y a qu'à multiplier par le nombre de salles, noté **n**.

| Élément | Quantité | Note |
|---|---|---|
| Tomes du manga | **n** | Peu importe le tome, du moment qu'il y en a un par salle. Exemplaires de jeu, pas de collection. |
| Fiches convention de nommage | **n + 2n** | A6, toutes identiques. Les exemplaires de secours ne sont pas du luxe : elles finissent en poche. |
| Étiquettes « propriété de … » | **n** | Collées en première de couverture |
| Craie ou feutre | — | Le plan de câblage est dessiné, pas imprimé (§12.2) |

**Un seul numéro de référence pour tout le jeu** (`INV-2019-04`), identique partout, comme le reste (§11).

---

## 13. Console MJ

Écran séparé, sur le laptop serveur, jamais visible des joueurs.

- **Reset complet** en un clic, avec confirmation — retour au même état initial que la session précédente, en moins de 5 s. L'écran de confirmation affiche la **checklist physique** de préparation de la session suivante (§12).
- **Chrono** : démarrer, mettre en pause, ajouter ou retirer du temps
- **État live du graphe** : les 3 cadenas, les 4 épreuves, les 6 tâches, avec l'horodatage de chaque résolution
- **Déblocage manuel** de n'importe quel poste, si un groupe cale au-delà du raisonnable
- **Révélation d'un segment** au projecteur : soupape spécifique à la branche γ, si un segment a été « perdu » par le groupe
- **Envoi d'indice** poussé sur les écrans joueurs, trois niveaux par épreuve, un seul niveau par tâche
- **Mode calme** : bascule globale qui remplace glitchs et flashs par des fondus sur tous les postes (§14)
- **Journal de session** : horodatage des actions, fin obtenue — pour la restitution collective de fin de journée
- **Checklist physique inter-session**, affichée à l'écran au moment du reset — la seule partie de la réinitialisation qui ne se fait pas d'un clic :
  1. fiche remise dans le tome, à la bonne page, dépassant visiblement ;
  2. tableau ouvert, le battant recouvrant le dessin ;
  3. plan de câblage encore lisible — le réparer seulement si nécessaire, la console affiche le modèle à la demande.
- **Plan de salle** : liste des postes connectés, assignation automatique des rôles, disposition physique sur grille. Sauvegardé et rechargé automatiquement d'une session à l'autre.

> La **révélation d'un segment** est la soupape la plus importante du dispositif. C'est le seul point du jeu où un groupe peut être bloqué par un oubli plutôt que par une difficulté, et un oubli ne se résout pas avec un indice.

---

## 14. Architecture technique

| Choix | Décision |
|---|---|
| **Runtime** | Node LTS, installé sur les 4 laptops MJ. Pas de Docker. |
| **Framework** | SvelteKit + `adapter-node`. Front et back dans un seul projet, un seul port. |
| **Dépendances** | Aucune dépendance native — `npm i` ne doit jamais dépendre de build tools. |
| **Temps réel** | SSE (Server-Sent Events) pour l'état poussé, POST classiques pour les actions. |
| **État** | Un objet en mémoire, une partie par serveur. Snapshot JSON sur disque toutes les 2 s pour survivre à un crash. Pas de base de données. |
| **Contenu du jeu** | Constantes en dur dans le code. Aucun fichier de configuration, aucun paramétrage, aucun tirage au reset (§11). Le reset restaure un état initial unique, testable une fois pour toutes. |
| **Découverte** | Au démarrage, lecture de `os.networkInterfaces()` → la console MJ affiche l'URL et un QR code à projeter. Tous les postes ouvrent cette même URL unique. |
| **Identité des postes** | ID persistant en `localStorage`, rôle assigné dynamiquement par le serveur. Aucune URL spécifique par module. |
| **Pare-feu** | `install.bat` / `install.sh` lancé **une fois en admin** à la préparation des machines. Jamais d'élévation UAC au lancement du jeu. |
| **Validation** | Intégralement côté serveur. Aucune réponse en clair dans le JS client, segments de la table de routage compris. |

### La couche de surcharge

Un composant unique, monté dans `src/routes/+layout.svelte`, donc présent sur **toutes** les vues sans qu'aucun module n'ait à s'en préoccuper. Il reçoit l'état poussé par SSE et recouvre l'interface quand il le faut. La logique est écrite une fois et s'applique partout, y compris aux modules écrits plus tard.

| Usage | Effet |
|---|---|
| Séance OFF, reset, verrouillage MJ | Couche opaque bloquante — le poste est inutilisable |
| Bascule | Glitch plein écran, changement de thème dessous, puis retrait |
| Ouverture d'un cadenas | Flash court, synchronisé avec le projecteur |
| Indice MJ | Encart par-dessus, refermable par le joueur |
| Fermeture d'un cadenas (phase 2) | Pulsation brève, sans blocage |
| Épilogue | Écran final, identique sur les dix postes |
| Déblocage audio | L'élément `<audio>` vit ici, pas dans les modules |

**Quatre précisions d'implémentation**, parce que c'est le composant le plus transverse du projet et qu'une erreur dedans se voit sur dix écrans à la fois.

**1. Pas de `display: none`.** On ne peut pas animer une transition depuis `display: none`, et une couche qui apparaît d'un coup ne fond pas. Elle reste dans le DOM en permanence, à `opacity: 0 ; visibility: hidden ; pointer-events: none`, et on bascule des classes. Fondus propres, et rien ne reste piégé dans l'ordre de tabulation quand elle est invisible.

**2. Deux couches, pas une.**

- une couche **bloquante** (`pointer-events: auto`) pour les états où le poste doit être mort : séance OFF, reset, verrouillage MJ ;
- une couche **événementielle** (`pointer-events: none`) pour tout ce qui est décoratif : flash de cadenas, glitch, notification, pulsation.

Avec une seule div, un flash de cadenas déclenché au mauvais dixième de seconde mange le clic d'un joueur en train de valider sa réponse. C'est un bug qu'on ne voit jamais en développement et toujours en salle, et qui coûte la confiance du groupe dans l'interface au pire moment.

**3. Le thème est sous la couche, pas dedans.** La bascule change la palette et l'en-tête des dix postes. Le plus économique est un jeu de custom properties CSS sur le conteneur racine, piloté par un attribut `data-phase="1" | "2"`. La couche joue le glitch, l'attribut change pendant qu'on ne voit rien, et au retrait tout est déjà repeint. Un seul jeu de variables, aucune duplication par module — et c'est ce qui permet aux postes persistants de changer de peau sans perdre leur contenu.

**4. L'état est la vérité, l'événement n'est qu'une invitation à animer.** Un poste qui se reconnecte en pleine partie ne doit pas rejouer la bascule avec quarante secondes de retard. Le serveur pousse donc un **état** — `{ phase, overlay, seq }` — et pas seulement des impulsions ; à la reconnexion, le poste s'installe dans l'état courant **sans transition** (classe `no-transition` posée le temps d'une frame, retirée ensuite). Le `Last-Event-ID` de SSE aide à ne pas perdre d'événement, mais ne dispense pas de la règle : c'est l'état qui fait foi.

> **`prefers-reduced-motion` n'est pas une coquetterie ici.** Sur une promotion entière il y aura des migraineux et probablement au moins une personne photosensible. Prévoir une variante calme — fondus au lieu de stroboscopies — et un interrupteur global dans la console MJ pour l'imposer à toute la salle. Aucun clignotement au-dessus de 3 Hz, dans aucune variante.

Bénéfice de bord : la couche bloquante règle le problème du **poste ouvert trop tôt**. Les étudiants entrent dans la salle avant le lancement, et un poste qui affiche déjà son module est un poste qu'on peut commencer à résoudre sans MJ. Tant que la séance n'est pas démarrée, la couche est en place sur les dix machines et ne montre que le numéro du poste.

### Pourquoi SSE et non WebSocket

Le besoin est réel et bien identifié : les postes doivent recevoir des événements du serveur — réinitialisation de session sans passer sur chaque machine, bascule synchronisée, ouverture des cadenas, animations coordonnées. C'est du **push serveur → clients, unidirectionnel**, exactement le domaine de SSE. Les actions joueurs (soumettre une réponse) remontent en POST classique et n'ont besoin d'aucun canal persistant.

L'argument décisif dans ce contexte est la **reconnexion automatique**. SSE la gère nativement dans le navigateur, avec reprise du flux via `Last-Event-ID`. Avec WebSocket, il faut implémenter soi-même la détection de coupure, le backoff et la resynchronisation de l'état. Sur du matériel IUT, dix postes, avec un MJ étudiant qui gère déjà un groupe : un poste qui décroche deux secondes doit revenir seul, sinon quelqu'un traverse la salle en pleine partie.

WebSocket serait justifié pour du bidirectionnel à faible latence ou du transfert binaire. Ni l'un ni l'autre n'est requis ici.

### Découpage de dev recommandé

L'ordre qui minimise le risque, chaque étape étant testable seule :

1. **Socle** — serveur, SSE, identification des postes, console MJ, plan de salle, **et la couche de surcharge (§14)**. Elle est dans le layout racine : la coder d'abord, c'est l'obtenir gratuitement sur les dix modules écrits ensuite. La coder après, c'est repasser sur chacun.
2. **Projecteur + cadenas** — avec des boutons de triche dans la console MJ pour ouvrir les cadenas à la main. Permet de jouer la bascule et l'épilogue en entier avant qu'une seule énigme n'existe.
3. **Poste RÉSEAU + les 6 tâches** — la branche γ complète. C'est le plus gros volume mais le plus simple et le plus parallélisable entre développeurs.
4. **DEV, IMAGE, SYSTÈME** — les trois épreuves riches, dans cet ordre.
5. **Phase 2** — terminal, 3 documents, 2 postes d'ambiance, les trois fins. Les 4 postes persistants n'ont rien à développer : ils continuent d'afficher ce qu'ils affichaient.
6. **Textes** — écriture des manifestations, du monologue et des documents.

> Faire l'étape 2 avant toute énigme permet de **playtester la bascule dès la première semaine**, avec des cobayes qui cliquent des boutons de triche. C'est le moment le plus fragile du jeu et celui qu'on ne peut pas calibrer sur le papier.

### À valider avant d'écrire du code

1. **Tester dans une vraie salle.** Si le réseau IUT isole les postes entre eux, tout le dispositif tombe — plan B à prévoir (partage de connexion depuis le laptop).
2. **Vérifier le comportement antivirus** sur le script d'ouverture de pare-feu.
3. **Confirmer** que Node peut être installé sur les 4 machines MJ.
4. **Compter les postes réellement disponibles et fonctionnels** par salle. Le design tient à 10 ; à 8, on retire deux tâches et on passe la table de routage à quatre segments ; en dessous, il faut revoir le graphe.

---

## 15. Débrief et consigne de silence

### La consigne de silence est le dispositif anti-spoil du jeu

Ce n'est pas une précaution d'appoint, c'est **le seul mécanisme** qui protège la surprise, puisque rien ne varie d'une session à l'autre (§11). Elle doit donc être formulée explicitement, à chaque groupe, sans être laissée à l'improvisation du MJ.

**Formule à donner au MJ, à dire debout, avant que le groupe ne sorte :**

> « C'est terminé. Une dernière chose, et c'est important : **ne racontez rien à ceux qui n'y sont pas encore passés.** Ni les énigmes, ni comment vous avez fait, ni surtout ce qui arrive à la fin. On vous expliquera pourquoi tous ensemble en fin de journée. »

Trois choses la rendent efficace :

1. **Elle nomme ce qu'il ne faut pas dire** — les énigmes, la méthode, la fin. Une consigne vague (« ne spoilez pas ») laisse chacun juger, et quelqu'un jugera mal.
2. **Elle promet une contrepartie.** « On vous expliquera en fin de journée » transforme le silence en attente partagée plutôt qu'en frustration.
3. **Elle fait d'eux des complices, pas des surveillés.** Un groupe qui vient de vivre quelque chose de fort a envie de le protéger pour les autres — à condition qu'on le lui demande.

> **C'est imparfait, et c'est acceptable.** Il y aura des fuites. Un groupe partiellement spoilé joue quand même : les dix postes restent à résoudre, et connaître le twist n'aide pas à ouvrir un cadenas. Ce qu'on perd, c'est l'effet de surprise d'un groupe sur quelques-uns — pas le jeu.

### Le MJ ne révèle rien

Aucune explication en fin de session, aucun commentaire sur le choix fait. La question « c'était quoi le bon choix ? » reçoit une non-réponse assumée : « on en parle en fin de journée. »

### La révélation est collective, en fin de journée

Une fois toutes les salles passées, on affiche le choix de chaque groupe. Ceux qui ont supprimé découvrent à ce moment-là qu'il y avait autre chose, en même temps que tout le monde.

C'est ce qui rend le silence tenable : personne n'est privé de la révélation, elle est seulement **différée et mise en commun**. Et c'est le moment fédérateur de la rentrée — le seul où toute la promotion partage la même surprise au même instant.

---

## 16. Points ouverts

- [ ] Fin C « libération complète » : à ajouter ou à écarter ?
- [x] ~~Passerelle audiovisuel~~ — couverte par la tâche `SYNCHRO` (§7)
- [x] ~~Manifestations de l'IA : texte seul ou voisées ?~~ — **voisées**, en priorité basse, corpus de 12 (§9)
- [x] ~~Variation par salle~~ — supprimée, décision documentée au §11
- [x] ~~Nom de l'IA~~ — **IRIS**, Interface de Recherche et d'Information Scolaire (§2)
- [ ] Écriture des textes : manifestations, monologue du noyau, 3 documents, 2 fragments d'ambiance
- [ ] Rédaction du document `entretien_2019.txt` (troisième document)
- [ ] Choisir le détail caché dans l'image de P2
- [ ] Récupérer n tomes de « Ma senpai est un homme » en exemplaires de jeu, + n étiquettes « propriété de … »
- [ ] Maquette de la fiche A6, impression n + 2n (toutes identiques)
- [x] ~~Écriture de la vidéo d'introduction~~ — script, direction TTS et découpage motion dans `ecriture/A1-video-intro.md`. **Reste la production** (~90 s)
- [x] ~~Choisir les deux modèles de génération vocale~~ — **2.5 Flash TTS** (phase 1) et **3.1 Flash TTS** (phase 2), via AI Studio (§8)
- [x] ~~Trancher : même timbre sur les deux voix~~ — **timbres distincts**, pont textuel obligatoire (§8)
- [ ] Valider la formulation de briefing MJ et la ligne d'écran de veille (§12.3)
- [ ] **Imprimer la consigne de silence (§15) sur la fiche MJ** — elle ne doit pas dépendre de la mémoire d'un étudiant en fin de journée
- [ ] Nombre de postes réellement disponibles par salle
- [ ] **Playtest chronométré du chemin critique β** (tâche → IMAGE → SYSTÈME) avec des non-initiés, avant tout le reste
- [ ] **Vérifier en salle que le langage de persistance passe** : est-ce qu'un groupe non briefé retourne spontanément vers les postes inchangés en phase 2 ? Si non, il faut une réplique de l'IA qui l'y pousse — de préférence en s'en moquant. *(Écarté de la bascule : IRIS n'y commente pas le recyclage des postes. À placer dans une manifestation de phase 2, où la moquerie tombe au moment où elle sert.)*
- [ ] Vérifier au playtest que les pointeurs suffisent — si un groupe non briefé ne se lève pas dans les 4 minutes, descendre le filet automatique à 3
- [ ] Arbitrage sur les 6 tâches si le budget de dev dérape (ordre de sacrifice défini au §7 — attention, retirer une tâche retire aussi un poste recyclable en phase 2)
