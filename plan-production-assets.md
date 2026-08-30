# Plan de production — assets, son et vidéo

**Escape Game Rentrée MMI1** · Charge **hors développement** · v0.2

---

## Ce qui a changé depuis la v0.1

| Décision | Effet sur la production |
|---|---|
| **Zéro variation** — d'une salle à l'autre comme d'une session à l'autre | Un seul exemplaire de chaque asset. −15 à −20 h |
| **Cadenas : swap d'image + son**, pas d'animation | −5 à −7 h de motion |
| **Postes joueurs muets**, seul le projecteur émet | −4 à −6 h (plus de nappes spatialisées) |
| **Vidéo d'introduction** ~90 s | **+8 à +12 h** — le seul poste qui augmente |
| **Voix générées par IA en amont, en MP3** | Le travail devient de l'itération de prompt et du montage, pas de l'enregistrement |

### Il n'y a plus aucune déclinaison, nulle part

Une image, un calque de bruit, un schéma de verrous, un symbole de séquenceur, une fiche, un plan au tableau, un code, une machine intruse. Rien n'est paramétré, rien n'est tiré au sort au reset.

**Ce qui protège la surprise, c'est la consigne de silence donnée par le MJ à la sortie** (§15 du game design), pas la variation. Le raisonnement complet est au §11 du game design ; en deux lignes : ce qui se transmet entre deux groupes n'est pas la réponse, c'est la méthode et le twist. Aucune déclinaison d'asset n'en protège — les payer revient donc à protéger la seule chose qui n'en a pas besoin.

**Trois conséquences pour la production :**

- **la charge ne dépend plus du nombre de salles.** Passer de 4 salles à 8 ne coûte que des photocopies et des tomes de manga ;
- **chaque asset n'est validé qu'une fois.** Pas quatre versions à garder cohérentes quand un choix graphique change en cours de route ;
- **un seul jeu à recetter.** Une configuration figée se teste une fois pour toutes, là où un tirage au reset produit des cas qu'on ne découvre que le jour J.

## 1. Vidéo et motion

| # | Livrable | Durée | Charge |
|---|---|---|---|
| 1 | **Vidéo d'introduction — l'hôtesse** | ~90 s | **8-12 h** |
| 2 | **Bascule** | ~90 s | **8-15 h** |
| 3 | Séquence de validation finale | ~20 s | 3-4 h |
| 4 | Épilogue A + Épilogue B | 2 × 20 s | 4-6 h |
| 5 | Effet de glitch réutilisable | boucle | 2-3 h |
| 6 | Écran de restitution de fin de journée | ~30 s | 3-4 h |
| 7 | Clap de `SYNCHRO` | 3 s | 1-3 h |
| | **Total** | | **29-47 h** |

### Sur la vidéo d'introduction

Le registre « consignes de sécurité en vol » se produit de trois façons, par coût croissant :

| Approche | Charge | Remarque |
|---|---|---|
| **Motion pictogrammes + voix off** | **8-12 h** | Les vraies consignes de sécurité *sont* des pictogrammes animés. C'est le plus juste, et le moins cher. **Recommandé.** |
| Tournage avec une personne | 15-25 h | Casting, tournage, montage, étalonnage. Plus chaleureux, beaucoup plus lourd. |
| Génération vidéo IA | imprévisible | La cohérence d'un personnage sur 90 s reste un pari. À ne pas mettre sur le chemin critique. |

Elle remplace le cadrage oral du MJ, qui prenait déjà une minute — le coût net en temps de jeu est d'environ trente secondes, et le gain d'uniformité entre les salles est réel : quatre MJ étudiants qui briefent chacun à leur façon, ce sont quatre jeux différents.

### Sur la bascule

Elle a baissé de 12-20 h à 8-15 h parce que le son ne vient plus que d'une source : il n'y a plus rien à synchroniser entre machines. Et l'essentiel de l'effet ne tient pas à la vidéo — il tient à **dix écrans qui changent d'un coup dans une pièce sombre**, ce qui relève du code, déjà budgété ailleurs.

---

## 2. Son

Tout sort du vidéoprojecteur. Aucun poste joueur n'émet.

| Livrable | Charge |
|---|---|
| **Voix 1 — corporate** : intro, annonces de cadenas, jalons de temps, validation | 4-6 h |
| **Voix 2 — l'IA** : bascule, ~10 manifestations, épilogues | 4-6 h |
| SFX projecteur : ouverture / fermeture de cadenas, validation, glitch, 2 fins | 3-4 h |
| Nappe phase 1 + nappe phase 2 | 3-5 h |
| Sound design de la bascule | 5-8 h |
| **Total** | **19-29 h** |

### Les deux modèles de génération

C'est le meilleur rapport effet/coût de tout le projet, et l'effet est narratif avant d'être esthétique : en phase 1, ce qui parle est un artefact **fabriqué par l'IA**, donc logiquement moins bon qu'elle. Une voix plate n'est plus un défaut à masquer, c'est une information sur le monde. À la bascule, quelque chose qui a un intérieur prend la parole, et les joueurs l'entendent avant de le comprendre.

**Deux conditions, à vérifier tôt :**

1. **L'écart doit s'entendre immédiatement.** Un modèle « avancé » seulement un peu meilleur, c'est deux budgets pour aucun effet. Test en écoute comparée avant de générer quoi que ce soit d'autre.
2. **Même timbre ou timbres distincts ?** Même timbre + deux modèles = « le masque tombe », plus troublant mais demande une référence clonée sur les deux générations. Timbres distincts = plus lisible, moins cher, le lien se faisant alors par le texte (une formule d'accueil rejouée à la bascule avec une autre intention).

> **Le travail réel n'est pas de la prise de son, c'est de l'itération.** Une bonne prise générée demande souvent dix à trente essais, et ce temps est peu prévisible. Prévoir large sur les répliques qui portent — la première phrase de l'IA à la bascule vaut à elle seule plusieurs heures d'essais.

> **Générer en amont et livrer des MP3 est la bonne décision**, et elle mérite d'être écrite : aucune dépendance réseau le jour J, aucune latence, et la qualité est arbitrée à froid pendant la conception plutôt que subie en salle.

### Conséquence à assumer : les tâches n'ont plus de retour sonore

Un joueur qui résout `PARITÉ` ne l'entend pas. Faire sonner le projecteur à chaque résolution est exclu — dix postes, ce serait un carillon permanent qui noierait les trois sons qui comptent.

**Le feedback de résolution doit donc être franchement appuyé à l'écran** : changement d'état visible à trois mètres, valeur affichée en très gros, mention du déblocage accordé. C'est déjà ce que prévoit la règle n°4 du game design, mais ça devient ici une obligation et non un confort.

---

## 3. Image

Plus aucun asset en quatre exemplaires.

| Livrable | Charge |
|---|---|
| Identité visuelle du système d'évaluation | 5-8 h |
| Signature visuelle de l'IA | 2-3 h |
| Cadenas grand format, ouvert et fermé | 2-3 h |
| Sprites robot + tuiles de grille | 5-7 h |
| Icônes : blocs, dossiers, cadenas d'interface, UI diverse | 8-12 h |
| Panneau de brassage, table de routage, barre mémoire | 5-8 h |
| Habillage du terminal d'urgence | 3-4 h |
| **Image source + calque de bruit + détail caché** | **3-5 h** |
| Symbole final du séquenceur | 0,5-1 h |
| **Total** | **33-51 h** |

> Le schéma des verrous est une image fixe, affichée par-dessus l'image restaurée après réussite. Un asset de plus, aucune logique — et un seul exemplaire.

> Les cadenas du vidéoprojecteur et ceux du poste SYSTÈME doivent être **le même dessin**. C'est ce qui fait fonctionner le fusil de Tchekhov en phase 2 sans qu'un mot soit prononcé.

---

## 4. Écriture

| Livrable | Charge |
|---|---|
| **Monologue de `noyau.core`** — le cœur narratif | 6-10 h |
| **Script de la vidéo d'introduction** | 2-3 h |
| 3 documents de phase 2 | 5-8 h |
| ~10 manifestations de l'IA | 3-4 h |
| Annonces vocales : cadenas, jalons de temps, rappels | 1-2 h |
| 2 fragments d'ambiance | 1 h |
| Textes système de phase 1 | 3-4 h |
| Table de correspondance, corpus de logs, liste des machines | 2-3 h |
| Nom de l'IA et du noyau | 0,5 h |
| **Total** | **24-36 h** |

> **Le script de l'intro est plus difficile qu'il n'en a l'air.** Il doit être drôle sans être une parodie, rassurant sans être plat, et faire passer les règles, l'autorisation de fouiller et le ton du jeu en quatre-vingt-dix secondes. C'est le texte que toute la promotion entendra, et le seul qu'elle entendra deux fois si elle repasse.

---

## 5. Print

| Livrable | Charge |
|---|---|
| Maquette de la fiche A6, une seule version, tirage n + 2n | 2-3 h |
| Étiquettes « propriété de … » et checklists MJ | 1 h |
| **Total** | **3-4 h** |

---

## 6. Charge totale

| Métier | v0.1 | **v0.2** |
|---|---|---|
| Vidéo et motion | 31-48 h | **29-47 h** |
| Son | 20-30 h | **19-29 h** |
| Image | 39-64 h | **33-51 h** |
| Écriture | 22-33 h | **24-36 h** |
| Print | 4-5 h | **3-4 h** |
| **TOTAL** | 116-180 h | **108-167 h** |

La baisse en heures est modeste — environ 10 % — parce que la vidéo d'introduction absorbe une bonne partie de ce que les déclinaisons libèrent. **Mais on n'achète pas la même chose** : on troque quatre versions que personne ne comparera jamais contre quatre-vingt-dix secondes que toute la promotion verra.

Le vrai gain n'est pas dans ces heures. Il est dans le fait qu'il n'existe plus qu'**un seul jeu d'assets et un seul état initial** — donc une seule chose à recetter, et rien qui puisse diverger le jour J.

### Version réduite

En tenant l'intro en motion pictogrammes, la bascule en typographie animée plus sound design, et les épilogues en écrans fixes sonorisés :

| Métier | Réduit |
|---|---|
| Vidéo et motion | 16-24 h |
| Son | 15-22 h |
| Image | 28-40 h |
| Écriture | 22-32 h |
| Print | 3-4 h |
| **TOTAL** | **84-122 h** |

Soit deux à trois semaines-personne — finançable avec du renfort MMI2/MMI3 sur les assets d'interface.

> **L'écriture ne se réduit quasiment pas, et c'est normal.** C'est le seul poste dont la qualité conditionne toute l'expérience : un monologue raté ne se rattrape pas au motion design, et une voix générée ne sauve pas un mauvais texte — elle l'expose.

---

## 7. Ordre de production

Chaque étape verrouille des choix dont la suivante dépend.

1. **Identité visuelle + signature de l'IA.** Tout s'y raccroche. Produire un asset avant elle, c'est le refaire.
2. **Test comparé des deux modèles de voix.** Avant toute écriture définitive : si l'écart ne s'entend pas, il faut le savoir tant qu'on peut encore changer de modèle ou de stratégie.
3. **Écriture** — monologue, puis script d'intro. Ils fixent le ton, donc la direction du son et de la bascule.
4. **Génération et montage des voix.** Le plus imprévisible en durée : commencer tôt, itérer par lots.
5. **Bascule** (motion + sound design). À playtester dans une salle sombre, pas sur un écran de bureau.
6. **Vidéo d'introduction.** Parallélisable avec la bascule si deux personnes.
7. **Assets d'interface.** Découpables entre plusieurs contributeurs.
8. **Print.** Dépend de l'identité visuelle. Prévoir une marge pour le tirage.

> **Les étapes 1 à 4 représentent environ 40 % de la charge et constituent le chemin critique.** Tant qu'elles ne sont pas closes, tout travail sur le reste risque d'être repris. L'étape 2 en particulier coûte une demi-journée et peut éviter de reconstruire toute la stratégie sonore à trois semaines de la rentrée.

---

## 8. Points à trancher

- [ ] Vidéo d'intro : motion pictogrammes, tournage, ou génération IA ? *(recommandation : pictogrammes)*
- [ ] Les deux voix ont-elles le même timbre (clonage) ou des timbres distincts reliés par le texte ?
- [ ] Choix des deux modèles de génération, et **validation de l'écart en écoute comparée**
- [ ] Ambition de la bascule : motion riche ou typographie animée + son fort ?
- [ ] `SYNCHRO` : clap filmé ou reconstitué graphiquement ?
- [ ] Qui produit ? Renfort MMI2/MMI3 envisageable sur les assets d'interface — pas sur l'écriture, pas sur la bascule, pas sur les voix
- [ ] **Date de gel des assets**, à fixer avant la fin du dev pour laisser le temps de l'intégration
