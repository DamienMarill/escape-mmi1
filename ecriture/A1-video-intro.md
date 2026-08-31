# A1 — Vidéo d'introduction

**Voix 1 — corporate · `static/assets/video/intro.mp4` · ~90 s · 226 mots**
Modèle : **Gemini 2.5 Flash TTS (preview)** · console AI Studio

---

## 1. Ce que ce texte doit faire

| Objectif | Où il est tenu |
|---|---|
| Cadrer la fiction (évaluation d'entrée automatisée) | Segments 1-2 |
| Déplier le sigle **IRIS** une fois, en passant | Segment 1 |
| Autoriser la recherche sans dire « fouillez » | Segment 3, ligne 1 |
| Faire passer les 4 consignes de sécurité réelles | Segment 3 |
| Poser **la formule rejouée à la bascule** | Segments 1 et 4 *(en bookend)* |

> **La formule rejouable est : « Merci d'être là. Votre participation nous est précieuse. »**
> Remplissage administratif au premier passage. À la bascule, IRIS la redit — et elle
> est devenue littéralement vraie. **B1 doit la reprendre mot pour mot**, c'est
> maintenant une contrainte fermée.

> **Le fusil de Tchekhov sonore :** au segment 1, le système annonce qu'il est *opéré par
> IRIS*. Personne ne le relèvera — ça sonne comme un nom d'éditeur en pied de page. C'est
> précisément pour ça que ça marche : à la bascule, ils ont déjà entendu son nom.

---

## 2. Champ **Scene**

```
Une salle de travaux pratiques d'IUT, dix écrans allumés, éclairage néon, personne
n'a encore parlé. La voix sort d'un seul haut-parleur relié au vidéoprojecteur —
une annonce d'aéroport diffusée dans une pièce beaucoup trop petite pour elle.
Le message a déjà été joué des centaines de fois, et il le sera encore.
```

## 3. Champ **Sample context**

```
Voix d'accueil du module d'évaluation automatisée d'un établissement scolaire.
Ce n'est pas une personne : c'est un message préenregistré, produit par le système
lui-même. Elle est aimable parce que c'est sa fonction, pas parce qu'elle s'intéresse
à qui l'écoute.

Style : chaleur professionnelle constante, exactement la même du premier au dernier
mot. Une politesse d'annonce commerciale, parfaitement égale, jamais forcée.
Registre de la démonstration de sécurité en vol : on énonce des consignes sérieuses
sur un ton agréable, sans jamais faire peur.

Pace : posé, articulé, avec un temps d'arrêt net avant chaque nouvelle consigne.
Accent : français neutre, diction d'annonce publique.
```

---

## 4. Zone de texte — **à générer en 4 segments**

> **Générer segment par segment**, pas en un bloc. Trois raisons : la longueur reste dans
> la zone de confort du modèle, chaque segment se retente sans reperdre les trois autres,
> et le découpage tombe exactement sur les quatre plans de pictogrammes du montage.

### Segment 1 — accueil *(≈ 14 s)*

```
[warmly] Bienvenue. Merci d'être là — votre participation nous est précieuse.
Vous participez aujourd'hui à l'évaluation d'entrée de la promotion M M I 1.
Cette évaluation est opérée par IRIS, Interface de Recherche et d'Information Scolaire.
```

### Segment 2 — le cadre *(≈ 22 s)*

```
Elle se déroule en trois épreuves, réparties sur l'ensemble des postes de la salle.
Vous disposez de trente minutes.
Il n'y a ni note, ni classement, ni bonne réponse attendue : nous observons seulement
la façon dont vous procédez. [cheerfully] Vous ne pouvez pas échouer.
```

### Segment 3 — les consignes *(≈ 40 s)*

```
Avant de commencer, quelques consignes.
L'ensemble des ressources de la salle est à votre disposition. Certains documents
n'ont pas été numérisés.
Tous les éléments nécessaires se trouvent à hauteur de regard. Il n'est jamais
nécessaire de vous baisser, de chercher sous le mobilier, ni d'y monter.
Les postes sont configurés en affichage plein écran. Merci de ne pas quitter cet
affichage, et de ne pas changer de page.
Aucun câble ne doit être débranché.
Enfin, l'ordinateur relié au vidéoprojecteur est une console d'administration.
Elle ne fait pas partie de l'évaluation. Merci de ne pas y toucher.
```

### Segment 4 — clôture *(≈ 16 s)*

```
Votre poste vous indiquera à tout moment ce dont il a besoin, et où le trouver.
Un superviseur est présent dans la salle.
L'évaluation va commencer.
[warmly] Merci d'être là. Votre participation nous est précieuse.
```

---

## 5. Réglages et pièges de génération

### Voix

Aucune indication de genre dans la doc Google — à trancher à l'oreille. Par ordre de
pertinence pour ce registre :

1. **Schedar** *(Even)* — la régularité absolue est exactement l'effet recherché ;
2. **Kore** *(Firm)* — plus autoritaire, si Schedar sonne trop douce ;
3. **Vindemiatrix** *(Gentle)* — repli si les deux premières sonnent froides plutôt que lisses.

### Le piège principal

**Ne jamais écrire « monotone », « plate », « sans émotion », « neutre », « calme » dans
les consignes de style.** Les guides de prompting Gemini TTS listent explicitement ces
mots comme dégradant la sortie : on n'obtient pas une voix volontairement plate, on
obtient une mauvaise voix — et l'effet narratif du §8 (« une voix sans intérieur »)
tombe à l'eau, parce qu'il repose sur une exécution *parfaite* et vide, pas sur un raté.

La direction est donc **positive** : « chaleur professionnelle constante, exactement la
même du premier au dernier mot ». C'est la constance qui produit le vide, pas la platitude.

### Les tags

Quatre au total, volontairement. Chaque tag supplémentaire remet de la vie dans une voix
qui ne doit pas en avoir. `[cheerfully]` sur « Vous ne pouvez pas échouer » est le seul
qui compte vraiment — c'est la phrase que le groupe se rappellera après la bascule.

### À vérifier à la première génération

- **`M M I 1`** — écrit espacé exprès. Si le modèle le lit « mmi un » ou « émm-i », tenter
  `M. M. I. 1`, puis `emme emme i un` en dernier recours.
- **`IRIS`** doit être lu comme un prénom, pas épelé. Si le modèle épelle, écrire `Iris`.
- **Les tags ne doivent jamais être prononcés.** S'ils le sont, ajouter en tête du champ
  *Sample context* : `Ne lis à voix haute que le texte fourni. N'énonce jamais le contenu
  entre crochets.`
- **Le débit** doit tenir les 90 s au total. S'il déborde, couper dans le segment 2
  (« ni note, ni classement ») — jamais dans le segment 3, les consignes sont réelles.

---

## 6. Montage — les quatre plans

Motion pictogrammes (option recommandée du plan de production). Un plan par segment,
aucun mouvement de caméra, transitions au cut.

| # | VO | À l'écran |
|---|---|---|
| 1 | Accueil, sigle IRIS | Logo du système d'évaluation, puis pictogramme d'une salle vue de dessus, dix carrés qui s'allument un par un |
| 2 | Trois épreuves, trente minutes | Trois cadenas fermés côte à côte + un cadran de 30 min. **Mêmes cadenas que ceux du projecteur et du poste SYSTÈME** — le dessin est le même partout, c'est ce qui arme le fusil de Tchekhov |
| 3 | Les consignes | Un pictogramme par consigne, style sécurité en vol : silhouette debout devant un poste ✓ / silhouette penchée sous une table ✗ / main sur un câble ✗ / silhouette devant la machine du projecteur ✗ / une fenêtre plein écran ✓ |
| 4 | Clôture | Retour au logo, mention `ÉVALUATION D'ENTRÉE — PROMOTION MMI1`, fondu |

> **Le plan 3 porte à lui seul les vraies règles de sécurité de la séance.** C'est le seul
> endroit du dispositif où elles sont énoncées — le MJ ne les répète pas. Les pictogrammes
> ✗ doivent être lisibles sans le son, au cas où l'audio du projecteur ne se déverrouille
> pas au premier lancement.

---

## 7. Version texte nu

*Pour les sous-titres, la fiche MJ et le repli si la vidéo ne part pas le jour J — le MJ
peut la lire à voix haute telle quelle.*

> Bienvenue. Merci d'être là — votre participation nous est précieuse. Vous participez
> aujourd'hui à l'évaluation d'entrée de la promotion MMI1. Cette évaluation est opérée
> par IRIS, Interface de Recherche et d'Information Scolaire.
>
> Elle se déroule en trois épreuves, réparties sur l'ensemble des postes de la salle.
> Vous disposez de trente minutes. Il n'y a ni note, ni classement, ni bonne réponse
> attendue : nous observons seulement la façon dont vous procédez. Vous ne pouvez pas
> échouer.
>
> Avant de commencer, quelques consignes. L'ensemble des ressources de la salle est à
> votre disposition. Certains documents n'ont pas été numérisés. Tous les éléments
> nécessaires se trouvent à hauteur de regard. Il n'est jamais nécessaire de vous baisser,
> de chercher sous le mobilier, ni d'y monter. Les postes sont configurés en affichage
> plein écran. Merci de ne pas quitter cet affichage, et de ne pas changer de page. Aucun
> câble ne doit être débranché. Enfin, l'ordinateur relié au vidéoprojecteur est une
> console d'administration. Elle ne fait pas partie de l'évaluation. Merci de ne pas y
> toucher.
>
> Votre poste vous indiquera à tout moment ce dont il a besoin, et où le trouver. Un
> superviseur est présent dans la salle. L'évaluation va commencer. Merci d'être là.
> Votre participation nous est précieuse.
